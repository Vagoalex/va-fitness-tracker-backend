import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicUserService } from './public-user.service';
import { UserModel, UserSchema } from '../../shared/user/models/user.model';
import { USER_COLLECTION_NAME } from '../../shared/user/constants/user.constants';
import { PublicUserController } from './public-user.controller';

@Module({
	controllers: [PublicUserController],
	imports: [
		MongooseModule.forFeature([
			{ name: UserModel.name, schema: UserSchema, collection: USER_COLLECTION_NAME },
		]),
	],
	providers: [PublicUserService],
})
export class PublicUserModule {}
