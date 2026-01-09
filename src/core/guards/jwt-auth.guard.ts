import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators';
import { JwtTypeName } from '../../modules/auth/constants';
import { AuthExceptions } from '../i18n/helpers/i18n-exeptions.helper';
import { AuthenticatedRequest } from '../../types/request.types';
import { JwtPayload } from '../../modules/auth/types';

/**
 * Guard для авторизации
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JwtTypeName) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = JwtPayload>(
    err: any,
    user: TUser,
    info: Error | { message?: string; name?: string } | null,
    context: ExecutionContext,
  ) {
    if (err || !user) {
      throw AuthExceptions.invalidToken();
    }

    // Добавляем user в request
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = user;

    return user;
  }
}
