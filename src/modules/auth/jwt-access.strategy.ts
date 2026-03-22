import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_ACCESS_STRATEGY_NAME } from '@/common/security/constants/security.constants';
import { UserStatus } from '@/core/enums/user-status.enum';
import { JwtAccessPayload } from '@/core/types/jwt-payload.types';
import { authConfig } from '@/modules/auth/auth.config';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, JWT_ACCESS_STRATEGY_NAME) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.accessTokenSecret,
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
