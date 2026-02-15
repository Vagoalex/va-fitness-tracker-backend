import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from '../../core/i18n';
import { AppLoggerService } from '../../core/logger/logger.service';
import { ApiError, ValidationError, ValidationErrorResponse } from '../../types/errors.types';
import { ExceptionTranslationService } from './exception-translation.service';
import { NestHttpExceptionResponse } from './types';

/**
 * Глобальный фильтр исключений для обработки всех ошибок приложения
 *
 * @description
 * Обеспечивает единый формат ответа, автоматический перевод сообщений
 * и структурированное логирование всех ошибок приложения
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Основной метод обработки исключений, вызываемый NestJS
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
   * Строит структурированный ответ об ошибке на основе исключения
   */
  private buildErrorResponse(exception: unknown, request: Request): ApiError {
    const baseResponse: Pick<ApiError, 'timestamp' | 'path'> = {
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, baseResponse);
    }

    return this.handleUnknownException(exception, baseResponse);
  }

  /**
   * Обрабатывает HTTP исключения (4xx, 5xx статусы)
   */
  private handleHttpException(
    exception: HttpException,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ApiError {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Проверяем, является ли это ошибкой валидации в нашем формате
    if (this.isValidationErrorResponse(exceptionResponse)) {
      return this.buildValidationError(exceptionResponse, status, baseResponse);
    }

    // Извлекаем ключ перевода из исключения
    const i18nPath = ExceptionTranslationService.extractI18nPath(
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as NestHttpExceptionResponse),
      status,
    );

    // Переводим ключ в текстовое сообщение
    const translatedMessage = this.translateMessage(i18nPath, status);

    // Получаем код ошибки для структурированного ответа
    const errorCode = ExceptionTranslationService.mapStatusCodeToErrorCode(status);

    return {
      ...baseResponse,
      statusCode: status,
      code: errorCode,
      message: translatedMessage,
    };
  }

  /**
   * Обрабатывает ошибки валидации в структурированном формате
   */
  private buildValidationError(
    validationResponse: ValidationErrorResponse,
    status: number,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ValidationError {
    // Переводим основное сообщение об ошибке валидации
    const mainMessage = this.translateMessage(
      'common.errors.validation_failed',
      HttpStatus.BAD_REQUEST,
    );

    // Переводим каждую отдельную ошибку валидации
    const translatedErrors = validationResponse.details.errors.map((error) => ({
      ...error,
      message: this.translateMessage(error.message, HttpStatus.BAD_REQUEST),
    }));

    return {
      ...baseResponse,
      statusCode: status,
      code: 'VALIDATION_ERROR',
      message: mainMessage,
      details: {
        errors: translatedErrors,
      },
    };
  }

  /**
   * Обрабатывает непредвиденные исключения (не HttpException)
   */
  private handleUnknownException(
    exception: unknown,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ApiError {
    const internalErrorKey = 'common.errors.internal_error';
    const translatedMessage = this.translateMessage(
      internalErrorKey,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const details =
      process.env.NODE_ENV !== 'production' ? this.getErrorDetails(exception) : undefined;

    return {
      ...baseResponse,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: translatedMessage,
      details,
    };
  }

  /**
   * Переводит ключ сообщения в текст с использованием i18n
   */
  private translateMessage(i18nPath: string, status: number): string {
    if (!ExceptionTranslationService.isTranslationKey(i18nPath)) {
      const fallbackKey = ExceptionTranslationService.getStatusTranslationKey(status);

      return this.i18n.translatePath(fallbackKey, {
        defaultValue: i18nPath,
      });
    }

    return this.i18n.translatePath(i18nPath, {
      defaultValue: i18nPath,
    });
  }

  /**
   * Проверяет, является ли ответ ошибкой валидации в нашем формате
   */
  private isValidationErrorResponse(response: unknown): response is ValidationErrorResponse {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const validationResponse = response as ValidationErrorResponse;

    return (
      validationResponse.code === 'VALIDATION_ERROR' &&
      validationResponse.details !== undefined &&
      typeof validationResponse.details === 'object' &&
      validationResponse.details !== null &&
      Array.isArray(validationResponse.details.errors) &&
      validationResponse.details.errors.length > 0
    );
  }

  /**
   * Извлекает детальную информацию об ошибке для отладки
   */
  private getErrorDetails(exception: unknown): Record<string, unknown> | undefined {
    if (process.env.NODE_ENV === 'production') {
      return undefined;
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return {
      raw:
        exception !== null && typeof exception === 'object'
          ? JSON.stringify(exception, null, 2)
          : String(exception),
    };
  }

  /**
   * Логирует ошибки с разным уровнем серьёзности
   */
  private logError(exception: unknown, errorResponse: ApiError, request: Request): void {
    const logMessage = `HTTP ${errorResponse.statusCode} - ${request.method} ${request.url}`;

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(`${logMessage} - ${errorResponse.message}`, 'GlobalExceptionFilter');
    }
  }
}
