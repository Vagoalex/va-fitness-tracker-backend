import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExerciseTypeDocument, ExerciseTypeModel } from './models/exercise-type.model';
import { BaseService } from '../../../core/services/base.service';

@Injectable()
export class ExerciseTypeService extends BaseService<ExerciseTypeDocument> {
	constructor(
		@InjectModel(ExerciseTypeModel.name)
		public readonly exerciseTypeModel: Model<ExerciseTypeDocument>,
	) {
		super(exerciseTypeModel);
	}
}
