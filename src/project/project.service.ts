import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Project } from './project.model';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectModel(Project) private readonly projectModel: typeof Project,
  ) {
    super(projectModel);
  }
}
