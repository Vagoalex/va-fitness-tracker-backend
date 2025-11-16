import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService, I18nPath } from '../../core/i18n';
import { AppLoggerService } from '../../core/logger/logger.service';

// Типы для исключений
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

// Используем типы из I18nService
type NestedTranslationKeys = Parameters<typeof I18nService.prototype.t>[1];

// Вспомогательная функция для безопасного перевода
const safeTranslate = (i18n: I18nService, path: I18nPath, fallback: string): string => {
  try {
    const parts = path.split('.');
    const namespace = parts[0] as 'auth' | 'common' | 'validation';
    const key = parts.slice(1).join('.') as NestedTranslationKeys;

    if (!['auth', 'common', 'validation'].includes(namespace)) {
      return fallback;
    }

    // Используем универсальный метод t из I18nService
    return i18n.t(namespace, key, { defaultValue: fallback });
  } catch {
    return fallback;
  }
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly i18n: I18nService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logError(exception, errorResponse, request);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, request);
    }
    return this.handleUnknownException(exception, request);
  }

  private handleHttpException(exception: HttpException, request: Request): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const baseResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof BadRequestException) {
      return this.handleValidationError(exception, baseResponse);
    }

    const message = this.extractMessageFromException(exceptionResponse, status);

    return {
      ...baseResponse,
      message: this.translateMessage(message, status),
    };
  }

  private extractMessageFromException(
    exceptionResponse: string | HttpExceptionResponse,
    status: number,
  ): I18nPath {
    if (typeof exceptionResponse === 'string') {
      return this.isTranslationKey(exceptionResponse)
        ? exceptionResponse
        : this.getStatusTranslationKey(status);
    }

    const rawMessage = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message[0]
      : exceptionResponse.message;

    if (rawMessage && this.isTranslationKey(rawMessage)) {
      return rawMessage;
    }

    return this.getStatusTranslationKey(status);
  }

  private handleValidationError(
    exception: BadRequestException,
    baseResponse: Omit<ErrorResponse, 'message'>,
  ): ErrorResponse {
    const exceptionResponse = exception.getResponse();
    let message: I18nPath = 'common.errors.validation_failed';
    let details: unknown = undefined;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as ValidationErrorResponse;

      if (Array.isArray(responseObj.message) && responseObj.message.length > 0) {
        const validationErrors = this.processValidationErrors(responseObj.message);
        message = validationErrors.translatedMessage;
        details = { errors: validationErrors.errors };
      }
    }

    return {
      ...baseResponse,
      message: this.translateMessage(message, HttpStatus.BAD_REQUEST),
      details,
    };
  }

  private processValidationErrors(messages: string[]): {
    translatedMessage: I18nPath;
    errors: string[];
  } {
    const translatedErrors: string[] = [];
    let firstTranslatedMessage: I18nPath = 'common.errors.validation_failed';

    for (const error of messages) {
      if (this.isTranslationKey(error)) {
        const translated = this.translateMessage(error, HttpStatus.BAD_REQUEST);
        translatedErrors.push(translated);

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

  private isTranslationKey(message: string): message is I18nPath {
    return (
      message.startsWith('auth.') ||
      message.startsWith('common.') ||
      message.startsWith('validation.')
    );
  }

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

  private translateMessage(message: I18nPath, status: number): string {
    try {
      // Используем безопасную функцию перевода
      const translated = safeTranslate(this.i18n, message, message);

      if (translated === message) {
        // Если перевод не удался, используем fallback по статусу
        const statusKey = this.getStatusTranslationKey(status);
        return safeTranslate(this.i18n, statusKey, message);
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

  private getStatusTranslationKey(status: number): I18nPath {
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

  private getErrorDetails(exception: unknown): unknown {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return { raw: String(exception) };
  }

  private logError(exception: unknown, errorResponse: ErrorResponse, request: Request): void {
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
