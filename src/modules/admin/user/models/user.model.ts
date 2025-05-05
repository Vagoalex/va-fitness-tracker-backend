import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserStatusTypes } from '../enums/UserStatusTypes';
import { IsValidSNILS } from '../../../../decorators/documents/snils.decorator';
import { IsNotEmpty } from 'class-validator';
import { IsValidINN } from '../../../../decorators/documents/inn.decorator';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ versionKey: false })
export class UserModel {
	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop()
	@IsNotEmpty()
	firstName: string | null;

	@Prop()
	@IsNotEmpty()
	lastName: string;

	@Prop()
	@IsValidINN()
	inn: string;

	@Prop()
	@IsValidSNILS()
	snils: string;

	@Prop()
	phone: string;

	@Prop({ enum: UserStatusTypes })
	status: UserStatusTypes;
}

export const UserSchema: MSchema<UserModel> = SchemaFactory.createForClass(UserModel);
