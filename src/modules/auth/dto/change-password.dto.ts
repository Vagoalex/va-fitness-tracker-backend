import { IsPassword, IsString, MinLength, MaxLength } from '@/common/decorators/validation';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  currentPassword!: string;

  @IsPassword()
  newPassword!: string;
}
