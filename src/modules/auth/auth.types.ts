import { UserResponse } from '@/modules/user/persistence/user.schema';

/** Тип токенов авторизации */
export type AuthTokens = {
  tokenType: 'Bearer';
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
};

/** Тип ответа авторизации */
export type AuthResponse = AuthTokens & {
  user: UserResponse;
};

/** Тип метаданных сессии обновления */
export type RefreshSessionMeta = {
  ip?: string;
  userAgent?: string;
};
