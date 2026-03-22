import { UserDocument } from '@/modules/user/persistence/user.schema';

/** Тип токенов авторизации */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

/** Тип ответа авторизации */
export type AuthResponse = AuthTokens & {
  user: UserDocument;
};

/** Тип метаданных сессии обновления */
export type RefreshSessionMeta = {
  ip?: string;
  userAgent?: string;
};
