import {
	BadRequestException,
	Body,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Query,
	Patch,
	Post,
	UsePipes,
	ValidationPipe,
	HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDocument } from './models/user.model';
import {
	ALREADY_EXISTED_USER_ERROR,
	SEARCHING_USER_NOT_FOUND_ERROR,
} from './constants/user.constants';
import { IdValidationPipe } from '../../../pipes/id-validation.pipe';
import { urlTemplateParts } from '../../../constants/url-template-parts.global-constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from '../common/dto/login.dto';
import { PublicController } from '../common/decorators/public-controller.decorator';
import { SafetyUserDocument } from './models/safety-user.model';

@PublicController('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UsePipes(new ValidationPipe())
	@Post('create')
	async create(@Body() dto: LoginDto): Promise<UserDocument> {
		const existedDocument = await this.userService.findUserByEmail(dto.login);
		if (existedDocument) {
			throw new BadRequestException(ALREADY_EXISTED_USER_ERROR);
		}

		return await this.userService.createUser(dto);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Get()
	async findUsers(@Query('search') search?: string | null): Promise<SafetyUserDocument[]> {
		return await this.userService.findUsers(search);
	}

	@Get(':id')
	async getById(@Param('id', IdValidationPipe) id: string): Promise<UserDocument> {
		const document = await this.userService.findUserById(id);
		if (!document) {
			throw new NotFoundException(
				SEARCHING_USER_NOT_FOUND_ERROR.replace(urlTemplateParts.id, id),
			);
		}

		return document;
	}

	@UsePipes(new ValidationPipe())
	@Patch(':id')
	async updateById(@Param('id', IdValidationPipe) id: string, @Body() dto: UpdateUserDto) {
		const updatedDocument = await this.userService.updateUserItem(id, dto);
		if (!updatedDocument) {
			throw new HttpException(
				SEARCHING_USER_NOT_FOUND_ERROR.replace(urlTemplateParts.id, id),
				HttpStatus.NOT_FOUND,
			);
		}
		return updatedDocument;
	}

	// @UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteUser(@Param('id', IdValidationPipe) id: string) {
		const deletedDocument = await this.userService.deleteUserItem(id);
		if (!deletedDocument) {
			throw new HttpException(SEARCHING_USER_NOT_FOUND_ERROR, HttpStatus.NOT_FOUND);
		}
	}
}
