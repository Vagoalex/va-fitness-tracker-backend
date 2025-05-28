import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument, UserModel } from './models/user.model';
import { UserGenderTypes } from './enums/UserGenderTypes';
import { UserStatusTypes } from './enums/UserStatusTypes';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto } from '../../public/common/dto/login.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './constants/user.constants';

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

// import { BadRequestException, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { UserDocument, UserModel } from './models/user.model';
// import { Model } from 'mongoose';
// import { UserGenderTypes } from './enums/UserGenderTypes';
// import { UserStatusTypes } from './enums/UserStatusTypes';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { compare, genSalt, hash } from 'bcryptjs';
// import { USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR } from './constants/user.constants';
// import { LoginDto } from '../../public/common/dto/login.dto';
// import { SafetyUserDocument } from './models/safety-user.model';
//
// @Injectable()
// export class UserService {
// 	private pureUser: UserModel = {
// 		email: '',
// 		passwordHash: '',
// 		firstName: '',
// 		lastName: '',
// 		gender: UserGenderTypes.UNKNOWN,
// 		status: UserStatusTypes.ACTIVE,
// 		phone: '',
// 	};
//
// 	constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>) {}
//
// 	async findUsers(search?: string | null): Promise<SafetyUserDocument[]> {
// 		const filter: { email?: RegExp } = {};
//
// 		if (search) {
// 			filter.email = new RegExp(search, 'i'); // Case-insensitive email search
// 		}
//
// 		return this.userModel.find(filter, { passwordHash: 0 }).exec();
// 	}
//
// 	async findUserById(userId: string): Promise<UserDocument | null> {
// 		return this.userModel.findById(userId).exec();
// 	}
//
// 	// TODO: будет обновление не всего userItem, вынести на будущее в отдельный сервис changeUserService, и отдельный changeUserController, так как изменений будет куча + будет куча данных в модели
// 	async updateUserItem(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
// 		const existedDocument = await this.findUserById(id);
// 		if (!existedDocument) return null;
//
// 		const formattedDto = {
// 			firstName: dto.firstName ?? existedDocument.firstName,
// 			lastName: dto.lastName || existedDocument.lastName,
// 			gender: dto.gender || existedDocument.gender,
// 			status: dto.status || existedDocument.status,
// 			phone: dto.phone || existedDocument.phone,
// 		};
//
// 		return this.userModel.findByIdAndUpdate(id, { $set: formattedDto }, { new: true }).exec();
// 	}
// }
