import {
  getAlreadyExistedWithCodeError,
  getAlreadyExistedWithNameError,
  getDocumentByIdNotFoundError,
} from '../../../../core/errors/errors.helper';
import { EXERCISE_TYPE_ENTITY_NAME } from './exercise-type.constants';

/**
 * API ошибки по модулю "Тип упражнения"
 */
export const EXERCISE_TYPE_ERRORS = {
  ALREADY_EXISTED_WITH_NAME: getAlreadyExistedWithNameError(EXERCISE_TYPE_ENTITY_NAME),
  ALREADY_EXISTED_WITH_CODE: getAlreadyExistedWithCodeError(EXERCISE_TYPE_ENTITY_NAME),
  DOCUMENT_NOT_FOUND: (id: string) => getDocumentByIdNotFoundError(id),
};

/**
 * Валидационные ошибки для упражнений
 */
export const EXERCISE_TYPE_VALIDATION_ERRORS = {
  CODE_PATTERN: `Код типа упражнения должен содержать только латиницу в lowercase, цифры и нижние подчеркивания`,
  NAME_REQUIRED: 'Название типа упражнения обязательно',
  CODE_REQUIRED: 'Код типа упражнения обязателен',
  CATEGORY_ID_REQUIRED: 'Категория типа упражнения обязательна',
};
