import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction } from '@task-management/data';

interface LogParams {
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      ...params,
      timestamp: new Date(),
    });

    console.log(`[AUDIT] ${params.action.toUpperCase()} ${params.resource}${params.resourceId ? `:${params.resourceId}` : ''} by ${params.userEmail}`);

    return this.auditLogRepository.save(log);
  }

  async findAll(_organizationIds: string[]): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByResource(resource: string, resourceId?: string): Promise<AuditLog[]> {
    const where: Partial<AuditLog> = { resource };
    if (resourceId) {
      where.resourceId = resourceId;
    }

    return this.auditLogRepository.find({
      where,
      order: { timestamp: 'DESC' },
    });
  }
}
