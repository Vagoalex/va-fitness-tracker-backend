import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { ExerciseDocument, ExerciseModel } from './exercise.model';
import { WorkoutExerciseSetDocument } from './workout-exercise-set.model';
import { arrayMinLength } from '../../../../core/validators/array-min-length.validator';

export type WorkoutExerciseDocument = HydratedDocument<WorkoutExerciseModel>;

/**
 * Подход в упражнении
 */
@Schema({ versionKey: false })
export class WorkoutExerciseModel {
	/**
	 * ID упражнения
	 */
	@Prop({
		type: MSchema.Types.ObjectId,
		ref: ExerciseModel.name,
		required: true,
	})
	exerciseId: ExerciseDocument;

	/**
	 * Количество подходов и повторений в подходах
	 */
	@Prop({
		type: Array<WorkoutExerciseSetDocument>,
		validate: [arrayMinLength(1)],
	})
	sets: WorkoutExerciseSetDocument[];
}

export const WorkoutExerciseSchema: MSchema<WorkoutExerciseModel> =
	SchemaFactory.createForClass(WorkoutExerciseModel);
