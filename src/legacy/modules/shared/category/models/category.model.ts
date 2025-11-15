import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type CategoryDocument = HydratedDocument<CategoryModel>;

/**
 * Схема категории упражнения
 * Например (Спина, Грудь, Ноги, Предплечья, Плечи, Бицепс, Трицепс и т.д.)
 */
@Schema({ versionKey: false, timestamps: true })
export class CategoryModel {
	/**
	 * Название вида категории в техническом виде
	 * Например: (back, chest, legs, arms, shoulders, biceps, triceps).
	 */
	@Prop({ required: true, unique: true })
	code: string;

	/**
	 * Название вида категории
	 * Например: Спина, Грудь, Ноги, Предплечья, Плечи, Бицепс, Трицепс и т.д.
	 */
	@Prop({ required: true, unique: true })
	name: string;

	/**
	 * Подробное описание
	 */
	@Prop()
	description?: string;

	/**
	 * Иконка категории
	 * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
	 */
	@Prop()
	icon?: string;
}

export const CategorySchema: MSchema<CategoryModel> = SchemaFactory.createForClass(CategoryModel);
