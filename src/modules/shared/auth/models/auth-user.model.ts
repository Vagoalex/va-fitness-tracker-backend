import { HydratedDocument } from 'mongoose';
import { SafetyUserModel } from '../../user/models/safety-user.model';

/** Модель данных аутентифицированного пользователя с access_token и SafetyUserModel */
export type AuthUserModel = SafetyUserModel & {
	access_token: string;
};
/** Документ модели данных аутентифицированного пользователя с access_token и SafetyUserModel */
export type AuthUserDocument = HydratedDocument<AuthUserModel>;
