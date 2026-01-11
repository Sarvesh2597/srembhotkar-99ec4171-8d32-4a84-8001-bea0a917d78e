import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';
import { CurrentUser, Roles, RolesGuard } from '@task-management/auth';
import { Role, IUserPayload } from '@task-management/data';

@Controller('audit-log')
@UseGuards(RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async findAll(@CurrentUser() user: IUserPayload): Promise<AuditLog[]> {
    return this.auditService.findAll([user.organizationId]);
  }
}
