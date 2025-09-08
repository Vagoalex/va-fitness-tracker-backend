import { IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

import { IsIn } from 'class-validator';
import { ADMIN_ROLES } from '../../../../core/constants/auth.constants';
import { IsString } from '../../../../core/decorators/validation.decorator';

export class FindUsersQueryDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	status?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@Transform(({ value }): string | string[] => {
		if (value === undefined || value === null) return undefined;
		return Array.isArray(value) ? value : [value];
	})
	@IsArray()
	@IsString({ each: true })
	@IsIn(ADMIN_ROLES, { each: true })
	roles?: string[];
}
