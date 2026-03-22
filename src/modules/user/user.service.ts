import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateCurrentUserDto } from '@/modules/user/dto/update-current-user.dto';
import { User, UserDocument } from '@/modules/user/persistence/user.schema';

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
      throw new NotFoundException('user.not_found');
    }

    return userDocument;
  }

  /**
   * Возвращает пользователя по email.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  /**
   * Возвращает пользователя по email с passwordHash.
   */
  async findByEmailWithPasswordHash(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  /**
   * Создаёт пользователя с уже подготовленным passwordHash.
   */
  async createUser(createUserPayload: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserDocument> {
    const existingUser = await this.findByEmail(createUserPayload.email);

    if (existingUser) {
      throw new BadRequestException('auth.email_already_exists');
    }

    return this.userModel.create({
      ...createUserPayload,
      email: createUserPayload.email.trim().toLowerCase(),
    });
  }

  /**
   * Обновляет профиль текущего пользователя.
   */
  async updateMe(
    userId: string,
    updateCurrentUserDto: UpdateCurrentUserDto,
  ): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(userId, updateCurrentUserDto, { new: true }).exec();
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
      throw new NotFoundException('user.not_found');
    }
  }
}
