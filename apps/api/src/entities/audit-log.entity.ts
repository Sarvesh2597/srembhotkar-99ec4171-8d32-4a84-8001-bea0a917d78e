import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IAuditLog, AuditAction } from '@task-management/data';

@Entity('audit_logs')
export class AuditLog implements IAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'user_email', length: 255 })
  userEmail!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  action!: AuditAction;

  @Column({ length: 100 })
  resource!: string;

  @Column({ nullable: true, name: 'resource_id' })
  resourceId?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ nullable: true, name: 'ip_address', length: 50 })
  ipAddress?: string;

  @CreateDateColumn()
  timestamp!: Date;
}
