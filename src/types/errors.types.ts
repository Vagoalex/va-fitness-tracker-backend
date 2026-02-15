import { HttpStatus } from '@nestjs/common';
import { I18nPath } from '../core/i18n';

type ErrorCodeType = {
  [K in string]: {
    statusCode: HttpStatus;
    code: K;
    defaultMessageKey: I18nPath;
    fallbackMessage: string;
    fallbackRuMessage: string;
  };
};

export const ErrorCodeInfo = {
  VALIDATION_ERROR: {
    /** 400 */
    statusCode: HttpStatus.BAD_REQUEST,
    code: 'VALIDATION_ERROR' as const,
    defaultMessageKey: 'common.errors.validation_failed',
    fallbackMessage: 'Validation error',
    fallbackRuMessage: 'Ошибка валидации данных"',
  },
  AUTHENTICATION_ERROR: {
    /** 401 */
    statusCode: HttpStatus.UNAUTHORIZED,
    code: 'AUTHENTICATION_ERROR' as const,
    defaultMessageKey: 'common.errors.authentication_failed',
    fallbackMessage: 'Authentication error',
    fallbackRuMessage: 'Ошибка аутентификации',
  },
  AUTHORIZATION_ERROR: {
    /** 403 */
    statusCode: HttpStatus.FORBIDDEN,
    code: 'AUTHORIZATION_ERROR' as const,
    defaultMessageKey: 'common.errors.bad_request',
    fallbackMessage: 'Authorization error',
    fallbackRuMessage: 'Authorization error',
  },
  NOT_FOUND_ERROR: {
    /** 404 */
    statusCode: HttpStatus.NOT_FOUND,
    code: 'NOT_FOUND_ERROR' as const,
    defaultMessageKey: 'common.errors.bad_request',
    fallbackMessage: 'Not found',
    fallbackRuMessage: 'Not found',
  },
  CONFLICT_ERROR: {
    /** 409 */
    statusCode: HttpStatus.CONFLICT,
    code: 'CONFLICT_ERROR' as const,
    defaultMessageKey: 'common.errors.bad_request',
    fallbackMessage: 'Conflict error',
    fallbackRuMessage: 'Conflict error',
  },
  INTERNAL_ERROR: {
    /** 500 */
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR' as const,
    defaultMessageKey: 'common.errors.bad_request',
    fallbackMessage: 'Internal server error',
    fallbackRuMessage: 'Internal server error',
  },
} satisfies ErrorCodeType;

export type ErrorCode = keyof typeof ErrorCodeInfo;

export interface ApiError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  timestamp: string;
  path: string;
  details?: unknown;
}

export interface ValidationErrorDetail {
  field: string;
  value: unknown;
  message: string;
  constraints?: string[];
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  details: {
    errors: ValidationErrorDetail[];
  };
}

// Тип для ответа валидации (без служебных полей)
export interface ValidationErrorResponse {
  code: 'VALIDATION_ERROR';
  message: string;
  details: {
    errors: ValidationErrorDetail[];
  };
}
