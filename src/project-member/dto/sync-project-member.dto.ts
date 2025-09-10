import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExistsInDatabase } from 'src/common/validators/exists-in-database.validator';
import { Project, User } from 'src/models';

class ProjectAssignmentDto {
  @ApiProperty({
    description: 'ID do usuário (developer) a ser atribuído ao projeto.',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  @ExistsInDatabase(
    { model: User },
    { message: 'O developer com o ID fornecido não existe.' },
  )
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
  @ExistsInDatabase(
    { model: Project },
    { message: 'O projeto especificado não existe.' },
  )
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
