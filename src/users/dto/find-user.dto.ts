import { IsNumber, IsString } from 'class-validator';

export class FindUserDto {
	@IsString()
	search?: string;

	@IsNumber()
	limit: number;
}
