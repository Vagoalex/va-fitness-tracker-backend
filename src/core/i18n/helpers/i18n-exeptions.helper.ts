import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { I18nPath } from '../generated/i18n.generated';
import { ValidationErrorDetail, ValidationErrorResponse } from '../../../types/errors.types';

/**
 * Типизированные хелперы для создания исключений с автоматической типизацией ключей переводов
 */
export class I18nExceptions {
  /**
   * Ошибка 400 - Bad Request
   */
  static badRequest<T extends I18nPath>(key?: T): BadRequestException {
    const messageKey: I18nPath = key || 'common.errors.bad_request';
    return new BadRequestException(messageKey);
  }

  /**
   * Ошибка 401 - Unauthorized
   */
  static unauthorized<T extends I18nPath>(key?: T): UnauthorizedException {
    const messageKey: I18nPath = key || 'common.errors.unauthorized';
    return new UnauthorizedException(messageKey);
  }

  /**
   * Ошибка 403 - Forbidden
   */
  static forbidden<T extends I18nPath>(key?: T): ForbiddenException {
    const messageKey: I18nPath = key || 'common.errors.forbidden';
    return new ForbiddenException(messageKey);
  }

  /**
   * Ошибка 404 - Not Found
   */
  static notFound<T extends I18nPath>(key?: T): NotFoundException {
    const messageKey: I18nPath = key || 'common.errors.not_found';
    return new NotFoundException(messageKey);
  }

  /**
   * Ошибка 409 - Conflict
   */
  static conflict<T extends I18nPath>(key?: T): ConflictException {
    const messageKey: I18nPath = key || 'common.errors.conflict';
    return new ConflictException(messageKey);
  }

  /**
   * Ошибка 500 - Internal Server Error
   */
  static internalError<T extends I18nPath>(key?: T): InternalServerErrorException {
    const messageKey: I18nPath = key || 'common.errors.internal_error';
    return new InternalServerErrorException(messageKey);
  }

  /**
   * Ошибка валидации с типизированной структурой
   */
  static validationFailed(errors: ValidationErrorDetail[]): BadRequestException {
    const validationResponse: ValidationErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'validation.validation_failed' as I18nPath,
      details: { errors },
    };

    return new BadRequestException(validationResponse);
  }

  /**
   * Создает ошибку валидации для одного поля
   */
  static fieldValidation(
    field: string,
    value: unknown,
    message: I18nPath,
    constraints?: string[],
  ): BadRequestException {
    const errorDetail: ValidationErrorDetail = {
      field,
      value,
      message,
      constraints,
    };

    return this.validationFailed([errorDetail]);
  }

  /**
   * Создает кастомную HTTP ошибку с типизированным ключом перевода
   */
  static create<T extends I18nPath>(status: number, key: T, details?: unknown): HttpException {
    const exceptionResponse = {
      message: key,
      ...(details && { details }),
    };

    return new HttpException(exceptionResponse, status);
  }
}

// TODO: перенести в отдельный файл, который относится к модулю
/**
 * Специализированные исключения для конкретных доменов с автодополнением
 */
export class AuthExceptions {
  /**
   * Неверные учетные данные
   */
  static invalidCredentials(): UnauthorizedException {
    return I18nExceptions.unauthorized('auth.errors.invalid_credentials');
  }

  /**
   * Пользователь уже существует
   */
  static userExists(): ConflictException {
    return I18nExceptions.conflict('auth.errors.user_exists');
  }

  // /**
  //  * Неверный или просроченный токен
  //  */
  // static invalidToken(): UnauthorizedException {
  //   return I18nExceptions.unauthorized('auth.errors.invalid_token');
  // }
  //
  // /**
  //  * Недостаточно прав
  //  */
  // static insufficientPermissions(): ForbiddenException {
  //   return I18nExceptions.forbidden('auth.errors.insufficient_permissions');
  // }
  //
  // /**
  //  * Аккаунт неактивен
  //  */
  // static accountInactive(): ForbiddenException {
  //   return I18nExceptions.forbidden('auth.errors.account_inactive');
  // }
}

// export class UserExceptions {
//   /**
//    * Пользователь не найден
//    */
//   static userNotFound(): NotFoundException {
//     return I18nExceptions.notFound('users.errors.not_found');
//   }
//
//   /**
//    * Email уже используется
//    */
//   static emailTaken(): ConflictException {
//     return I18nExceptions.conflict('users.errors.email_taken');
//   }
//
//   /**
//    * Неверный текущий пароль
//    */
//   static invalidCurrentPassword(): BadRequestException {
//     return I18nExceptions.badRequest('users.errors.invalid_current_password');
//   }
// }
//
// export class WorkoutExceptions {
//   /**
//    * Тренировка не найдена
//    */
//   static workoutNotFound(): NotFoundException {
//     return I18nExceptions.notFound('workouts.errors.not_found');
//   }
//
//   /**
//    * Доступ к тренировке запрещен
//    */
//   static workoutAccessDenied(): ForbiddenException {
//     return I18nExceptions.forbidden('workouts.errors.access_denied');
//   }
//
//   /**
//    * Неверные данные тренировки
//    */
//   static invalidWorkoutData(): BadRequestException {
//     return I18nExceptions.badRequest('workouts.errors.invalid_data');
//   }
// }
