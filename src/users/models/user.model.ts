import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserRolesEnum } from '@/users/enums/UserRolesEnum';

export type UserDocument = HydratedDocument<UserModel>;

@Schema()
export class UserModel {
	@Prop({ required: true })
	login: string;

	@Prop({ required: true })
	password: string;

	@Prop({ enum: UserRolesEnum, default: UserRolesEnum.USER })
	role?: UserRolesEnum;
}

export const UserSchema: MSchema<UserModel> = SchemaFactory.createForClass(UserModel);
