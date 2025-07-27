import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
	ValidationOptions,
} from 'class-validator';

/**
 * Валидатор для class-validator
 */
@ValidatorConstraint({ name: 'arrayMinLength', async: false })
export class ArrayMinLengthValidator implements ValidatorConstraintInterface {
	validate(value: unknown, args: ValidationArguments): boolean {
		if (!Array.isArray(value)) return false;

		const minLength = args.constraints[0] as number;
		return value.length >= minLength;
	}

	defaultMessage(args: ValidationArguments): string {
		const minLength = args.constraints[0] as number;
		return `Требуется не менее ${minLength}`;
	}
}

/**
 *  Декоратор для DTO
 * @param min
 * @param validationOptions
 * @constructor
 */
export function ArrayMinLength(min: number, validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'arrayMinLength',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [min],
			options: validationOptions,
			validator: ArrayMinLengthValidator,
		});
	};
}

/**
 * Валидатор для Mongoose схемы
 * @param min
 * @param message
 */
export const arrayMinLength = (min: number, message?: string) => ({
	validator: (value: unknown) => {
		if (!Array.isArray(value)) return false;
		return value.length >= min;
	},
	message: message || `Требуется не менее ${min}`,
});

/**
 * Типизированная версия для вложенных объектов (опционально)
 */
interface ArrayValidationOptions {
	min?: number;
	max?: number;
	message?: string;
}

export const arrayValidator = (options: ArrayValidationOptions) => ({
	validator: (value: unknown) => {
		if (!Array.isArray(value)) return false;

		if (options.min !== undefined && value.length < options.min) return false;
		if (options.max !== undefined && value.length > options.max) return false;

		return true;
	},
	message:
		options.message ||
		`Количество элементов должно быть между ${options.min || 0} и ${options.max || '∞'}`,
});
