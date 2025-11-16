import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService as NestI18nService } from 'nestjs-i18n';
import { I18nTranslations, I18nPath } from './generated/i18n.generated';
import { I18N_CONFIG, AppLanguage } from './constants';

// Вспомогательные типы для глубоких ключей
type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DeepKeys<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

type NestedTranslationKeys = {
  [K in keyof I18nTranslations]: DeepKeys<I18nTranslations[K]>;
};

@Injectable()
export class I18nService {
  constructor(
    @Inject(NestI18nService)
    private readonly nestI18nService: NestI18nService,
  ) {}

  /**
   * Универсальный типизированный метод для переводов
   */
  t<K extends keyof I18nTranslations>(
    namespace: K,
    key: NestedTranslationKeys[K],
    options?: {
      lang?: AppLanguage;
      args?: Record<string, any>;
      defaultValue?: string;
    },
  ): string {
    return this.nestI18nService.translate(`${namespace as string}.${key as string}`, {
      lang: options?.lang || I18nContext.current()?.lang,
      args: options?.args,
      defaultValue: options?.defaultValue,
    });
  }

  /**
   * Универсальный метод для перевода по полному пути
   */
  translatePath(
    path: I18nPath,
    options?: {
      lang?: AppLanguage;
      args?: Record<string, any>;
      defaultValue?: string;
    },
  ): string {
    const [namespace, ...keyParts] = path.split('.');
    const key = keyParts.join('.') as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.t(namespace as keyof I18nTranslations, key, {
      ...options,
      defaultValue: options?.defaultValue || path,
    });
  }

  /**
   * Быстрые методы для namespace auth с поддержкой вложенных ключей
   */
  auth(
    key: NestedTranslationKeys['auth'],
    options?: Omit<Parameters<typeof this.t>[2], 'namespace'>,
  ): string {
    return this.t('auth', key, options);
  }

  /**
   * Быстрые методы для namespace common с поддержкой вложенных ключей
   */
  common(
    key: NestedTranslationKeys['common'],
    options?: Omit<Parameters<typeof this.t>[2], 'namespace'>,
  ): string {
    return this.t('common', key, options);
  }

  /**
   * Быстрые методы для namespace validation с поддержкой вложенных ключей
   */
  validation(
    key: NestedTranslationKeys['validation'],
    options?: Omit<Parameters<typeof this.t>[2], 'namespace'>,
  ): string {
    return this.t('validation', key, options);
  }

  /**
   * Получить текущий язык
   */
  getCurrentLanguage(): AppLanguage {
    return (I18nContext.current()?.lang || I18N_CONFIG.defaultLanguage) as AppLanguage;
  }

  /**
   * Проверить поддержку языка
   */
  isLanguageSupported(language: string): language is AppLanguage {
    return I18N_CONFIG.supportedLanguages.includes(language as AppLanguage);
  }

  /**
   * Получить все поддерживаемые языки
   */
  getSupportedLanguages(): AppLanguage[] {
    return [...I18N_CONFIG.supportedLanguages];
  }
}
