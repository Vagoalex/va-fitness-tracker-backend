import { AuthDto } from '../../../../src/modules/public/auth/dto/auth.dto';
import { Types } from 'mongoose';

export const testNonExistingUserId = new Types.ObjectId().toHexString();

export const testExistedUserAuthDto: AuthDto = {
	login: 'test@test.com',
	password: 'qwerty123',
};

export const testAuthDto: AuthDto = {
	login: 'test1@test.com',
	password: 'qwerty1234',
};
