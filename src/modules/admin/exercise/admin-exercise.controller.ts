import {
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	BadRequestException,
	Post,
} from '@nestjs/common';
import { AdminController } from '../common/decorators/admin-controller.decorator';
import { AdminExerciseService } from './admin-exercise.service';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../../core/decorators/roles.decorator';
import { RoleTypes } from '../../../core/enums/RoleTypes';
import { ExerciseController } from '../../shared/exercise/exercise.controller';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseDocument } from '../../shared/exercise/models/exercise.model';
import { EXERCISE_NAME } from './constants/exercise.constants';

@AdminController('exercises')
@RequireRoles(RoleTypes.Admin)
@UseGuards(JwtAuthGuard)
export class AdminExerciseController extends ExerciseController {
	constructor(private readonly adminExerciseService: AdminExerciseService) {
		super(adminExerciseService);
	}

	/**
	 * Создание нового упражнения
	 */
	@UsePipes(new ValidationPipe())
	@Post()
	async create(@Body() dto: CreateExerciseDto): Promise<ExerciseDocument> {
		const { nameExists, codeExists } =
			await this.adminExerciseService.findNameOrCodeConflicts(dto);

		if (nameExists) {
			throw new BadRequestException(EXERCISE_NAME);
		}

		if (codeExists) {
			throw new BadRequestException(EXERCISE_NAME);
		}

		return await this.adminExerciseService.createExercise(dto);
	}
}
