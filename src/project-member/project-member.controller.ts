import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectMember } from './project-member.model';
import { ProjectMemberService } from './project-member.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SyncProjectMemberDto } from './dto/sync-project-member.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Project Members')
@Controller('project-member')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({
    summary: 'Sincroniza os membros de um projeto',
    description:
      'Substitui a lista de membros de um projeto pela lista fornecida. Se um membro existente não estiver na nova lista, ele será removido. Se um membro na lista não existir, ele será adicionado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Membros do projeto sincronizados com sucesso.',
    type: [ProjectMember],
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  create(@Body() data: SyncProjectMemberDto): Promise<ProjectMember[]> {
    return this.projectMemberService.syncMembers(data);
  }
}
