import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CurrentUser } from '@/common/security/decorators/current-user.decorator';
import { Public } from '@/common/security/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/security/guards/jwt-auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    return await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async logoutFromAllDevices(@CurrentUser('sub') currentUserId: string): Promise<void> {
    return await this.authService.logoutFromAllDevices(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-password')
  async changePassword(
    @CurrentUser('sub') currentUserId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return await this.authService.changePassword(currentUserId, changePasswordDto);
  }
}
