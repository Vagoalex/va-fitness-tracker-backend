import { RoleType } from '@/core/enums/role-type.enum';

/**
 * Полезная нагрузка JWT access токена
 */
export type JwtAccessPayload = {
  sub: string;
  roles: RoleType[];
  passwordChangedAt?: number;
};

/**
 * Полезная нагрузку JWT refresh токена
 */
export type JwtRefreshPayload = {
  sub: string;
  sid: string;
  passwordChangedAt?: number;
};
