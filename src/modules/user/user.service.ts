import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const i18n = I18nContext.current();
		const { email, password } = createUserDto;

		const existingUser = await this.userModel.findOne({ email });
		if (existingUser) {
			throw new BadRequestException(i18n.t('errors.email_already_exists'));
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const createdUser = new this.userModel({
			...createUserDto,
			password: hashedPassword,
		});

		return createdUser.save();
	}

	async findByEmail(email: string): Promise<User | undefined> {
		return this.userModel.findOne({ email });
	}
}
