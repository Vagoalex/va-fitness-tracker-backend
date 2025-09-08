/**
 * Возвращает сообщение об ошибке валидации, что документ не был найден
 * @param id
 */
export const getDocumentByIdNotFoundError = (id: string) => {
	return `Документ с ID ${id} не найден`;
};

/**
 * Возвращает сообщение об ошибке валидации, что элемент с таким названием уже существует
 * @param elementName
 */
export const getAlreadyExistedWithNameError = (elementName: string) => {
	return `${elementName} с таким названием уже существует.`;
};

/**
 * Возвращает сообщение об ошибке валидации, что элемент с таким кодом уже существует
 * @param elementName
 */
export const getAlreadyExistedWithCodeError = (elementName: string) => {
	return `${elementName} с таким кодом уже существует.`;
};

/**
 * Возвращает сообщение об ошибке валидации
 * @param field
 * @param message
 */
export const getValidationError = (field: string, message: string) => {
	return `Поле ${field}: ${message}`;
};

/**
 * Возвращает сообщение об ошибке обязательного поля
 * @param fieldName
 */
export const getRequiredFieldError = (fieldName: string) => {
	return `Поле ${fieldName} обязательно для заполнения`;
};

/**
 * Возвращает сообщение об ошибке неверного формата
 * @param fieldName
 * @param expectedFormat
 */
export const getInvalidFormatError = (fieldName: string, expectedFormat: string) => {
	return `Поле ${fieldName} имеет неверный формат. Ожидается: ${expectedFormat}`;
};
