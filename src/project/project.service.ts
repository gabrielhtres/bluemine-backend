import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Project } from './project.model';
import { ProjectMember } from 'src/models';
import { Op } from 'sequelize';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(ProjectMember)
    private readonly projectMemberModel: typeof ProjectMember,
  ) {
    super(projectModel);
  }

  async findByUserId(userId: number): Promise<Project[]> {
    const memberProjectIds = (
      await this.projectMemberModel.findAll({
        where: { userId },
        attributes: ['projectId'],
      })
    ).map((member) => member.projectId);

    return this.projectModel.findAll({
      where: {
        [Op.or]: [{ managerId: userId }, { id: { [Op.in]: memberProjectIds } }],
      },
    });
  }
}
