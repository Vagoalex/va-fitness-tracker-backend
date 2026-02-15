export enum RoleTypes {
  ADMIN = 'admin',
  USER = 'user',
  TRAINER = 'trainer',
}

export const ROLES_ARRAY = Object.values(RoleTypes);
export type RolesArray = (typeof RoleTypes)[keyof typeof RoleTypes];
