import { IsJWT } from '@/common/validation';

export class RefreshTokenDto {
  @IsJWT()
  refreshToken!: string;
}
