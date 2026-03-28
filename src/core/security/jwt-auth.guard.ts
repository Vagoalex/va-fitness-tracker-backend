import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_CONSTANTS } from '@/common/constants';
import { SECURITY_CONSTANTS } from './constants/security.constants';
import { I18nExceptions } from '@/core/i18n';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_CONSTANTS.JwtTypeName) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(SECURITY_CONSTANTS.IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(error: Error | null, user: TUser | false | null): TUser {
    if (error || !user) {
      throw I18nExceptions.unauthorized('auth.errors.invalid_token');
    }

    return user;
  }
}
