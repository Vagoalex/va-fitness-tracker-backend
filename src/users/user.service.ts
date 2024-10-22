import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './models/user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { FindUserDto } from '@/users/dto/find-user.dto';
import { SortTypesEnum } from '@/enums/SortTypesEnum';

@Injectable()
export class UserService {
	constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>) {}

	async createUser({ login, password }: CreateUserDto) {
		const newUser = new this.userModel({ login, password });
		return newUser.save();
	}

	async findUserById(userId: string): Promise<UserDocument> {
		return this.userModel.findById(userId).exec();
	}

	async findUserByLogin(login: string) {
		return this.userModel.findOne({ login });
	}

	async deleteUserItem(id: string): Promise<UserDocument | null> {
		return this.userModel.findByIdAndDelete(id).exec();
	}

	async updateUserItem(id: string, dto: CreateUserDto): Promise<UserDocument | null> {
		return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
	}

	async findUsers(dto: FindUserDto): Promise<UserDocument[]> {
		const filterMatch: any = {};

		if (dto.search) {
			filterMatch.search = dto.search;
		}

		return (await this.userModel
			.aggregate([
				{
					$match: filterMatch,
				},
				{
					$sort: {
						createdAt: SortTypesEnum.ASC,
						// Также можно сортировать по _id (стабильная сортировка)
					},
				},
				{
					$limit: dto.limit,
				},
			])
			.exec()) as unknown as UserDocument[];
	}
}
