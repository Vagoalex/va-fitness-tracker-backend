import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthorizedRequest } from '@/common/http/types/request.types';
import { ROLES_METADATA_KEY } from '@/common/security/constants/security.constants';
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
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если роли не требуются - пропускаем
    if (!requiredRoles?.length) {
      return true;
    }

    // Получаем запрос и роли пользователя из запроса
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    // Получаем роли пользователя из запроса
    const currentUserRoles = request.user?.roles ?? [];

    // Проверяем, имеет ли пользователь необходимые роли
    return requiredRoles.some((role) => currentUserRoles.includes(role));
  }
}
