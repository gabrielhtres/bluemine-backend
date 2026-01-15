import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ProjectMember } from './project-member.model';
import { InjectConnection } from '@nestjs/sequelize';
import { SyncProjectMemberDto } from './dto/sync-project-member.dto';
import { Project } from '../project/project.model';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectModel(ProjectMember)
    private readonly projectMemberRepository: typeof ProjectMember,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async syncMembers(
    dto: SyncProjectMemberDto,
    userId: number,
    userRole?: string,
  ): Promise<ProjectMember[]> {
    const { projectId, assignments } = dto;

    const project = await this.projectModel.findByPk(projectId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    const isManager = project.managerId === userId;
    const isAdmin = userRole === 'admin';

    if (!isManager && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para gerenciar membros deste projeto.',
      );
    }

    return this.sequelize.transaction(async (t) => {
      await this.projectMemberRepository.destroy({
        where: { projectId },
        transaction: t,
      });

      if (!assignments || assignments.length === 0) {
        return [];
      }

      const membersToCreate = assignments.map((assignment) => ({
        projectId,
        userId: assignment.developerId,
        role: assignment.role,
      }));

      return this.projectMemberRepository.bulkCreate(
        membersToCreate as ProjectMember['_creationAttributes'][],
        {
          transaction: t,
        },
      );
    });
  }
}
