export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
  TRAINER = 'trainer',
}

/** Массив ролей */
export const ROLES_ARRAY = Object.values(RoleType);
/** Тип значения роли */
export type RoleTypeT = (typeof RoleType)[keyof typeof RoleType];
