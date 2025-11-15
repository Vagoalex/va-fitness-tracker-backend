import {
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  BadRequestException,
  Post,
} from '@nestjs/common';
import { AdminController } from '../common/decorators/admin-controller.decorator';
import { AdminCategoryService } from './admin-category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryDocument } from '../../shared/category/models/category.model';
import {
  ALREADY_EXISTED_CATEGORY_WITH_CODE_ERROR,
  ALREADY_EXISTED_CATEGORY_WITH_NAME_ERROR,
} from './constants/category.constants';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CategoryController } from '../../shared/category/category.controller';
import { RequireRoles } from '../../../core/decorators/roles.decorator';
import { RoleTypes } from '../../../core/enums/RoleTypes';
import { UseValidationPipe } from '../../../core/decorators/use-validation-pipe.decorator';

@AdminController('categories')
@RequireRoles(RoleTypes.Admin)
@UseGuards(JwtAuthGuard)
export class AdminCategoryController extends CategoryController {
  constructor(private readonly adminCategoryService: AdminCategoryService) {
    super(adminCategoryService);
  }

  /**
   * Создание новой категории
   */
  @UseValidationPipe()
  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDocument> {
    const { nameExists, codeExists } = await this.adminCategoryService.findNameOrCodeConflicts(dto);

    if (nameExists) {
      throw new BadRequestException(ALREADY_EXISTED_CATEGORY_WITH_NAME_ERROR);
    }
    if (codeExists) {
      throw new BadRequestException(ALREADY_EXISTED_CATEGORY_WITH_CODE_ERROR);
    }

    return await this.adminCategoryService.createCategory(dto);
  }
}
