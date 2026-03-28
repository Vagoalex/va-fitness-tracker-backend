import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AUTH_CONFIG_KEY } from '@/core/config/auth.config';
import { AuthConfig } from '@/core/types/config.types';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { JwtAccessStrategy } from '@/modules/auth/jwt-access.strategy';

import {
  RefreshSession,
  RefreshSessionSchema,
} from '@/modules/auth/persistence/refresh-session.schema';

import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [
    UserModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authSettings = configService.get<AuthConfig>(AUTH_CONFIG_KEY);

        if (!authSettings) {
          throw new Error('Auth config is not defined');
        }

        return {
          secret: authSettings.accessTokenSecret,
          signOptions: {
            expiresIn: authSettings.accessTokenExpiresIn,
          },
        };
      },
    }),

    MongooseModule.forFeature([
      {
        name: RefreshSession.name,
        schema: RefreshSessionSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy],
  exports: [AuthService],
})
export class AuthModule {}
