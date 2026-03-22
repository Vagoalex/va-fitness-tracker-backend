import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';

import { RoleType } from '@/core/enums/role-type.enum';
import { UserStatus } from '@/core/enums/user-status.enum';
import { JwtAccessPayload, JwtRefreshPayload } from '@/core/types/jwt-payload.types';
import { authConfig } from '@/modules/auth/auth.config';
import { AuthResponse, AuthTokens, RefreshSessionMeta } from '@/modules/auth/auth.types';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { RefreshSession, RefreshSessionDocument } from './persistence/refresh-session.schema';
import { UserDocument } from '@/modules/user/persistence/user.schema';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(RefreshSession.name)
    private readonly refreshSessionModel: Model<RefreshSessionDocument>,
  ) {}

  /**
   * Регистрирует пользователя и сразу создаёт auth-сессию.
   */
  async register(registerDto: RegisterDto, sessionMeta: RefreshSessionMeta): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(registerDto.password, authConfig.bcryptSaltRounds);

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

    if (userDocument.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('auth.user_is_not_active');
    }

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

    if (!isRefreshTokenValid) {
      await this.revokeAllUserSessions(refreshPayload.sub);
      throw new ForbiddenException('auth.invalid_refresh_token');
    }

    const userDocument = await this.userService.findById(refreshPayload.sub);

    if (userDocument.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('auth.user_is_not_active');
    }

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

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('auth.new_password_must_be_different');
    }

    const nextPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      authConfig.bcryptSaltRounds,
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
        secret: authConfig.accessTokenSecret,
        expiresIn: authConfig.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: authConfig.refreshTokenSecret,
        expiresIn: authConfig.refreshTokenExpiresIn,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, authConfig.bcryptSaltRounds);

    await this.refreshSessionModel.create({
      userId: new Types.ObjectId(userDocument.id),
      sessionId,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + authConfig.refreshTokenTtlMs),
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
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: authConfig.refreshTokenSecret,
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
}
