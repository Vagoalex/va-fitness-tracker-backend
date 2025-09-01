import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { UserLevelTypes } from '../../../../core/enums/UserLevelTypes';
import { ExerciseTypeModel } from '../../exercise-type/models/exercise-type.model';

export type ExerciseDocument = HydratedDocument<ExerciseModel>;

/**
 * Модель конкретного упражнения - конечное состояние (Входит в exercise-type)
 * Например ("Подтягивания широким хватом", "Алмазные отжимания" и т.д)
 */
@Schema({ versionKey: false })
export class ExerciseModel {
	/**
	 * Название упражнения в техническом виде
	 * Наример: ("wide_grip_pull_ups", "diamond_push_ups" и т.д)
	 */
	@Prop({ required: true, unique: true })
	code: string;

	/**
	 * Название упражнения
	 * Наример: "Подтягивания широким хватом", "Алмазные отжимания" и т.д
	 */
	@Prop({ required: true, unique: true })
	name: string;

	/**
	 * Подробное описание
	 */
	@Prop()
	description?: string;

	/**
	 * Связь с типом упражнения
	 */
	@Prop({
		type: MSchema.Types.ObjectId,
		ref: ExerciseTypeModel.name,
		required: true,
	})
	exerciseTypeId: ExerciseTypeModel;

	/**
	 * Пошаговая инструкция выполнения
	 */
	@Prop()
	instructions?: string;

	/**
	 * Ссылка на изображение (Пока нет, так как на бэк не предназначено)
	 */
	@Prop()
	imageUrl?: string;

	/**
	 * Ссылка на видео (Пока нет, так как на бэк не предназначено)
	 */
	@Prop()
	videoUrl?: string;

	/**
	 * Сложность упражнения
	 */
	@Prop({
		min: 1,
		max: 5,
		default: 3,
	})
	difficulty: number;

	/**
	 * Для какого уровня подходит
	 */
	@Prop({
		enum: UserLevelTypes,
	})
	suitableFor: UserLevelTypes[];
}

export const ExerciseSchema: MSchema<ExerciseModel> = SchemaFactory.createForClass(ExerciseModel);
