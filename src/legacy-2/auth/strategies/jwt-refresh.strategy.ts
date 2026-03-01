import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { AUTH_CONSTANTS } from '../constants';
import { JwtPayload, RefreshTokenPayload } from '../types';
import { AuthExceptions } from '../../../core/i18n/helpers/i18n-exeptions.helper';
import { AllConfig } from '../../../types/config.types';

/**
 * Типизация запроса для получения рефреш токена
 */
// @ts-ignore
interface RefreshTokenRequest extends Request {
  cookies?: {
    refreshToken?: string;
  };
  body?: {
    refreshToken?: string;
  };
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  AUTH_CONSTANTS.JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(configService: ConfigService<AllConfig>) {
    const jwtConfig = configService.get('jwt', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RefreshTokenRequest) => {
          return request?.cookies?.refreshToken || request?.body?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(request: RefreshTokenRequest, payload: JwtPayload): RefreshTokenPayload {
    const refreshToken = request.cookies?.refreshToken || request.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw AuthExceptions.invalidToken();
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
