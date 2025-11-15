import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { checkObjectId } from '../utils/checkObjectId';

@Injectable()
export class IdValidationPipe implements PipeTransform {
	transform(value: string, metadata: ArgumentMetadata) {
		if (metadata.type !== 'param') return value;

		checkObjectId(value);

		return value;
	}
}
