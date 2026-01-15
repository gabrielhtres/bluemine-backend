import { Project } from '../../project/project.model';
import { ProjectMember } from '../../project-member/project-member.model';
import { Op } from 'sequelize';

/**
 * Busca IDs de projetos onde o usuário é manager ou membro
 */
export async function getUserProjectIds(
  userId: number,
  projectModel: typeof Project,
  projectMemberModel: typeof ProjectMember,
): Promise<number[]> {
  const managedProjects = await projectModel.findAll({
    where: { managerId: userId },
    attributes: ['id'],
  });
  const managedProjectIds = managedProjects.map((p) => p.id);

  const memberProjects = await projectMemberModel.findAll({
    where: { userId },
    attributes: ['projectId'],
  });
  const memberProjectIds = memberProjects.map((m) => m.projectId);

  return [...managedProjectIds, ...memberProjectIds];
}

/**
 * Cria um filtro de Sequelize para buscar tarefas do usuário
 */
export function createUserTaskFilter(
  userId: number,
  projectIds: number[],
): {
  [Op.or]: Array<{ assigneeId: number } | { projectId: { [Op.in]: number[] } }>;
} {
  return {
    [Op.or]: [{ assigneeId: userId }, { projectId: { [Op.in]: projectIds } }],
  };
}
