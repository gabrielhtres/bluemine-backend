import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ProjectAssignmentDto {
  @ApiProperty({
    description: 'ID do usuário (developer) a ser atribuído ao projeto.',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  developerId: number;

  @ApiProperty({
    description: 'Papel do usuário dentro do projeto.',
    enum: ['viewer', 'contributor', 'maintainer'],
    example: 'contributor',
  })
  @IsNotEmpty()
  @IsEnum(['viewer', 'contributor', 'maintainer'], {
    message: 'O papel deve ser viewer, contributor ou maintainer.',
  })
  role: 'viewer' | 'contributor' | 'maintainer';
}

export class SyncProjectMemberDto {
  @ApiProperty({
    description: 'ID do projeto no qual os membros serão sincronizados.',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description:
      'Lista completa de membros e seus papéis para o projeto. As atribuições anteriores serão substituídas.',
    type: [ProjectAssignmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectAssignmentDto)
  assignments: ProjectAssignmentDto[];
}
