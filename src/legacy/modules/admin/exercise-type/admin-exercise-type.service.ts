import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { ExerciseTypeService } from '../../shared/exercise-type/exercise-type.service';
import {
	ExerciseTypeDocument,
	ExerciseTypeModel,
} from '../../shared/exercise-type/models/exercise-type.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryService } from '../../shared/category/category.service';

@Injectable()
export class AdminExerciseTypeService extends ExerciseTypeService {
	constructor(
		@InjectModel(ExerciseTypeModel.name)
		readonly exerciseTypeModel: Model<ExerciseTypeDocument>,

		private readonly categoryService: CategoryService,
	) {
		super(exerciseTypeModel);
	}

	async createExerciseType(dto: CreateExerciseTypeDto): Promise<ExerciseTypeDocument> {
		// Используем categoryService для проверки существования категории
		const categoryExists = await this.categoryService.existsById(dto.categoryId);

		if (!categoryExists) {
			throw new NotFoundException(`Категория с ID ${dto.categoryId} не найдена`);
		}

		// Используем унаследованную модель из родительского класса
		const newDocument = new this.exerciseTypeModel(dto);
		return newDocument.save();
	}
}
