import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from './create-task.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'O novo status da tarefa.',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus, {
    message: `O status deve ser um dos seguintes valores: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O status da tarefa é obrigatório.' })
  status: TaskStatus;
}
