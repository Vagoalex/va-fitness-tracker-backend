import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_COLLECTION_NAME } from './constants/category.constants';
import { CategoryController } from './category.controller';
import { CategoryModel, CategorySchema } from './models/category.model';
import { AdminCategoryController } from '../../admin/category/admin-category.controller';
import { AdminCategoryService } from '../../admin/category/admin-category.service';

@Module({
	controllers: [CategoryController, AdminCategoryController],
	imports: [
		MongooseModule.forFeature([
			{
				name: CategoryModel.name,
				schema: CategorySchema,
				collection: CATEGORY_COLLECTION_NAME,
			},
		]),
	],
	providers: [CategoryService, AdminCategoryService],
	exports: [CategoryService], // Делаем сервис доступным для других модулей,
})
export class CategoryModule {}
