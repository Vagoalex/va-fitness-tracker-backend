import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { I18nService } from '../../../core/i18n';
import { ValidationErrorDetail, ValidationErrorResponse } from '../../../types/errors.types';
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
 * // В контроллере
 * @Post()
 * async create(@Body(ValidationPipe) createDto: CreateDto) {}
 *
 * // Или глобально в main.ts
 * app.useGlobalPipes(new ValidationPipe());
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  constructor(private readonly i18nService: I18nService) {}

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
    const objectInstance = plainToInstance(metatype, value) as object;

    // Выполняем валидацию с дополнительными опциями
    const validationErrors = await validate(objectInstance);

    // Если ошибок нет, возвращаем валидированный объект
    if (validationErrors.length === 0) {
      return objectInstance;
    }

    // Обрабатываем и структурируем ошибки валидации
    const structuredErrors = this.processValidationErrors(validationErrors);

    // Создаем структурированный ответ об ошибке
    const errorResponse: ValidationErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'validation.validation_failed',
      details: {
        errors: structuredErrors,
      },
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
  ): ValidationErrorDetail[] {
    const structuredErrors: ValidationErrorDetail[] = [];

    for (const error of errors) {
      // Строим полный путь к полю (с учетом вложенности)
      const fullPath = this.buildFieldPath(error.property, parentPath);

      // Рекурсивно обрабатываем вложенные ошибки (для объектов и массивов)
      if (error.children && error.children.length > 0) {
        const childErrors = this.processValidationErrors(error.children, fullPath);
        structuredErrors.push(...childErrors);
        continue;
      }

      // Если есть констрейнты, обрабатываем их
      if (error.constraints && Object.keys(error.constraints).length > 0) {
        const errorDetail = this.createValidationErrorDetail(error, fullPath);
        structuredErrors.push(errorDetail);
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
  private createValidationErrorDetail(
    error: ClassValidatorError,
    fieldPath: string,
  ): ValidationErrorDetail {
    // Переводим констрейнты с использованием i18n
    const translatedConstraints = this.translateConstraints(error.constraints);

    // Выбираем основное сообщение об ошибке на основе приоритета констрейнтов
    const primaryMessage = this.selectPrimaryMessage(translatedConstraints);

    return {
      field: fieldPath,
      value: error.value,
      message: primaryMessage,
      constraints: Object.values(translatedConstraints),
    };
  }

  /**
   * Переводит констрейнты валидации с использованием i18n сервиса
   *
   * @param constraints - Констрейнты от class-validator
   * @returns Объект с переведенными сообщениями об ошибках
   */
  private translateConstraints(constraints: Record<string, string>): Record<string, string> {
    const translatedConstraints: Record<string, string> = {};

    for (const [constraintType, originalMessage] of Object.entries(constraints)) {
      try {
        // Получаем ключ перевода для данного констрейнта
        const translationKey = this.getTranslationKey(constraintType, originalMessage);

        translatedConstraints[constraintType] = `validation.${translationKey}`;
      } catch (error) {
        // В случае ошибки перевода используем оригинальное сообщение
        translatedConstraints[constraintType] = originalMessage;

        // Логируем ошибку для отладки (в продакшене можно заменить на logger)
        console.debug(
          `Translation failed for constraint "${constraintType}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return translatedConstraints;
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

  /**
   * Выбирает основное сообщение об ошибке из переведенных констрейнтов
   * Использует приоритет констрейнтов для определения наиболее важной ошибки
   *
   * @param translatedConstraints - Объект с переведенными констрейнтами
   * @returns Основное сообщение об ошибке
   */
  private selectPrimaryMessage(translatedConstraints: Record<string, string>): string {
    // Ищем констрейнты в порядке приоритета
    for (const constraintType of CONSTRAINT_PRIORITY) {
      const message = translatedConstraints[constraintType];
      if (message) {
        return message;
      }
    }

    // Если не нашли приоритетных констрейнтов, возвращаем первый доступный
    const firstConstraint = Object.values(translatedConstraints)[0];
    return firstConstraint || 'Validation failed';
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
}
