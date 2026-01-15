import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { BaseController } from '../base/base.controller';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { extractUserFromRequest } from '../common/helpers/request.helper';

@ApiBearerAuth()
@ApiTags('Tasks')
@Controller('task')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController extends BaseController<Task> {
  constructor(private readonly taskService: TaskService) {
    super(taskService);
  }

  @Get('my-tasks')
  @Roles('manager', 'developer')
  @ApiOperation({
    summary: 'Lista todas as tarefas atribuídas ao usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso.',
    type: [Task],
  })
  findMyTasks(@CurrentUser('id') userId: string): Promise<Task[]> {
    return this.taskService.findByAssigneeId(+userId);
  }

  @Patch(':id/status')
  @Roles('developer', 'manager')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ): Promise<Task> {
    return this.taskService.updateStatus(
      +id,
      updateTaskStatusDto.status,
      +userId,
      userRole,
    );
  }

  @Post()
  @Roles('manager')
  @ApiOperation({ summary: 'Cria uma nova tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso.',
    type: Task,
  })
  create(@Body() data: CreateTaskDto): Promise<Task> {
    return super.create(data as unknown as Partial<Task>);
  }

  @Get()
  @Roles('manager', 'developer')
  @ApiOperation({ summary: 'Lista todas as tarefas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso.',
    type: [Task],
  })
  findAll(
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ): Promise<Task[]> {
    return this.taskService.findAll(userId ? +userId : undefined, userRole);
  }

  @Get(':id')
  @Roles('manager', 'developer')
  @ApiOperation({ summary: 'Busca uma tarefa pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa retornada com sucesso.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para acessar esta tarefa.',
  })
  async findOne(@Param('id') id: string, @Req() req?: Request): Promise<Task> {
    const { id: userId, role: userRole } = extractUserFromRequest(req);

    const task = await this.taskService.findOne(+id);
    const hasAccess = await this.taskService.checkUserHasAccess(
      +id,
      userId,
      userRole,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta tarefa.',
      );
    }

    return task;
  }

  @Put(':id')
  @Roles('manager', 'developer')
  @ApiOperation({ summary: 'Atualiza uma tarefa existente' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para alterar esta tarefa.',
  })
  update(
    @Param('id') id: string,
    @Body() data: UpdateTaskDto,
    @Req() req?: Request,
  ): Promise<Task> {
    const { id: userId, role: userRole } = extractUserFromRequest(req);
    return this.taskService.update(+id, data, userId, userRole);
  }

  @Delete(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Remove uma tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  @ApiResponse({
    status: 403,
    description: 'Você não tem permissão para remover esta tarefa.',
  })
  remove(@Param('id') id: string, @Req() req?: Request): Promise<void> {
    const { id: userId, role: userRole } = extractUserFromRequest(req);
    return this.taskService.remove(+id, userId, userRole);
  }
}
