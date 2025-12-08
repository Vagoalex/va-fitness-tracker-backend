import { I18nKeys } from '../../../core/i18n/types';
import { ValidationOptions } from 'class-validator';

/**
 * Тип для ключей переводов в неймспейсе validation
 */
type ValidationTranslationKeys = I18nKeys['validation'];
/**
 * Базовый интерфейс для типизированных опций валидации
 * Добавляет поддержку i18n ключей с автодополнением
 */
export interface TypedValidationOptions extends ValidationOptions {
  /** Ключ перевода для сообщения об ошибке */
  message?: ValidationTranslationKeys;
  /** Контекстные данные для подстановки в сообщение */
  context?: Record<string, unknown>;
}

/**
 * Типы опций для декораторов (основаны на документации class-validator)
 * Эти типы не экспортированы из class-validator, поэтому определяем их здесь
 */
export interface IsEmailOptions {
  allow_display_name?: boolean;
  require_tld?: boolean;
  allow_utf8_local_part?: boolean;
  require_valid_protocol?: boolean;
  host_blacklist?: string[];
  host_whitelist?: string[];
  allow_ip_domain?: boolean;
  domain_specific_validation?: boolean;
  ignore_max_length?: boolean;
}

export interface IsNumberOptions {
  allowNaN?: boolean;
  allowInfinity?: boolean;
  maxDecimalPlaces?: number;
}

export interface IsUrlOptions {
  protocols?: string[];
  require_tld?: boolean;
  require_protocol?: boolean;
  require_host?: boolean;
  require_port?: boolean;
  require_valid_protocol?: boolean;
  allow_underscores?: boolean;
  allow_trailing_dot?: boolean;
  allow_protocol_relative_urls?: boolean;
  disallow_auth?: boolean;
  host_whitelist?: string[];
  host_blacklist?: string[];
}

export interface IsDateStringOptions {
  strict?: boolean;
}

export interface IsNumberStringOptions {
  no_symbols?: boolean;
}

/**
 * Комбинированные типы для декораторов с поддержкой i18n
 */
export interface TypedIsEmailOptions extends IsEmailOptions, TypedValidationOptions {}
export interface TypedIsNumberOptions extends IsNumberOptions, TypedValidationOptions {}
export interface TypedIsUrlOptions extends IsUrlOptions, TypedValidationOptions {}
export interface TypedIsDateStringOptions extends IsDateStringOptions, TypedValidationOptions {}
export interface TypedIsNumberStringOptions extends IsNumberStringOptions, TypedValidationOptions {}
