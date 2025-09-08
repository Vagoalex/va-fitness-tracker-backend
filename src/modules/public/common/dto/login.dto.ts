import { IsString } from '../../../../core/decorators/validation.decorator';

export class LoginDto {
	@IsString()
	login: string;

	@IsString()
	password: string;
}
