import { AppLanguage } from '../constants';

/**
 * Параметры для методов перевода
 */
export interface TranslationOptions {
  lang?: AppLanguage;
  args?: Record<string, unknown>;
  defaultValue?: string;
}
