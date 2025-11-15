import { Injectable } from '@nestjs/common';
import { I18nService as NestI18nService, I18nContext } from 'nestjs-i18n';
import { TranslationKey } from './types/translations.types';

/**
 * Типизированный сервис для работы с переводами
 * Обеспечивает автодополнение и типобезопасность для ключей переводов
 */
@Injectable()
export class TypedI18nService {
  constructor(private readonly i18nService: NestI18nService) {}

  /**
   * Типизированный метод для получения перевода
   * @param key - Ключ перевода с автодополнением
   * @param options - Опции для перевода (язык, параметры и т.д.)
   * @returns Переведенная строка
   */
  translate<T extends TranslationKey>(
    key: T,
    options?: {
      lang?: string;
      args?: Record<string, string | number>;
    },
  ): string {
    return this.i18nService.translate(key, {
      lang: options?.lang,
      args: options?.args,
    });
  }

  /**
   * Асинхронный метод для получения перевода
   * @param key - Ключ перевода с автодополнением
   * @param options - Опции для перевода
   * @returns Promise с переведенной строкой
   */
  async translateAsync<T extends TranslationKey>(
    key: T,
    options?: {
      lang?: string;
      args?: Record<string, string | number>;
    },
  ): Promise<string> {
    return this.i18nService.translate(key, {
      lang: options?.lang,
      args: options?.args,
    });
  }

  /**
   * Получить текущий язык
   */
  getCurrentLanguage(): string {
    return I18nContext.current().lang || 'en';
  }

  /**
   * Альтернативный метод получения языка с явным контекстом
   */
  getLanguageFromContext(): string {
    try {
      const context = I18nContext.current();
      return context?.lang || 'en';
    } catch {
      return 'en';
    }
  }
}
