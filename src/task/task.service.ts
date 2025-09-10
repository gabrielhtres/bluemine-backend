import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Task } from './task.model';
import { TaskStatus } from './dto/create-task.dto';
import { Project, User } from 'src/models';

@Injectable()
export class TaskService extends BaseService<Task> {
  constructor(@InjectModel(Task) private readonly taskModel: typeof Task) {
    super(taskModel);
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.findAll({
      include: [
        {
          model: Project,
          attributes: ['name'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['name'],
        },
      ],
    });
  }

  async findByAssigneeId(assigneeId: number): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { assigneeId },
      include: ['project', 'assignee'],
    });
  }

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }
    task.status = status;
    return task.save();
  }
}
