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
import { IOrganization } from '@task-management/data';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('organizations')
export class Organization implements IOrganization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ nullable: true, name: 'parent_id' })
  parentId?: string | null;

  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Organization | null;

  @OneToMany(() => Organization, (org) => org.parent)
  children?: Organization[];

  @OneToMany(() => User, (user) => user.organization)
  users?: User[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks?: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
