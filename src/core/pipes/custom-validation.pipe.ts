import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { createValidationException } from './validation-exception.factory';

/**
 * Кастомный ValidationPipe со стандартной обработкой ошибок
 */
export class CustomValidationPipe extends ValidationPipe {
	constructor(options?: ValidationPipeOptions) {
		super({
			exceptionFactory: createValidationException,
			transform: true, // Включить трансформацию по умолчанию
			whitelist: true, // Отклонять поля не из DTO по умолчанию
			forbidNonWhitelisted: true, // Выбрасывать ошибку при невалидных полях
			...options, // Позволяет переопределить настройки
		});
	}
}
