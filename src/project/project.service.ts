import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Project } from './project.model';
import { ProjectMember, User } from 'src/models';
import { Op } from 'sequelize';
import { ProjectStatus } from './dto/create-project.dto';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
    @InjectModel(ProjectMember)
    private readonly projectMemberModel: typeof ProjectMember,
  ) {
    super(projectModel);
  }

  async findAll(userId?: number, userRole?: string): Promise<Project[]> {
    // Se for admin, retorna todos os projetos
    if (userRole === 'admin') {
      return this.projectModel.findAll({
        include: [
          {
            model: User,
            as: 'developers',
            attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
            through: { attributes: ['role'] },
          },
        ],
      });
    }

    // Se for manager ou developer, retorna apenas seus projetos
    if (userId) {
      return this.findByUserId(userId);
    }

    // Fallback: retorna todos (caso não tenha userId)
    return this.projectModel.findAll({
      include: [
        {
          model: User,
          as: 'developers',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
          through: { attributes: ['role'] },
        },
      ],
    });
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
      include: [
        {
          model: User,
          as: 'developers',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
          through: { attributes: ['role'] },
        },
      ],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'developers',
          attributes: ['id', 'name', 'email', 'role', 'avatarUrl'],
          through: { attributes: ['role'] },
        },
      ],
    });

    if (!project) throw new NotFoundException('Projeto não encontrado.');

    return project;
  }

  async create(data: Partial<Project>): Promise<Project> {
    const project = await this.projectModel.create(
      data as unknown as Project['_creationAttributes'],
    );
    return this.findOne(project.id);
  }

  async update(id: number, data: Partial<Project>): Promise<Project> {
    const project = await this.findOne(id);
    await project.update(data as unknown as Partial<Project['_attributes']>);
    return this.findOne(id);
  }

  async updateStatus(
    projectId: number,
    newStatus: ProjectStatus,
    userId: number,
    userRole?: string,
  ): Promise<Project> {
    const project = await this.projectModel.findByPk(projectId);

    if (!project) throw new NotFoundException('Projeto não encontrado.');

    // VALIDAÇÃO DE PERMISSÃO
    // Apenas o manager do projeto ou admin pode alterar o status
    const isManager = project.managerId === userId;
    const isAdmin = userRole === 'admin';

    if (!isManager && !isAdmin) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este projeto.',
      );
    }

    await project.update({ status: newStatus });
    return this.findOne(projectId);
  }
}
