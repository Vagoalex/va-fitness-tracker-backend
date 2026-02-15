import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, JwtPayload, Tokens } from './types';
import { AuthExceptions } from '../../core/i18n/helpers/i18n-exeptions.helper';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '../../types/config.types';
import { RoleTypes } from '../../types/roles.types';
import { I18nService } from '../../core/i18n';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfig>,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * Генерация токенов доступа и обновления
   * @param user
   * @private
   */
  private async generateTokens(user: UserDocument): Promise<Tokens> {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    // Получаем конфигурацию JWT
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const [accessToken, refreshToken] = await Promise.all([
      // Access токен
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.secret,
        expiresIn: jwtConfig.expiresIn,
      }),
      // Refresh токен
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Проверяем существование пользователя
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });
    if (existingUser) {
      throw AuthExceptions.userExists();
    }

    // Получаем конфигурацию JWT
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(registerDto.password, jwtConfig.bcryptSaltRounds);

    // Создаем пользователя
    const user = await this.userModel.create({
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      isActive: true,
      roles: [RoleTypes.USER],
    });

    // Генерируем токены
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      tokens,
      message: this.i18nService.auth('success.registered'),
    };
  }

  async getCurrentUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw AuthExceptions.invalidToken();
    }

    return user;
  }

  mapToSafeUser(user: UserDocument): any {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      // Получаем конфигурацию JWT
      const jwtConfig = this.configService.get('jwt', { infer: true });

      const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      const user = await this.userModel.findById(payload.userId);
      if (!user) {
        throw AuthExceptions.invalidToken();
      }

      if (!user.isActive) {
        throw AuthExceptions.accountInactive();
      }

      return this.generateTokens(user);
    } catch {
      throw AuthExceptions.invalidToken();
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // В реальном приложении здесь можно инвалидировать refresh token
    return {
      message: this.i18nService.auth('success.logged_out'),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Находим пользователя
    const user = await this.userModel.findOne({
      email: loginDto.email.toLowerCase(),
    });
    if (!user) {
      throw AuthExceptions.invalidCredentials();
    }

    // Проверяем активность аккаунта
    if (!user.isActive) {
      throw AuthExceptions.accountInactive();
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw AuthExceptions.invalidCredentials();
    }

    // Генерируем токены
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      tokens,
      message: this.i18nService.auth('success.logged_in'),
    };
  }

  /**
   * Верификация токена (используется в стратегиях)
   */
  async verifyToken(token: string, isRefreshToken = false): Promise<JwtPayload> {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const secret = isRefreshToken ? jwtConfig.refreshSecret : jwtConfig.secret;

    return this.jwtService.verifyAsync(token, { secret });
  }
}
