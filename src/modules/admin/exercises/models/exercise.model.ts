import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { ExerciseTypeModel } from '../../exercise-types/models/exercise-type.model';

export type ExerciseDocument = HydratedDocument<ExerciseModel>;

@Schema({ versionKey: false })
export class ExerciseModel {
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

export const ExerciseSchema: MSchema<ExerciseModel> = SchemaFactory.createForClass(ExerciseModel);
