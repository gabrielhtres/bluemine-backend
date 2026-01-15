import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Task } from './task.model';
import { TaskStatus } from './dto/create-task.dto';
import { Project, User } from 'src/models';
import { ProjectMember } from '../project-member/project-member.model';
import { USER_PUBLIC_ATTRIBUTES } from '../common/constants/user-attributes.constant';
import {
  getUserProjectIds,
  createUserTaskFilter,
} from '../common/helpers/project.helper';

@Injectable()
export class TaskService extends BaseService<Task> {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(ProjectMember)
    private readonly projectMemberModel: typeof ProjectMember,
  ) {
    super(taskModel);
  }

  async findAll(userId?: number, userRole?: string): Promise<Task[]> {
    if (userRole === 'admin') {
      return this.taskModel.findAll({
        include: [
          {
            model: Project,
            attributes: ['name'],
          },
          {
            model: User,
            as: 'assignee',
            attributes: [...USER_PUBLIC_ATTRIBUTES],
          },
        ],
      });
    }

    if (userId) {
      const allProjectIds = await getUserProjectIds(
        userId,
        Project,
        this.projectMemberModel,
      );

      return this.taskModel.findAll({
        where: createUserTaskFilter(userId, allProjectIds),
        include: [
          {
            model: Project,
            attributes: ['name'],
          },
          {
            model: User,
            as: 'assignee',
            attributes: [...USER_PUBLIC_ATTRIBUTES],
          },
        ],
      });
    }

    return this.taskModel.findAll({
      include: [
        {
          model: Project,
          attributes: ['name'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
        },
      ],
    });
  }

  async findByAssigneeId(assigneeId: number): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { assigneeId },
      include: [
        'project',
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
        },
      ],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id, {
      include: [
        {
          model: Project,
          attributes: ['id', 'name', 'managerId'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
        },
      ],
    });

    if (!task) throw new NotFoundException('Tarefa não encontrada.');

    return task;
  }

  async checkUserHasAccess(
    taskId: number,
    userId: number,
    userRole?: string,
  ): Promise<boolean> {
    if (userRole === 'admin') {
      return true;
    }

    const task = await this.taskModel.findByPk(taskId, {
      include: [
        {
          model: Project,
          attributes: ['id', 'managerId'],
        },
      ],
    });

    if (!task) {
      return false;
    }

    // Verifica se o usuário é o assignee da tarefa
    if (task.assigneeId === userId) {
      return true;
    }

    // Verifica se o usuário é o manager do projeto
    if (task.project.managerId === userId) {
      return true;
    }

    // Verifica se o usuário é membro do projeto
    const projectMember = await this.projectMemberModel.findOne({
      where: {
        projectId: task.projectId,
        userId: userId,
      },
    });

    return !!projectMember;
  }

  async updateStatus(
    taskId: number,
    newStatus: TaskStatus,
    userId: number,
    userRole?: string,
  ): Promise<Task> {
    const task = await this.taskModel.findByPk(taskId, {
      include: [
        {
          model: Project,
        },
      ],
    });

    if (!task) throw new NotFoundException('Tarefa não encontrada.');

    const hasAccess = await this.checkUserHasAccess(taskId, userId, userRole);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta tarefa.',
      );
    }

    await task.update({ status: newStatus });
    return this.findOne(taskId);
  }

  async update(
    id: number,
    data: Partial<Task>,
    userId?: number,
    userRole?: string,
  ): Promise<Task> {
    const task = await this.findOne(id);

    if (userId !== undefined && userRole !== undefined) {
      const hasAccess = await this.checkUserHasAccess(id, userId, userRole);
      if (!hasAccess) {
        throw new ForbiddenException(
          'Você não tem permissão para alterar esta tarefa.',
        );
      }
    }

    await task.update(data as unknown as Partial<Task['_attributes']>);
    return this.findOne(id);
  }

  async remove(id: number, userId?: number, userRole?: string): Promise<void> {
    const task = await this.findOne(id);

    if (userId !== undefined && userRole !== undefined) {
      const hasAccess = await this.checkUserHasAccess(id, userId, userRole);
      if (!hasAccess) {
        throw new ForbiddenException(
          'Você não tem permissão para remover esta tarefa.',
        );
      }
    }

    await task.destroy();
  }
}
