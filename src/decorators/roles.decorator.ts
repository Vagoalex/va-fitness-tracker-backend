import { SetMetadata } from '@nestjs/common';
import { RoleTypes } from '../enums/RoleTypes';

export const ROLES_KEY = 'roles';

/**
 * Декоратор проверки ролей. Работает совместно с /guards/roles.guard
 * @param roles
 * @constructor
 */
export const RequireRoles = (...roles: RoleTypes[]) => SetMetadata(ROLES_KEY, roles);