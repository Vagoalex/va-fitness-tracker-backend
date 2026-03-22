/** Конфигурация авторизации */
export const authConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET ?? '',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET ?? '',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  refreshTokenTtlMs: Number(process.env.JWT_REFRESH_TTL_MS ?? 1000 * 60 * 60 * 24 * 30),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
};

/** Валидация конфигурации авторизации */
export const validateAuthConfig = (): void => {
  // Обязательные переменные окружения
  const requiredEnvironmentVariables = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRES',
    'JWT_REFRESH_EXPIRES',
    'JWT_REFRESH_TTL_MS',
  ];

  // Переменные окружения, которые отсутствуют
  const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (environmentVariableName) => !process.env[environmentVariableName],
  );

  // Если отсутствуют переменные окружения, выбрасываем ошибку
  if (missingEnvironmentVariables.length > 0) {
    throw new Error(`Missing auth env variables: ${missingEnvironmentVariables.join(', ')}`);
  }
};
