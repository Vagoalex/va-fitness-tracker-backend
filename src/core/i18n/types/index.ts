import { I18nTranslations } from '../generated/i18n.generated';

/**
 * Утилита для извлечения вложенных ключей переводов
 */
export type NestedI18nKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedI18nKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

/**
 * Типизированные ключи переводов для каждого неймспейса
 */
export type I18nKeys = {
  [K in keyof I18nTranslations]: NestedI18nKeyOf<I18nTranslations[K]>;
};
