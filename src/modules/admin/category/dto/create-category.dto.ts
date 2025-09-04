import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
	/**
	 * Техническое название категории
	 * @example back, chest, legs, arms, shoulders, biceps, triceps
	 */
	@ApiProperty({ example: 'back' })
	@IsString()
	@IsNotEmpty()
	code: string;

	/**
	 * Название категории на русском
	 * @example Спина, Грудь, Ноги, Предплечья, Плечи, Бицепс, Трицепс
	 */
	@ApiProperty({ example: 'Спина' })
	@IsString()
	@IsNotEmpty()
	@IsString()
	name: string;

	/**
	 * Дополнительное описание упражнения
	 */
	@ApiProperty({ example: 'Упражнения для спины' })
	@IsOptional()
	@IsString()
	description?: string;

	/**
	 * Иконка категории
	 * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
	 */
	@ApiProperty({ example: 'back' })
	@IsOptional()
	@IsString()
	icon?: string;
}
