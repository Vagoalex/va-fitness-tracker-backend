import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateCurrentUserDto } from '@/modules/user/dto/update-current-user.dto';
import { User, UserDocument } from '@/modules/user/persistence/user.schema';

type CreateUserPayload = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Возвращает пользователя по id.
   */
  async findById(userId: string): Promise<UserDocument> {
    const userDocument = await this.userModel.findById(userId).exec();

    if (!userDocument) {
      throw new NotFoundException('common.errors.not_found');
    }

    return userDocument;
  }

  /**
   * Возвращает пользователя по email.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: this.normalizeEmail(email) }).exec();
  }

  /**
   * Возвращает пользователя по email с passwordHash.
   */
  async findByEmailWithPasswordHash(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select('+passwordHash')
      .exec();
  }

  /**
   * Создаёт пользователя с уже подготовленным passwordHash.
   */
  async createUser(createUserPayload: CreateUserPayload): Promise<UserDocument> {
    // Нормализуем email
    const normalizedEmail = this.normalizeEmail(createUserPayload.email);

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('auth.errors.user_exists');
    }

    try {
      return await this.userModel.create({
        ...createUserPayload,
        email: normalizedEmail,
      });
    } catch (error: unknown) {
      // Проверяем, является ли ошибка ошибкой дубликата ключа в MongoDB
      if (this.isMongoDuplicateKeyError(error)) {
        throw new BadRequestException('auth.errors.user_exists');
      }

      throw error;
    }
  }

  /**
   * Обновляет профиль текущего пользователя.
   */
  async updateMe(
    userId: string,
    updateCurrentUserDto: UpdateCurrentUserDto,
  ): Promise<UserDocument> {
    const updatedUserDocument = await this.userModel
      .findByIdAndUpdate(userId, updateCurrentUserDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUserDocument) {
      throw new NotFoundException('common.errors.not_found');
    }

    return updatedUserDocument;
  }

  /**
   * Обновляет дату последнего входа.
   */
  async updateLastLoginAt(userId: string, loginDate: Date): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $set: { lastLoginAt: loginDate } }).exec();
  }

  /**
   * Обновляет пароль и дату смены пароля.
   */
  async updatePassword(userId: string, nextPasswordHash: string): Promise<void> {
    const passwordChangedAt = new Date();

    const updateResult = await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: {
            passwordHash: nextPasswordHash,
            passwordChangedAt,
          },
        },
      )
      .exec();

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException('common.errors.not_found');
    }
  }

  /**
   * Нормализует email для поиска и сохранения.
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isMongoDuplicateKeyError(error: unknown): error is { code: number } {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
  }
}
