import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ITask, TaskStatus, TaskPriority, TaskCategory } from '@task-management/data';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity('tasks')
export class Task implements ITask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: 'varchar',
    length: 20,
    default: TaskCategory.WORK,
  })
  category!: TaskCategory;

  @Column({ type: 'datetime', nullable: true, name: 'due_date' })
  dueDate?: Date;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ name: 'created_by_id' })
  createdById!: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @Column({ nullable: true, name: 'assignee_id' })
  assigneeId?: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee?: User;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.tasks)
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
