import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModel, UserSchema } from '../user/models/user.model';
import { UserController } from '../user/user.controller';
import { UserModule } from '../user/user.module';
import { USER_COLLECTION_NAME } from '../user/constants/user.constants';
import { UserService } from '../user/user.service';

@Module({
	controllers: [AuthController, UserController],
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
		PassportModule,
		UserModule,
	],
	providers: [AuthService, UserService, JwtStrategy],
	exports: [AuthService], // Делаем сервис доступным для других модулей
})
export class AuthModule {}
