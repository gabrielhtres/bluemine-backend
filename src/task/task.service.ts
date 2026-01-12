import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Task } from './task.model';
import { TaskStatus } from './dto/create-task.dto';
import { Project, ProjectMember, User } from 'src/models';

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

  async updateStatus(taskId: number, newStatus: TaskStatus, userId: number): Promise<Task> {
    const task = await this.taskModel.findByPk(taskId, {
      include: [{ model: Project, include: [ProjectMember] }] // Precisa ver os membros
    });

    if (!task) throw new NotFoundException('Tarefa não encontrada.');

    // VALIDAÇÃO DE PROPRIEDADE
    const isManager = task.project.managerId === userId;
    const isMember = task.project.developers.some(dev => dev.id === userId);

    if (!isManager && !isMember) {
      throw new ForbiddenException('Você não tem permissão para alterar esta tarefa.');
    }

    return task.update({ status: newStatus });
  }
}
