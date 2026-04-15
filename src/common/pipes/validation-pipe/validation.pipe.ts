import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { I18nPath } from '@/core/i18n';
import {
  InternalValidationErrorDetail,
  InternalValidationErrorResponse,
} from '@/core/types/errors.types';
import { CONSTRAINT_TO_I18N_KEY, CONSTRAINT_PRIORITY, ValidationTranslationKeys } from './types';

/**
 * Кастомный пайп валидации с поддержкой i18n и типобезопасностью
 *
 * @description
 * Заменяет стандартный ValidationPipe NestJS, добавляя:
 * 1. Автоматический перевод сообщений об ошибках
 * 2. Структурированный формат ошибок для фронтенда
 * 3. Поддержку вложенных объектов и массивов
 *
 * @example
 * ```typescript
 * // В контроллере
 * @Post()
 * async create(@Body(ValidationPipe) createDto: CreateDto) {}
 *
 * // Или глобально в main.ts
 * app.useGlobalPipes(new ValidationPipe());
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  private readonly sensitiveFieldMarkers = [
    'password',
    'token',
    'authorization',
    'cookie',
    'secret',
  ];

  /**
   * Основной метод трансформации и валидации входных данных
   *
   * @param value - Входные данные для валидации
   * @param metadata - Метаданные аргумента (информация о типе DTO)
   * @returns Валидированные и трансформированные данные
   * @throws BadRequestException с структурированными ошибками валидации
   */
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    // Если тип не указан или является примитивным, пропускаем валидацию
    if (!metatype || !this.isValidatableType(metatype)) {
      return value;
    }

    // Преобразуем plain object в экземпляр класса для валидации
    const objectInstance = plainToInstance(metatype as ClassConstructor<object>, value, {
      enableImplicitConversion: true,
    });

    // Выполняем валидацию с дополнительными опциями
    const validationErrors = await validate(objectInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: { target: false, value: true },
    });

    // Если ошибок нет, возвращаем валидированный объект
    if (validationErrors.length === 0) {
      return objectInstance;
    }

    // Обрабатываем и структурируем ошибки валидации
    const structuredErrors = this.processValidationErrors(validationErrors);

    // Создаем структурированный ответ об ошибке
    const errorResponse: InternalValidationErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'validation.validation_failed',
      details: { errors: structuredErrors },
    };

    // Бросаем исключение с структурированной ошибкой
    throw new BadRequestException(errorResponse);
  }

  /**
   * Проверяет, является ли тип валидируемым
   * Примитивные типы (String, Number, Boolean, Array, Object) не требуют валидации
   *
   * @param metatype - Проверяемый тип
   * @returns true если тип требует валидации через class-validator
   */
  private isValidatableType(metatype: unknown): boolean {
    const primitiveTypes: unknown[] = [String, Boolean, Number, Array, Object];
    return !primitiveTypes.includes(metatype);
  }

  /**
   * Обрабатывает массив ошибок валидации в структурированный формат
   *
   * @param errors - Ошибки валидации от class-validator
   * @param parentPath - Путь родительского поля для вложенных объектов
   * @returns Массив структурированных ошибок
   */
  private processValidationErrors(
    errors: ClassValidatorError[],
    parentPath: string = '',
  ): InternalValidationErrorDetail[] {
    const structuredErrors: InternalValidationErrorDetail[] = [];

    for (const error of errors) {
      // Строим полный путь к полю (с учетом вложенности)
      const fullPath = this.buildFieldPath(error.property, parentPath);

      // Рекурсивно обрабатываем вложенные ошибки (для объектов и массивов)
      if (error.children && error.children.length > 0) {
        structuredErrors.push(...this.processValidationErrors(error.children, fullPath));
      }
      // Если есть констрейнты, обрабатываем их
      if (error.constraints && Object.keys(error.constraints).length > 0) {
        structuredErrors.push(this.createInternalValidationErrorDetail(error, fullPath));
      }
    }

    return structuredErrors;
  }

  /**
   * Создает структурированную ошибку валидации для одного поля
   *
   * @param error - Ошибка валидации от class-validator
   * @param fieldPath - Полный путь к полю
   * @returns Структурированная ошибка валидации
   */
  private createInternalValidationErrorDetail(
    error: ClassValidatorError,
    fieldPath: string,
  ): InternalValidationErrorDetail {
    const constraintEntries = Object.entries(error.constraints ?? {});
    const mapped = constraintEntries.map(([constraintType, originalMessage]) => {
      const key = this.getTranslationKey(constraintType, originalMessage);
      return {
        constraintType,
        i18nPath: `validation.${key}` as I18nPath,
        args: this.buildArgs(constraintType, originalMessage, fieldPath, error.value),
      };
    });

    const primary = this.selectPrimary(mapped);

    return {
      field: fieldPath,
      value: this.sanitizeFieldValue(fieldPath, error.value),
      message: primary.i18nPath,
      args: primary.args,
      constraints: mapped.map((m) => m.i18nPath),
    };
  }

  /**
   * Определяет ключ перевода для констрейнта валидации
   *
   * @param constraintType - Тип констрейнта (например, 'isEmail')
   * @param originalMessage - Оригинальное сообщение об ошибке
   * @returns Ключ перевода из i18n системы
   */
  private getTranslationKey(
    constraintType: string,
    originalMessage: string,
  ): ValidationTranslationKeys {
    // Проверяем, не является ли оригинальное сообщение уже ключом перевода
    // (например, для кастомных валидаторов, которые возвращают ключи)
    const translationKeyMatch = originalMessage.match(/^validation\.(.+)$/);
    if (translationKeyMatch) {
      const potentialKey = translationKeyMatch[1];

      // Проверяем, существует ли такой ключ в нашей карте констрейнтов
      if (potentialKey in CONSTRAINT_TO_I18N_KEY) {
        return potentialKey as ValidationTranslationKeys;
      }
    }

    // Используем стандартное сопоставление констрейнта с ключом перевода
    const mappedKey = CONSTRAINT_TO_I18N_KEY[constraintType];
    if (mappedKey) {
      return mappedKey;
    }

    // Если констрейнт не найден в маппинге, используем общий ключ
    return 'validation_failed';
  }

  private selectPrimary(
    mapped: Array<{ constraintType: string; i18nPath: I18nPath; args: Record<string, unknown> }>,
  ) {
    for (const type of CONSTRAINT_PRIORITY) {
      const found = mapped.find((m) => m.constraintType === type);
      if (found) return found;
    }
    return (
      mapped[0] ?? {
        constraintType: 'unknown',
        i18nPath: 'validation.validation_failed' as I18nPath,
        args: {},
      }
    );
  }

  /**
   * Строит полный путь к полю с учетом вложенности
   *
   * @param property - Свойство текущего уровня
   * @param parentPath - Путь родительского уровня
   * @returns Полный путь к полю в формате 'parent.child'
   */
  private buildFieldPath(property: string, parentPath: string): string {
    return parentPath ? `${parentPath}.${property}` : property;
  }

  private buildArgs(
    constraintType: string,
    originalMessage: string,
    fieldPath: string,
    value: unknown,
  ): Record<string, unknown> {
    // базовые args
    const args: Record<string, unknown> = {
      field: fieldPath,
      value,
    };

    // Попытка вытащить параметры из сообщения (простая и достаточная для MVP)
    // Примеры сообщений class-validator часто содержат числа/паттерны.
    // Если ты хочешь 100% корректно — лучше передавать args из кастомных декораторов через contexts.
    if (constraintType === 'minLength' || constraintType === 'maxLength') {
      const n = this.extractFirstNumber(originalMessage);
      if (n !== null) {
        args[constraintType === 'minLength' ? 'min' : 'max'] = n;
      }
    }

    if (constraintType === 'length') {
      const nums = this.extractNumbers(originalMessage);
      if (nums.length >= 2) {
        args.min = nums[0];
        args.max = nums[1];
      }
    }

    if (constraintType === 'min' || constraintType === 'max') {
      const n = this.extractFirstNumber(originalMessage);
      if (n !== null) {
        args[constraintType] = n;
      }
    }

    // matches — попробуем вытащить pattern
    if (constraintType === 'matches') {
      const pattern = this.extractPattern(originalMessage);
      if (pattern) args.pattern = pattern;
    }

    return args;
  }

  private extractFirstNumber(text: string): number | null {
    const m = text.match(/(\d+(\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }

  private extractNumbers(text: string): number[] {
    return Array.from(text.matchAll(/(\d+(\.\d+)?)/g)).map((m) => Number(m[1]));
  }

  private extractPattern(text: string): string | null {
    // очень простая эвристика
    const m = text.match(/\/(.+)\/[gimsuy]*/);
    return m?.[1] ?? null;
  }

  private sanitizeFieldValue(fieldPath: string, value: unknown): unknown {
    const normalizedFieldPath = fieldPath.toLowerCase();

    if (this.sensitiveFieldMarkers.some((marker) => normalizedFieldPath.includes(marker))) {
      return '[REDACTED]';
    }

    return value;
  }
}
