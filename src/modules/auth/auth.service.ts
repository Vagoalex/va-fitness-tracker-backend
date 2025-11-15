import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly i18nService: I18nService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Проверяем существование пользователя
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      const message = await this.i18nService.translate('auth.errors.user_exists');
      throw new ConflictException(message);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Создаем пользователя
    const user = new this.userModel({
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    await user.save();

    const message = await this.i18nService.translate('auth.success.registered');

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message,
    };
  }

  async login(loginDto: LoginDto) {
    // Находим пользователя
    const user = await this.userModel.findOne({
      email: loginDto.email.toLowerCase(),
    });

    if (!user) {
      const message = await this.i18nService.translate('auth.errors.invalid_credentials');
      throw new ConflictException(message);
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      const message = await this.i18nService.translate('auth.errors.invalid_credentials');
      throw new ConflictException(message);
    }

    const message = await this.i18nService.translate('auth.success.logged_in');

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message,
    };
  }
}
