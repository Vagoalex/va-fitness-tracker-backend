import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleTypes } from '../enums/RoleTypes';
import { JwtService } from '@nestjs/jwt';
import { NOT_AUTHORITY_ERROR, NOT_VALID_TOKEN_ERROR, TOKEN_NOT_FOUND_ERROR } from '../constants/auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwtService: JwtService,
	) {}
	
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<RoleTypes[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		
		if (!requiredRoles) {
			return true;
		}
		
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		
		if (!token) {
			throw new UnauthorizedException(TOKEN_NOT_FOUND_ERROR);
		}
		
		let payload: { roles: RoleTypes[] };
		try {
			payload = await this.jwtService.verifyAsync(token);
		} catch {
			throw new UnauthorizedException(NOT_VALID_TOKEN_ERROR);
		}
		
		const hasAccess = requiredRoles.some(role =>
			payload.roles?.includes(role)
		);
		
		if (!hasAccess) {
			throw new ForbiddenException(NOT_AUTHORITY_ERROR);
		}
		
		request.user = payload;
		return true;
	}
	
	private extractTokenFromHeader(request: Request): string | undefined {
		const authHeader = request.headers.get('authorization');
		if (!authHeader) return undefined;
		
		const [type, token] = authHeader.split(' ');
		return type === 'Bearer' ? token : undefined;
	}
}