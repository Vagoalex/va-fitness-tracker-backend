import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJWTConfig } from '../../../configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModel, UserSchema } from '../user/models/user.model';
import { UserController } from '../user/user.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { USER_COLLECTION_NAME } from '../user/constants/user.constants';

@Module({
	controllers: [AuthController, UserController],
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig,
		}),
		ConfigModule,
		PassportModule,
		UserModule,
	],
	providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
