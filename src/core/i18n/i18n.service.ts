import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService as NestI18nService } from 'nestjs-i18n';
import { I18nTranslations, I18nPath } from './generated/i18n.generated';
import { I18N_CONFIG, AppLanguage } from './constants';
import { I18nKeys } from './types';
import { TranslationOptions } from './types/translation-options.types';

/**
 * Типизированный сервис интернационализации
 * Предоставляет полностью типизированные методы для работы с переводами
 */
@Injectable()
export class I18nService {
  constructor(
    @Inject(NestI18nService)
    private readonly nestI18nService: NestI18nService,
  ) {}

  /**
   * Универсальный типизированный метод для переводов
   * @template K - Тип неймспейса (например, 'auth', 'common')
   * @param namespace - Неймспейс перевода
   * @param key - Ключ перевода внутри неймспейса
   * @param options - Дополнительные опции перевода
   * @returns Переведённая строка
   */
  t<K extends keyof I18nTranslations>(
    namespace: K,
    key: I18nKeys[K],
    options?: TranslationOptions,
  ): string {
    const translationPath = `${namespace}.${key}`;
    return this.nestI18nService.translate(translationPath, {
      lang: options?.lang || I18nContext.current()?.lang,
      args: options?.args,
      defaultValue: options?.defaultValue,
    });
  }

  /**
   * Универсальный метод для перевода по полному пути
   * @param path - Полный путь к переводу (например, 'auth.errors.invalid_credentials')
   * @param options - Дополнительные опции перевода
   * @returns Переведённая строка
   */
  translatePath(path: I18nPath, options?: TranslationOptions): string {
    const [namespace, ...keyParts] = path.split('.') as [keyof I18nTranslations, ...string[]];
    const key = keyParts.join('.') as I18nKeys[typeof namespace];

    return this.t(namespace, key, {
      ...options,
      defaultValue: options?.defaultValue || path,
    });
  }

  /**
   * Быстрый метод для переводов в неймспейсе auth
   * @param key - Ключ перевода в неймспейсе auth
   * @param options - Дополнительные опции перевода
   * @returns Переведённая строка
   */
  auth(key: I18nKeys['auth'], options?: Omit<Parameters<typeof this.t>[2], 'namespace'>): string {
    return this.t('auth', key, options);
  }

  /**
   * Быстрый метод для переводов в неймспейсе common
   * @param key - Ключ перевода в неймспейсе common
   * @param options - Дополнительные опции перевода
   * @returns Переведённая строка
   */
  common(
    key: I18nKeys['common'],
    options?: Omit<Parameters<typeof this.t>[2], 'namespace'>,
  ): string {
    return this.t('common', key, options);
  }

  /**
   * Быстрый метод для переводов в неймспейсе validation
   * @param key - Ключ перевода в неймспейсе validation
   * @param options - Дополнительные опции перевода
   * @returns Переведённая строка
   */
  validation(
    key: I18nKeys['validation'],
    options?: Omit<Parameters<typeof this.t>[2], 'namespace'>,
  ): string {
    return this.t('validation', key, options);
  }

  /**
   * Получить текущий язык из контекста
   */
  getCurrentLanguage(): AppLanguage {
    return (I18nContext.current()?.lang || I18N_CONFIG.defaultLanguage) as AppLanguage;
  }

  /**
   * Проверить поддержку языка
   * @param language - Язык для проверки
   */
  isLanguageSupported(language: string): language is AppLanguage {
    return I18N_CONFIG.supportedLanguages.includes(language as AppLanguage);
  }

  /**
   * Получить список всех поддерживаемых языков
   */
  getSupportedLanguages(): AppLanguage[] {
    return [...I18N_CONFIG.supportedLanguages];
  }
}
