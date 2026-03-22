export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
  TRAINER = 'trainer',
}

/** Массив ролей */
export const ROLE_TYPE_VALUES = Object.values(RoleType) as RoleType[];
