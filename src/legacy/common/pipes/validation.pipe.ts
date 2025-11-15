import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(private readonly i18nService: I18nService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const translatedErrors = await this.translateErrors(errors);
      throw new BadRequestException({
        message: await this.i18nService.translate('validation.validation_failed'),
        errors: translatedErrors,
      });
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private async translateErrors(errors: any[]): Promise<any[]> {
    return Promise.all(
      errors.map(async (error) => {
        const constraints = error.constraints
          ? await this.translateConstraints(error.constraints)
          : {};
        return {
          field: error.property,
          value: error.value,
          constraints,
          children: error.children ? await this.translateErrors(error.children) : undefined,
        };
      }),
    );
  }

  private async translateConstraints(constraints: {
    [type: string]: string;
  }): Promise<{ [type: string]: string }> {
    const translated: { [type: string]: string } = {};

    for (const [type, message] of Object.entries(constraints)) {
      const translationKey = this.mapConstraintToTranslationKey(type);
      try {
        translated[type] =
          (await this.i18nService.translate(`validation.${translationKey}`)) || message;
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
