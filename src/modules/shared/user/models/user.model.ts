import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserGenderTypes } from '../enums/UserGenderTypes';
import { UserStatusTypes } from '../enums/UserStatusTypes';
import { RoleTypes } from '../../../../enums/RoleTypes';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ versionKey: false })
export class UserModel {
	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop()
	firstName: string;

	@Prop()
	lastName: string;

	@Prop({ enum: UserGenderTypes })
	gender: UserGenderTypes;

	@Prop({ enum: UserStatusTypes })
	status: UserStatusTypes;

	@Prop()
	phone: string;

	@Prop({ type: [{ type: String, enum: Object.values(RoleTypes) }] })
	roles: RoleTypes[];
}

export const UserSchema: MSchema<UserModel> = SchemaFactory.createForClass(UserModel);
