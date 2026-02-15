import { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * Конфигурация для app
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Конфигурация для БД под mongoDB
 */
export interface MongoConfig {
  uri: string;
  options: Partial<MongooseModuleOptions>;
}

/**
 * Конфигурация для jwt и авторизации
 */
export interface JwtConfig {
  /** JWT access secret */
  secret: string;
  /** JWT access expires in */
  expiresIn: string;
  /** Bcrypt salt rounds */
  bcryptSaltRounds: number;
  /** JWT refresh secret */
  refreshSecret: string;
  /** JWT refresh expires in */
  refreshExpiresIn: string;
}

/**
 * Вся общая конфигурация
 */
export interface AllConfig {
  app: AppConfig;
  jwt: JwtConfig;
  database: MongoConfig;
}
