import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { ExerciseTypeModel } from '../../workout-exercise-types/models/exercise-type.model';

export type WorkoutExerciseDocument = HydratedDocument<WorkoutExerciseModel>;

@Schema({ versionKey: false })
export class WorkoutExerciseModel {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop()
	imageUrl?: string;

	@Prop()
	videoUrl?: string;

	@Prop({ type: MSchema.Types.ObjectId, ref: 'ExerciseType' })
	type: ExerciseTypeModel;
}

export const WorkoutExerciseSchema: MSchema<WorkoutExerciseModel> =
	SchemaFactory.createForClass(WorkoutExerciseModel);
