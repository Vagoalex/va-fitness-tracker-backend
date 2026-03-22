import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

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
    JwtModule.register({}),
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
