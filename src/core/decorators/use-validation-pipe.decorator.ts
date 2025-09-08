import { UsePipes } from '@nestjs/common';
import { CustomValidationPipe } from '../pipes/custom-validation.pipe';
import type { ValidationPipeOptions } from '@nestjs/common';

/**
 * Декоратор для стандартизированной валидации
 */
export function UseValidationPipe() {
	return UsePipes(new CustomValidationPipe());
}

/**
 * Декоратор для кастомной валидации с дополнительными опциями
 */
export function UseValidationPipeWithOptions(
	options?: ValidationPipeOptions,
): MethodDecorator & ClassDecorator {
	return UsePipes(new CustomValidationPipe(options));
}
