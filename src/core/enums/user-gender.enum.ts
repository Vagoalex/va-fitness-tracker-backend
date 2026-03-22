export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

/** Массив гендеров пользователей */
export const USER_GENDER_ARRAY = Object.values(UserGender);
/** Тип значения гендера пользователя */
export type UserGenderT = (typeof UserGender)[keyof typeof UserGender];
