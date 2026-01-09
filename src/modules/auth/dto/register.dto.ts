import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsPassword,
} from '../../../common/decorators';

/**
 * DTO для регистрации пользователя
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsPassword()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString({ message: 'is_string' })
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  lastName: string;
}
