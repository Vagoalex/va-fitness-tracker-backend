// modules/user/constants.ts
import { RoleTypes } from '../../../types/roles.types';

// TODO:
export const USER_CONSTANTS = {
  ROLES: RoleTypes,
  DEFAULT_ROLE: RoleTypes.USER,
  DEFAULT_AVATAR: 'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
} as const;

export const USER_ERROR_KEYS = {
  NOT_FOUND: 'user.errors.not_found',
  ALREADY_EXISTS: 'user.errors.already_exists',
  INVALID_ROLE: 'user.errors.invalid_role',
  CANNOT_DELETE_SELF: 'user.errors.cannot_delete_self',
  CANNOT_UPDATE_ROLE: 'user.errors.cannot_update_role',
  CANNOT_DEACTIVATE_SELF: 'user.errors.cannot_deactivate_self',
  PASSWORD_MISMATCH: 'user.errors.password_mismatch',
} as const;

export const USER_SUCCESS_KEYS = {
  CREATED: 'user.success.created',
  UPDATED: 'user.success.updated',
  DELETED: 'user.success.deleted',
  PROFILE_UPDATED: 'user.success.profile_updated',
  PASSWORD_UPDATED: 'user.success.password_updated',
  ACTIVATED: 'user.success.activated',
  DEACTIVATED: 'user.success.deactivated',
} as const;
