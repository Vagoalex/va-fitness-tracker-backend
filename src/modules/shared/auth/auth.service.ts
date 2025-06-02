import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../user/models/user.model';
import { AuthUserModel } from './models/auth-user.model';
import { INVALID_OR_EXPIRED_TOKEN_ERROR } from './constants/auth.constants';
import { UserJwtPayloadModel } from './models/user-jwt-payload.model';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {}

	async loginToAccount(user: UserDocument): Promise<AuthUserModel> {
		const payload: UserJwtPayloadModel = {
			email: user.email,
			userId: user._id.toString(),
			// TODO: сделать роли и выдавать их из пользоака
			roles: [],
		};

		// Преобразуем документ в plain object и удаляем из него passwordHash
		const { passwordHash, ...safetyUser } = user.toObject();

		return {
			...safetyUser,
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	async auth(token: string): Promise<AuthUserModel> {
		if (!token) {
			throw new UnauthorizedException(INVALID_OR_EXPIRED_TOKEN_ERROR);
		}

		try {
			const jwtPayload: AuthUserModel = await this.jwtService.verifyAsync(token);
			const user = await this.userService.findUserByEmail(jwtPayload.email);
			if (!user) {
				throw new UnauthorizedException(INVALID_OR_EXPIRED_TOKEN_ERROR);
			}

			return this.loginToAccount(user);
		} catch (e) {
			throw new UnauthorizedException(INVALID_OR_EXPIRED_TOKEN_ERROR);
		}
	}
}
