import { IsJWT } from '@/common/decorators/validation';

export class RefreshTokenDto {
  @IsJWT()
  refreshToken!: string;
}
