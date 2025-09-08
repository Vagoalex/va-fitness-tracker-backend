import { ValidationError, BadRequestException } from '@nestjs/common';
import { CORE_ERRORS } from '../errors/errors.constants';

/**
 * Фабрика для создания стандартизированных ошибок валидации
 */
export function createValidationException(errors: ValidationError[]) {
	// Группируем ошибки по полям
	const fieldErrors = errors.reduce(
		(acc, error) => {
			const constraints = Object.values(error.constraints || {});

			if (constraints.length > 0) {
				acc[error.property] = constraints;
			}

			// Обрабатываем вложенные ошибки (для сложных объектов)
			if (error.children && error.children.length > 0) {
				const nestedErrors = processNestedErrors(error.children, error.property);
				Object.assign(acc, nestedErrors);
			}

			return acc;
		},
		{} as Record<string, string[]>,
	);

	return new BadRequestException({
		message: CORE_ERRORS.VALIDATION_ERROR,
		errors: fieldErrors, // Теперь errors - объект с полями и массивами сообщений
		statusCode: 400,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Обрабатывает вложенные ошибки для сложных объектов и массивов
 */
function processNestedErrors(
	children: ValidationError[],
	parentPath: string,
): Record<string, string[]> {
	const result: Record<string, string[]> = {};

	children.forEach((child) => {
		const currentPath = parentPath ? `${parentPath}.${child.property}` : child.property;
		const constraints = Object.values(child.constraints || {});

		if (constraints.length > 0) {
			result[currentPath] = constraints;
		}

		// Рекурсивно обрабатываем更深层次的 вложенности
		if (child.children && child.children.length > 0) {
			const nestedErrors = processNestedErrors(child.children, currentPath);
			Object.assign(result, nestedErrors);
		}
	});

	return result;
}
