import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument, UserModel } from './models/user.model';
import { UserGenderTypes } from './enums/UserGenderTypes';
import { UserStatusTypes } from './enums/UserStatusTypes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from '../../public/common/dto/login.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './constants/user.constants';
import { RoleTypes } from '../../../enums/RoleTypes';
import { ADMIN_ROLES } from '../../../constants/auth.constants';

@Injectable()
export class UserService {
	public pureUser: UserModel = {
		email: '',
		passwordHash: '',
		firstName: '',
		lastName: '',
		gender: UserGenderTypes.UNKNOWN,
		status: UserStatusTypes.ACTIVE,
		phone: '',
		roles: [RoleTypes.User],
	};

	constructor(@InjectModel(UserModel.name) public userModel: Model<UserDocument>) {}

	async createUser(dto: LoginDto): Promise<UserDocument> {
		const salt = await genSalt(10);

		const newUser = new this.userModel({
			...this.pureUser,
			email: dto.login,
			passwordHash: await hash(dto.password, salt),
		});

		return newUser.save();
	}

	async findUserByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email });
	}

	async loginUser(dto: LoginDto): Promise<UserDocument> {
		const foundUser: UserDocument | null = await this.userModel.findOne({ email: dto.login });
		if (!foundUser) {
			throw new BadRequestException(USER_NOT_FOUND_ERROR);
		}

		const isCorrectPassword = await compare(dto.password, foundUser.passwordHash);
		if (!isCorrectPassword) {
			throw new BadRequestException(WRONG_PASSWORD_ERROR);
		}

		return foundUser;
	}

	async deleteUserItem(id: string): Promise<UserDocument | null> {
		return this.userModel.findByIdAndDelete(id).exec();
	}
}
