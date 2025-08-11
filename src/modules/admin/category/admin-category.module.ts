import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminCategoryService } from './admin-category.service';
import { AdminCategoryController } from './admin-category.controller';
import { CategoryModel, CategorySchema } from '../../shared/category/models/category.model';
import { CATEGORY_COLLECTION_NAME } from '../../shared/category/constants/category.constants';
import { CategoryService } from '../../shared/category/category.service';
import { CategoryController } from '../../shared/category/category.controller';

@Module({
	controllers: [AdminCategoryController, CategoryController],
	imports: [
		MongooseModule.forFeature([
			{
				name: CategoryModel.name,
				schema: CategorySchema,
				collection: CATEGORY_COLLECTION_NAME,
			},
		]),
	],
	providers: [AdminCategoryService, CategoryService],
})
export class AdminCategoryModule {}
