import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import {
  IS_PUBLIC_KEY,
  JWT_ACCESS_STRATEGY_NAME,
} from '@/common/security/constants/security.constants';

/**
 * Guard для авторизации через JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY_NAME) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser>(error: Error | null, user: TUser | false | null): TUser {
    if (error || !user) {
      throw new UnauthorizedException('auth.errors.invalid_token');
    }

    return user;
  }
}
