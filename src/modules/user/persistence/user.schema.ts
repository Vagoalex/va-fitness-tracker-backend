import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

import { RoleType } from '@/core/enums/role-type.enum';
import { UserGender } from '@/core/enums/user-gender.enum';
import { UserStatus } from '@/core/enums/user-status.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  versionKey: false,
  timestamps: true, // createdAt / updatedAt
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
    unique: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: true,
    select: false, // по умолчанию не отдаём в запросах
  })
  passwordHash!: string;

  @Prop({ type: String, trim: true })
  firstName?: string;

  @Prop({ type: String, trim: true })
  lastName?: string;

  @Prop({ type: String, enum: Object.values(UserGender), default: UserGender.UNKNOWN })
  gender!: UserGender;

  @Prop({ type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE, index: true })
  status!: UserStatus;

  @Prop({
    type: String,
    trim: true,
    // sparse + index: чтобы уникальность работала только для тех, у кого phone задан
    index: true,
    sparse: true,
  })
  phone?: string;

  @Prop({
    type: [String],
    enum: Object.values(RoleType),
    default: [RoleType.USER],
  })
  roles!: RoleType[];

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  /**
   * Техническое поле: мягкое удаление (опционально).
   * Можно включить позже, если нужно.
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * createdAt/updatedAt добавятся автоматически через timestamps: true
   * но TS поля можно описать, если используете строгую типизацию DTO->Entity маппинга.
   */
  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Индексы лучше задавать явно, чтобы они были стабильны
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ phone: 1 }, { sparse: true });

// Небольшая защита от утечек: запрещаем случайно возвращать passwordHash даже если select включили
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});
