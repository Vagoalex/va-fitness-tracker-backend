import { IsEnum, IsOptional, IsString, MaxLength } from '@/common/validation';

import { UserGender } from '@/core/enums/user-gender.enum';
import { USERS_CONSTANTS } from '@/common/constants';

export class UpdateCurrentUserDto {
  /** Имя пользователя */
  @IsOptional()
  @IsString()
  @MaxLength(USERS_CONSTANTS.USER_NAME_MAX_LENGTH)
  firstName?: string;

  /** Фамилия пользователя */
  @IsOptional()
  @IsString()
  @MaxLength(USERS_CONSTANTS.USER_NAME_MAX_LENGTH)
  lastName?: string;

  /** Телефон пользователя */
  @IsOptional()
  @IsString()
  @MaxLength(USERS_CONSTANTS.USER_PHONE_MAX_LENGTH)
  phone?: string;

  /** Пол пользователя */
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
