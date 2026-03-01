import { Request } from 'express';
import { JwtPayload } from '../../legacy-2/auth/types';

/**
 * Расширенный Request с пользователем
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
