import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { UserModel, UserSchema } from '../shared/user/models/user.model';
import { USER_COLLECTION_NAME } from '../shared/user/constants/user.constants';
import { UserService } from '../shared/user/user.service';

@Module({
	controllers: [AdminUserController],
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
	],
	providers: [AdminUserService, UserService],
})
export class AdminUserModule {}
