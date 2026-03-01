import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONSTANTS } from '../../common/constants';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SECURITY_CONSTANTS } from './constants/security.constants';
// import { CurrentUser } from '../decorators/current-user.decorator';
import { I18nExceptions } from '../i18n';

// TODO: реализовать jwtAuthGuard
/**
 * Guard для авторизации
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_CONSTANTS.JwtTypeName) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SECURITY_CONSTANTS.IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // handleRequest<TUser = CurrentUser>(
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false | null,
    info: Error | { message?: string; name?: string } | null,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      throw err || I18nExceptions.unauthorized('auth.errors.invalid_token');
    }
    return user;
  }
}
