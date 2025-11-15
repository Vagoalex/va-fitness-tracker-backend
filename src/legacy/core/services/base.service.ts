import { Model, Document, isValidObjectId } from 'mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { getDocumentByIdNotFoundError } from '../errors/errors.helper';

export type NameCodeDto = { name?: string; code?: string };

@Injectable()
export class BaseService<T extends Document> {
  protected readonly logger = new Logger(BaseService.name);

  constructor(protected readonly model: Model<T>) {}

  /**
   * Поиск по name и/или code (case-insensitive)
   */
  async findByNameOrCode({ name, code }: NameCodeDto = {}): Promise<T[]> {
    const filter: Record<string, RegExp> = {};

    if (name) filter.name = new RegExp(name, 'i');
    if (code) filter.code = new RegExp(code, 'i');

    return this.model.find(filter).exec();
  }

  /**
   * Проверка на конфликт по name и code
   */
  async findNameOrCodeConflicts(
    dto: NameCodeDto,
  ): Promise<{ nameExists: boolean; codeExists: boolean }> {
    const orConditions = [dto.name && { name: dto.name }, dto.code && { code: dto.code }].filter(
      Boolean,
    );

    if (orConditions.length === 0) {
      return { nameExists: false, codeExists: false };
    }

    const conflicts = await this.model
      .find({
        $or: orConditions,
      })
      .select('name code')
      .lean()
      .exec();

    // Явное приведение типов для устранения ошибки типизации
    const typedConflicts = conflicts as Array<{ name?: string; code?: string }>;

    return {
      nameExists: typedConflicts.some((c) => c.name === dto.name),
      codeExists: typedConflicts.some((c) => c.code === dto.code),
    };
  }

  /**
   * Проверка существования документа по ID
   */
  async existsById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const count = await this.model.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  /**
   * Поиск документа по ID
   */
  async findById(id: string): Promise<T | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.model.findById(id).exec();
  }

  /**
   * Поиск документа по ID с проверкой существования
   * (выбрасывает исключение, если документ не найден)
   */
  async findByIdOrThrow(id: string, errorMessage?: string): Promise<T> {
    const document = await this.findById(id);

    if (!document) {
      throw new NotFoundException(errorMessage || getDocumentByIdNotFoundError(id));
    }

    return document;
  }
}
