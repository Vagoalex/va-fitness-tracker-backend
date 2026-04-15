import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;

@Schema({
  collection: 'refresh_sessions',
  versionKey: false,
  timestamps: true,
})
export class RefreshSession {
  /** Идентификатор пользователя, которому принадлежит сессия */
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  userId!: Types.ObjectId;

  /** Уникальный идентификатор refresh-сессии */
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

  /** User-Agent клиента */
  @Prop({ type: String })
  userAgent?: string;

  /** IP-адрес клиента */
  @Prop({ type: String })
  ip?: string;

  /** Дата истечения срока действия refresh-сессии */
  @Prop({
    type: Date,
    required: true,
  })
  expiresAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RefreshSessionSchema = SchemaFactory.createForClass(RefreshSession);

/** TTL-индекс для автоматической очистки истёкших refresh-сессий */
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/** Индекс для выборок сессий пользователя */
RefreshSessionSchema.index({ userId: 1 });
