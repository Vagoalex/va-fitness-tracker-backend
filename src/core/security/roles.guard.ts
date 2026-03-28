import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_METADATA_KEY } from '@/common/security/constants/security.constants';
import { SECURITY_CONSTANTS } from './constants/security.constants';
import { RoleType } from '@/core/enums/role-type.enum';
import { AuthenticatedRequest } from '@/common/http/types/request.types';
import { I18nExceptions } from '@/core/i18n';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /** Проверка @Public */
    const isPublic = this.reflector.getAllAndOverride<boolean>(SECURITY_CONSTANTS.IsPublicKey, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    /** Получение ролей */
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(I18nExceptions.unauthorized('auth.errors.invalid_token'));
    }

    if (!user.roles || user.roles.length === 0) {
      throw new ForbiddenException(I18nExceptions.forbidden('auth.errors.no_roles'));
    }

    const hasAccess = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasAccess) {
      throw new ForbiddenException(
        I18nExceptions.forbidden('auth.errors.insufficient_permissions'),
      );
    }

    return true;
  }
}
