import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService, I18nPath, I18nTranslations, I18N_NAMESPACES } from '../../core/i18n';
import { AppLoggerService } from '../../core/logger/logger.service';

/**
 * Интерфейсы для стандартизированных ответов об ошибках
 */
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

interface ValidationErrorResponse extends HttpExceptionResponse {
  errors?: unknown[];
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

/**
 * Сервис для перевода ключей ошибок в текстовые сообщения
 * Автоматически работает со всеми неймспейсами из I18nTranslations
 */
class ExceptionTranslationService {
  /**
   * Получает ключ перевода на основе HTTP статуса
   */
  static getStatusTranslationKey(status: number): I18nPath {
    const statusMap: Record<number, I18nPath> = {
      400: 'common.errors.bad_request',
      401: 'common.errors.unauthorized',
      403: 'common.errors.forbidden',
      404: 'common.errors.not_found',
      409: 'common.errors.conflict',
      500: 'common.errors.internal_error',
    };

    return statusMap[status] || 'common.errors.internal_error';
  }

  /**
   * Проверяет, является ли строка валидным ключом перевода
   */
  static isTranslationKey(message: string): message is I18nPath {
    const namespacePattern = I18N_NAMESPACES.join('|');
    return new RegExp(`^(${namespacePattern})\\..+`).test(message);
  }

  /**
   * Выполняет перевод ключа в текстовое сообщение
   */
  static translate(i18n: I18nService, path: I18nPath, fallback: string): string {
    try {
      // Используем универсальный метод translatePath если он есть в I18nService
      if ('translatePath' in i18n && typeof i18n.translatePath === 'function') {
        return i18n.translatePath(path, { defaultValue: fallback });
      }

      // Fallback: используем прямое разбиение пути
      const parts = path.split('.');
      const namespace = parts[0] as keyof I18nTranslations;
      const key = parts.slice(1).join('.');

      // Используем универсальный метод t с правильной типизацией
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return i18n.t(namespace, key as any, { defaultValue: fallback });
    } catch {
      return fallback;
    }
  }
}

/**
 * Глобальный фильтр исключений с автоматической поддержкой всех модулей переводов
 *
 * @description
 * Автоматически работает со всеми неймспейсами из I18nTranslations.
 * При добавлении новых модулей переводов достаточно:
 * 1. Добавить JSON файлы в папку locales
 * 2. Запустить npm run i18n:generate
 * 3. Фильтр автоматически начнет поддерживать новые неймспейсы
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Основной метод обработки исключений
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logError(exception, errorResponse, request);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Строит стандартизированный ответ об ошибке
   */
  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, request);
    }

    return this.handleUnknownException(exception, request);
  }

  /**
   * Обрабатывает HTTP исключения (4xx, 5xx статусы)
   */
  private handleHttpException(exception: HttpException, request: Request): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const baseResponse = this.createBaseErrorResponse(status, request);

    if (exception instanceof BadRequestException) {
      return this.handleValidationError(exception, baseResponse);
    }

    const message = this.extractMessageFromException(exceptionResponse, status);

    return {
      ...baseResponse,
      message: this.translateMessage(message, status),
    };
  }

  /**
   * Обрабатывает ошибки валидации (BadRequestException)
   */
  private handleValidationError(
    exception: BadRequestException,
    baseResponse: Omit<ErrorResponse, 'message'>,
  ): ErrorResponse {
    const exceptionResponse = exception.getResponse();
    let message: I18nPath = 'common.errors.validation_failed';
    let details: unknown = undefined;

    if (this.isValidationErrorResponse(exceptionResponse)) {
      const arrayMessages = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];

      const validationErrors = this.processValidationErrors(arrayMessages);
      message = validationErrors.translatedMessage;
      details = { errors: validationErrors.errors };
    }

    return {
      ...baseResponse,
      message: this.translateMessage(message, HttpStatus.BAD_REQUEST),
      details,
    };
  }

  /**
   * Обрабатывает непредвиденные исключения
   */
  private handleUnknownException(exception: unknown, request: Request): ErrorResponse {
    const isProduction = process.env.NODE_ENV === 'production';
    const message: I18nPath = 'common.errors.internal_error';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.translateMessage(message, HttpStatus.INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
      path: request.url,
      details: isProduction ? undefined : this.getErrorDetails(exception),
    };
  }

  /**
   * Извлекает сообщение из объекта исключения
   */
  private extractMessageFromException(
    exceptionResponse: string | HttpExceptionResponse,
    status: number,
  ): I18nPath {
    if (typeof exceptionResponse === 'string') {
      return ExceptionTranslationService.isTranslationKey(exceptionResponse)
        ? exceptionResponse
        : ExceptionTranslationService.getStatusTranslationKey(status);
    }

    const rawMessage = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message[0]
      : exceptionResponse.message;

    if (rawMessage && ExceptionTranslationService.isTranslationKey(rawMessage)) {
      return rawMessage;
    }

    return ExceptionTranslationService.getStatusTranslationKey(status);
  }

  /**
   * Обрабатывает массив ошибок валидации
   */
  private processValidationErrors(messages: string[]): {
    translatedMessage: I18nPath;
    errors: string[];
  } {
    const translatedErrors: string[] = [];
    let firstTranslatedMessage: I18nPath = 'common.errors.validation_failed';

    for (const error of messages) {
      if (ExceptionTranslationService.isTranslationKey(error)) {
        const translated = this.translateMessage(error, HttpStatus.BAD_REQUEST);
        translatedErrors.push(translated);

        // Используем первую найденную переводимую ошибку как основное сообщение
        if (firstTranslatedMessage === 'common.errors.validation_failed') {
          firstTranslatedMessage = error;
        }
      } else {
        translatedErrors.push(error);
      }
    }

    return {
      translatedMessage: firstTranslatedMessage,
      errors: translatedErrors,
    };
  }

  /**
   * Выполняет перевод сообщения с fallback на статус
   */
  private translateMessage(message: I18nPath, status: number): string {
    try {
      // Пытаемся перевести исходное сообщение
      const translated = ExceptionTranslationService.translate(this.i18n, message, message);

      // Если перевод не удался (вернулся исходный ключ), используем перевод по статусу
      if (translated === message) {
        const statusKey = ExceptionTranslationService.getStatusTranslationKey(status);
        return ExceptionTranslationService.translate(this.i18n, statusKey, message);
      }

      return translated;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';
      this.logger.warn(
        `Translation failed for key: ${message}, error: ${errorMessage}`,
        'GlobalExceptionFilter',
      );
      return message;
    }
  }

  /**
   * Создает базовый объект ответа об ошибке
   */
  private createBaseErrorResponse(
    status: number,
    request: Request,
  ): Omit<ErrorResponse, 'message'> {
    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  /**
   * Проверяет, является ли объект ответом с ошибками валидации
   */
  private isValidationErrorResponse(response: unknown): response is ValidationErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      Array.isArray((response as ValidationErrorResponse).message) &&
      (response as ValidationErrorResponse).message.length > 0
    );
  }

  /**
   * Извлекает детальную информацию об ошибке для разработки
   */
  private getErrorDetails(exception: unknown): unknown {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      raw: exception instanceof Object ? exception?.toString() : String(exception),
    };
  }

  /**
   * Логирует ошибки в зависимости от их типа и уровня серьезности
   */
  private logError(exception: unknown, errorResponse: ErrorResponse, request: Request): void {
    const logMessage = `HTTP ${errorResponse.statusCode} - ${request.method} ${request.url}`;

    if (errorResponse.statusCode >= 500) {
      // Серверные ошибки логируем с полным стектрейсом
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    } else if (errorResponse.statusCode >= 400) {
      // Клиентские ошибки логируем как предупреждения
      this.logger.warn(`${logMessage} - ${errorResponse.message}`, 'GlobalExceptionFilter');
    }
  }
}
