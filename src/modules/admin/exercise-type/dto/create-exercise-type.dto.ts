import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EXERCISE_TYPE_VALIDATION_ERRORS } from '../../../shared/exercise-type/constants/exercise-type-errors.constants';
import {
	IsCodePattern,
	IsString,
	IsValidObjectId,
} from '../../../../core/decorators/validation.decorator';

/**
 * Модель DTO типа упражнения (Входит в category)
 * Например ("Подтягивания", "Отжимания", "Приседания" и т.д)
 */
export class CreateExerciseTypeDto {
	/**
	 * Техническое название типа упражнения
	 * @example pull_up, push_up, squat
	 */
	@ApiProperty({ example: 'pull_up' })
	@IsCodePattern()
	@IsNotEmpty({ message: EXERCISE_TYPE_VALIDATION_ERRORS.CODE_REQUIRED })
	code: string;

	/**
	 * Название типа упражнения
	 * @example Подтягивания, Отжимания, Приседания
	 */
	@ApiProperty({ example: 'Подтягивания' })
	@IsString()
	@IsNotEmpty({ message: EXERCISE_TYPE_VALIDATION_ERRORS.NAME_REQUIRED })
	name: string;

	/**
	 * Дополнительное описание типа упражнения
	 */
	@IsString()
	@IsOptional()
	description?: string;

	/**
	 * Иконка типа упражнения
	 * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
	 */
	@ApiProperty({ example: 'pull_up' })
	@IsString()
	@IsCodePattern()
	@IsOptional()
	icon?: string;

	/**
	 * ObjectId категории (связь с категорией)
	 */
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	@IsValidObjectId() // Проверка валидности ID
	@IsNotEmpty({ message: EXERCISE_TYPE_VALIDATION_ERRORS.CATEGORY_ID_REQUIRED })
	categoryId: string;
}
