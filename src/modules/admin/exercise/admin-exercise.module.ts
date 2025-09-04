import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminExerciseService } from './admin-exercise.service';
import { AdminExerciseController } from './admin-exercise.controller';
import { ExerciseModel, ExerciseSchema } from '../../shared/exercise/models/exercise.model';
import { EXERCISE_COLLECTION_NAME } from '../../shared/exercise/constants/exercise.constants';

@Module({
	controllers: [AdminExerciseController],
	imports: [
		MongooseModule.forFeature([
			{
				name: ExerciseModel.name,
				schema: ExerciseSchema,
				collection: EXERCISE_COLLECTION_NAME,
			},
		]),
	],
	providers: [AdminExerciseService],
})
export class AdminExerciseModule {}
