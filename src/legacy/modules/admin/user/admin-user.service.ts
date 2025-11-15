import { Injectable } from '@nestjs/common';
import { UserDocument, UserModel } from '../../shared/user/models/user.model';
import { SafetyUserDocument } from '../../shared/user/models/safety-user.model';
import { UpdateUserDto } from '../../shared/user/dto/update-user.dto';
import { UserService } from '../../shared/user/user.service';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { UserGenderTypes } from '../../shared/user/enums/UserGenderTypes';
import { UserStatusTypes } from '../../shared/user/enums/UserStatusTypes';
import { isNil } from '../../../core/utils/isNil';
import { checkUserGenderHelper } from '../../shared/user/helpers/checkUserGender.helper';
import { checkUserStatusHelper } from '../../shared/user/helpers/checkUserStatus.helper';

@Injectable()
export class AdminUserService extends UserService {
  async findUsers(queryParameters?: FindUsersQueryDto): Promise<SafetyUserDocument[]> {
    const filter: {
      email?: RegExp;
      firstName?: RegExp;
      lastName?: RegExp;
      gender?: { $in: UserGenderTypes };
      status?: { $in: UserStatusTypes };
      phone?: RegExp;
      roles?: { $in: string[] };
    } = {};

    const search = queryParameters?.search;
    if (search) {
      filter.email = new RegExp(search, 'i');
    }

    const firstName = queryParameters?.firstName;
    if (firstName) {
      filter.firstName = new RegExp(firstName, 'i');
    }

    const lastName = queryParameters?.lastName;
    if (lastName) {
      filter.lastName = new RegExp(lastName, 'i');
    }

    const gender = queryParameters?.gender;
    if (checkUserGenderHelper(gender)) {
      filter.gender = { $in: Number(gender) };
    }

    const status = queryParameters?.status;
    if (checkUserStatusHelper(status)) {
      filter.status = { $in: Number(status) };
    }

    const phone = queryParameters?.phone;
    if (phone) {
      filter.phone = new RegExp(phone, 'i');
    }

    const roles = queryParameters?.roles;
    if (roles) {
      filter.roles = { $in: roles };
    }

    return this.userModel.find(filter, { passwordHash: 0 }).exec();
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
