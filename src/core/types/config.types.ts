import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Environment } from './global.types';

/**
 * Поддерживаемые уровни логирования приложения.
 */
export const LOG_LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as const;

/**
 * Тип значения уровня логирования.
 */
export type AppLogLevel = (typeof LOG_LEVELS)[number];

/**
 * Конфигурация приложения.
 */
export interface AppConfig {
  nodeEnv: Environment;
  port: number;
  apiPrefix: string;
  isProduction: boolean;
  isDevelopment: boolean;
  logLevel: AppLogLevel;
}

/**
 * Конфигурация подключения к MongoDB.
 */
export interface MongoConfig {
  uri: string;
  options: Partial<MongooseModuleOptions>;
}

/**
 * Конфигурация авторизации и токенов.
 */
export interface AuthConfig {
  /** Секрет для access token */
  accessTokenSecret: string;
  /** Время жизни access token */
  accessTokenExpiresIn: string;
  /** Секрет для refresh token */
  refreshTokenSecret: string;
  /** Время жизни refresh token */
  refreshTokenExpiresIn: string;
  /** TTL refresh session в миллисекундах */
  refreshTokenTtlMs: number;
  /** Количество раундов bcrypt */
  bcryptSaltRounds: number;
}

/**
 * Общая конфигурация приложения.
 */
export interface AllConfig {
  app: AppConfig;
  auth: AuthConfig;
  database: MongoConfig;
}
