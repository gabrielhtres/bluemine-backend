import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Project } from './project.model';
import { User } from '../user/user.model';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectMember } from 'src/models';

@Module({
  imports: [SequelizeModule.forFeature([Project, User, ProjectMember])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
