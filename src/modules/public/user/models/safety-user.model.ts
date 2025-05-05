import { UserModel } from './user.model';
import { HydratedDocument } from 'mongoose';

/** Безопасный тип UserModel без passwordHash для получения данных для пользователя */
export type SafetyUserModel = Omit<UserModel, 'passwordHash'>;
/** Безопасный тип UserDocument без passwordHash для получения данных для пользователя */
export type SafetyUserDocument = HydratedDocument<SafetyUserModel>;
