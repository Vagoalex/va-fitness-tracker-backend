/**
 * Константы для ключей переводов
 * Используются для типобезопасного доступа к переводам
 * Автодополнение работает через типы в translations.types.ts
 */

/**
 * Ключи переводов для auth
 */
export const AUTH_TRANSLATION_KEYS = {
  errors: {
    invalid_credentials: 'auth.errors.invalid_credentials',
    user_exists: 'auth.errors.user_exists',
    unauthorized: 'auth.errors.unauthorized',
  },
  success: {
    registered: 'auth.success.registered',
    logged_in: 'auth.success.logged_in',
  },
} as const;

/**
 * Ключи переводов для common
 */
export const COMMON_TRANSLATION_KEYS = {
  errors: {
    not_found: 'common.errors.not_found',
    internal_error: 'common.errors.internal_error',
    validation_failed: 'common.errors.validation_failed',
    bad_request: 'common.errors.bad_request',
    unauthorized: 'common.errors.unauthorized',
    forbidden: 'common.errors.forbidden',
    conflict: 'common.errors.conflict',
  },
  success: {
    created: 'common.success.created',
    updated: 'common.success.updated',
    deleted: 'common.success.deleted',
  },
} as const;

/**
 * Ключи переводов для validation
 */
export const VALIDATION_TRANSLATION_KEYS = {
  is_email: 'validation.is_email',
  is_not_empty: 'validation.is_not_empty',
  min_length: 'validation.min_length',
  max_length: 'validation.max_length',
  is_string: 'validation.is_string',
  is_number: 'validation.is_number',
} as const;
