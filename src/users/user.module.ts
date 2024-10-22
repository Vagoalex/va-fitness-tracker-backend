import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from '@/users/models/user.model';
import { USER_COLLECTION_NAME } from '@/users/constants/users.constants';
import { UserController } from '@/users/user.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
	],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
