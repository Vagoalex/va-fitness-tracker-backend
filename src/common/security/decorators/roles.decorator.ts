import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@/core/enums/role-type.enum';
import { ROLES_METADATA_KEY } from '@/common/security/constants/security.constants';

/**
 * Декоратор для проверки ролей
 *
 * @param roles - роли, которые нужно проверить
 * @returns декоратор
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_METADATA_KEY, roles);
