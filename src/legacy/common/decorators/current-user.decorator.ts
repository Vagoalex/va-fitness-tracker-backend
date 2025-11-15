import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// TODO:
export interface CurrentUser {
  userId: string;
  email: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    return data ? user?.[data] : user;
  },
);
