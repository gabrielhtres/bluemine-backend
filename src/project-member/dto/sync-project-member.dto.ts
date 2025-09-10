import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProjectAssignmentDto {
  @IsNotEmpty()
  @IsNumber()
  developerId: number;

  @IsNotEmpty()
  @IsEnum(['viewer', 'contributor', 'maintainer'], {
    message: 'O papel deve ser viewer, contributor ou maintainer.',
  })
  role: string;
}

export class SyncProjectMemberDto {
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectAssignmentDto)
  assignments: ProjectAssignmentDto[];
}
