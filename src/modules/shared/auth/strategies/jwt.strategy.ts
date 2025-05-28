import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { INVALID_OR_EXPIRED_TOKEN_ERROR, JwtTypeName } from '../constants/auth.constants';
import { AuthUserModel } from '../models/auth-user.model';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JwtTypeName) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: AuthUserModel) {
		const user = await this.userService.findUserByEmail(payload.email);
		if (!user) {
			throw new UnauthorizedException(INVALID_OR_EXPIRED_TOKEN_ERROR);
		}
		return user;
	}
}
