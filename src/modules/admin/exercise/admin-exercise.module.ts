import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminExerciseService } from './admin-exercise.service';
import { AdminExerciseController } from './admin-exercise.controller';
import { CategoryModel, CategorySchema } from '../../shared/category/models/category.model';
import { CATEGORY_COLLECTION_NAME } from '../../shared/category/constants/category.constants';
import { CategoryService } from '../../shared/category/category.service';
import { CategoryController } from '../../shared/category/category.controller';

@Module({
	controllers: [AdminExerciseController],
	imports: [
		MongooseModule.forFeature([
			{
				name: CategoryModel.name,
				schema: CategorySchema,
				collection: CATEGORY_COLLECTION_NAME,
			},
		]),
	],
	providers: [AdminExerciseService],
})
export class AdminExerciseModule {}
