import {
	BadRequestException,
	Body,
	Delete,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
	Req,
	UseGuards,
	Controller,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDocument } from './models/user.model';
import {
	ALREADY_EXISTED_USER_ERROR,
	SEARCHING_USER_NOT_FOUND_ERROR,
} from './constants/user.constants';
import { IdValidationPipe } from '../../../pipes/id-validation.pipe';
import { LoginDto } from '../../public/common/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
	constructor(protected readonly userService: UserService) {}

	/**
	 * Создание пользователя
	 */
	@UsePipes(new ValidationPipe())
	@Post('create')
	async create(@Body() dto: LoginDto): Promise<UserDocument> {
		const existedDocument = await this.userService.findUserByEmail(dto.login);
		if (existedDocument) {
			throw new BadRequestException(ALREADY_EXISTED_USER_ERROR);
		}

		return await this.userService.createUser(dto);
	}

	/**
	 * Удаление пользователя по id (Нельзя удалить с role ADMIN!)
	 */
	// TODO: запилить отмену удаления и выдачу ошибки, если роль юзера ADMIN
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteUser(@Param('id', IdValidationPipe) id: string) {
		const deletedDocument = await this.userService.deleteUserItem(id);
		if (!deletedDocument) {
			throw new HttpException(SEARCHING_USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
		}
	}

	/**
	 * Удаление текущего пользователя (Нельзя удалить с role ADMIN!)
	 */
	// TODO: запилить отмену удаления и выдачу ошибки, если роль юзера ADMIN
	@Delete('me')
	@UseGuards(JwtAuthGuard)
	async deleteMyself(@Req() request): Promise<void> {
		console.warn(request);
		const userId: string = request.user._id; // ID из JWT
		await this.userService.deleteUserItem(userId);
	}
}
