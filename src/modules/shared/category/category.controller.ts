import {
	UsePipes,
	ValidationPipe,
	Controller,
	HttpCode,
	HttpStatus,
	Get,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDocument } from './models/category.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
	constructor(protected readonly categoryService: CategoryService) {}

	/**
	 * Получение категорий по названию
	 */
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findCategories(
		@Query() queryParameters?: { name?: string },
	): Promise<CategoryDocument[]> {
		return await this.categoryService.findByNameOrCode(queryParameters);
	}
}
