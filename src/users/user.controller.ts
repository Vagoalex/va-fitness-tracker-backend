import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { urlTemplateParts } from '@/constants/url-template-parts.global-constants';
import { IdValidationPipe } from '@/pipes/id-validation.pipe';
import { UserService } from '@/users/user.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UserDocument } from '@/users/models/user.model';
import { USER_BY_ID_NOT_FOUND, USER_BY_LOGIN_NOT_FOUND } from '@/users/constants/users.constants';
import { FindUserDto } from '@/users/dto/find-user.dto';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UsePipes(new ValidationPipe())
	@Post('create')
	async createUser(@Body() dto: CreateUserDto): Promise<UserDocument> {
		return await this.userService.createUser(dto);
	}

	@Get(':id')
	async getUserById(@Param('id', IdValidationPipe) id: string): Promise<UserDocument> {
		const user = this.userService.findUserById(id);
		if (!user) {
			throw new NotFoundException(USER_BY_ID_NOT_FOUND.replace(urlTemplateParts.id, id));
		}

		return user;
	}

	@Get('search/:login')
	async getUserByLogin(@Param('login') login: string): Promise<UserDocument> {
		const user = this.userService.findUserByLogin(login);
		if (!user) {
			throw new NotFoundException(
				USER_BY_LOGIN_NOT_FOUND.replace(urlTemplateParts.id, login),
			);
		}

		return user;
	}

	@Delete(':id')
	async deleteUser(@Param('id', IdValidationPipe) id: string) {
		const deletedDocument = await this.userService.deleteUserItem(id);
		if (!deletedDocument) {
			throw new HttpException(
				USER_BY_ID_NOT_FOUND.replace(urlTemplateParts.id, id),
				HttpStatus.NOT_FOUND,
			);
		}
	}

	@UsePipes(new ValidationPipe())
	@Patch(':id')
	async updateUserById(@Param('id', IdValidationPipe) id: string, @Body() dto: CreateUserDto) {
		const updatedDocument = await this.userService.updateUserItem(id, dto);
		if (!updatedDocument) {
			throw new HttpException(
				USER_BY_ID_NOT_FOUND.replace(urlTemplateParts.id, id),
				HttpStatus.NOT_FOUND,
			);
		}
		return updatedDocument;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findUsers(@Body() dto: FindUserDto): Promise<UserDocument[]> {
		return await this.userService.findUsers(dto);
	}
}
