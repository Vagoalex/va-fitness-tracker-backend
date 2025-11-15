import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModel, UserSchema } from '../user/models/user.model';
import { UserModule } from '../user/user.module';
import { USER_COLLECTION_NAME } from '../user/constants/user.constants';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJWTConfig } from '../../../core/configs/jwt.config';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
    PassportModule,
    UserModule,
    JwtModule,
  ],
  providers: [ConfigService, AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
