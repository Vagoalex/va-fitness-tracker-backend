import { RoleTypes } from '../enums/RoleTypes';

export const TOKEN_NOT_FOUND_ERROR = 'Токен не предоставлен';
export const NOT_VALID_TOKEN_ERROR = 'Невалидный токен';
export const NOT_AUTHORITY_ERROR = 'Недостаточно прав';

export const ALL_ROLES: RoleTypes[] = [RoleTypes.User, RoleTypes.Admin, RoleTypes.Trainer];
export const PUBLIC_ROLES: RoleTypes[] = [RoleTypes.User, RoleTypes.Trainer];
export const ADMIN_ROLES: RoleTypes[] = ALL_ROLES;
