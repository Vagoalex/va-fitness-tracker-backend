import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseTypeController } from './exercise-type.controller';
import { ExerciseTypeModel, ExerciseTypeSchema } from './models/exercise-type.model';
import { EXERCISE_TYPE_COLLECTION_NAME } from './constants/exercise-type.constants';
import { ExerciseTypeService } from './exercise-type.service';

@Module({
	controllers: [ExerciseTypeController],
	imports: [
		MongooseModule.forFeature([
			// Типы упражнений ("Подтягивания", "Отжимания", "Приседания" и т.д)
			{
				name: ExerciseTypeModel.name,
				schema: ExerciseTypeSchema,
				collection: EXERCISE_TYPE_COLLECTION_NAME,
			},
		]),
	],
	providers: [ExerciseTypeService],
	exports: [ExerciseTypeService], // Делаем сервис доступным для других модулей,
})
export class ExerciseTypeModule {}
