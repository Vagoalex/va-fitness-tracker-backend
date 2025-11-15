import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppLogger } from '../../../core/logger/logger.service';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: string;
}

// TODO:
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly i18nService: I18nService,
    private readonly logger: AppLogger,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      errorResponse = await this.handleHttpException(exception, request);
    } else {
      errorResponse = this.handleUnknownException(exception, request);
    }

    // Log error
    this.logger.error(
      `HTTP ${errorResponse.statusCode} - ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private async handleHttpException(
    exception: HttpException,
    request: Request,
  ): Promise<ErrorResponse> {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message = await this.getTranslatedMessage(exceptionResponse, status);

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: exception.name,
    };
  }

  private handleUnknownException(exception: unknown, request: Request): ErrorResponse {
    return {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }

  private async getTranslatedMessage(
    exceptionResponse: string | object,
    status: number,
  ): Promise<string> {
    try {
      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      const responseObj = exceptionResponse as any;
      const defaultMessage = responseObj.message || 'An error occurred';

      // Try to translate common error messages
      if (status === 401) {
        return await this.i18nService.translate('errors.unauthorized');
      }
      if (status === 404) {
        return await this.i18nService.translate('errors.not_found');
      }

      return Array.isArray(defaultMessage) ? defaultMessage[0] : defaultMessage;
    } catch {
      return 'An error occurred';
    }
  }
}
