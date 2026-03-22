export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

/** Массив статусов пользователей */
export const USER_STATUS_ARRAY = Object.values(UserStatus);
/** Тип значения статуса пользователя */
export type UserStatusT = (typeof UserStatus)[keyof typeof UserStatus];
