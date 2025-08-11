import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserDocument, UserModel } from '../../user/models/user.model';
import { arrayMinLength } from '../../../../validators/array-min-length.validator';
import {
	WorkoutExerciseDocument,
	WorkoutExerciseModel,
} from '../../exercise/models/workout-exercise.model';

// 1. Интерфейс для виртуальных полей
export interface WorkoutModelVirtual {
	totalReps: number;
	duration: number | null;
}

export type WorkoutDocument = HydratedDocument<WorkoutModel> & WorkoutModelVirtual;

/**
 *  Модель тренировки
 */
@Schema({
	versionKey: false,
	timestamps: true,
	toJSON: { virtuals: true }, // Включаем виртуальные поля в JSON
	toObject: { virtuals: true }, // Включаем виртуальные поля в объекты })
})
export class WorkoutModel {
	/**
	 * ID пользователя
	 */
	@Prop({
		required: true,
		type: MSchema.Types.ObjectId,
		ref: UserModel.name,
	})
	userId: UserDocument;

	/**
	 * Дата начала тренировки
	 */
	@Prop({ required: true, default: Date.now })
	startDate: Date;

	/**
	 * Дата завершения
	 * (null = тренировка не завершена и она еще активна)
	 */
	@Prop()
	endDate?: Date | null;

	/**
	 * Массив упражнений
	 */
	@Prop({
		type: Array<WorkoutExerciseDocument>,
		validate: [arrayMinLength(1)],
	})
	exercises: WorkoutExerciseDocument[];
}

export const WorkoutSchema = SchemaFactory.createForClass(WorkoutModel);

/**
 * Виртуальное computed поле (общее количество повторений)
 */
WorkoutSchema.virtual('totalReps').get(function (this: WorkoutDocument) {
	if (!Array.isArray(this.exercises) || !this.exercises?.length) return 0;

	return this.exercises.reduce((total, exercise) => {
		return total + exercise.sets.reduce((sum, set) => sum + set.reps, 0);
	}, 0);
});

/**
 * Виртуальное computed поле (Продолжительность тренировки)
 */
WorkoutSchema.virtual('duration').get(function (this: WorkoutDocument) {
	return this.endDate ? this.endDate.getTime() - this.startDate.getTime() : null;
});
