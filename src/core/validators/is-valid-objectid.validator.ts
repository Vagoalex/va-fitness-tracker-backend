// shared/validators/is-valid-objectid.validator.ts
import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';
import { isValidObjectId } from 'mongoose';

@ValidatorConstraint({ name: 'isValidObjectId', async: false })
export class IsValidObjectIdConstraint implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		return isValidObjectId(value);
	}

	defaultMessage(args: ValidationArguments) {
		return 'Некорректный формат ID';
	}
}

/**
 * Валидатор для проверки валидности ID
 * @constructor
 */
export function IsValidObjectId() {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			validator: IsValidObjectIdConstraint,
		});
	};
}
