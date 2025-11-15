import { IsMongoId, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsCodePattern,
  IsString,
  IsValidObjectId,
} from '../../../../core/decorators/validation.decorator';
import { EXERCISE_VALIDATION_ERRORS } from '../../../shared/exercise/constants/exercise-errors.constants';
import { EXERCISE_CODE_PATTERN } from '../../../shared/exercise/constants/exercise.constants';

/**
 * Модель DTO конкретного упражнения - конечное состояние (Входит в exercise-type)
 * Например ("Подтягивания широким хватом", "Алмазные отжимания" и т.д)
 */
export class CreateExerciseDto {
  /**
   * Техническое название упражнения
   * @example wide_grip_pull_ups, diamond_push_ups
   */
  @ApiProperty({ example: 'wide_grip_pull_ups' })
  @IsString()
  @IsNotEmpty({ message: EXERCISE_VALIDATION_ERRORS.CODE_REQUIRED })
  @Matches(EXERCISE_CODE_PATTERN, {
    message: EXERCISE_VALIDATION_ERRORS.CODE_PATTERN,
  })
  code: string;

  /**
   * Название упражнения
   * @example Подтягивания широким хватом, Алмазные отжимания
   */
  @ApiProperty({ example: 'Подтягивания широким хватом' })
  @IsString()
  @IsNotEmpty({ message: EXERCISE_VALIDATION_ERRORS.NAME_REQUIRED })
  name: string;

  /**
   * Дополнительное описание упражнения
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Иконка упражнения
   * (Пока что будет icon мэтчиться с названием иконки на фронте. В будущем перенесем добавление иконок на бэке)
   */
  @ApiProperty({ example: 'wide_grip_pull_ups' })
  @IsString()
  @IsCodePattern()
  @IsOptional()
  icon?: string;

  /**
   * ObjectId категории (связь с типом упражнения)
   */
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  @IsValidObjectId()
  exerciseTypeId: string;
}
