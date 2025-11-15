import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorCode =
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'USER_ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED';

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super({ code, message }, status);
  }
}

export class NotFoundException extends AppException {
  constructor(code: ErrorCode, message: string) {
    super(code, message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestException extends AppException {
  constructor(code: ErrorCode, message: string) {
    super(code, message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppException {
  constructor(code: ErrorCode, message: string) {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}
