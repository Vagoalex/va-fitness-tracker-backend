import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type CategoryDocument = HydratedDocument<CategoryModel>;

@Schema({ versionKey: false })
export class CategoryModel {
	@Prop({ required: true, unique: true })
	name: string;

	@Prop()
	description?: string;

	@Prop({ type: MSchema.Types.ObjectId, ref: 'Category' })
	parent?: CategoryModel;
}

export const CategorySchema: MSchema<CategoryModel> = SchemaFactory.createForClass(CategoryModel);
