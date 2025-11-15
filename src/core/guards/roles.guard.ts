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
  NOT_AUTHORITY_ROLES_ERROR,
  NOT_VALID_TOKEN_ERROR,
  TOKEN_NOT_FOUND_ERROR,
} from '../../legacy/core/constants/auth.constants';
import { templateParts } from '../../legacy/core/constants/template-parts.constants';

interface NestJSRequestHeaders {
  [key: string]: string | string[] | undefined;
  authorization?: string | string[];
}

/**
 * Guard для проверки ролей
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Метод для проверки ролей (стандартный метод)
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    /** Получение ролей из декоратора */
    const requiredRoles = this.reflector.getAllAndOverride<RoleTypes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    /** Получение токена из headers */
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(TOKEN_NOT_FOUND_ERROR);
    }

    /** Проверка токена */
    let payload: { roles: RoleTypes[] };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException(NOT_VALID_TOKEN_ERROR);
    }

    /** Проверка ролей */
    const hasAccess = requiredRoles.some((role) => payload.roles?.includes(role));
    if (!hasAccess) {
      throw new ForbiddenException(
        NOT_AUTHORITY_ROLES_ERROR.replace(templateParts.id, requiredRoles.join(', ')),
      );
    }

    /** Добавление payload в request */
    request['user'] = payload;
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
