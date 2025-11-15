import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminCategoryService } from './admin-category.service';
import { AdminCategoryController } from './admin-category.controller';
import { CategoryModel, CategorySchema } from '../../shared/category/models/category.model';
import { CATEGORY_COLLECTION_NAME } from '../../shared/category/constants/category.constants';

@Module({
	controllers: [AdminCategoryController],
	imports: [
		MongooseModule.forFeature([
			{
				name: CategoryModel.name,
				schema: CategorySchema,
				collection: CATEGORY_COLLECTION_NAME,
			},
		]),
	],
	providers: [AdminCategoryService],
})
export class AdminCategoryModule {}
