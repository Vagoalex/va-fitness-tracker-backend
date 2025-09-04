import { Injectable } from '@nestjs/common';
import { ExerciseService } from '../../shared/exercise/exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseDocument } from '../../shared/exercise/models/exercise.model';

@Injectable()
export class AdminExerciseService extends ExerciseService {
	async createExercise(dto: CreateExerciseDto): Promise<ExerciseDocument> {
		const newDocument = new this.exerciseModel(dto);
		return newDocument.save();
	}
}
