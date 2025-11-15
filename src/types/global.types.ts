/**
 * Переменная типов environment для приложения
 */
export const EnvironmentTypes = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

/**
 * Тип от EnvironmentTypes
 */
export type Environment = (typeof EnvironmentTypes)[keyof typeof EnvironmentTypes];
