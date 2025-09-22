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
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { ExerciseDocument } from './models/exercise.model';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
	constructor(protected readonly exerciseService: ExerciseService) {}

	/**
	 * Получение типов упражнений
	 */
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findExerciseTypes(
		@Query() queryParameters?: { name?: string; code?: string },
	): Promise<ExerciseDocument[]> {
		return await this.exerciseService.findByNameOrCode(queryParameters);
	}
}
