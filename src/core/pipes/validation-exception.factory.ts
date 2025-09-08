import { ValidationError, BadRequestException } from '@nestjs/common';
import { CORE_ERRORS } from '../errors/errors.constants';

/**
 * Фабрика для создания стандартизированных ошибок валидации
 */
export function createValidationException(errors: ValidationError[]) {
	const messages = errors.map((error) => {
		const constraints = Object.values(error.constraints || {});
		return constraints.join(', ');
	});

	return new BadRequestException({
		message: CORE_ERRORS.VALIDATION_ERROR,
		errors: messages,
		statusCode: 400,
		timestamp: new Date().toISOString(),
	});
}
