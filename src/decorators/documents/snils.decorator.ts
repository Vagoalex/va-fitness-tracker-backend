import { IsString, IsNotEmpty, registerDecorator, ValidationOptions } from 'class-validator';
import { checkSnils } from 'ru-validation-codes';
import { NOT_VALID_SNILS_VALIDATION_ERROR } from '../../constants/common.global-constants';

/** Кастомный декоратор для валидации СНИЛС */
export function IsValidSNILS(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: string) {
					return checkSnils(value);
				},
				defaultMessage() {
					return NOT_VALID_SNILS_VALIDATION_ERROR;
				},
			},
		});
	};
}

// Модель с валидацией ИНН и СНИЛС
export class User {
	@IsString()
	@IsNotEmpty()
	name: string;
}
