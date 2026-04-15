import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '@/common/http/types/request.types';
import { IS_PUBLIC_KEY, ROLES_METADATA_KEY } from '@/common/security/constants/security.constants';
import { RoleType } from '@/core/enums/role-type.enum';

/**
 * Guard для проверки ролей
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Метод для проверки ролей
   * @param context - контекст выполнения
   * @returns true, если пользователь имеет необходимые роли, иначе false
   */
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если роли не требуются - пропускаем
    if (!requiredRoles?.length) {
      return true;
    }

    // Получаем запрос и роли пользователя из запроса
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('auth.errors.invalid_token');
    }

    // Получаем роли пользователя из запроса
    const currentUserRoles = request.user?.roles ?? [];

    if (currentUserRoles.length === 0) {
      throw new ForbiddenException('auth.errors.no_roles');
    }

    // Проверяем, имеет ли пользователь необходимые роли
    if (!requiredRoles.some((role) => currentUserRoles.includes(role))) {
      throw new ForbiddenException('auth.errors.insufficient_permissions');
    }

    return true;
  }
}
