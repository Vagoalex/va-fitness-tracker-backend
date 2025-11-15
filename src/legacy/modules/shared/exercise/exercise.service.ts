import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../../../core/services/base.service';
import { ExerciseDocument, ExerciseModel } from './models/exercise.model';

@Injectable()
export class ExerciseService extends BaseService<ExerciseDocument> {
  constructor(@InjectModel(ExerciseModel.name) public exerciseModel: Model<ExerciseDocument>) {
    super(exerciseModel);
  }
}
