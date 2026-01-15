import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Patch,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { BaseController } from '../base/base.controller';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { extractUserFromRequest } from '../common/helpers/request.helper';

@ApiBearerAuth()
@ApiTags('Projects')
@Controller('project')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectController extends BaseController<Project> {
  constructor(private readonly projectService: ProjectService) {
    super(projectService);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo projeto' })
  @ApiResponse({
    status: 201,
    description: 'O projeto foi criado com sucesso.',
    type: Project,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(
    @Body() data: CreateProjectDto,
    @CurrentUser('id') managerId: string,
  ): Promise<Project> {
    const createData = {
      ...data,
      managerId: +managerId,
    };
    return this.projectService.create(createData);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos retornada com sucesso.',
    type: [Project],
  })
  findAll(
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ): Promise<Project[]> {
    return this.projectService.findAll(userId ? +userId : undefined, userRole);
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Lista os projetos do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos retornada com sucesso.',
    type: [Project],
  })
  findMyProjects(@CurrentUser('id') userId: string): Promise<Project[]> {
    return this.projectService.findByUserId(+userId);
  }

  @Patch(':id/status')
  @Roles('manager')
  @ApiOperation({ summary: 'Atualiza o status de um projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Status do projeto atualizado com sucesso.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para alterar este projeto.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ): Promise<Project> {
    return this.projectService.updateStatus(
      +id,
      updateProjectStatusDto.status,
      +userId,
      userRole,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Projeto retornado com sucesso.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para acessar este projeto.',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req?: Request,
  ): Promise<Project> {
    const { id: userId, role: userRole } = extractUserFromRequest(req);

    const project = await this.projectService.findOne(+id);
    const hasAccess = await this.projectService.checkUserHasAccess(
      +id,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este projeto.',
      );
    }

    return project;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um projeto existente' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Projeto atualizado com sucesso.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para alterar este projeto.',
  })
  update(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
    @Req() req?: Request,
  ): Promise<Project> {
    const { id: userId, role: userRole } = extractUserFromRequest(req);
    return this.projectService.update(+id, data, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  remove(@Param('id') id: string): Promise<void> {
    return super.remove(id);
  }
}
