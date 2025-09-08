import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { CORE_ERRORS } from '../errors/errors.constants';

export const checkObjectId = (id: string) => {
	if (!Types.ObjectId.isValid(id)) {
		throw new BadRequestException(CORE_ERRORS.NOT_VALID_FORMAT_ID_VALIDATION_ERROR);
	}
};
