import { AuthTranslationKeys } from './types';

export const JwtTypeName = 'jwt';

export const AUTH_CONSTANTS = {
  JWT_STRATEGY_NAME: 'jwt',
  JWT_REFRESH_STRATEGY_NAME: 'jwt-refresh',
  BCRYPT_SALT_ROUNDS: 12,
  JWT_ACCESS_EXPIRES_IN: '60m',
  JWT_REFRESH_EXPIRES_IN: '7d',
} as const;

export const AUTH_ERRORS: Record<string, AuthTranslationKeys> = {
  USER_EXISTS: 'errors.user_exists',
  INVALID_CREDENTIALS: 'errors.invalid_credentials',
  INVALID_TOKEN: 'errors.invalid_token',
  INSUFFICIENT_PERMISSIONS: 'errors.insufficient_permissions',
  ACCOUNT_INACTIVE: 'errors.account_inactive',
  REFRESH_TOKEN_EXPIRED: 'errors.refresh_token_expired',
} as const;

export const AUTH_SUCCESS: Record<string, AuthTranslationKeys> = {
  REGISTERED: 'success.registered',
  LOGGED_IN: 'success.logged_in',
  LOGGED_OUT: 'success.logged_out',
  TOKEN_REFRESHED: 'success.token_refreshed',
} as const;
