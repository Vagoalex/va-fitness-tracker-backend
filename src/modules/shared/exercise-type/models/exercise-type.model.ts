import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { CategoryModel } from '../../category/models/category.model';

export type ExerciseTypeDocument = HydratedDocument<ExerciseTypeModel>;

/**
 * Модель типа упражнения (Входит в category)
 * Например ("Подтягивания", "Отжимания", "Приседания" и т.д)
 */
@Schema({ versionKey: false })
export class ExerciseTypeModel {
	/**
	 * Название вида упражнения в техническом виде
	 * Например: ("pull_up", "push_up", "squat" и т.д).
	 */
	@Prop({ required: true, unique: true })
	code: string;

	/**
	 * Название упражнения.
	 * Например: "Подтягивание", "Отжимание", "Приседание" и т.д.
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
	categoryId: CategoryModel;
}

export const ExerciseTypeSchema: MSchema<ExerciseTypeModel> =
	SchemaFactory.createForClass(ExerciseTypeModel);
