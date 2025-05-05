import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { NOT_VALID_FORMAT_ID_VALIDATION_ERROR } from '../constants/common.global-constants';

@Injectable()
export class IdValidationPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata) {
		if (metadata.type !== 'param') return value;

		if (!Types.ObjectId.isValid(value)) {
			throw new BadRequestException(NOT_VALID_FORMAT_ID_VALIDATION_ERROR);
		}

		return value;
	}
}
