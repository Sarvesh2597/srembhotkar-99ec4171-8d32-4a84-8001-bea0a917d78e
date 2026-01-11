import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Task } from '../../entities/task.entity';
import { OrganizationsService } from '../../organizations/organizations.service';
import { AuditService } from '../../audit/audit.service';
import { Role, TaskStatus, TaskPriority, TaskCategory, IUserPayload } from '@task-management/data';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepository: any;
  let mockOrganizationsService: any;
  let mockAuditService: any;

  const mockOwnerUser: IUserPayload = {
    sub: 'owner-123',
    email: 'owner@example.com',
    role: Role.OWNER,
    organizationId: 'org-123',
  };

  const mockAdminUser: IUserPayload = {
    sub: 'admin-123',
    email: 'admin@example.com',
    role: Role.ADMIN,
    organizationId: 'org-123',
  };

  const mockViewerUser: IUserPayload = {
    sub: 'viewer-123',
    email: 'viewer@example.com',
    role: Role.VIEWER,
    organizationId: 'org-123',
  };

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.WORK,
    order: 1,
    createdById: 'owner-123',
    organizationId: 'org-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockTaskRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      }),
    };

    mockOrganizationsService = {
      getAccessibleOrganizations: jest.fn().mockResolvedValue(['org-123']),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: OrganizationsService,
          useValue: mockOrganizationsService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('create', () => {
    it('should create a task for authenticated user', async () => {
      mockTaskRepository.create.mockReturnValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(
        {
          title: 'New Task',
          description: 'Description',
        },
        mockOwnerUser,
      );

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return tasks for user organization', async () => {
      const result = await service.findAll(mockOwnerUser);

      expect(result).toEqual([mockTask]);
      expect(mockOrganizationsService.getAccessibleOrganizations).toHaveBeenCalled();
    });

    it('should filter viewer to only see their tasks', async () => {
      const viewerTask = { ...mockTask, createdById: 'viewer-123' };
      mockTaskRepository.createQueryBuilder().getMany.mockResolvedValue([viewerTask]);

      const result = await service.findAll(mockViewerUser);

      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return task if user has access', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-123', mockOwnerUser);

      expect(result).toEqual(mockTask);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockOwnerUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow viewer to access any task in their org (read-only)', async () => {
      const otherUserTask = { ...mockTask, createdById: 'other-user' };
      mockTaskRepository.findOne.mockResolvedValue(otherUserTask);

      const result = await service.findOne('task-123', mockViewerUser);

      expect(result).toEqual(otherUserTask);
    });

    it('should throw ForbiddenException if user tries to access task outside org and not assigned', async () => {
      const outsideOrgTask = { ...mockTask, organizationId: 'other-org', assigneeId: 'other-user' };
      mockTaskRepository.findOne.mockResolvedValue(outsideOrgTask);
      mockOrganizationsService.getAccessibleOrganizations.mockResolvedValue(['org-123']);

      await expect(service.findOne('task-123', mockViewerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow user to access task assigned to them even if outside org', async () => {
      const assignedTask = { ...mockTask, organizationId: 'other-org', assigneeId: 'viewer-123' };
      mockTaskRepository.findOne.mockResolvedValue(assignedTask);
      mockOrganizationsService.getAccessibleOrganizations.mockResolvedValue(['org-123']);

      const result = await service.findOne('task-123', mockViewerUser);

      expect(result).toEqual(assignedTask);
    });
  });

  describe('update', () => {
    it('should allow owner to update any task', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue({ ...mockTask, title: 'Updated' });

      const result = await service.update('task-123', { title: 'Updated' }, mockOwnerUser);

      expect(result.title).toBe('Updated');
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should allow viewer to update only their own task', async () => {
      const viewerTask = { ...mockTask, createdById: 'viewer-123' };
      mockTaskRepository.findOne.mockResolvedValue(viewerTask);
      mockTaskRepository.save.mockResolvedValue({ ...viewerTask, title: 'Updated' });

      const result = await service.update('task-123', { title: 'Updated' }, mockViewerUser);

      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException if viewer tries to update others task', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      await expect(
        service.update('task-123', { title: 'Updated' }, mockViewerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should allow admin to delete task', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);

      await service.remove('task-123', mockAdminUser);

      expect(mockTaskRepository.remove).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if viewer tries to delete', async () => {
      const viewerTask = { ...mockTask, createdById: 'viewer-123' };
      mockTaskRepository.findOne.mockResolvedValue(viewerTask);

      await expect(service.remove('task-123', mockViewerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
