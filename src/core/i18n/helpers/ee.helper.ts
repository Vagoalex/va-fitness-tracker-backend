import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { I18nPath } from '../generated/i18n.generated';

/**
 * Хелперы для создания исключений с типизированными ключами переводов
 */
export class I18nExceptions {
  /**
   * Ошибка 400
   * @param key
   */
  static badRequest(key?: I18nPath): BadRequestException {
    const messageKey: I18nPath = key || 'common.errors.bad_request';
    return new BadRequestException(messageKey);
  }

  /**
   * Ошибка 401
   * @param key
   */
  static unauthorized(key?: I18nPath): UnauthorizedException {
    const messageKey: I18nPath = key || 'common.errors.unauthorized';
    return new UnauthorizedException(messageKey);
  }

  /**
   * Ошибка 403
   * @param key
   */
  static forbidden(key?: I18nPath): ForbiddenException {
    const messageKey: I18nPath = key || 'common.errors.forbidden';
    return new ForbiddenException(messageKey);
  }

  /**
   * Ошибка 404
   * @param key
   */
  static notFound(key?: I18nPath): NotFoundException {
    const messageKey: I18nPath = key || 'common.errors.not_found';
    return new NotFoundException(messageKey);
  }

  /**
   * Ошибка 409
   * @param key
   */
  static conflict(key?: I18nPath): ConflictException {
    const messageKey: I18nPath = key || 'common.errors.conflict';
    return new ConflictException(messageKey);
  }

  /**
   * Ошибка 500
   * @param key
   */
  static internalError(key?: I18nPath): InternalServerErrorException {
    const messageKey: I18nPath = key || 'common.errors.internal_error';
    return new InternalServerErrorException(messageKey);
  }

  /**
   * Ошибка 400
   * @param details
   */
  static validationFailed(details?: unknown): BadRequestException {
    return new BadRequestException({
      message: ['validation.failed'],
      error: 'Bad Request',
      statusCode: 400,
      details,
    });
  }
}
