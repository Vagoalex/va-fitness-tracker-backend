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
import { AllConfig, AuthConfig } from '@/core/types/config.types';
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

/**
 * Сервис для работы с аутентификацией
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<AllConfig>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(RefreshSession.name)
    private readonly refreshSessionModel: Model<RefreshSessionDocument>,
  ) {}

  /**
   * Регистрирует пользователя и сразу создаёт auth-сессию.
   * @param registerDto
   * @param sessionMeta - Мета данные сессии (IP и user-agent)
   */
  async register(registerDto: RegisterDto, sessionMeta: RefreshSessionMeta): Promise<AuthResponse> {
    // Получаем конфигурацию авторизации
    const authSettings = this.getAuthConfig();
    const passwordHash = await bcrypt.hash(registerDto.password, authSettings.bcryptSaltRounds);

    const createdUser = await this.userService.createUser({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    // Создаём access и refresh токены
    const authTokens = await this.createSessionTokens(createdUser, sessionMeta);

    return {
      user: createdUser,
      ...authTokens,
    };
  }

  /**
   * Логинит пользователя по email и паролю.
   * @param loginDto
   * @param sessionMeta - Мета данные сессии (IP и user-agent)
   */
  async login(loginDto: LoginDto, sessionMeta: RefreshSessionMeta): Promise<AuthResponse> {
    // Находим пользователя по email с passwordHash
    const userDocument = await this.userService.findByEmailWithPasswordHash(loginDto.email);
    if (!userDocument?.passwordHash) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    // Проверяем активность пользователя
    this.assertUserIsActive(userDocument.status);

    const isPasswordValid = await bcrypt.compare(loginDto.password, userDocument.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    // Обновляем дату последнего входа пользователя
    await this.userService.updateLastLoginAt(this.getUserId(userDocument), new Date());

    // Создаём access и refresh токены
    const authTokens = await this.createSessionTokens(userDocument, sessionMeta);

    return {
      user: userDocument,
      ...authTokens,
    };
  }

  /**
   * Выпускает новую пару токенов и ротирует refresh-сессию.
   * @param refreshToken - Refresh токен
   * @param sessionMeta - Мета данные сессии (IP и user-agent)
   */
  async refresh(refreshToken: string, sessionMeta: RefreshSessionMeta): Promise<AuthTokens> {
    // Проверяем refresh token
    const refreshPayload = await this.verifyRefreshToken(refreshToken);

    // Находим refresh session по sessionId
    const refreshSessionDocument = await this.refreshSessionModel
      .findOne({ sessionId: refreshPayload.sid })
      .select('+refreshTokenHash')
      .exec();

    if (!refreshSessionDocument?.refreshTokenHash) {
      throw new ForbiddenException('auth.errors.invalid_refresh_token');
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
      throw new ForbiddenException('auth.errors.invalid_refresh_token');
    }

    const userDocument = await this.userService.findById(refreshPayload.sub);

    // Проверяем активность пользователя
    this.assertUserIsActive(userDocument.status);

    // Получаем timestamp последнего изменения пароля пользователя
    const currentPasswordChangedAtTimestamp = userDocument.passwordChangedAt?.getTime();

    /**
     * Если timestamp последнего изменения пароля пользователя больше, чем timestamp последнего изменения пароля в payload,
     * то отзываем все сессии пользователя и выбрасываем ошибку.
     */
    if (
      currentPasswordChangedAtTimestamp &&
      refreshPayload.passwordChangedAt &&
      refreshPayload.passwordChangedAt < currentPasswordChangedAtTimestamp
    ) {
      await this.revokeAllUserSessions(this.getUserId(userDocument));
      throw new ForbiddenException('auth.errors.refresh_token_expired_by_password_change');
    }

    // Удаляем refresh session
    await this.refreshSessionModel.deleteOne({ _id: refreshSessionDocument._id }).exec();

    // Создаём новые access и refresh токены
    return this.createSessionTokens(userDocument, sessionMeta);
  }

  /**
   * Завершает текущую сессию по refresh token.
   * @param refreshToken - Refresh токен
   */
  async logout(refreshToken: string): Promise<void> {
    // Проверяем refresh token
    const refreshPayload = await this.verifyRefreshToken(refreshToken);

    // Удаляем refresh session
    await this.refreshSessionModel.deleteOne({ sessionId: refreshPayload.sid }).exec();
  }

  /**
   * Завершает все активные сессии пользователя.
   * @param userId
   */
  async logoutFromAllDevices(userId: string): Promise<void> {
    await this.revokeAllUserSessions(userId);
  }

  /**
   * Меняет пароль и инвалидирует старые refresh-сессии.
   * @param userId
   * @param changePasswordDto
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const authSettings = this.getAuthConfig();

    const userDocument = await this.userService.findById(userId);
    const userWithPasswordHash = await this.userService.findByEmailWithPasswordHash(
      userDocument.email,
    );

    if (!userWithPasswordHash?.passwordHash) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      userWithPasswordHash.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('auth.errors.invalid_credentials');
    }

    const isNewPasswordEqualToCurrent = await bcrypt.compare(
      changePasswordDto.newPassword,
      userWithPasswordHash.passwordHash,
    );

    if (isNewPasswordEqualToCurrent) {
      throw new BadRequestException('auth.errors.new_password_must_be_different');
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
    const sessionId = randomUUID();
    const authSettings = this.getAuthConfig();
    // Получаем timestamp последнего изменения пароля пользователя
    const passwordChangedAtTimestamp = userDocument.passwordChangedAt?.getTime();
    const userId = this.getUserId(userDocument);
    const userRoles = this.getUserRoles(userDocument);

    const accessPayload: JwtAccessPayload = {
      sub: userId,
      roles: userRoles,
      passwordChangedAt: passwordChangedAtTimestamp,
    };

    const refreshPayload: JwtRefreshPayload = {
      sub: userId,
      sid: sessionId,
      passwordChangedAt: passwordChangedAtTimestamp,
    };

    // Создаём access и refresh токены
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

    // Создаём refresh session
    await this.refreshSessionModel.create({
      userId: new Types.ObjectId(userId),
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
      throw new ForbiddenException('auth.errors.invalid_refresh_token');
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
   * Возвращает типизированную auth-конфигурацию из сервиса конфигурации.
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
      throw new ForbiddenException('auth.errors.account_inactive');
    }
  }

  /**
   * Возвращает ID пользователя из документа пользователя.
   */
  private getUserId(userDocument: UserDocument): string {
    const userId = (userDocument as UserDocument & { _id: Types.ObjectId })._id;

    return userId.toString();
  }

  /**
   * Возвращает роли пользователя из документа пользователя.
   */
  private getUserRoles(userDocument: UserDocument): RoleType[] {
    return Array.isArray(userDocument.roles) && userDocument.roles.length > 0
      ? [...userDocument.roles]
      : [RoleType.USER];
  }
}
