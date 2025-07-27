import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { CategoryModel } from '../../categories/models/category.model';

export type ExerciseTypeDocument = HydratedDocument<ExerciseTypeModel>;

/**
 * Модель типа упражнения
 */
@Schema({ versionKey: false })
export class ExerciseTypeModel {
	/**
	 * Название упражнения.
	 * Например: "Подтягивания", "Отжимания", "Приседания" и т.д.
	 */
	@Prop({ required: true, unique: true })
	name: string;

	/**
	 * Подробное описание
	 */
	@Prop()
	description?: string;

	/**
	 * Связь с категорией
	 */
	@Prop({
		type: MSchema.Types.ObjectId,
		ref: CategoryModel.name,
		required: true,
	})
	category: CategoryModel;
}

export const ExerciseTypeSchema: MSchema<ExerciseTypeModel> =
	SchemaFactory.createForClass(ExerciseTypeModel);
