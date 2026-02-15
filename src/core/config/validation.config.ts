import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';
import { EnvironmentTypes, Environment } from '../../types/global.types';
import { AppLogLevel, LOG_LEVELS } from '../../types/config.types';

/**
 * Класс валидации переменных окружения
 */
class EnvironmentTypesVariables {
  @IsEnum(EnvironmentTypes)
  NODE_ENV: Environment;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  DB_NAME: string;

  @IsOptional()
  @IsString()
  DB_USERNAME?: string;

  @IsString()
  DB_HOST: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  @IsOptional()
  @IsString()
  DB_CLUSTER?: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string;

  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(15)
  BCRYPT_SALT_ROUNDS: number;

  @Type(() => Number)
  @IsInt()
  @Min(6)
  @Max(128)
  PASSWORD_MIN_LENGTH: number;

  @IsIn([...LOG_LEVELS])
  LOG_LEVEL: AppLogLevel;
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
