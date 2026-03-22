export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

/** Массив гендеров пользователей */
export const USER_GENDER_VALUES = Object.values(UserGender) as UserGender[];
