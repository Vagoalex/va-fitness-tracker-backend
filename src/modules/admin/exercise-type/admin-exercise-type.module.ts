import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminExerciseTypeService } from './admin-exercise-type.service';
import { AdminExerciseTypeController } from './admin-exercise-type.controller';
import {
	ExerciseTypeModel,
	ExerciseTypeSchema,
} from '../../shared/exercise-type/models/exercise-type.model';
import { EXERCISE_TYPE_COLLECTION_NAME } from '../../shared/exercise-type/constants/exercise-type.constants';

@Module({
	controllers: [AdminExerciseTypeController],
	imports: [
		MongooseModule.forFeature([
			{
				name: ExerciseTypeModel.name,
				schema: ExerciseTypeSchema,
				collection: EXERCISE_TYPE_COLLECTION_NAME,
			},
		]),
	],
	providers: [AdminExerciseTypeService],
})
export class AdminExerciseTypeModule {}
