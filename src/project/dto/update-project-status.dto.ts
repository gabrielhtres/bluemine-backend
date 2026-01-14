import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from './create-project.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'O novo status do projeto.',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      ProjectStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status do projeto é obrigatório.' })
  status: ProjectStatus;
}
