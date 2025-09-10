import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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

@Controller('task')
export class TaskController extends BaseController<Task> {
  constructor(private readonly taskService: TaskService) {
    super(taskService);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-tasks')
  findMyTasks(@CurrentUser('id') userId: string): Promise<Task[]> {
    return this.taskService.findByAssigneeId(+userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('developer')
  @Patch('toggle-status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.taskService.updateStatus(+id, updateTaskStatusDto.status);
  }
}
