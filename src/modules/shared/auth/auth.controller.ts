import {
	BadRequestException,
	Body,
	Headers,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
	Controller,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ALREADY_REGISTERED_ERROR } from './constants/auth.constants';
import { LoginDto } from '../../public/common/dto/login.dto';
import { AuthUserModel } from './models/auth-user.model';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@UsePipes(new ValidationPipe())
	@Post('register')
	async register(@Body() dto: LoginDto) {
		const existedUser = await this.userService.findUserByEmail(dto.login);
		if (existedUser) {
			throw new BadRequestException(ALREADY_REGISTERED_ERROR);
		}

		return await this.userService.createUser(dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Body() dto: LoginDto): Promise<AuthUserModel> {
		const user = await this.userService.loginUser(dto);
		return this.authService.loginToAccount(user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('check-auth')
	async checkAuth(@Headers('authorization') authorization: string): Promise<AuthUserModel> {
		const token = authorization?.split(' ')[1];
		return await this.authService.auth(token);
	}
}
