import {
	IsString as OriginalIsString,
	IsNumber as OriginalIsNumber,
	IsEnum as OriginalIsEnum,
	IsNotEmpty as OriginalIsNotEmpty,
	IsEmail as OriginalIsEmail,
	MinLength as OriginalMinLength,
	MaxLength as OriginalMaxLength,
	Min as OriginalMin,
	Max as OriginalMax,
	IsDate as OriginalIsDate,
	IsBoolean as OriginalIsBoolean,
	IsArray as OriginalIsArray,
	IsMongoId as OriginalIsMongoId,
	IsPositive as OriginalIsPositive,
	IsInt as OriginalIsInt,
	ValidationOptions,
} from 'class-validator';
import { VALIDATION_ERRORS } from '../errors/validation-errors.constants';

/** Декоратор для строк */
export function IsString(options?: ValidationOptions) {
	return OriginalIsString({ message: VALIDATION_ERRORS.IS_STRING, ...options });
}

/** Декоратор для чисел */
export function IsNumber() {
	return OriginalIsNumber({}, { message: VALIDATION_ERRORS.IS_NUMBER });
}

/** Декоратор для enum */
export function IsEnum(entity: object) {
	return OriginalIsEnum(entity, { message: VALIDATION_ERRORS.IS_ENUM });
}

/** Декоратор для проверки на пустоту */
export function IsNotEmpty() {
	return OriginalIsNotEmpty({ message: VALIDATION_ERRORS.IS_NOT_EMPTY });
}

/** Декоратор для email */
export function IsEmail() {
	return OriginalIsEmail({}, { message: VALIDATION_ERRORS.IS_EMAIL });
}

/** Декоратор для минимальной длины */
export function MinLength(min: number) {
	return OriginalMinLength(min, { message: VALIDATION_ERRORS.MIN_LENGTH });
}

/** Декоратор для максимальной длины */
export function MaxLength(max: number) {
	return OriginalMaxLength(max, { message: VALIDATION_ERRORS.MAX_LENGTH });
}

/** Декоратор для минимального значения */
export function Min(min: number) {
	return OriginalMin(min, { message: VALIDATION_ERRORS.MIN });
}

/** Декоратор для максимального значения */
export function Max(max: number) {
	return OriginalMax(max, { message: VALIDATION_ERRORS.MAX });
}

/** Декоратор для даты */
export function IsDate() {
	return OriginalIsDate({ message: VALIDATION_ERRORS.IS_DATE });
}

/** Декоратор для boolean */
export function IsBoolean() {
	return OriginalIsBoolean({ message: VALIDATION_ERRORS.IS_BOOLEAN });
}

/** Декоратор для массива */
export function IsArray() {
	return OriginalIsArray({ message: VALIDATION_ERRORS.IS_ARRAY });
}

/** Декоратор для MongoDB ID */
export function IsMongoId() {
	return OriginalIsMongoId({ message: VALIDATION_ERRORS.IS_MONGO_ID });
}

/** Декоратор для положительных чисел */
export function IsPositive() {
	return OriginalIsPositive({ message: VALIDATION_ERRORS.IS_POSITIVE });
}

/** Декоратор для целых чисел */
export function IsInt() {
	return OriginalIsInt({ message: VALIDATION_ERRORS.IS_INT });
}

/** Декоратор для ObjectId (кастомная реализация) */
export { IsValidObjectId } from '../validators/is-valid-objectid.validator';
