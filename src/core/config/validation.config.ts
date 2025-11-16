import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Environment } from '../../types/global.types';

/**
 * Класс валидации переменных окружения
 */
class EnvironmentTypesVariables {
  @IsString()
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsNumber()
  BCRYPT_SALT_ROUNDS: number;

  @IsNumber()
  PASSWORD_MIN_LENGTH: number;
}

/**
 * Функция валидации конфигурации evironment
 * @param config
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentTypesVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
