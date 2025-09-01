import { urlTemplateParts } from '../../../../core/constants/url-template-parts.constants';

export const USER_COLLECTION_NAME: string = 'users';

export const IMPOSSIBLE_DELETE_ADMIN_USER_ERROR =
	'Невозможно удалить пользователя с ролью "Администратор"';
export const ALREADY_EXISTED_USER_ERROR = 'Пользователь с таким email уже зарегистрирован';
export const SEARCHING_USER_NOT_FOUND_ERROR = `Пользователь с id: ${urlTemplateParts.id} не найден`;
export const USER_NOT_FOUND_ERROR = 'Пользователь не найден';
export const LOGIN_USER_NOT_FOUND_ERROR = 'Неверный логин или пароль';
export const WRONG_PASSWORD_ERROR = 'Неверный логин или пароль';
