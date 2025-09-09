import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('project')
export class ProjectController extends BaseController<Project> {
  constructor(private readonly projectService: ProjectService) {
    super(projectService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() data: Omit<Project, 'managerId'>,
    @CurrentUser('id') managerId: string,
  ): Promise<Project> {
    const createData = {
      ...data,
      managerId: +managerId,
    };
    return this.projectService.create(createData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-projects')
  findMyProjects(@CurrentUser('id') userId: string): Promise<Project[]> {
    return this.projectService.findByUserId(+userId);
  }
}
