import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { NOT_VALID_FORMAT_ID_VALIDATION_ERROR } from '../constants/common.constants';

export const checkObjectId = (id: string) => {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestException(NOT_VALID_FORMAT_ID_VALIDATION_ERROR);
	}
};
