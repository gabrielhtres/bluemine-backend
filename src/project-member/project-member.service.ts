import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ProjectMember } from './project-member.model';
import { InjectConnection } from '@nestjs/sequelize';
import { SyncProjectMemberDto } from './dto/sync-project-member.dto';

@Injectable()
export class ProjectMemberService {
  constructor(
    @InjectModel(ProjectMember)
    private readonly projectMemberRepository: typeof ProjectMember,
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async syncMembers(dto: SyncProjectMemberDto): Promise<ProjectMember[]> {
    const { projectId, assignments } = dto;

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

      return this.projectMemberRepository.bulkCreate(membersToCreate as any, {
        transaction: t,
      });
    });
  }
}
