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
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * Вся общая конфигурация
 */
export interface AllConfig {
  app: AppConfig;
  mongo: MongoConfig;
  jwt: JwtConfig;
  database: string;
}
