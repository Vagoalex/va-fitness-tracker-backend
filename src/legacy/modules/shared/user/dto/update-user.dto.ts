import { IsOptional } from 'class-validator';
import { UserGenderTypes } from '../enums/UserGenderTypes';
import { UserStatusTypes } from '../enums/UserStatusTypes';
import { IsString, IsEnum } from '../../../../core/decorators/validation.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(UserGenderTypes)
  gender?: UserGenderTypes;

  @IsOptional()
  @IsEnum(UserStatusTypes)
  status?: UserStatusTypes;

  @IsOptional()
  @IsString()
  phone: string;
}
