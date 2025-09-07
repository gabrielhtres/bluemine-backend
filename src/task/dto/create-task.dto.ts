import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  IsPositive,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateTaskDto {
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status da tarefa é obrigatório.' })
  status: TaskStatus;

  @IsEnum(TaskPriority, {
    message: `A prioridade deve ser uma das seguintes: ${Object.values(
      TaskPriority,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'A prioridade da tarefa é obrigatória.' })
  priority: TaskPriority;

  @Type(() => Date)
  @IsDate({ message: 'A data de vencimento deve ser uma data válida.' })
  @IsOptional()
  dueDate?: Date;

  @IsNumber({}, { message: 'O ID do projeto deve ser um número.' })
  @IsPositive({ message: 'O ID do projeto deve ser um número positivo.' })
  @IsNotEmpty({ message: 'O ID do projeto é obrigatório.' })
  projectId: number;

  @IsNumber({}, { message: 'O ID do responsável deve ser um número.' })
  @IsPositive({ message: 'O ID do responsável deve ser um número positivo.' })
  @IsNotEmpty({ message: 'É obrigatório atribuir a tarefa a um responsável.' })
  assigneeId: number;
}
