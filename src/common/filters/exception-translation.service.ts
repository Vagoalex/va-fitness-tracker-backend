import { I18N_NAMESPACES, I18nPath, I18nService } from '../../core/i18n';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../types/errors.types';

/**
 * Сервис для работы с переводами исключений в globalExceptionFilter
 * Содержит утилитарные методы для обработки и перевода ключей ошибок
 */
export class ExceptionTranslationService {
  /**
   * Карта соответствия HTTP статусов ключам переводов для общих ошибок
   * Используется когда исключение не содержит специфичного ключа перевода
   */
  private static readonly STATUS_TO_I18N_KEY: Readonly<Record<number, I18nPath>> = {
    [HttpStatus.BAD_REQUEST]: 'common.errors.bad_request',
    [HttpStatus.UNAUTHORIZED]: 'common.errors.unauthorized',
    [HttpStatus.FORBIDDEN]: 'common.errors.forbidden',
    [HttpStatus.NOT_FOUND]: 'common.errors.not_found',
    [HttpStatus.CONFLICT]: 'common.errors.conflict',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'common.errors.internal_error',
  } as const;

  /**
   * Карта соответствия HTTP статусов кодам ошибок для структурированного ответа
   * Используется для поля `code` в ответе API
   */
  private static readonly STATUS_TO_ERROR_CODE: Readonly<Record<number, ErrorCode>> = {
    [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
    [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_ERROR',
    [HttpStatus.FORBIDDEN]: 'AUTHORIZATION_ERROR',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND_ERROR',
    [HttpStatus.CONFLICT]: 'CONFLICT_ERROR',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
  } as const;

  /**
   * Получает ключ перевода на основе HTTP статуса
   * @param status - HTTP статус код
   * @returns Ключ перевода для заданного статуса
   */
  static getStatusTranslationKey(status: number): I18nPath {
    return this.STATUS_TO_I18N_KEY[status] || 'common.errors.internal_error';
  }

  /**
   * Преобразует HTTP статус в код ошибки для структурированного ответа
   * @param status - HTTP статус код
   * @returns Код ошибки соответствующего типа
   */
  static mapStatusCodeToErrorCode(status: number): ErrorCode {
    return this.STATUS_TO_ERROR_CODE[status] || 'INTERNAL_ERROR';
  }

  /**
   * Проверяет, является ли строка валидным ключом перевода i18n
   * Проверяет формат: `namespace.path.to.key`
   * @param message - Строка для проверки
   * @returns true если строка является валидным ключом перевода
   */
  static isTranslationKey(message: string): message is I18nPath {
    // Паттерн для проверки формата ключа: namespace.rest.of.path
    const namespacePattern = I18N_NAMESPACES.join('|');
    const translationKeyRegex = new RegExp(`^(${namespacePattern})\\.[a-zA-Z0-9._-]+$`);

    return translationKeyRegex.test(message);
  }

  /**
   * Извлекает ключ перевода из ответа исключения
   */
  static extractI18nPath(
    response: string | { message?: string | string[]; error?: string; statusCode?: number },
    status: number,
  ): I18nPath {
    // Если ответ - строка и это ключ перевода
    if (typeof response === 'string' && this.isTranslationKey(response)) {
      return response;
    }

    // Если ответ - объект, ищем ключ перевода в message
    if (response && typeof response === 'object' && 'message' in response) {
      const message = response.message;

      if (typeof message === 'string' && this.isTranslationKey(message)) {
        return message;
      }

      if (Array.isArray(message) && message.length > 0) {
        const firstMessage = message[0];
        if (typeof firstMessage === 'string' && this.isTranslationKey(firstMessage)) {
          return firstMessage;
        }
      }
    }

    // Возвращаем ключ по умолчанию для статуса
    return this.getStatusTranslationKey(status);
  }

  /**
   * Переводит ключ ошибки в текстовое сообщение с полной типизацией
   */
  static translate(i18n: I18nService, path: I18nPath, fallback: string): string {
    try {
      // Используем универсальный метод translatePath из I18nService
      // Он уже типизирован внутри I18nService
      return i18n.translatePath(path, { defaultValue: fallback });
    } catch {
      return fallback;
    }
  }
}
