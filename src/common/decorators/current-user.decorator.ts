import { createParamDecorator } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

// Тип текущего пользователя
export interface CurrentUser {
  userId: string;
  email: string;
  roles: string[];
}

// Расширяем Request локально — только для этого файла
interface ReceivedRequest extends ExpressRequest {
  user?: CurrentUser;
}

export const CurrentUser = createParamDecorator<
  keyof CurrentUser | undefined,
  CurrentUser | string | string[] | undefined
>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest<ReceivedRequest>();
  const user = request.user;

  if (!user) {
    return undefined;
  }

  return data ? user[data] : user;
});
