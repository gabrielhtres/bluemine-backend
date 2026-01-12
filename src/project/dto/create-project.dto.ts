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
import { ExistsInDatabase } from 'src/common/validators/exists-in-database.validator';
import { User } from 'src/models';

export enum ProjectStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'O nome do projeto.',
    minLength: 3,
    example: 'Projeto Bluemine',
  })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório.' })
  @MinLength(3, {
    message: 'O nome do projeto deve ter no mínimo 3 caracteres.',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do projeto.',
    required: false,
    example: 'Este é um projeto para gerenciar tarefas e equipes.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'O status atual do projeto.',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNED,
  })
  @IsEnum(ProjectStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      ProjectStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status do projeto é obrigatório.' })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Data de início do projeto.',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'A data de início deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  startDate: Date;

  @ApiProperty({
    description: 'Data de término do projeto.',
    example: '2025-12-31T23:59:59.000Z',
  })
  @Type(() => Date)
  @IsDate({ message: 'A data de fim deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data de fim é obrigatória.' })
  endDate: Date;
}
