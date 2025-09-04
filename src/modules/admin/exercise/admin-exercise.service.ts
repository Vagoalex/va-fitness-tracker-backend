import { Injectable } from '@nestjs/common';
import { CategoryService } from '../../shared/category/category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDocument } from '../../shared/category/models/category.model';

@Injectable()
export class AdminExerciseService extends CategoryService {
	async createCategory(dto: CreateCategoryDto): Promise<CategoryDocument> {
		const newCategory = new this.categoryModel(dto);
		return newCategory.save();
	}
}
