import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Task } from '../task/task.model';
import { Project } from '../project/project.model';
import { ProjectMember } from '../project-member/project-member.model';
import { User } from '../user/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Task, Project, ProjectMember, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
