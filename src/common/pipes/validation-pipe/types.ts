import { I18nKeys } from '../../../core/i18n/types';

/**
 * Тип для ключей переводов в неймспейсе validation
 */
export type ValidationTranslationKeys = I18nKeys['validation'];

/**
 * Карта соответствия констрейнтов class-validator ключам переводов i18n
 * Обеспечивает автоматический перевод стандартных сообщений об ошибках
 */
export const CONSTRAINT_TO_I18N_KEY: Readonly<Record<string, ValidationTranslationKeys>> = {
  // Основные валидаторы
  isNotEmpty: 'is_not_empty',
  isEmail: 'is_email',
  isString: 'is_string',
  isNumber: 'is_number',
  isInt: 'is_integer',
  isBoolean: 'is_boolean',
  isDate: 'is_date',
  isArray: 'is_array',
  isObject: 'is_object',
  isUrl: 'is_url',
  isUUID: 'is_uuid',
  isPhoneNumber: 'is_phone_number',

  // Валидаторы длины
  minLength: 'min_length',
  maxLength: 'max_length',
  length: 'length',

  // Валидаторы числовых значений
  min: 'min',
  max: 'max',

  // Специализированные валидаторы
  isEnum: 'is_enum',
  matches: 'matches',

  // Кастомные валидаторы
  isStrongPassword: 'is_strong_password',
  isAdult: 'is_adult',
  isFutureDate: 'is_future_date',

  // Дополнительные стандартные валидаторы
  isJWT: 'is_jwt',
  isLowercase: 'is_string',
  isMongoId: 'is_mongo_id',
  isNegative: 'is_negative',
  isPositive: 'is_positive',

  // Дополнительные валидаторы с параметрами
  equals: 'equals',
  notEquals: 'not_equals',
  contains: 'contains',
  notContains: 'not_contains',
  isIn: 'is_in',
  isNotIn: 'is_not_in',
} as const;

/**
 * Приоритет констрейнтов для выбора основного сообщения об ошибке
 * Определяет порядок, в котором констрейнты будут рассматриваться при формировании основного сообщения
 */
export const CONSTRAINT_PRIORITY: ReadonlyArray<keyof typeof CONSTRAINT_TO_I18N_KEY> = [
  // Базовые ошибки типа данных
  'isNotEmpty', // Пустое значение - самая базовая ошибка
  'isString', // Неверный тип данных: не строка
  'isNumber', // Неверный тип данных: не число
  'isBoolean', // Неверный тип данных: не булево значение
  'isDate', // Неверный тип данных: не дата
  'isArray', // Неверный тип данных: не массив
  'isObject', // Неверный тип данных: не объект

  // Критические бизнес-валидаторы
  'isEmail', // Невалидный email - критично для аутентификации
  'isStrongPassword', // Слабый пароль - критично для безопасности
  'isAdult', // Возраст меньше 18 - критично для регистрации
  'isFutureDate', // Дата не в будущем - для планирования событий

  // Валидаторы длины (по приоритету)
  'minLength', // Слишком короткое значение
  'maxLength', // Слишком длинное значение
  'length', // Несоответствие диапазону длины

  // Числовые валидаторы
  'min', // Значение меньше минимального
  'max', // Значение больше максимального

  // Специализированные валидаторы
  'isEnum', // Недопустимое значение из списка
  'matches', // Несоответствие паттерну
  'isUUID', // Неверный формат UUID
  'isUrl', // Неверный формат URL
  'isPhoneNumber', // Неверный формат телефона

  // Дополнительные стандартные валидаторы
  'isInt', // Не целое число
  'isPositive', // Не положительное число
  'isNegative', // Не отрицательное число
  'isJWT', // Неверный формат JWT токена
  'isMongoId', // Неверный формат MongoDB ID

  // Валидаторы сравнения
  'equals', // Не равно ожидаемому значению
  'notEquals', // Равно запрещенному значению
  'contains', // Не содержит требуемое значение
  'notContains', // Содержит запрещенное значение
  'isIn', // Не входит в разрешенный список
  'isNotIn', // Входит в запрещенный список
] as const;
