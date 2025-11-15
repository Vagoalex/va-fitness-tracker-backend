import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseController } from './exercise.controller';
import { EXERCISE_COLLECTION_NAME } from './constants/exercise.constants';
import { ExerciseModel, ExerciseSchema } from './models/exercise.model';

@Module({
	controllers: [ExerciseController],
	imports: [
		MongooseModule.forFeature([
			// Упражнения (конечные состояния "Подтягивания широким хватом", "Алмазные отжимания", "Приседания с широкой постановкой ног" и т.д)
			{
				name: ExerciseModel.name,
				schema: ExerciseSchema,
				collection: EXERCISE_COLLECTION_NAME,
			},
		]),
	],
	providers: [ExerciseService],
	exports: [ExerciseService], // Делаем сервис доступным для других модулей,
})
export class ExerciseModule {}
