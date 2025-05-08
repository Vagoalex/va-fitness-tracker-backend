import { urlTemplateParts } from '../../../../constants/url-template-parts.constants';

export const USER_COLLECTION_NAME: string = 'user';

export const ALREADY_EXISTED_USER_ERROR = 'Пользователь с таким email уже зарегистрирован';
export const SEARCHING_USER_NOT_FOUND_ERROR = `Пользователь с id: ${urlTemplateParts.id} не найден`;
export const USER_NOT_FOUND_ERROR = 'Неверный логин или пароль';
export const WRONG_PASSWORD_ERROR = 'Неверный логин или пароль';
