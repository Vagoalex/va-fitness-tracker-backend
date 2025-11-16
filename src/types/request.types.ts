import { Request } from 'express';
import { RoleTypes } from '../legacy/core/enums/RoleTypes';

// TODO: перенести в другое место
/**
 * Полезная нагрузка JWT токена
 */
export interface JwtPayload {
  userId: string;
  email: string;
  roles: RoleTypes[];
  // другие поля из вашего JWT
}

/**
 * Расширенный Request с пользователем
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
