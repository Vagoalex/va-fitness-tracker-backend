import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/*
 * Декоратор получения email из модели user
 */
export const UserEmail = createParamDecorator((data: unknown, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	return request.user;
});
