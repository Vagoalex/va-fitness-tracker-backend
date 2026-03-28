import { IsPassword, IsString, MinLength, MaxLength } from '@/common/validation';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export class ChangePasswordDto {
  @IsString()
  @MinLength(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH_CONSTANTS.PASSWORD_MAX_LENGTH)
  currentPassword!: string;

  @IsPassword()
  newPassword!: string;
}
