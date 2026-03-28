import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { RoleType, ROLE_TYPE_VALUES } from '@/core/enums/role-type.enum';
import { UserGender, USER_GENDER_VALUES } from '@/core/enums/user-gender.enum';
import { UserStatus, USER_STATUS_VALUES } from '@/core/enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: true,
})
export class User {
  /** Email пользователя */
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email!: string;

  /** Хэш пароля пользователя */
  @Prop({
    type: String,
    required: true,
    select: false,
  })
  passwordHash!: string;

  /** Имя пользователя */
  @Prop({ type: String, trim: true })
  firstName?: string;

  /** Фамилия пользователя */
  @Prop({ type: String, trim: true })
  lastName?: string;

  /** Пол пользователя */
  @Prop({
    type: String,
    enum: USER_GENDER_VALUES,
    default: UserGender.UNKNOWN,
  })
  gender!: UserGender;

  /** Статус пользователя */
  @Prop({
    type: String,
    enum: USER_STATUS_VALUES,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status!: UserStatus;

  /** Телефон пользователя */
  @Prop({
    type: String,
    trim: true,
    index: true,
    sparse: true,
  })
  phone?: string;

  /** Роли пользователя */
  @Prop({
    type: [String],
    enum: ROLE_TYPE_VALUES,
    default: [RoleType.USER],
  })
  roles!: RoleType[];

  /** Дата последнего входа пользователя */
  @Prop({ type: Date })
  lastLoginAt?: Date;

  /** Дата последней смены пароля */
  @Prop({ type: Date })
  passwordChangedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/** Трансформация для поля passwordHash */
UserSchema.set('toJSON', {
  transform: (_document, returnedObject: Record<string, unknown>) => {
    delete returnedObject.passwordHash;
    return returnedObject;
  },
});
