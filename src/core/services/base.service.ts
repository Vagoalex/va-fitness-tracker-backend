import { Model, Document } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

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
		const orConditions = [
			dto.name && { name: dto.name },
			dto.code && { code: dto.code },
		].filter(Boolean);

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
}
