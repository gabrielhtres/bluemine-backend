import { Controller, Get, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { Task } from './task.model';
import { TaskService } from './task.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

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
}
