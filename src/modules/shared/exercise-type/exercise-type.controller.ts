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
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { ExerciseTypeService } from './exercise-type.service';
import { ExerciseTypeDocument } from './models/exercise-type.model';

@Controller('exercise-types')
@UseGuards(JwtAuthGuard)
export class ExerciseTypeController {
	constructor(protected readonly exerciseTypeService: ExerciseTypeService) {}

	/**
	 * Получение типов упражнений
	 */
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findExerciseTypes(
		@Query() queryParameters?: { name?: string; code?: string },
	): Promise<ExerciseTypeDocument[]> {
		return await this.exerciseTypeService.findByNameOrCode(queryParameters);
	}
}
