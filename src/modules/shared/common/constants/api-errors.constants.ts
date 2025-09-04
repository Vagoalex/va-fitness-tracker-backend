export const getAlreadyExistedBaseDataWithNameError = (elementName: string) => {
	return `${elementName} с таким названием уже существует.`;
};

export const getAlreadyExistedBaseDataWithCodeError = (elementName: string) => {
	return `${elementName} с таким кодом уже существует.`;
};

export const getDocumentByIdNotFoundError = (id: string) => {
	return `Документ с ID ${id} не найден`;
};
