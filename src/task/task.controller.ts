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
} from '@nestjs/common';
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

  @Patch(':id/status') // Nome correto
  @Roles('developer', 'manager') // Manager também deveria poder mudar status
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
  @Roles('manager')
  @ApiOperation({ summary: 'Busca uma tarefa pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa retornada com sucesso.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  findOne(@Param('id') id: string): Promise<Task> {
    return super.findOne(id);
  }

  @Put(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Atualiza uma tarefa existente' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  update(@Param('id') id: string, @Body() data: UpdateTaskDto): Promise<Task> {
    return super.update(id, data);
  }

  @Delete(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Remove uma tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  remove(@Param('id') id: string): Promise<void> {
    return super.remove(id);
  }
}
