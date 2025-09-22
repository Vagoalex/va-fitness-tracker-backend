import { AuthGuard } from '@nestjs/passport';
import { JwtTypeName } from '../constants/auth.constants';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUserModel } from '../../modules/shared/auth/models/auth-user.model';

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

	handleRequest(
		err: Error | null,
		user: AuthUserModel | false | null,
		info: Error | { message?: string; name?: string } | null,
	) {
		if (err || !user) {
			throw err || new UnauthorizedException('Invalid token');
		}
		return user;
	}
}
