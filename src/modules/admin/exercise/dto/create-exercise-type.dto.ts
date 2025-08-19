import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseTypeDto {
	/**
	 * Техническое название упражнения
	 */
	@ApiProperty({ example: 'pull_up' })
	@IsString()
	@IsNotEmpty()
	code: string;

	/**
	 * Название упражнения
	 */
	@ApiProperty({ example: 'Подтягивание' })
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
	 * ObjectId категории (связь с категорией)
	 */
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	@IsMongoId()
	@IsNotEmpty()
	category: string;
}
