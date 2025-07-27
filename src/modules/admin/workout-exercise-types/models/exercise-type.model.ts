import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { CategoryModel } from '../../categories/models/category.model';

export type WorkoutExerciseTypeDocument = HydratedDocument<WorkoutExerciseTypeModel>;

@Schema({ versionKey: false })
export class WorkoutExerciseTypeModel {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop({ type: MSchema.Types.ObjectId, ref: 'Category' })
	category: CategoryModel;
}

export const WorkoutExerciseTypeSchema: MSchema<WorkoutExerciseTypeModel> =
	SchemaFactory.createForClass(WorkoutExerciseTypeModel);
