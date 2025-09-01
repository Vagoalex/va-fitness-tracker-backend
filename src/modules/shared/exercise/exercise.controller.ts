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
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExerciseTypeService } from './exercise-type.service';
import { ExerciseTypeDocument } from './models/exercise-type.model';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
	constructor(
		protected readonly exerciseService: ExerciseService,
		protected readonly exerciseTypeService: ExerciseTypeService,
	) {}

	/**
	 * Получение типов упражнений
	 */
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findExerciseTypes(
		@Query() queryParameters?: { name?: string; code?: string },
	): Promise<ExerciseTypeDocument[]> {
		return await this.exerciseTypeService.findExerciseTypeByName(queryParameters);
	}
}
