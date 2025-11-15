import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments,
	registerDecorator,
} from 'class-validator';
import { VALIDATION_ERRORS } from '../errors/validation-errors.constants';
import { CODE_PATTERN } from '../constants/patterns.constants';

@ValidatorConstraint({ name: 'isCodePattern', async: false })
export class IsCodePatternConstraint implements ValidatorConstraintInterface {
	private readonly pattern = CODE_PATTERN;

	validate(value: unknown, args: ValidationArguments) {
		if (typeof value !== 'string') {
			return false;
		}

		return this.pattern.test(value);
	}

	defaultMessage(args: ValidationArguments) {
		return VALIDATION_ERRORS.CODE_PATTERN.replace('$property', args.property);
	}
}

/**
 * Валидатор для проверки валидности code
 * @constructor
 */
export function IsCodePattern() {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			validator: IsCodePatternConstraint,
		});
	};
}
