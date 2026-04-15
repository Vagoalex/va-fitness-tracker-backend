import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '@/common/http/types/request.types';

/**
 * Декоратор для получения текущего пользователя из запроса
 *
 * @param propertyName - свойство пользователя, которое нужно получить
 * @param context - контекст выполнения
 * @returns текущий пользователь или свойство пользователя
 */
export const CurrentUser = createParamDecorator(
  (propertyName: keyof AuthenticatedRequest['user'] | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Если propertyName передано, возвращаем свойство пользователя, иначе возвращаем пользователя
    return propertyName ? request.user?.[propertyName] : request.user;
  },
);
