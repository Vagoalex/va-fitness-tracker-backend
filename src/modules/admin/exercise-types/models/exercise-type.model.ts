import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { CategoryModel } from '../../categories/models/category.model';

export type ExerciseTypeDocument = HydratedDocument<ExerciseTypeModel>;

@Schema({ versionKey: false })
export class ExerciseTypeModel {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop({ type: MSchema.Types.ObjectId, ref: 'Category' })
	category: CategoryModel;
}

export const ExerciseTypeSchema: MSchema<ExerciseTypeModel> =
	SchemaFactory.createForClass(ExerciseTypeModel);
