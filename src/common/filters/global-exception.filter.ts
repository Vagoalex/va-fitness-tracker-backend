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
    if (this.isInternalValidationErrorResponse(exceptionResponse)) {
      return this.buildValidationError(exceptionResponse, status, baseResponse);
    }

    const { message, details } = this.extractMessageAndDetails(exceptionResponse);

    const translatedMessage = this.translateIfNeeded(message);

    const errorCode = this.mapStatusToErrorCode(status);

    return {
      ...baseResponse,
      statusCode: status,
      code: errorCode,
      message: translatedMessage,
      ...(this.shouldExposeDetails(status) && details ? { details } : {}),
    };
  }

  /**
   * Обрабатывает ошибки валидации в структурированном формате
   */
  private buildValidationError(
    validationResponse: InternalValidationErrorResponse,
    status: number,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ValidationError {
    const translatedMainMessage = this.translateIfNeeded(validationResponse.message);

    const translatedErrors: ValidationErrorDetail[] = validationResponse.details.errors.map(
      (error) => {
        const constraints = error.constraints?.map((c) =>
          this.i18n.translatePath(c, { defaultValue: c }),
        );

        return {
          field: error.field,
          value: error.value,
          message: this.i18n.translatePath(error.message, {
            defaultValue: error.message,
            args: error.args,
          }),
          ...(constraints && constraints.length ? { constraints } : {}),
        };
      },
    );

    return {
      ...baseResponse,
      statusCode: status,
      code: 'VALIDATION_ERROR',
      message: translatedMainMessage,
      details: { errors: translatedErrors },
    };
  }

  /**
   * Обрабатывает непредвиденные исключения (не HttpException)
   */
  private handleUnknownException(
    exception: unknown,
    baseResponse: Pick<ApiError, 'timestamp' | 'path'>,
  ): ApiError {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.i18n.translatePath('common.errors.internal_error', {
      defaultValue: 'Internal server error',
    });

    const details =
      process.env.NODE_ENV !== 'production' ? this.getErrorDetails(exception) : undefined;

    return {
      ...baseResponse,
      statusCode: status,
      code: 'INTERNAL_ERROR',
      message,
      ...(details ? { details } : {}),
    };
  }

  /**
   * Извлекает сообщение и детали из ответа исключения
   * @param response
   * @returns
   */
  private extractMessageAndDetails(response: unknown): { message: string; details?: unknown } {
    if (typeof response === 'string') return { message: response };

    if (!this.isNestHttpExceptionResponse(response)) return { message: 'Unknown error' };

    const message =
      typeof response.message === 'string'
        ? response.message
        : Array.isArray(response.message)
          ? response.message[0]
          : 'Unknown error';

    return {
      message,
      details: response.details,
    };
  }

  private translateIfNeeded(message: string): string {
    // Переводим только если это реально валидный ключ
    if (typeof message === 'string' && ExceptionTranslationService.isTranslationKey(message)) {
      return this.i18n.translatePath(message, { defaultValue: message });
    }

    if (typeof message === 'string') return message;

    // message уже I18nPath
    return this.i18n.translatePath(message, { defaultValue: message });
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    const entry = Object.values(ErrorCodeInfo).find(
      (info) => info.statusCode === (status as HttpStatus),
    );

    return entry?.code ?? 'INTERNAL_ERROR';
  }

  private shouldExposeDetails(status: number): boolean {
    if (status >= 500) {
      return process.env.NODE_ENV !== 'production';
    }
    return true;
  }

  private isNestHttpExceptionResponse(
    response: unknown,
  ): response is NestHttpExceptionResponse & { details?: unknown } {
    return typeof response === 'object' && response !== null && 'message' in response;
  }

  /**
   * Извлекает детальную информацию об ошибке для отладки
   */
  private getErrorDetails(exception: unknown): Record<string, unknown> {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return { raw: exception };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isI18nPath(value: unknown): value is I18nPath {
    // Важно: мы не можем строго проверить все возможные ключи без рантайм-реестра,
    // но мы можем проверить формат и namespace через ExceptionTranslationService.
    return typeof value === 'string' && ExceptionTranslationService.isTranslationKey(value);
  }

  private isInternalValidationErrorResponse(
    response: unknown,
  ): response is InternalValidationErrorResponse {
    if (!this.isRecord(response)) return false;

    if (response.code !== 'VALIDATION_ERROR') return false;
    if (!this.isI18nPath(response.message)) return false;

    const details = response.details;
    if (!this.isRecord(details)) return false;

    const errors = details.errors;
    if (!Array.isArray(errors)) return false;

    // минимальная проверка элементов массива
    return errors.every((e) => {
      if (!this.isRecord(e)) return false;
      if (typeof e.field !== 'string') return false;
      // value может быть любым
      if (!this.isI18nPath(e.message)) return false;

      if ('args' in e && e.args !== undefined && !this.isRecord(e.args)) return false;

      if ('constraints' in e && e.constraints !== undefined) {
        if (!Array.isArray(e.constraints)) return false;
        if (!e.constraints.every((c) => this.isI18nPath(c))) return false;
      }

      return true;
    });
  }

  /**
   * Логирует ошибки с разным уровнем серьёзности
   */

  private logError(exception: unknown, errorResponse: ApiError, request: Request): void {
    const logMessage = `${request.method} ${request.url} → ${errorResponse.statusCode}`;

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
      );
    } else {
      this.logger.warn(`${logMessage} - ${errorResponse.message}`, 'GlobalExceptionFilter');
    }
  }
}
