import { RoleTypes } from '../enums/RoleTypes';
import { templateParts } from './template-parts.constants';

export const TOKEN_NOT_FOUND_ERROR = 'Токен не предоставлен';
export const NOT_VALID_TOKEN_ERROR = 'Невалидный токен';
export const NOT_AUTHORITY_ERROR = 'Недостаточно прав';
export const NOT_AUTHORITY_ROLES_ERROR = `Недостаточно прав. Требуемые роли: ${templateParts.id}. `;

export const ALL_ROLES: RoleTypes[] = [RoleTypes.User, RoleTypes.Admin, RoleTypes.Trainer];
export const PUBLIC_ROLES: RoleTypes[] = [RoleTypes.User, RoleTypes.Trainer];
export const ADMIN_ROLES: RoleTypes[] = ALL_ROLES;

export const JwtTypeName = 'jwt';
