import {
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	BadRequestException,
	Post,
} from '@nestjs/common';
import { AdminController } from '../common/decorators/admin-controller.decorator';
import { AdminExerciseTypeService } from './admin-exercise-type.service';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RequireRoles } from '../../../core/decorators/roles.decorator';
import { RoleTypes } from '../../../core/enums/RoleTypes';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { ExerciseTypeController } from '../../shared/exercise-type/exercise-type.controller';
import { ExerciseTypeDocument } from '../../shared/exercise-type/models/exercise-type.model';
import { EXERCISE_TYPE_ERRORS } from '../../shared/exercise-type/constants/exercise-type-errors.constants';
import { UseValidationPipe } from '../../../core/decorators/use-validation-pipe.decorator';

@AdminController('exercise-types')
@RequireRoles(RoleTypes.Admin)
@UseGuards(JwtAuthGuard)
export class AdminExerciseTypeController extends ExerciseTypeController {
	constructor(private readonly adminExerciseTypeService: AdminExerciseTypeService) {
		super(adminExerciseTypeService);
	}

	/**
	 * Создание нового упражнения
	 */
	@UseValidationPipe()
	@Post()
	async create(@Body() dto: CreateExerciseTypeDto): Promise<ExerciseTypeDocument> {
		const { nameExists, codeExists } =
			await this.adminExerciseTypeService.findNameOrCodeConflicts(dto);

		if (nameExists) {
			throw new BadRequestException(EXERCISE_TYPE_ERRORS.ALREADY_EXISTED_WITH_NAME);
		}
		if (codeExists) {
			throw new BadRequestException(EXERCISE_TYPE_ERRORS.ALREADY_EXISTED_WITH_CODE);
		}

		return await this.adminExerciseTypeService.createExerciseType(dto);
	}
}
