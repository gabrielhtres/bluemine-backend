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

export enum ProjectStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateProjectDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório.' })
  @MinLength(3, {
    message: 'O nome do projeto deve ter no mínimo 3 caracteres.',
  })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      ProjectStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status do projeto é obrigatório.' })
  status: ProjectStatus;

  @Type(() => Date)
  @IsDate({ message: 'A data de início deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  startDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'A data de fim deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data de fim é obrigatória.' })
  endDate: Date;

  @IsNumber({}, { message: 'O ID do gerente deve ser um número.' })
  @IsPositive({ message: 'O ID do gerente deve ser um número positivo.' })
  @IsNotEmpty({ message: 'O ID do gerente é obrigatório.' })
  managerId: number;
}
