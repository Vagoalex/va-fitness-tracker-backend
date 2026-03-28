import { AuthConfig } from '@/core/types/config.types';
import { registerAs } from '@nestjs/config';

export const AUTH_CONFIG_KEY = 'auth';

/**
 * Конфигурация авторизации.
 */
export const authConfig = registerAs(
  AUTH_CONFIG_KEY,
  (): AuthConfig => ({
    accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    refreshTokenTtlMs: Number(process.env.JWT_REFRESH_TTL_MS ?? 1000 * 60 * 60 * 24 * 30),
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
  }),
);
