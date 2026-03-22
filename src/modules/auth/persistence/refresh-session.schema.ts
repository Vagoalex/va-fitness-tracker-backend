import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;

@Schema({
  collection: 'refresh_sessions',
  versionKey: false,
  timestamps: true,
})
export class RefreshSession {
  /** ID пользователя */
  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  /** ID сессии */
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  sessionId!: string;

  /** Хэш refresh токена */
  @Prop({
    type: String,
    required: true,
    select: false,
  })
  refreshTokenHash!: string;

  /** User-Agent */
  @Prop({ type: String })
  userAgent?: string;

  /** IP адрес */
  @Prop({ type: String })
  ip?: string;

  /** Дата истечения срока действия */
  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  expiresAt!: Date;

  /** Дата истечения срока действия */
  @Prop({ type: Date })
  revokedAt?: Date;

  /** Дата создания */
  createdAt!: Date;
  updatedAt!: Date;
}

export const RefreshSessionSchema = SchemaFactory.createForClass(RefreshSession);

/** Индексы для поля expiresAt */
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
/** Индексы для поля userId */
RefreshSessionSchema.index({ userId: 1 });
/** Индексы для поля userId и sessionId */
RefreshSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
