import {
	getAlreadyExistedWithCodeError,
	getAlreadyExistedWithNameError,
	getDocumentByIdNotFoundError,
} from '../../../../core/errors/errors.helper';
import { EXERCISE_CODE_PATTERN_DESCRIPTION, EXERCISE_ENTITY_NAME } from './exercise.constants';

/**
 * API ошибки по модулю "Упражнения"
 */
export const EXERCISE_ERRORS = {
	ALREADY_EXISTED_WITH_NAME: getAlreadyExistedWithNameError(EXERCISE_ENTITY_NAME),
	ALREADY_EXISTED_WITH_CODE: getAlreadyExistedWithCodeError(EXERCISE_ENTITY_NAME),
	NOT_FOUND: (id: string) => getDocumentByIdNotFoundError(id),
};

/**
 * Валидационные ошибки для упражнений
 */
export const EXERCISE_VALIDATION_ERRORS = {
	CODE_PATTERN: `Код упражнения должен содержать только: ${EXERCISE_CODE_PATTERN_DESCRIPTION}`,
	NAME_REQUIRED: 'Название упражнения обязательно',
	CODE_REQUIRED: 'Код упражнения обязателен',
	CATEGORY_REQUIRED: 'Категория упражнения обязательна',
};
