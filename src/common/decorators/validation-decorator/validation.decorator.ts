import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsEmail as OriginalIsEmail,
  IsNotEmpty as OriginalIsNotEmpty,
  IsString as OriginalIsString,
  MinLength as OriginalMinLength,
  MaxLength as OriginalMaxLength,
  IsNumber as OriginalIsNumber,
  IsInt as OriginalIsInt,
  IsBoolean as OriginalIsBoolean,
  IsDate as OriginalIsDate,
  IsArray as OriginalIsArray,
  IsEnum as OriginalIsEnum,
  Min as OriginalMin,
  Max as OriginalMax,
  IsUrl as OriginalIsUrl,
  Matches as OriginalMatches,
  IsOptional as OriginalIsOptional,
  IsDateString as OriginalIsDateString,
  IsNumberString as OriginalIsNumberString,
  IsJWT as OriginalIsJWT,
} from 'class-validator';
import { I18nKeys } from '../../../core/i18n/types';
import {
  TypedIsDateStringOptions,
  TypedIsEmailOptions,
  TypedIsNumberOptions,
  TypedIsNumberStringOptions,
  TypedIsUrlOptions,
  TypedValidationOptions,
} from './types';

/**
 * Тип для ключей переводов в неймспейсе validation
 */
type ValidationTranslationKeys = I18nKeys['validation'];

/**
 * Утилита для формирования финальных опций с добавлением префикса к ключу перевода
 */
function buildDecoratorOptions<T extends TypedValidationOptions>(
  options: T | undefined,
  defaultMessage: ValidationTranslationKeys,
): ValidationOptions & Omit<T, 'message'> {
  const { message, ...restOptions } = options || {};

  return {
    ...restOptions,
    message: message
      ? `validation.${message}` // Добавляем префикс для совместимости с ValidationPipe
      : `validation.${defaultMessage}`,
  } as ValidationOptions & Omit<T, 'message'>;
}

// ============================================================================
// ДЕКОРАТОРЫ БЕЗ ПАРАМЕТРОВ (кроме опций валидации)
// ============================================================================

/**
 * Декоратор для проверки, что значение не является пустым
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * @IsNotEmpty()
 * name: string;
 */
export function IsNotEmpty(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_not_empty');
  return OriginalIsNotEmpty(finalOptions);
}

/**
 * Декоратор для проверки, что значение является строкой
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsString()
 * title: string;
 */
export function IsString(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_string');
  return OriginalIsString(finalOptions);
}

/**
 * Декоратор для проверки, что значение является целым числом
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsInt()
 * quantity: number;
 */
export function IsInt(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_integer');
  return OriginalIsInt(finalOptions);
}

/**
 * Декоратор для проверки, что значение является boolean
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsBoolean()
 * isActive: boolean;
 */
export function IsBoolean(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_boolean');
  return OriginalIsBoolean(finalOptions);
}

/**
 * Декоратор для проверки, что значение является датой
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsDate()
 * birthDate: Date;
 */
export function IsDate(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_date');
  return OriginalIsDate(finalOptions);
}

/**
 * Декоратор для проверки, что значение является массивом
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsArray()
 * tags: string[];
 */
export function IsArray(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_array');
  return OriginalIsArray(finalOptions);
}

/**
 * Декоратор для проверки, что значение необязательно
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsOptional()
 * middleName?: string;
 */
export function IsOptional(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_not_empty');
  return OriginalIsOptional(finalOptions);
}

// ============================================================================
// ДЕКОРАТОРЫ С ОПЦИЯМИ СПЕЦИФИЧНОГО ТИПА
// ============================================================================

/**
 * Декоратор для проверки, что значение является валидным email адресом
 * @param options - Опции валидации email с поддержкой i18n
 * @example
 * .@IsEmail()
 * .@IsEmail({ allow_display_name: true })
 * .@IsEmail({ message: 'is_email' })
 * email: string;
 */
export function IsEmail(options?: TypedIsEmailOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(options, 'is_email');
  return OriginalIsEmail(finalOptions);
}

/**
 * Декоратор для проверки, что значение является числом
 * @param options - Опции валидации числа с поддержкой i18n
 * @example
 * .@IsNumber()
 * .@IsNumber({ maxDecimalPlaces: 2 })
 * .@IsNumber({ message: 'is_number' })
 * price: number;
 */
export function IsNumber(options?: TypedIsNumberOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(options, 'is_number');
  return OriginalIsNumber(finalOptions);
}

/**
 * Декоратор для проверки, что значение является URL
 * @param options - Опции валидации URL с поддержкой i18n
 * @example
 * .@IsUrl()
 * .@IsUrl({ require_protocol: true })
 * .@IsUrl({ message: 'is_url' })
 * website: string;
 */
export function IsUrl(options?: TypedIsUrlOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(options, 'is_url');
  return OriginalIsUrl(finalOptions);
}

/**
 * Декоратор для проверки, что значение является строкой даты
 * @param options - Опции валидации строки даты с поддержкой i18n
 * @example
 * .@IsDateString()
 * .@IsDateString({ strict: true })
 * .@IsDateString({ message: 'is_date' })
 * createdAt: string;
 */
export function IsDateString(options?: TypedIsDateStringOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(options, 'is_date');
  return OriginalIsDateString(finalOptions);
}

/**
 * Декоратор для проверки, что значение является строкой числа
 * @param options - Опции валидации строки числа с поддержкой i18n
 * @example
 * .@IsNumberString()
 * .@IsNumberString({ no_symbols: true })
 * .@IsNumberString({ message: 'is_number' })
 * price: string;
 */
export function IsNumberString(options?: TypedIsNumberStringOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(options, 'is_number');
  return OriginalIsNumberString(finalOptions);
}

// ============================================================================
// ДЕКОРАТОРЫ С ПАРАМЕТРАМИ
// ============================================================================

/**
 * Декоратор для проверки минимальной длины строки или массива
 * @param min - Минимальная длина
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@MinLength(8)
 * .@MinLength(8, { message: 'min_length' })
 * password: string;
 */
export function MinLength(
  min: number,
  validationOptions?: TypedValidationOptions,
): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'min_length');
  return OriginalMinLength(min, finalOptions);
}

/**
 * Декоратор для проверки максимальной длины строки или массива
 * @param max - Максимальная длина
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@MaxLength(100)
 * .@MaxLength(100, { message: 'max_length' })
 * description: string;
 */
export function MaxLength(
  max: number,
  validationOptions?: TypedValidationOptions,
): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'max_length');
  return OriginalMaxLength(max, finalOptions);
}

/**
 * Декоратор для проверки минимального числового значения
 * @param min - Минимальное значение
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@Min(0)
 * .@Min(0, { message: 'min' })
 * age: number;
 */
export function Min(min: number, validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'min');
  return OriginalMin(min, finalOptions);
}

/**
 * Декоратор для проверки максимального числового значения
 * @param max - Максимальное значение
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@Max(120)
 * .@Max(120, { message: 'max' })
 * age: number;
 */
export function Max(max: number, validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'max');
  return OriginalMax(max, finalOptions);
}

/**
 * Декоратор для проверки, что значение соответствует регулярному выражению
 * @param pattern - Регулярное выражение
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@Matches(/^[A-Z][a-z]+$/)
 * .@Matches(/^[A-Z][a-z]+$/, { message: 'matches' })
 * firstName: string;
 */
export function Matches(
  pattern: RegExp,
  validationOptions?: TypedValidationOptions,
): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'matches');
  return OriginalMatches(pattern, finalOptions);
}

/**
 * Декоратор для проверки, что значение является одним из значений перечисления
 * @param entity - Объект перечисления или массив допустимых значений
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * .@IsEnum(UserRole)
 * .@IsEnum(['active', 'inactive'], { message: 'is_enum' })
 * status: string;
 */
export function IsEnum(
  entity: object,
  validationOptions?: TypedValidationOptions,
): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_enum');
  return OriginalIsEnum(entity, finalOptions);
}

// ============================================================================
// КАСТОМНЫЕ ВАЛИДАТОРЫ
// ============================================================================

/**
 * Валидатор для проверки сложности пароля
 * Требования: минимум 8 символов, заглавная буква, строчная буква, цифра, специальный символ
 */
@ValidatorConstraint({ name: 'isStrongPassword' })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  defaultMessage(): string {
    return 'validation.is_strong_password';
  }
}

/**
 * Декоратор для проверки сложности пароля
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * @IsStrongPassword()
 * @IsStrongPassword({ message: 'is_strong_password' })
 * password: string;
 */
export function IsStrongPassword(validationOptions?: TypedValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: buildDecoratorOptions(validationOptions, 'is_strong_password'),
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

/**
 * Валидатор для проверки возраста пользователя (18+)
 */
@ValidatorConstraint({ name: 'isAdult' })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(birthDate: Date): boolean {
    if (!birthDate || !(birthDate instanceof Date)) {
      return false;
    }

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  defaultMessage(): string {
    return 'validation.is_adult';
  }
}

/**
 * Декоратор для проверки возраста пользователя (18+)
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * @IsAdult()
 * @IsAdult({ message: 'is_adult' })
 * birthDate: Date;
 */
export function IsAdult(validationOptions?: TypedValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: buildDecoratorOptions(validationOptions, 'is_adult'),
      constraints: [],
      validator: IsAdultConstraint,
    });
  };
}

/**
 * Валидатор для проверки даты в будущем
 */
@ValidatorConstraint({ name: 'isFutureDate' })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date): boolean {
    if (!date || !(date instanceof Date)) {
      return false;
    }

    return date > new Date();
  }

  defaultMessage(): string {
    return 'validation.is_future_date';
  }
}

/**
 * Декоратор для проверки даты в будущем
 * @param validationOptions - Опции валидации с поддержкой i18n
 * @example
 * @IsFutureDate()
 * @IsFutureDate({ message: 'is_future_date' })
 * appointmentDate: Date;
 */
export function IsFutureDate(validationOptions?: TypedValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: buildDecoratorOptions(validationOptions, 'is_future_date'),
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
// ============================================================================

/**
 * Композитный декоратор для проверки пароля
 * Объединяет требования к длине и сложности
 * @example
 * @IsPassword()
 * password: string;
 */
export function IsPassword(validationOptions?: TypedValidationOptions): PropertyDecorator {
  return function (object: object, propertyName: string | symbol) {
    // Применяем несколько валидаторов к одному полю
    MinLength(8, validationOptions)(object, propertyName);
    MaxLength(100, validationOptions)(object, propertyName);
    IsStrongPassword(validationOptions)(object, propertyName);
  };
}

export function IsJWT(validationOptions?: TypedValidationOptions): PropertyDecorator {
  const finalOptions = buildDecoratorOptions(validationOptions, 'is_jwt');
  return OriginalIsJWT(finalOptions);
}

// ============================================================================
// РЕЭКСПОРТ СТАНДАРТНЫХ УТИЛИТ
// ============================================================================

/**
 * Декоратор Type для преобразования типов в DTO
 * @example
 * @Type(() => Number)
 * price: number;
 */
export { Type } from 'class-transformer';

/**
 * Декоратор Transform для кастомных преобразований значений
 * @example
 * @Transform(({ value }) => value.trim())
 * name: string;
 */
export { Transform } from 'class-transformer';

/**
 * Декоратор Exclude для исключения свойства из сериализации
 * @example
 * @Exclude()
 * password: string;
 */
export { Exclude } from 'class-transformer';

/**
 * Декоратор Expose для явного указания сериализуемых свойств
 * @example
 * @Expose()
 * id: string;
 */
export { Expose } from 'class-transformer';
