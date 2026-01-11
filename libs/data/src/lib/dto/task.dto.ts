import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { TaskStatus, TaskPriority, TaskCategory } from '../interfaces/task.interface';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.TODO;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory = TaskCategory.WORK;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsOptional()
  assigneeId?: string | null;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class TaskFilterDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'order';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class ReorderTaskDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @IsNumber()
  @IsNotEmpty()
  newOrder!: number;

  @IsEnum(TaskStatus)
  @IsOptional()
  newStatus?: TaskStatus;
}
