import { Request } from 'express';

import { JwtAccessPayload } from '@/core/types/jwt-payload.types';

/**
 * Расширенный Request с полезной нагрузкой JWT access токена
 */
export type AuthenticatedRequest = Request & {
  user: JwtAccessPayload;
};

/**
 * Совместимость со старым названием типа запроса.
 */
export type AuthorizedRequest = AuthenticatedRequest;
