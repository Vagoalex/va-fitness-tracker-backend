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
import { IdValidationPipe } from '../../../core/pipes/id-validation.pipe';
import { templateParts } from '../../../core/constants/template-parts.constants';
import { UpdateUserDto } from '../../shared/user/dto/update-user.dto';
import { SEARCHING_USER_NOT_FOUND_ERROR } from '../../shared/user/constants/user.constants';
import { SafetyUserDocument } from '../../shared/user/models/safety-user.model';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { RequireRoles } from '../../../core/decorators/roles.decorator';
import { RoleTypes } from '../../../core/enums/RoleTypes';

@AdminController('users')
@RequireRoles(RoleTypes.ADMIN)
@UseGuards(JwtAuthGuard)
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  /**
   * Получение всех пользователей
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findUsers(@Query() query?: FindUsersQueryDto): Promise<SafetyUserDocument[]> {
    return this.adminUserService.findUsers(query);
  }

  /**
   * Получение пользователя по id
   */
  @Get(':id')
  async getById(@Param('id', IdValidationPipe) id: string): Promise<UserDocument> {
    const document = await this.adminUserService.findUserById(id);
    if (!document) {
      throw new NotFoundException(SEARCHING_USER_NOT_FOUND_ERROR.replace(templateParts.id, id));
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
        SEARCHING_USER_NOT_FOUND_ERROR.replace(templateParts.id, id),
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedDocument;
  }
}
