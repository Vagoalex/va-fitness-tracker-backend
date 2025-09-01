import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJWTConfig = (configService: ConfigService): JwtModuleOptions => {
	const secret = configService.get<string>('JWT_SECRET');
	if (!secret) {
		throw new Error('JWT_SECRET is not defined in environment variables');
	}

	return {
		secret,
		signOptions: {
			expiresIn: configService.get<string | number>('JWT_EXPIRES') || '1d',
		},
	} as JwtModuleOptions;
};
