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
import { CategoryDocument } from '../../shared/category/models/category.model';
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

@AdminController('categories')
@RequireRoles(RoleTypes.Admin)
@UseGuards(JwtAuthGuard)
export class AdminExerciseTypeController extends ExerciseTypeController {
	constructor(private readonly adminCategoryService: AdminExerciseTypeService) {
		super(adminCategoryService);
	}

	/**
	 * Создание новой категории
	 */
	@UsePipes(new ValidationPipe())
	@Post()
	async create(@Body() dto: CreateExerciseTypeDto): Promise<CategoryDocument> {
		const { nameExists, codeExists } =
			await this.adminCategoryService.findNameOrCodeConflicts(dto);

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

		return await this.adminCategoryService.createExerciseType(dto);
	}
}
