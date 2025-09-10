import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from './create-task.dto';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status da tarefa é obrigatório.' })
  status: TaskStatus;
}
