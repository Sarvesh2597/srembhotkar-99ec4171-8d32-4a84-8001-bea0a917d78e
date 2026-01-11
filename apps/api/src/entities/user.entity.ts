import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IUser, Role } from '@task-management/data';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ length: 100, name: 'last_name' })
  lastName!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: Role.VIEWER,
  })
  role!: Role;

  @Column({ name: 'organization_id' })
  organizationId!: string;

  @ManyToOne(() => Organization, (org) => org.users)
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks?: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks?: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
