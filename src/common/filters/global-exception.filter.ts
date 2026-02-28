import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nPath, I18nService } from '../../core/i18n';
import { AppLoggerService } from '../../core/logger/logger.service';
import {
  ApiError,
  ErrorCode,
  ErrorCodeInfo,
  InternalValidationErrorResponse,
  ValidationError,
  ValidationErrorDetail,
} from '../../types/errors.types';
import { ExceptionTranslationService } from './exception-translation.service';
import { NestHttpExceptionResponse } from './types';

/**
 * Глобальный фильтр исключений для обработки всех ошибок приложения
 *
 * Отвечает за:
 * - единый формат ошибок API
 * - перевод i18n ключей
 * - преобразование internal validation ошибок в публичный формат
 * - централизованное логирование
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
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const apiError = this.resolveExceptionResponse(exception, request);

    this.logError(exception, apiError, request);

    response.status(apiError.statusCode).json(apiError);
  }

  /**
   * Преобразует исключение в структурированный ApiError
   */
  private resolveExceptionResponse(exception: unknown, request: Request): ApiError {
    const baseResponse: Pick<ApiError, 'timestamp' | 'path'> = {
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Обработка HttpException
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, baseResponse);
    }

    // Обработка непредвиденных ошибок
    return this.handleUnknownException(exception, baseResponse);
  }

  /**
   * Обрабатывает стандартные HttpException (4xx / 5xx)
   */
  private handleHttpException(
    exception: HttpException,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ApiError {
    const status = exception.getStatus();
    const payload = exception.getResponse();

    // Внутренняя validation ошибка (из ValidationPipe или I18nExceptions)
    if (this.isInternalValidationError(payload)) {
      return this.buildValidationError(payload, status, baseResponse);
    }

    const message = this.extractMessage(payload);
    const translatedMessage = this.translateIfTranslationKey(message);

    return {
      ...baseResponse,
      statusCode: status,
      code: this.mapStatusToErrorCode(status),
      message: translatedMessage,
    };
  }

  /**
   * Обрабатывает internal validation ошибку
   * (переводит ключи в строки и возвращает публичный формат)
   */
  private buildValidationError(
    validation: InternalValidationErrorResponse,
    status: number,
    base: Pick<ApiError, 'timestamp' | 'path'>,
  ): ValidationError {
    const translatedErrors: ValidationErrorDetail[] = validation.details.errors.map((error) => {
      const translatedConstraints = error.constraints?.map((constraintKey) =>
        this.i18n.translatePath(constraintKey, {
          defaultValue: constraintKey,
        }),
      );

      return {
        field: error.field,
        value: error.value,
        message: this.i18n.translatePath(error.message, {
          args: error.args,
          defaultValue: error.message,
        }),
        ...(translatedConstraints && translatedConstraints.length
          ? { constraints: translatedConstraints }
          : {}),
      };
    });

    return {
      ...base,
      statusCode: status,
      code: 'VALIDATION_ERROR',
      message: this.i18n.translatePath(validation.message, {
        defaultValue: validation.message,
      }),
      details: { errors: translatedErrors },
    };
  }

  /**
   * Обработка неизвестных ошибок (500)
   */
  private handleUnknownException(
    exception: unknown,
    base: Pick<ApiError, 'timestamp' | 'path'>,
  ): ApiError {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    return {
      ...base,
      statusCode: status,
      code: 'INTERNAL_ERROR',
      message: this.i18n.translatePath('common.errors.internal_error'),
      ...(process.env.NODE_ENV !== 'production'
        ? { details: this.serializeException(exception) }
        : {}),
    };
  }

  /**
   * Извлекает текст сообщения из payload HttpException
   */
  private extractMessage(payload: unknown): string {
    if (typeof payload === 'string') {
      return payload;
    }

    if (this.isNestHttpExceptionResponse(payload)) {
      const responseMessage = payload.message;

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }

      if (Array.isArray(responseMessage) && responseMessage.length > 0) {
        return String(responseMessage[0]);
      }
    }

    return 'Unknown error';
  }

  /**
   * Переводит сообщение, если оно является валидным i18n ключом
   */
  private translateIfTranslationKey(message: string): string {
    if (ExceptionTranslationService.isTranslationKey(message)) {
      return this.i18n.translatePath(message, {
        defaultValue: message,
      });
    }

    return message;
  }

  /**
   * Маппинг HTTP статуса к ErrorCode через ErrorCodeInfo
   */
  private mapStatusToErrorCode(status: number): ErrorCode {
    const entry = Object.values(ErrorCodeInfo).find(
      (info) => info.statusCode === (status as HttpStatus),
    );

    return entry?.code ?? 'INTERNAL_ERROR';
  }

  /**
   * Проверяет, является ли payload internal validation ошибкой
   */
  private isInternalValidationError(value: unknown): value is InternalValidationErrorResponse {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as InternalValidationErrorResponse;

    return (
      candidate.code === 'VALIDATION_ERROR' &&
      typeof candidate.message === 'string' &&
      Array.isArray(candidate.details?.errors)
    );
  }

  /**
   * Проверяет структуру стандартного ответа NestJS HttpException
   */
  private isNestHttpExceptionResponse(value: unknown): value is NestHttpExceptionResponse {
    return typeof value === 'object' && value !== null && 'message' in value;
  }

  /**
   * Сериализация неизвестной ошибки для dev режима
   */
  private serializeException(exception: unknown): Record<string, unknown> {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return { raw: exception };
  }

  /**
   * Централизованное логирование ошибок
   */
  private logError(exception: unknown, apiError: ApiError, request: Request): void {
    const logMessage = `${request.method} ${request.url} → ${apiError.statusCode}`;

    if (apiError.statusCode >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    } else {
      this.logger.warn(`${logMessage} - ${apiError.message}`, 'GlobalExceptionFilter');
    }
  }
}
