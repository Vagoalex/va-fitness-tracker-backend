import {
	BadRequestException,
	Body,
	Delete,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
	Req,
	UseGuards,
	Controller,
	NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDocument } from './models/user.model';
import { ALREADY_EXISTED_USER_ERROR, USER_NOT_FOUND_ERROR } from './constants/user.constants';
import { IdValidationPipe } from '../../../pipes/id-validation.pipe';
import { LoginDto } from '../../public/common/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeleteMeRequestModel } from './models/delete-me-request.model';

@Controller('user')
export class UserController {
	constructor(protected readonly userService: UserService) {}

	/**
	 * Создание пользователя
	 */
	@UsePipes(new ValidationPipe())
	@UseGuards(JwtAuthGuard)
	@Post('create')
	async create(@Body() dto: LoginDto): Promise<UserDocument> {
		const existedDocument = await this.userService.findUserByEmail(dto.login);
		if (existedDocument) {
			throw new BadRequestException(ALREADY_EXISTED_USER_ERROR);
		}

		return await this.userService.createUser(dto);
	}

	/**
	 * Удаление текущего пользователя (Нельзя удалить с role ADMIN!)
	 */
	@UseGuards(JwtAuthGuard)
	@Delete('me')
	async deleteMyself(@Req() request: DeleteMeRequestModel): Promise<void> {
		if (!request.user) {
			throw new BadRequestException(USER_NOT_FOUND_ERROR);
		}

		const userId = request.user._id as unknown as string;
		await this.userService.checkDeletableUser(userId);

		const deletedDocument = await this.userService.deleteUserItem(userId);
		if (!deletedDocument) {
			throw new NotFoundException(USER_NOT_FOUND_ERROR);
		}
	}

	/**
	 * Удаление пользователя по id (Нельзя удалить с role ADMIN!)
	 */
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteUser(@Param('id', IdValidationPipe) id: string) {
		await this.userService.checkDeletableUser(id);

		const deletedDocument = await this.userService.deleteUserItem(id);
		if (!deletedDocument) {
			throw new NotFoundException(USER_NOT_FOUND_ERROR);
		}
	}
}
