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
import { Op } from 'sequelize';

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
    // Se for admin, retorna todas as tarefas
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
            attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
          },
        ],
      });
    }

    // Se for manager ou developer, retorna apenas suas tarefas
    if (userId) {
      // Busca projetos onde o usuário é manager
      const managedProjects = await Project.findAll({
        where: { managerId: userId },
        attributes: ['id'],
      });
      const managedProjectIds = managedProjects.map((p) => p.id);

      // Busca projetos onde o usuário é membro
      const memberProjects = await this.projectMemberModel.findAll({
        where: { userId },
        attributes: ['projectId'],
      });
      const memberProjectIds = memberProjects.map((m) => m.projectId);

      // Combina todos os IDs de projetos relevantes
      const allProjectIds = [...managedProjectIds, ...memberProjectIds];

      // Busca tarefas onde:
      // 1. O usuário é assignee, OU
      // 2. A tarefa pertence a um projeto onde o usuário é manager ou membro
      return this.taskModel.findAll({
        where: {
          [Op.or]: [
            { assigneeId: userId },
            { projectId: { [Op.in]: allProjectIds } },
          ],
        },
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

    // Fallback: retorna todas (caso não tenha userId)
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

    // VALIDAÇÃO DE PERMISSÃO
    // 1. Verifica se o usuário é o assignee da tarefa
    const isAssignee = task.assigneeId === userId;

    // 2. Verifica se o usuário é o manager do projeto ou admin
    const isManager = task.project.managerId === userId;
    const isAdmin = userRole === 'admin';

    // 3. Verifica se o usuário é membro do projeto
    const projectMember = await this.projectMemberModel.findOne({
      where: {
        projectId: task.projectId,
        userId: userId,
      },
    });
    const isMember = !!projectMember;

    if (!isAssignee && !isManager && !isMember && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar esta tarefa.',
      );
    }

    return task.update({ status: newStatus });
  }
}
