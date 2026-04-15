import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { CurrentUser } from '@/common/security/decorators/current-user.decorator';
import { Public } from '@/common/security/decorators/public.decorator';
import { AuthService } from '@/modules/auth/auth.service';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

/**
 * Контроллер для работы с аутентификацией
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация пользователя
   * @param registerDto
   * @param request
   * @param userAgent
   */
  @Public()
  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
    @Req() request: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.register(registerDto, {
      ip: request.ip,
      userAgent,
    });
  }

  /**
   * Вход в систему
   * @param loginDto
   * @param request
   * @param userAgent
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.login(loginDto, {
      ip: request.ip,
      userAgent,
    });
  }

  /**
   * Обновление токенов
   * @param refreshTokenDto
   * @param request
   * @param userAgent
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.refresh(refreshTokenDto.refreshToken, {
      ip: request.ip,
      userAgent,
    });
  }

  /**
   * Выход из системы
   * @param refreshTokenDto
   */
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  /**
   * Выход из системы на всех устройствах
   * @param currentUserId
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async logoutFromAllDevices(@CurrentUser('sub') currentUserId: string): Promise<void> {
    await this.authService.logoutFromAllDevices(currentUserId);
  }

  /**
   * Смена пароля
   * @param currentUserId
   * @param changePasswordDto
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-password')
  async changePassword(
    @CurrentUser('sub') currentUserId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(currentUserId, changePasswordDto);
  }
}
