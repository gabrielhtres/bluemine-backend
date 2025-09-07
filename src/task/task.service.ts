import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BaseService } from '../base/base.service';
import { Task } from './task.model';

@Injectable()
export class TaskService extends BaseService<Task> {
  constructor(@InjectModel(Task) private readonly taskModel: typeof Task) {
    super(taskModel);
  }
}
