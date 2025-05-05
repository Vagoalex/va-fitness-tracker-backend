import { CreateReviewDto } from '../../../../src/review/dto/create-review.dto';
import { Types } from 'mongoose';

export const testProductId = new Types.ObjectId().toHexString();
export const testNonExistingProductId = new Types.ObjectId().toHexString();

export const testCreateReviewDto: CreateReviewDto = {
	name: 'Тестовое название',
	title: 'Тестовый заголовок',
	description: 'Тестовое описание',
	rating: 4.5,
	productId: testProductId,
};
