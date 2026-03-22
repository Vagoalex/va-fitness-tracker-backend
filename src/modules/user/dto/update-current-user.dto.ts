import { IsOptional, MaxLength, IsEnum, IsString } from '@/common/decorators/validation';

import { UserGender } from '@/core/enums/user-gender.enum';
import { USERS_CONSTANTS } from '@/common/constants';

/**
 * DTO для обновления текущего пользователя
 */
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
  @MaxLength(15)
  phone?: string;

  /** Пол пользователя */
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;
}
