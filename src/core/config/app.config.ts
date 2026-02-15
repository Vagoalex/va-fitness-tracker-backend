import { registerAs } from '@nestjs/config';
import { EnvironmentTypes } from '../../types/global.types';
import { AppConfig, AppLogLevel, LOG_LEVELS } from '../../types/config.types';

/**
 * Название регистрируемого конфига (app)
 */
export const REGISTER_APP = 'app';

const parseLogLevel = (value?: string): AppLogLevel => {
  const normalized = (value ?? 'log').toLowerCase() as AppLogLevel;
  const allowed: AppLogLevel[] = [...LOG_LEVELS];
  return allowed.includes(normalized) ? normalized : 'log';
};

/**
 *  appConfig
 */
export default registerAs(
  REGISTER_APP,
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV as AppConfig['nodeEnv'],
    port: Number(process.env.PORT),
    apiPrefix: process.env.API_PREFIX || 'api',
    isProduction: process.env.NODE_ENV === EnvironmentTypes.PRODUCTION,
    isDevelopment: process.env.NODE_ENV === EnvironmentTypes.DEVELOPMENT,
    logLevel: parseLogLevel(process.env.LOG_LEVEL),
  }),
);
