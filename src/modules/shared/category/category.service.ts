import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument, CategoryModel } from './models/category.model';
import { CreateCategoryDto } from '../../admin/category/dto/create-category.dto';

@Injectable()
export class CategoryService {
	constructor(@InjectModel(CategoryModel.name) public categoryModel: Model<CategoryDocument>) {}

	async findCategoriesByName({ name }: { name?: string } = {}): Promise<CategoryDocument[]> {
		const filter: {
			name?: RegExp;
		} = {};

		if (name) {
			filter.name = new RegExp(name, 'i');
		}

		return this.categoryModel.find(filter).exec();
	}

	async findCategoryConflicts(
		dto: CreateCategoryDto,
	): Promise<{ nameExists: boolean; codeExists: boolean }> {
		const conflicts = await this.categoryModel
			.find({
				$or: [{ name: dto.name }, { code: dto.code }],
			})
			.select('name code')
			.lean();

		return {
			nameExists: conflicts.some((c) => c.name === dto.name),
			codeExists: conflicts.some((c) => c.code === dto.code),
		};
	}
}
