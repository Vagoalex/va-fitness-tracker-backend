/**
 * Типы для переводов на основе JSON файлов
 * Обеспечивают автодополнение и типобезопасность для ключей переводов
 */

/**
 * Структура переводов auth.json
 */
export type AuthTranslations = {
  errors: {
    invalid_credentials: string;
    user_exists: string;
    unauthorized: string;
  };
  success: {
    registered: string;
    logged_in: string;
  };
};

/**
 * Структура переводов common.json
 */
export type CommonTranslations = {
  errors: {
    not_found: string;
    internal_error: string;
    validation_failed: string;
    bad_request?: string;
    forbidden?: string;
    conflict?: string;
    unauthorized?: string;
  };
  success: {
    created: string;
    updated: string;
    deleted: string;
  };
};

/**
 * Структура переводов validation.json
 */
export type ValidationTranslations = {
  is_email: string;
  is_not_empty: string;
  min_length: string;
  max_length: string;
  is_string: string;
  is_number: string;
  validation_failed?: string;
  [key: string]: string | undefined; // Для других валидаторов
};

/**
 * Объединенная структура всех переводов
 */
type Translations = {
  auth: AuthTranslations;
  common: CommonTranslations;
  validation: ValidationTranslations;
};

/**
 * Рекурсивный тип для генерации путей к вложенным свойствам
 * Генерирует все возможные пути типа "auth.errors.user_exists"
 */
type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${Paths<T[K]>}` : K) : never;
    }[keyof T]
  : never;

/**
 * TranslationKey для auth
 */
export type AuthErrorTranslationKey = Paths<Pick<Translations, 'auth'>>;

/**
 * TranslationKey для common
 */
export type CommonTranslationKey = Paths<Pick<Translations, 'common'>>;

/**
 * TranslationKey для validation
 */
export type ValidationTranslationKey = Paths<Pick<Translations, 'validation'>>;

/**
 * Тип для путей к переводам с автодополнением
 * Примеры: "auth.errors.user_exists" | "common.success.created" | "validation.is_email"
 */
export type TranslationKey = Paths<Translations>;

/**
 * Вспомогательный тип для проверки существования ключа
 */
export type TranslationKeyOf<T extends string> = T extends TranslationKey ? T : never;
