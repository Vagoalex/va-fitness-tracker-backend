import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { CurrentUser } from '@/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/security/guards/jwt-auth.guard';
import { UpdateCurrentUserDto } from '@/modules/user/dto/update-current-user.dto';
import { UserService } from '@/modules/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Получение текущего пользователя
   * @param currentUserId - ID текущего пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser('sub') currentUserId: string) {
    return this.userService.findById(currentUserId);
  }

  /**
   * Обновление текущего пользователя
   * @param currentUserId - ID текущего пользователя
   * @param updateCurrentUserDto - DTO для обновления текущего пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @CurrentUser('sub') currentUserId: string,
    @Body() updateCurrentUserDto: UpdateCurrentUserDto,
  ) {
    return this.userService.updateMe(currentUserId, updateCurrentUserDto);
  }
}
