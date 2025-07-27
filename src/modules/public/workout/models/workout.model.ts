import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserDocument, UserModel } from '../../../shared/user/models/user.model';
import {
	WorkoutExerciseDocument,
	WorkoutExerciseModel,
} from '../../../admin/workout-exercises/models/workout-exercise.model';

export type WorkoutDocument = HydratedDocument<WorkoutModel>;

@Schema({ versionKey: false })
export class WorkoutModel {
	@Prop({ required: true, type: MSchema.Types.ObjectId, ref: UserModel.name })
	user: UserDocument;

	/**
	 * Дата начала тренировки
	 */
	@Prop({ default: Date.now })
	startDate: Date;

	/**
	 * Дата завершения
	 * (null = тренировка не завершена)
	 */
	@Prop()
	endDate?: Date | null;

	@Prop({
		type: [
			{
				exercise: { type: MSchema.Types.ObjectId, ref: WorkoutExerciseModel.name },
				sets: [{ reps: Number }], // Массив подходов с повторениями
			},
		],
	})
	exercises: {
		exercise: WorkoutExerciseDocument;
		sets: { reps: number }[];
	}[];
}

export const WorkoutSchema = SchemaFactory.createForClass(WorkoutModel);
