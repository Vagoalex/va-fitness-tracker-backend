import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_ACCESS_STRATEGY_NAME } from '@/common/security/constants/security.constants';
import { UserStatus } from '@/core/enums/user-status.enum';
import { JwtAccessPayload } from '@/core/types/jwt-payload.types';
import { AUTH_CONFIG_KEY, authConfig } from '@/core/config/auth.config';
import { UserService } from '@/modules/user/user.service';
import { AuthConfig } from '@/core/types/config.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, JWT_ACCESS_STRATEGY_NAME) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const authSettings = configService.get<AuthConfig>(AUTH_CONFIG_KEY);

    if (!authSettings) {
      throw new Error('Auth config is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authSettings.accessTokenSecret,
    });
  }

  async validate(payload: JwtAccessPayload): Promise<JwtAccessPayload> {
    const userDocument = await this.userService.findById(payload.sub);

    if (userDocument.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('auth.user_is_not_active');
    }

    const currentPasswordChangedAtTimestamp = userDocument.passwordChangedAt?.getTime();

    if (
      currentPasswordChangedAtTimestamp &&
      payload.passwordChangedAt &&
      payload.passwordChangedAt < currentPasswordChangedAtTimestamp
    ) {
      throw new UnauthorizedException('auth.access_token_expired_by_password_change');
    }

    return {
      sub: userDocument.id,
      roles: userDocument.roles,
      passwordChangedAt: currentPasswordChangedAtTimestamp,
    };
  }
}
