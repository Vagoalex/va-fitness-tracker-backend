import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './models/user.model';
import { USER_COLLECTION_NAME } from './constants/user.constants';
import { UserController } from './user.controller';

@Module({
	controllers: [UserController],
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
	],
	providers: [UserService],
	exports: [UserService] // Делаем сервис доступным для других модулей,
})
export class UserModule {}
