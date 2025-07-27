import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type WorkoutExerciseSetDocument = HydratedDocument<WorkoutExerciseSetModel>;

/**
 * Подход в упражнении
 */
@Schema({ versionKey: false })
export class WorkoutExerciseSetModel {
	/**
	 * Количество повторений
	 */
	@Prop({ required: true })
	reps: number;

	/**
	 * Дополнительный вес в упражнении
	 */
	@Prop({ min: 0 })
	weight?: number;

	/**
	 * Какие нибудь заметки к подходу
	 */
	@Prop()
	notes?: string;

	/**
	 * Время выполнения подхода
	 */
	@Prop()
	completedAt?: Date | null;
}

export const WorkoutExerciseSetSchema: MSchema<WorkoutExerciseSetModel> =
	SchemaFactory.createForClass(WorkoutExerciseSetModel);
