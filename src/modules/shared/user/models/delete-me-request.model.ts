import { SafetyUserModel } from './safety-user.model';
import { ObjectId } from 'mongoose';

export interface DeleteMeRequestModel extends Request {
	user?: SafetyUserModel & { _id: ObjectId }; // Данные из JWT
}
