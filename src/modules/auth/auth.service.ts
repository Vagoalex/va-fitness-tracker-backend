import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { AUTH_CONFIG_KEY } from '@/core/config/auth.config';
import { AuthConfig } from '@/core/types/config.types';
import { RoleType } from '@/core/enums/role-type.enum';
import { UserStatus } from '@/core/enums/user-status.enum';
import { JwtAccessPayload, JwtRefreshPayload } from '@/core/types/jwt-payload.types';

import { AuthResponse, AuthTokens, RefreshSessionMeta } from '@/modules/auth/auth.types';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import {
  RefreshSession,
  RefreshSessionDocument,
} from '@/modules/auth/persistence/refresh-session.schema';
import { UserDocument } from '@/modules/user/persistence/user.schema';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(RefreshSession.name)
    private readonly refreshSessionModel: Model<RefreshSessionDocument>,
  ) {}

  /**
   * Регистрирует пользователя и сразу создаёт auth-сессию.
   */
  async register(registerDto: RegisterDto, sessionMeta: RefreshSessionMeta): Promise<AuthResponse> {
    const authSettings = this.getAuthConfig();
    const passwordHash = await bcrypt.hash(registerDto.password, authSettings.bcryptSaltRounds);

    const createdUser = await this.userService.createUser({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    const authTokens = await this.createSessionTokens(createdUser, sessionMeta);

    return {
      user: createdUser,
      ...authTokens,
    };
  }

  /**
   * Логинит пользователя по email и паролю.
   */
  async login(loginDto: LoginDto, sessionMeta: RefreshSessionMeta): Promise<AuthResponse> {
    const userDocument = await this.userService.findByEmailWithPasswordHash(loginDto.email);

    if (!userDocument?.passwordHash) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    this.assertUserIsActive(userDocument.status);

    const isPasswordValid = await bcrypt.compare(loginDto.password, userDocument.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    await this.userService.updateLastLoginAt(userDocument.id, new Date());

    const authTokens = await this.createSessionTokens(userDocument, sessionMeta);

    return {
      user: userDocument,
      ...authTokens,
    };
  }

  /**
   * Выпускает новую пару токенов и ротирует refresh-сессию.
   */
  async refresh(refreshToken: string, sessionMeta: RefreshSessionMeta): Promise<AuthTokens> {
    const refreshPayload = await this.verifyRefreshToken(refreshToken);

    const refreshSessionDocument = await this.refreshSessionModel
      .findOne({ sessionId: refreshPayload.sid })
      .select('+refreshTokenHash')
      .exec();

    if (!refreshSessionDocument?.refreshTokenHash) {
      throw new ForbiddenException('auth.invalid_refresh_token');
    }

    if (refreshSessionDocument.revokedAt) {
      throw new ForbiddenException('auth.refresh_session_revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      refreshSessionDocument.refreshTokenHash,
    );

    /**
     * Несовпадение hash означает, что sessionId найден,
     * но сам refresh token не соответствует сохранённой сессии.
     * Это похоже на reuse / компрометацию — отзываем все сессии пользователя.
     */
    if (!isRefreshTokenValid) {
      await this.revokeAllUserSessions(refreshPayload.sub);
      throw new ForbiddenException('auth.invalid_refresh_token');
    }

    const userDocument = await this.userService.findById(refreshPayload.sub);

    this.assertUserIsActive(userDocument.status);

    const currentPasswordChangedAtTimestamp = userDocument.passwordChangedAt?.getTime();

    if (
      currentPasswordChangedAtTimestamp &&
      refreshPayload.passwordChangedAt &&
      refreshPayload.passwordChangedAt < currentPasswordChangedAtTimestamp
    ) {
      await this.revokeAllUserSessions(userDocument.id);
      throw new ForbiddenException('auth.refresh_token_expired_by_password_change');
    }

    await this.refreshSessionModel.deleteOne({ _id: refreshSessionDocument._id }).exec();

    return this.createSessionTokens(userDocument, sessionMeta);
  }

  /**
   * Завершает текущую сессию по refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    const refreshPayload = await this.verifyRefreshToken(refreshToken);

    await this.refreshSessionModel.deleteOne({ sessionId: refreshPayload.sid }).exec();
  }

  /**
   * Завершает все активные сессии пользователя.
   */
  async logoutFromAllDevices(userId: string): Promise<void> {
    await this.revokeAllUserSessions(userId);
  }

  /**
   * Меняет пароль и инвалидирует старые refresh-сессии.
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const authSettings = this.getAuthConfig();

    const userDocument = await this.userService.findById(userId);
    const userWithPasswordHash = await this.userService.findByEmailWithPasswordHash(
      userDocument.email,
    );

    if (!userWithPasswordHash?.passwordHash) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      userWithPasswordHash.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    const isNewPasswordEqualToCurrent = await bcrypt.compare(
      changePasswordDto.newPassword,
      userWithPasswordHash.passwordHash,
    );

    if (isNewPasswordEqualToCurrent) {
      throw new BadRequestException('auth.new_password_must_be_different');
    }

    const nextPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      authSettings.bcryptSaltRounds,
    );

    await this.userService.updatePassword(userId, nextPasswordHash);
    await this.revokeAllUserSessions(userId);
  }

  /**
   * Создаёт access/refresh токены и сохраняет refresh session.
   */
  private async createSessionTokens(
    userDocument: UserDocument,
    sessionMeta: RefreshSessionMeta,
  ): Promise<AuthTokens> {
    const authSettings = this.getAuthConfig();
    const sessionId = randomUUID();
    const passwordChangedAtTimestamp = userDocument.passwordChangedAt?.getTime();

    const accessPayload: JwtAccessPayload = {
      sub: userDocument.id,
      roles: userDocument.roles ?? [RoleType.USER],
      passwordChangedAt: passwordChangedAtTimestamp,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: userDocument.id,
      sid: sessionId,
      passwordChangedAt: passwordChangedAtTimestamp,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: authSettings.accessTokenSecret,
        expiresIn: authSettings.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: authSettings.refreshTokenSecret,
        expiresIn: authSettings.refreshTokenExpiresIn,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, authSettings.bcryptSaltRounds);

    await this.refreshSessionModel.create({
      userId: new Types.ObjectId(userDocument.id),
      sessionId,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + authSettings.refreshTokenTtlMs),
      ip: sessionMeta.ip,
      userAgent: sessionMeta.userAgent,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Проверяет refresh token и возвращает payload.
   */
  private async verifyRefreshToken(refreshToken: string): Promise<JwtRefreshPayload> {
    const authSettings = this.getAuthConfig();

    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: authSettings.refreshTokenSecret,
      });
    } catch {
      throw new ForbiddenException('auth.invalid_refresh_token');
    }
  }

  /**
   * Отзывает все refresh-сессии пользователя.
   */
  private async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshSessionModel
      .deleteMany({
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  /**
   * Возвращает типизированную auth-конфигурацию.
   */
  private getAuthConfig(): AuthConfig {
    const authSettings = this.configService.get<AuthConfig>(AUTH_CONFIG_KEY);

    if (!authSettings) {
      throw new Error('Auth config is not defined');
    }

    return authSettings;
  }

  /**
   * Единая проверка активности пользователя.
   */
  private assertUserIsActive(userStatus: UserStatus): void {
    if (userStatus !== UserStatus.ACTIVE) {
      throw new ForbiddenException('auth.user_is_not_active');
    }
  }
}
