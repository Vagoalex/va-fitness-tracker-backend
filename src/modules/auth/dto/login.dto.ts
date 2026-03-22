import { IsEmail, IsString, MaxLength, MinLength } from '@/common/decorators/validation';

export class LoginDto {
  /** Email пользователя */
  @IsEmail()
  email!: string;

  /** Пароль пользователя */
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password!: string;
}
