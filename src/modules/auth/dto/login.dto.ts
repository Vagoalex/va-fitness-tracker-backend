import { IsEmail, IsString, MaxLength, MinLength } from '@/common/validation';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export class LoginDto {
  /** Email пользователя */
  @IsEmail()
  @MaxLength(AUTH_CONSTANTS.EMAIL_MAX_LENGTH)
  email!: string;

  /** Пароль пользователя */
  @IsString()
  @MinLength(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH_CONSTANTS.PASSWORD_MAX_LENGTH)
  password!: string;
}
