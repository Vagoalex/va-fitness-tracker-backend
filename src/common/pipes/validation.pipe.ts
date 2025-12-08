import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationError } from 'class-validator/types/validation/ValidationError';
import { I18nService } from '../../core/i18n';

// Тип для ограничений (ключи - это валидаторы, значения - строки)
type TranslatedConstraint = Record<string, string>;

// Интерфейс для структуры ошибки после перевода
interface TranslatedError {
  field: string;
  value: unknown;
  constraints: TranslatedConstraint;
  children?: TranslatedError[];
}

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  constructor(private readonly i18nService: I18nService) {}

  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value) as object;
    const errors = await validate(object);

    if (errors.length > 0) {
      const translatedErrors = await this.translateErrors(errors);
      throw new BadRequestException({
        message: this.i18nService.validation('validation_failed'),
        errors: translatedErrors,
      });
    }

    return value;
  }

  private toValidate(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private async translateErrors(errors: ValidationError[]): Promise<TranslatedError[]> {
    return Promise.all(
      errors.map(async (error) => {
        const constraints = error.constraints
          ? await this.translateConstraints(error.constraints)
          : {};

        return {
          field: error.property,
          value: error.value as unknown,
          constraints,
          children: error.children ? await this.translateErrors(error.children) : undefined,
        };
      }),
    );
  }

  private translateConstraints(constraints: {
    [type: string]: string;
  }): Promise<{ [type: string]: string }> {
    const translated: { [type: string]: string } = {};

    for (const [type, message] of Object.entries(constraints)) {
      const translationKey = this.mapConstraintToTranslationKey(type);
      try {
        translated[type] = this.i18nService.validation(translationKey) || message;
      } catch {
        translated[type] = message;
      }
    }

    return translated;
  }

  private mapConstraintToTranslationKey(constraint: string): string {
    const mapping: { [key: string]: string } = {
      isEmail: 'is_email',
      isNotEmpty: 'is_not_empty',
      minLength: 'min_length',
      maxLength: 'max_length',
      isString: 'is_string',
      isNumber: 'is_number',
    };

    return mapping[constraint] || constraint;
  }
}
