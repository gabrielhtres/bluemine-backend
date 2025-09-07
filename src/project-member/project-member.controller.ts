import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ProjectMember } from './project-member.model';
import { ProjectMemberService } from './project-member.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { SyncProjectMemberDto } from './dto/sync-project-member.dto';

@Controller('project-member')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() data: SyncProjectMemberDto): Promise<ProjectMember[]> {
    return this.projectMemberService.syncMembers(data);
  }
}
