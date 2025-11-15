import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';
import { isValidObjectId } from 'mongoose';
import { CORE_ERRORS } from '../errors/errors.constants';

@ValidatorConstraint({ name: 'isValidObjectId', async: false })
export class IsValidObjectIdConstraint implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		return isValidObjectId(value);
	}

	defaultMessage(args: ValidationArguments) {
		return CORE_ERRORS.NOT_VALID_FORMAT_ID_VALIDATION_ERROR;
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
