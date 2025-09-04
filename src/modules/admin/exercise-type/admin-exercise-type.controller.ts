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
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../../core/decorators/roles.decorator';
import { RoleTypes } from '../../../core/enums/RoleTypes';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { EXERCISE_TYPE_NAME } from './constants/exercise-type.constants';
import {
	getAlreadyExistedBaseDataWithCodeError,
	getAlreadyExistedBaseDataWithNameError,
} from '../../shared/common/constants/api-errors.constants';
import { ExerciseTypeController } from '../../shared/exercise-type/exercise-type.controller';
import { ExerciseTypeDocument } from '../../shared/exercise-type/models/exercise-type.model';

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
	@UsePipes(new ValidationPipe())
	@Post()
	async create(@Body() dto: CreateExerciseTypeDto): Promise<ExerciseTypeDocument> {
		const { nameExists, codeExists } =
			await this.adminExerciseTypeService.findNameOrCodeConflicts(dto);

		if (nameExists) {
			throw new BadRequestException(
				getAlreadyExistedBaseDataWithNameError(EXERCISE_TYPE_NAME),
			);
		}

		if (codeExists) {
			throw new BadRequestException(
				getAlreadyExistedBaseDataWithCodeError(EXERCISE_TYPE_NAME),
			);
		}

		return await this.adminExerciseTypeService.createExerciseType(dto);
	}
}
