import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Task } from './task.model';
import { Project } from '../project/project.model';
import { User } from '../user/user.model';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [SequelizeModule.forFeature([Task, Project, User])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
