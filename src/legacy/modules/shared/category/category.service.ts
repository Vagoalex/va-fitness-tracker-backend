import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument, CategoryModel } from './models/category.model';
import { BaseService } from '../../../core/services/base.service';

@Injectable()
export class CategoryService extends BaseService<CategoryDocument> {
  constructor(@InjectModel(CategoryModel.name) public categoryModel: Model<CategoryDocument>) {
    super(categoryModel);
  }
}
