import { Request } from 'express';
import { JwtPayload } from '../modules/auth/types';

/**
 * Расширенный Request с пользователем
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
