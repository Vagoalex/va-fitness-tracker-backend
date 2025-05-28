import { Injectable } from '@nestjs/common';
import { UserDocument, UserModel } from '../shared/user/models/user.model';
import { SafetyUserDocument } from '../shared/user/models/safety-user.model';
import { UpdateUserDto } from '../shared/user/dto/update-user.dto';
import { UserService } from '../shared/user/user.service';

@Injectable()
export class AdminUserService extends UserService {
	async findUsers(search?: string | null): Promise<SafetyUserDocument[]> {
		const filter: { email?: RegExp } = {};

		if (search) {
			filter.email = new RegExp(search, 'i'); // Case-insensitive email search
		}

		return this.userModel.find(filter, { passwordHash: 0 }).exec();
	}

	async findUserById(userId: string): Promise<UserDocument | null> {
		return this.userModel.findById(userId).exec();
	}

	// TODO: будет обновление не всего userItem, вынести на будущее в отдельный сервис changeUserService, и отдельный changeUserController, так как изменений будет куча + будет куча данных в модели
	async updateUserItem(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
		const existedDocument = await this.findUserById(id);
		if (!existedDocument) return null;

		const formattedDto = {
			firstName: dto.firstName ?? existedDocument.firstName,
			lastName: dto.lastName || existedDocument.lastName,
			gender: dto.gender || existedDocument.gender,
			status: dto.status || existedDocument.status,
			phone: dto.phone || existedDocument.phone,
		};

		return this.userModel.findByIdAndUpdate(id, { $set: formattedDto }, { new: true }).exec();
	}
}
