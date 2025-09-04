import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Модель DTO конкретного упражнения - конечное состояние (Входит в exercise-type)
 * Например ("Подтягивания широким хватом", "Алмазные отжимания" и т.д)
 */
export class CreateExerciseDto {
	/**
	 * Техническое название упражнения
	 * @example wide_grip_pull_ups, diamond_push_ups
	 */
	@ApiProperty({ example: 'wide_grip_pull_ups' })
	@IsString()
	@IsNotEmpty()
	code: string;

	/**
	 * Название упражнения
	 * @example Подтягивания широким хватом, Алмазные отжимания
	 */
	@ApiProperty({ example: 'Подтягивания широким хватом' })
	@IsString()
	@IsNotEmpty()
	name: string;

	/**
	 * Дополнительное описание упражнения
	 */
	@IsOptional()
	@IsString()
	description?: string;

	/**
	 * Иконка упражнения
	 * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
	 */
	@ApiProperty({ example: 'wide_grip_pull_ups' })
	@IsOptional()
	@IsString()
	icon?: string;

	/**
	 * ObjectId категории (связь с типом упражнения)
	 */
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	@IsMongoId()
	@IsNotEmpty()
	exerciseTypeId: string;
}
