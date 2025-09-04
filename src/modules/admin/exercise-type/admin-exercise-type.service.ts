import { Injectable } from '@nestjs/common';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { ExerciseTypeService } from '../../shared/exercise-type/exercise-type.service';
import { ExerciseTypeDocument } from '../../shared/exercise-type/models/exercise-type.model';

@Injectable()
export class AdminExerciseTypeService extends ExerciseTypeService {
	async createExerciseType(dto: CreateExerciseTypeDto): Promise<ExerciseTypeDocument> {
		const newDocument = new this.exerciseTypeModel(dto);
		return newDocument.save();
	}
}
