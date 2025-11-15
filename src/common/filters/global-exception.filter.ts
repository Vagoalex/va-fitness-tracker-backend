import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { AppLoggerService } from '../../core/logger/logger.service';
import {
  AUTH_TRANSLATION_KEYS,
  COMMON_TRANSLATION_KEYS,
  VALIDATION_TRANSLATION_KEYS,
  CommonTranslationKey,
  TranslationKey,
} from '../../core/i18n';

/**
 * Интерфейсы для типизации ответов исключений
 */
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

interface ValidationErrorResponse extends HttpExceptionResponse {
  errors?: unknown[];
}

/**
 * Стандартизированный ответ об ошибке
 */
interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

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
    exceptionResponse: string | object,
    status: number,
  ): TranslationKey {
    if (typeof exceptionResponse === 'string') {
      return this.isTranslationKey(exceptionResponse)
        ? exceptionResponse
        : this.getStatusTranslationKey(status);
    }

    const responseObj = exceptionResponse as HttpExceptionResponse;
    const rawMessage = Array.isArray(responseObj.message)
      ? responseObj.message[0]
      : responseObj.message;

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
    let message: TranslationKey = COMMON_TRANSLATION_KEYS.errors.validation_failed;
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
    translatedMessage: TranslationKey;
    errors: string[];
  } {
    const translatedErrors: string[] = [];
    let firstTranslatedMessage: TranslationKey = COMMON_TRANSLATION_KEYS.errors.validation_failed;

    for (const error of messages) {
      if (this.isTranslationKey(error)) {
        const translated = this.translateMessage(error, HttpStatus.BAD_REQUEST);
        translatedErrors.push(translated);

        if (firstTranslatedMessage === COMMON_TRANSLATION_KEYS.errors.validation_failed) {
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

  private isTranslationKey(message: string): message is TranslationKey {
    const allTranslationKeys = [
      ...Object.values(AUTH_TRANSLATION_KEYS.errors),
      ...Object.values(COMMON_TRANSLATION_KEYS.errors),
      ...Object.values(VALIDATION_TRANSLATION_KEYS),
    ] as string[];

    return (
      message.startsWith('auth.') ||
      message.startsWith('common.') ||
      message.startsWith('validation.') ||
      allTranslationKeys.includes(message)
    );
  }

  private handleUnknownException(exception: unknown, request: Request): ErrorResponse {
    const isProduction = process.env.NODE_ENV === 'production';

    const message: TranslationKey = COMMON_TRANSLATION_KEYS.errors.internal_error;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.translateMessage(message, HttpStatus.INTERNAL_SERVER_ERROR),
      timestamp: new Date().toISOString(),
      path: request.url,
      details: isProduction ? undefined : this.getErrorDetails(exception),
    };
  }

  private translateMessage(message: TranslationKey, status: number): string {
    try {
      const i18n = I18nContext.current();
      if (!i18n) {
        return message;
      }

      const translated = i18n.translate(message);

      if (translated === message) {
        const statusKey = this.getStatusTranslationKey(status);
        const statusTranslated = i18n.translate(statusKey);
        return statusTranslated === statusKey ? message : statusTranslated;
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

  private getStatusTranslationKey(status: number): CommonTranslationKey {
    const statusMap: Record<number, CommonTranslationKey> = {
      400: COMMON_TRANSLATION_KEYS.errors.bad_request,
      401: COMMON_TRANSLATION_KEYS.errors.unauthorized,
      403: COMMON_TRANSLATION_KEYS.errors.forbidden,
      404: COMMON_TRANSLATION_KEYS.errors.not_found,
      409: COMMON_TRANSLATION_KEYS.errors.conflict,
      500: COMMON_TRANSLATION_KEYS.errors.internal_error,
    };
    return statusMap[status] || COMMON_TRANSLATION_KEYS.errors.internal_error;
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
