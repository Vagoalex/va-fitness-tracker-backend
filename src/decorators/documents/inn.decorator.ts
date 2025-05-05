import {
	IsString,
	IsNotEmpty,
	Validate,
	registerDecorator,
	ValidationOptions,
} from 'class-validator';
import { checkINN, checkSnils } from 'ru-validation-codes';
import { NOT_VALID_INN_VALIDATION_ERROR } from '../../constants/common.global-constants';

/** Кастомный декоратор для валидации ИНН */
export function IsValidINN(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: {
				validate(value: string) {
					return checkINN(value);
				},
				defaultMessage() {
					return NOT_VALID_INN_VALIDATION_ERROR;
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

	@IsString()
	@IsNotEmpty()
	@IsValidINN()
	inn: string;
}
