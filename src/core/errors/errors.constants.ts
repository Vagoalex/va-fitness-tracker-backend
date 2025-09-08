/**
 * Глобальные константы ошибок
 */
export const CORE_ERRORS = {
	NOT_VALID_FORMAT_ID_VALIDATION_ERROR: 'Некорректный формат ID',
	VALIDATION_ERROR: 'Ошибка валидации данных',
	UNAUTHORIZED: 'Не авторизован',
	FORBIDDEN: 'Доступ запрещен',
	NOT_FOUND: 'Ресурс не найден',
	INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
	IS_STRING: 'Значение должно быть строкой',
} as const;
