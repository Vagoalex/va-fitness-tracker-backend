import { I18nKeys } from '../../core/i18n/types';
import { RoleTypes } from '../../types/roles.types';

/**
 * Тип для ключей переводов в неймспейсе auth
 */
export type AuthTranslationKeys = I18nKeys['auth'];

/**
 * Полезная нагрузка JWT токена
 */
export interface JwtPayload {
  userId: string;
  email: string;
  roles: RoleTypes[];
  // другие поля из JWT
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: Tokens;
  message: string;
}
