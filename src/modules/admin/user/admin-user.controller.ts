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
	UseGuards,
} from '@nestjs/common';
import { AdminController } from '../common/decorators/admin-controller.decorator';
import { UserDocument } from '../../shared/user/models/user.model';
import { AdminUserService } from './admin-user.service';
import { IdValidationPipe } from '../../../pipes/id-validation.pipe';
import { urlTemplateParts } from '../../../constants/url-template-parts.constants';
import { UpdateUserDto } from '../../shared/user/dto/update-user.dto';
import { SEARCHING_USER_NOT_FOUND_ERROR } from '../../shared/user/constants/user.constants';
import { SafetyUserDocument } from '../../shared/user/models/safety-user.model';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@AdminController('user')
export class AdminUserController {
	constructor(private readonly adminUserService: AdminUserService) {}

	/**
	 * Получение всех пользователей
	 */
	@UsePipes(new ValidationPipe({ transform: true }))
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get()
	async findUsers(@Query() query?: FindUsersQueryDto): Promise<SafetyUserDocument[]> {
		return this.adminUserService.findUsers(query);
	}

	/**
	 * Получение пользователя по id
	 */
	@UseGuards(JwtAuthGuard)
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
	@UseGuards(JwtAuthGuard)
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
