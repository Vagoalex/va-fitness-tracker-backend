import { Injectable } from '@nestjs/common';

@Injectable()
export class PublicUserService {
	// TODO: реализовать обновление публичного пользователя. будет обновление не всего userItem, вынести на будущее в отдельный сервис changeUserService, и отдельный changeUserController, так как изменений будет куча + будет куча данных в модели
	// async updateUserItem(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
	// 	const existedDocument = await this.findUserById(id);
	// 	if (!existedDocument) return null;
	//
	// 	const formattedDto = {
	// 		firstName: dto.firstName ?? existedDocument.firstName,
	// 		lastName: dto.lastName || existedDocument.lastName,
	// 		gender: dto.gender || existedDocument.gender,
	// 		status: dto.status || existedDocument.status,
	// 		phone: dto.phone || existedDocument.phone,
	// 	};
	//
	// 	return this.userModel.findByIdAndUpdate(id, { $set: formattedDto }, { new: true }).exec();
	// }
}
