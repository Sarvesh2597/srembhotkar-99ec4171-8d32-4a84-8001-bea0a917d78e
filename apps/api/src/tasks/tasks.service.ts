import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Task } from '../entities/task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
  ReorderTaskDto,
  IUserPayload,
  Role,
  hasHigherOrEqualRole,
  AuditAction,
} from '@task-management/data';
import { OrganizationsService } from '../organizations/organizations.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private organizationsService: OrganizationsService,
    private auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: IUserPayload): Promise<Task> {
    const maxOrder = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.organizationId = :orgId', { orgId: user.organizationId })
      .select('MAX(task.order)', 'max')
      .getRawOne();

    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      createdById: user.sub,
      organizationId: user.organizationId,
      order: (maxOrder?.max || 0) + 1,
    });

    const savedTask = await this.taskRepository.save(task);

    await this.auditService.log({
      userId: user.sub,
      userEmail: user.email,
      action: AuditAction.CREATE,
      resource: 'task',
      resourceId: savedTask.id,
      details: `Created task: ${savedTask.title}`,
    });

    return savedTask;
  }

  async findAll(user: IUserPayload, filterDto?: TaskFilterDto): Promise<Task[]> {
    const orgIds = await this.organizationsService.getAccessibleOrganizations(
      user.organizationId,
    );

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where(
        '(task.organizationId IN (:...orgIds) OR task.assigneeId = :userId)',
        { orgIds, userId: user.sub }
      );

    // Apply filters
    if (filterDto?.status) {
      queryBuilder.andWhere('task.status = :status', { status: filterDto.status });
    }

    if (filterDto?.priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority: filterDto.priority });
    }

    if (filterDto?.category) {
      queryBuilder.andWhere('task.category = :category', { category: filterDto.category });
    }

    if (filterDto?.search) {
      queryBuilder.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Sorting
    const sortBy = filterDto?.sortBy || 'order';
    const sortOrder = filterDto?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: string, user: IUserPayload): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignee', 'organization'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const orgIds = await this.organizationsService.getAccessibleOrganizations(
      user.organizationId,
    );

    const hasOrgAccess = orgIds.includes(task.organizationId);
    const isAssignee = task.assigneeId === user.sub;

    if (!hasOrgAccess && !isAssignee) {
      throw new ForbiddenException('You do not have access to this task');
    }

    await this.auditService.log({
      userId: user.sub,
      userEmail: user.email,
      action: AuditAction.READ,
      resource: 'task',
      resourceId: task.id,
    });

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: IUserPayload): Promise<Task> {
    const task = await this.findOne(id, user);

    this.checkUpdatePermission(task, user);

    if (updateTaskDto.dueDate) {
      (updateTaskDto as any).dueDate = new Date(updateTaskDto.dueDate);
    }

    if ('assigneeId' in updateTaskDto) {
      task.assigneeId = updateTaskDto.assigneeId as string | null;
      task.assignee = undefined as any;
      delete (updateTaskDto as any).assigneeId;
    }

    Object.assign(task, updateTaskDto);
    await this.taskRepository.save(task);

    await this.auditService.log({
      userId: user.sub,
      userEmail: user.email,
      action: AuditAction.UPDATE,
      resource: 'task',
      resourceId: task.id,
      details: `Updated task: ${task.title}`,
    });

    return this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignee', 'organization'],
    }) as Promise<Task>;
  }

  async remove(id: string, user: IUserPayload): Promise<void> {
    const task = await this.findOne(id, user);

    this.checkDeletePermission(task, user);

    await this.auditService.log({
      userId: user.sub,
      userEmail: user.email,
      action: AuditAction.DELETE,
      resource: 'task',
      resourceId: task.id,
      details: `Deleted task: ${task.title}`,
    });

    await this.taskRepository.remove(task);
  }

  async reorder(reorderDto: ReorderTaskDto, user: IUserPayload): Promise<Task> {
    const task = await this.findOne(reorderDto.taskId, user);

    this.checkUpdatePermission(task, user);

    task.order = reorderDto.newOrder;
    if (reorderDto.newStatus) {
      task.status = reorderDto.newStatus;
    }

    return this.taskRepository.save(task);
  }

  async getTaskStats(user: IUserPayload): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const orgIds = await this.organizationsService.getAccessibleOrganizations(
      user.organizationId,
    );

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .where(
        '(task.organizationId IN (:...orgIds) OR task.assigneeId = :userId)',
        { orgIds, userId: user.sub }
      )
      .getMany();

    const stats = {
      total: tasks.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    tasks.forEach((task) => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
    });

    return stats;
  }

  private checkUpdatePermission(task: Task, user: IUserPayload): void {
    if (hasHigherOrEqualRole(user.role, Role.ADMIN)) {
      return;
    }
    if (task.createdById !== user.sub) {
      throw new ForbiddenException('You can only update tasks you created');
    }
  }

  private checkDeletePermission(_task: Task, user: IUserPayload): void {
    if (!hasHigherOrEqualRole(user.role, Role.ADMIN)) {
      throw new ForbiddenException('Only owners and admins can delete tasks');
    }
  }
}
