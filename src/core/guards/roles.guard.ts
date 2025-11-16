import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../legacy/core/decorators/roles.decorator';
import { RoleTypes } from '../../legacy/core/enums/RoleTypes';
import { JwtService } from '@nestjs/jwt';
import {
  NOT_AUTHORITY_ERROR,
  NOT_AUTHORITY_ROLES_ERROR,
  NOT_VALID_TOKEN_ERROR,
  TOKEN_NOT_FOUND_ERROR,
} from '../../legacy/core/constants/auth.constants';
import { templateParts } from '../../legacy/core/constants/template-parts.constants';
import { AuthenticatedRequest } from '../../types/request.types';

interface NestJSRequestHeaders {
  [key: string]: string | string[] | undefined;
  authorization?: string | string[];
}

// TODO: Получаем тип пользователя из вашей JWT стратегии
// type AuthUser = ReturnType<typeof YourJwtStrategy.prototype.validate>;

/**
 * Guard для проверки ролей
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Метод для проверки ролей (стандартный метод)
   * @param context
   */
  canActivate(context: ExecutionContext): boolean {
    /** Получение ролей из декоратора */
    const requiredRoles = this.reflector.getAllAndOverride<RoleTypes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    /** Если роли не требуются - пропускаем */
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user; // Уже проверен через JwtAuthGuard

    if (!user?.roles) {
      throw new ForbiddenException(NOT_AUTHORITY_ERROR);
    }

    /** Проверка ролей */
    const hasAccess = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasAccess) {
      throw new ForbiddenException(
        NOT_AUTHORITY_ROLES_ERROR.replace(templateParts.id, requiredRoles.join(', ')),
      );
    }

    return true;
  }

  /**
   * Получение токена из headers
   * @param request
   * @private
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const headers = request?.headers as unknown as NestJSRequestHeaders;
    const authHeader = headers?.authorization;

    if (!authHeader) return undefined;

    const authValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const [type, token] = authValue.split(' ');

    return type === 'Bearer' ? token : undefined;
  }
}
