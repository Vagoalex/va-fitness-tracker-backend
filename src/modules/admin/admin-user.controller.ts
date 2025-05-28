import {
	Body,
	Get,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Query,
	Patch,
	UsePipes,
	ValidationPipe,
	HttpCode,
} from '@nestjs/common';
import { AdminController } from './common/decorators/admin-controller.decorator';
import { UserDocument } from '../shared/user/models/user.model';
import { UserController } from '../shared/user/user.controller';
import { AdminUserService } from './admin-user.service';
import { IdValidationPipe } from '../../pipes/id-validation.pipe';
import { urlTemplateParts } from '../../constants/url-template-parts.constants';
import { UpdateUserDto } from '../shared/user/dto/update-user.dto';
import { SEARCHING_USER_NOT_FOUND_ERROR } from '../shared/user/constants/user.constants';
import { SafetyUserDocument } from '../shared/user/models/safety-user.model';

@AdminController('user')
export class AdminUserController extends UserController {
	constructor(private readonly adminUserService: AdminUserService) {
		super(adminUserService);
	}

	/**
	 * Получение всех пользователей
	 */
	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findUsers(@Query('search') search?: string | null): Promise<SafetyUserDocument[]> {
		return await this.adminUserService.findUsers(search);
	}

	/**
	 * Получение пользователя по id
	 */
	@Get(':id')
	async getById(@Param('id', IdValidationPipe) id: string): Promise<UserDocument> {
		const document = await this.adminUserService.findUserById(id);
		if (!document) {
			throw new NotFoundException(
				SEARCHING_USER_NOT_FOUND_ERROR.replace(urlTemplateParts.id, id),
			);
		}

		return document;
	}

	/**
	 * Обновление пользователя по id
	 */
	@UsePipes(new ValidationPipe())
	@Patch(':id')
	async updateById(@Param('id', IdValidationPipe) id: string, @Body() dto: UpdateUserDto) {
		const updatedDocument = await this.adminUserService.updateUserItem(id, dto);
		if (!updatedDocument) {
			throw new HttpException(
				SEARCHING_USER_NOT_FOUND_ERROR.replace(urlTemplateParts.id, id),
				HttpStatus.NOT_FOUND,
			);
		}
		return updatedDocument;
	}
}
