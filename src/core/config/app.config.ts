import { registerAs } from '@nestjs/config';
import { EnvironmentTypes } from '../../types/global.types';
import { AppConfig } from '../../types/config.types';

export const REGISTER_APP = 'app';

/**
 *  appConfig
 */
export default registerAs(
  REGISTER_APP,
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || EnvironmentTypes.DEVELOPMENT,
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    isProduction: process.env.NODE_ENV === EnvironmentTypes.PRODUCTION,
    isDevelopment: process.env.NODE_ENV === EnvironmentTypes.DEVELOPMENT,
  }),
);
