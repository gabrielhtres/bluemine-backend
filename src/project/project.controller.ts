import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Project } from './project.model';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiBearerAuth()
@ApiTags('Projects') // A tag específica para agrupar as rotas de Projeto
@Controller('project')
export class ProjectController extends BaseController<Project> {
  constructor(private readonly projectService: ProjectService) {
    super(projectService);
  }

  // O método create já era específico, então mantemos a documentação dele
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

  // --- AQUI COMEÇA A MÁGICA DA SOBRESCRITA ---

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' }) // Descrição específica
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos retornada com sucesso.',
    type: [Project],
  }) // Tipo específico
  findAll(): Promise<Project[]> {
    return super.findAll(); // A lógica continua sendo a do BaseController
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um projeto pelo ID' }) // Descrição específica
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Projeto retornado com sucesso.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findOne(@Param('id') id: string): Promise<Project> {
    return super.findOne(id);
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
  update(
    @Param('id') id: string,
    @Body() data: UpdateProjectDto,
  ): Promise<Project> {
    return super.update(id, data as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  remove(@Param('id') id: string): Promise<void> {
    return super.remove(id);
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
}
