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
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'O título da tarefa.',
    minLength: 3,
    example: 'Desenvolver endpoint de autenticação',
  })
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título da tarefa é obrigatório.' })
  @MinLength(3, { message: 'O título deve ter no mínimo 3 caracteres.' })
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada da tarefa.',
    required: false,
    example: 'Implementar a lógica de login com JWT e refresh tokens.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'O status atual da tarefa.',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status da tarefa é obrigatório.' })
  status: TaskStatus;

  @ApiProperty({
    description: 'A prioridade da tarefa.',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, {
    message: `A prioridade deve ser uma das seguintes: ${Object.values(
      TaskPriority,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'A prioridade da tarefa é obrigatória.' })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Data de vencimento da tarefa.',
    required: false,
    example: '2025-10-15T23:59:59.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'A data de vencimento deve ser uma data válida.' })
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({
    description: 'ID do projeto ao qual a tarefa pertence.',
    example: 1,
  })
  @IsNumber({}, { message: 'O ID do projeto deve ser um número.' })
  @IsPositive({ message: 'O ID do projeto deve ser um número positivo.' })
  @IsNotEmpty({ message: 'O ID do projeto é obrigatório.' })
  projectId: number;

  @ApiProperty({
    description: 'ID do usuário responsável pela tarefa (assignee).',
    example: 2,
  })
  @IsNumber({}, { message: 'O ID do responsável deve ser um número.' })
  @IsPositive({ message: 'O ID do responsável deve ser um número positivo.' })
  @IsNotEmpty({ message: 'É obrigatório atribuir a tarefa a um responsável.' })
  assigneeId: number;
}
