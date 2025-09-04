import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidObjectId } from '../../../../core/validators/is-valid-objectid.validator';

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
	@IsString()
	@IsNotEmpty()
	code: string;

	/**
	 * Название типа упражнения
	 * @example Подтягивания, Отжимания, Приседания
	 */
	@ApiProperty({ example: 'Подтягивания' })
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * Дополнительное описание типа упражнения
	 */
	@IsOptional()
	@IsString()
	description?: string;

	/**
	 * Иконка типа упражнения
	 * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
	 */
	@ApiProperty({ example: 'pull_up' })
	@IsOptional()
	@IsString()
	icon?: string;

	/**
	 * ObjectId категории (связь с категорией)
	 */
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	@IsMongoId()
	@IsValidObjectId() // Проверка валидности ID
	@IsNotEmpty()
	categoryId: string;
}
