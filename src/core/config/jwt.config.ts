import { registerAs } from '@nestjs/config';
import { JwtConfig } from '../../types/config.types';

/**
 * Название регистрируемого конфига (jwt)
 */
export const REGISTER_JWT = 'jwt';

export default registerAs(
  REGISTER_JWT,
  (): JwtConfig => ({
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '60m',
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS ? Number(process.env.BCRYPT_SALT_ROUNDS) : 12,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }),
);
