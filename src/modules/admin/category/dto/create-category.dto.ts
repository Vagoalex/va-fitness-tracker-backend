import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
	@IsString()
	code: string;

	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	icon?: string;
}
