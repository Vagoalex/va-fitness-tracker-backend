import {
  IsEmail,
  IsOptional,
  IsPassword,
  IsString,
  MaxLength,
} from '@/common/decorators/validation';
import { USERS_CONSTANTS } from '@/common/constants';

/**
 * DTO для регистрации пользователя
 */
export class RegisterDto {
  /** Email пользователя */
  @IsEmail()
  email!: string;

  /** Пароль пользователя */
  @IsPassword()
  password!: string;

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
}
