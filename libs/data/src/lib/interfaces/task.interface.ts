import { IUser } from './user.interface';
import { IOrganization } from './organization.interface';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  URGENT = 'urgent',
  OTHER = 'other',
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  order: number;
  createdById: string;
  createdBy?: IUser;
  assigneeId?: string;
  assignee?: IUser;
  organizationId: string;
  organization?: IOrganization;
  createdAt: Date;
  updatedAt: Date;
}
