import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../user/schemas/user.schema';
import { AllConfig } from '../../../types/config.types';
import { AUTH_CONSTANTS } from '../constants';
import { JwtPayload } from '../types';
import { AuthExceptions } from '../../../core/i18n/helpers/i18n-exeptions.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH_CONSTANTS.JWT_STRATEGY_NAME) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    configService: ConfigService<AllConfig>,
  ) {
    const jwtConfig = configService.get('jwt', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userModel.findById(payload.userId);
    if (!user) {
      throw AuthExceptions.invalidToken();
    }
    if (!user.isActive) {
      throw AuthExceptions.accountInactive();
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };
  }
}
