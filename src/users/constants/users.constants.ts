import { urlTemplateParts } from '@/constants/url-template-parts.global-constants';

export const USER_COLLECTION_NAME: string = 'user';

export const USER_BY_ID_NOT_FOUND = `Пользователь с id: ${urlTemplateParts.id} не найден`;
export const USER_BY_LOGIN_NOT_FOUND = `Пользователь с login: ${urlTemplateParts.id} не найден`;
