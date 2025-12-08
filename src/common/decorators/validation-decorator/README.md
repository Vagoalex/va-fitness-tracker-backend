## Инструкция по использованию

```typescript
import { Type } from 'class-transformer';
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsNotEmpty,
  IsStrongPassword,
  IsDate,
  IsAdult,
  IsOptional,
  Matches,
} from '/..some-path/common/decorators/validation-decorator/validation.decorator';

export class RegisterDto {
  @IsEmail() // Автоматически использует 'is_email' с автодополнением
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8) // Автоматически использует 'min_length'
  @MaxLength(100) // Автоматически использует 'max_length'
  @IsStrongPassword() // Кастомный валидатор
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Za-zА-Яа-яЁё]+$/) // Проверка на буквы
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Za-zА-Яа-яЁё]+$/)
  lastName!: string;

  @IsDate()
  @Type(() => Date)
  @IsAdult() // Кастомный валидатор для возраста
  birthDate!: Date;

  @IsString()
  @IsOptional() // Необязательное поле
  @Matches(/^\+7\d{10}$/) // Российский формат телефона
  phone?: string;

  // С кастомным сообщением (автодополнение работает!)
  @IsString()
  @MinLength(2, { message: 'min_length' })
  @MaxLength(50, { message: 'max_length' })
  username!: string;
}

// Пример с кастомными опциями
export class UpdateUserDto {
  @IsEmail({ 
    message: 'is_email', // Автодополнение для ключей переводов
    context: { 
      help: 'Enter a valid email like user@example.com' 
    }
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;
}
```