import { registerAs } from '@nestjs/config';
import { EnvironmentTypes } from '../../types/global.types';
import { AppConfig } from '../../types/config.types';

/**
 * Название регистрируемого конфига (app)
 */
export const REGISTER_APP = 'app';

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
  }),
);
