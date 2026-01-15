import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from '../task/task.model';
import { Project } from '../project/project.model';
import { ProjectMember } from '../project-member/project-member.model';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize';

type ProjectStatusItem = { status: Project['status']; count: number };
type TaskPriorityItem = {
  priority: Task['priority'];
  status: Task['status'];
  count: number;
};
type TaskProgressByProjectItem = {
  projectId: number;
  projectName: string;
  status: Task['status'];
  count: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Task) private readonly taskModel: typeof Task,
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(ProjectMember)
    private readonly projectMemberModel: typeof ProjectMember,
  ) {}

  async getAdminDashboard(userId?: number, userRole?: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo da semana atual
    startOfWeek.setHours(0, 0, 0, 0);

    // Filtro de projetos baseado no role
    let projectFilter: WhereOptions = {};
    if (userRole !== 'admin' && userId) {
      const memberProjectIds = (
        await this.projectMemberModel.findAll({
          where: { userId },
          attributes: ['projectId'],
        })
      ).map((member) => member.projectId);

      projectFilter = {
        [Op.or]: [{ managerId: userId }, { id: { [Op.in]: memberProjectIds } }],
      };
    }

    // Filtro de tarefas baseado no role
    let taskFilter: WhereOptions = {};
    if (userRole !== 'admin' && userId) {
      const managedProjects = await this.projectModel.findAll({
        where: { managerId: userId },
        attributes: ['id'],
      });
      const managedProjectIds = managedProjects.map((p) => p.id);

      const memberProjects = await this.projectMemberModel.findAll({
        where: { userId },
        attributes: ['projectId'],
      });
      const memberProjectIds = memberProjects.map((m) => m.projectId);

      const allProjectIds = [...managedProjectIds, ...memberProjectIds];

      taskFilter = {
        [Op.or]: [
          { assigneeId: userId },
          { projectId: { [Op.in]: allProjectIds } },
        ],
      };
    }

    // 1. Projetos Ativos
    const activeProjects = await this.projectModel.count({
      where: {
        ...projectFilter,
        status: 'active',
      },
    });

    // 2. Tarefas Atrasadas
    const overdueTasks = await this.taskModel.count({
      where: {
        ...taskFilter,
        dueDate: { [Op.lt]: now },
        status: { [Op.ne]: 'done' },
      },
    });

    // 3. Tarefas Concluídas na Semana
    const completedThisWeek = await this.taskModel.count({
      where: {
        ...taskFilter,
        status: 'done',
        updatedAt: { [Op.gte]: startOfWeek },
      },
    });

    // 4. Status dos Projetos
    const allProjects = await this.projectModel.findAll({
      where: projectFilter,
      attributes: ['status'],
    });

    // Agrupa projetos por status manualmente
    const projectStatusMap = new Map<string, number>();
    allProjects.forEach((project) => {
      const status: Project['status'] = project.status ?? 'planned';
      projectStatusMap.set(status, (projectStatusMap.get(status) || 0) + 1);
    });

    const projectStatus: ProjectStatusItem[] = Array.from(
      projectStatusMap.entries(),
    ).map(([status, count]) => ({
      status: status as Project['status'],
      count,
    }));

    // 5. Prioridade das Tarefas
    const allTasksForPriority = await this.taskModel.findAll({
      where: taskFilter,
      attributes: ['priority', 'status'],
    });

    // Agrupa tarefas por prioridade + status manualmente (para permitir filtros no frontend)
    const taskPriorityMap = new Map<string, TaskPriorityItem>();
    allTasksForPriority.forEach((task) => {
      const priority: Task['priority'] = task.priority ?? 'medium';
      const status: Task['status'] = task.status ?? 'todo';
      const key = `${priority}-${status}`;
      const existing = taskPriorityMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        taskPriorityMap.set(key, { priority, status, count: 1 });
      }
    });

    const taskPriority: TaskPriorityItem[] = Array.from(
      taskPriorityMap.values(),
    );

    // 6. Progresso das Tarefas por Projeto
    const allTasks = await this.taskModel.findAll({
      where: taskFilter,
      include: [
        {
          model: Project,
          attributes: ['id', 'name'],
        },
      ],
    });

    // Agrupa tarefas por projeto e status
    const taskProgressByProjectMap = new Map<
      string,
      TaskProgressByProjectItem
    >();
    allTasks.forEach((task) => {
      const key = `${task.projectId}-${task.status}`;
      const existing = taskProgressByProjectMap.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        taskProgressByProjectMap.set(key, {
          projectId: task.projectId,
          projectName: task.project?.name ?? 'Unknown',
          status: task.status,
          count: 1,
        });
      }
    });

    const taskProgressByProject: TaskProgressByProjectItem[] = Array.from(
      taskProgressByProjectMap.values(),
    );

    return {
      activeProjects,
      overdueTasks,
      completedThisWeek,
      projectStatus,
      taskPriority,
      taskProgressByProject,
    };
  }

  async getDeveloperDashboard(userId: number) {
    try {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // Busca projetos onde o usuário é manager
      const managedProjects = await this.projectModel.findAll({
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

      // Filtro para tarefas onde:
      // 1. O usuário é assignee, OU
      // 2. A tarefa pertence a um projeto onde o usuário é manager ou membro
      const userTaskFilter: WhereOptions =
        allProjectIds.length > 0
          ? {
              [Op.or]: [
                { assigneeId: userId },
                { projectId: { [Op.in]: allProjectIds } },
              ],
            }
          : { assigneeId: userId };

      // 1. Tarefas a Fazer
      const todoTasks = await this.taskModel.count({
        where: {
          ...userTaskFilter,
          status: 'todo',
        },
      });

      // 2. Em Progresso
      const inProgressTasks = await this.taskModel.count({
        where: {
          ...userTaskFilter,
          status: 'in_progress',
        },
      });

      // 3. Atrasadas - apenas tarefas com dueDate não nulo e menor que agora
      const overdueTasks = await this.taskModel.count({
        where: {
          ...userTaskFilter,
          dueDate: { [Op.lt]: now },
          status: { [Op.ne]: 'done' },
        },
      });

      // 4. Minhas Tarefas por Prioridade
      const allUserTasks = await this.taskModel.findAll({
        where: userTaskFilter,
      });

      // Agrupa tarefas por prioridade + status manualmente (para permitir filtros no frontend)
      const tasksByPriorityMap = new Map<string, TaskPriorityItem>();
      allUserTasks.forEach((task) => {
        const priority: Task['priority'] = task.priority ?? 'medium';
        const status: Task['status'] = task.status ?? 'todo';
        const key = `${priority}-${status}`;
        const existing = tasksByPriorityMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          tasksByPriorityMap.set(key, { priority, status, count: 1 });
        }
      });

      const tasksByPriority: TaskPriorityItem[] = Array.from(
        tasksByPriorityMap.values(),
      );

      // 5. Próximos Vencimentos (próximos 7 dias) - apenas tarefas com dueDate não nulo
      const upcomingDeadlines = await this.taskModel.findAll({
        where: {
          ...userTaskFilter,
          dueDate: { [Op.between]: [now, nextWeek] },
          status: { [Op.ne]: 'done' },
        },
        include: [
          {
            model: Project,
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['dueDate', 'ASC']],
        limit: 10,
      });

      type TaskWithProject = Task & { project?: Project | null };

      return {
        todoTasks,
        inProgressTasks,
        overdueTasks,
        tasksByPriority,
        upcomingDeadlines: (upcomingDeadlines as TaskWithProject[]).map(
          (task) => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            project: task.project
              ? {
                  id: task.project.id,
                  name: task.project.name,
                }
              : null,
          }),
        ),
      };
    } catch (error) {
      console.error('Error in getDeveloperDashboard:', error);
      throw error;
    }
  }
}
