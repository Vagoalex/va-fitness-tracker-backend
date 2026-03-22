export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

/** Массив статусов пользователей */
export const USER_STATUS_VALUES = Object.values(UserStatus) as UserStatus[];
