import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { Role, TaskStatus, TaskPriority, TaskCategory } from '@task-management/data';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async onModuleInit() {
    const existingOrgs = await this.organizationRepository.count();
    if (existingOrgs === 0) {
      this.logger.log('Empty database detected, auto-seeding...');
      const result = await this.seedDatabase();
      this.logger.log(result.message);
    } else {
      this.logger.log('Database already contains data, skipping auto-seed');
    }
  }

  getData(): { message: string } {
    return { message: 'Task Management API is running!' };
  }

  async seedDatabase() {
    const existingOrgs = await this.organizationRepository.count();
    if (existingOrgs > 0) {
      return { message: 'Database already seeded' };
    }

    const parentOrg = await this.organizationRepository.save({
      name: 'Acme Corporation',
    });

    const techDept = await this.organizationRepository.save({
      name: 'Technology Department',
      parentId: parentOrg.id,
    });

    const salesDept = await this.organizationRepository.save({
      name: 'Sales Department',
      parentId: parentOrg.id,
    });

    const hashedPassword = await bcrypt.hash('password123', 10);

    const owner = await this.userRepository.save({
      email: 'sarah.mitchell@acme.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: Role.OWNER,
      organizationId: parentOrg.id,
    });

    const admin = await this.userRepository.save({
      email: 'james.wilson@acme.com',
      password: hashedPassword,
      firstName: 'James',
      lastName: 'Wilson',
      role: Role.ADMIN,
      organizationId: techDept.id,
    });

    const viewer = await this.userRepository.save({
      email: 'emily.chen@acme.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Chen',
      role: Role.VIEWER,
      organizationId: techDept.id,
    });

    const salesAdmin = await this.userRepository.save({
      email: 'michael.brown@acme.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Brown',
      role: Role.ADMIN,
      organizationId: salesDept.id,
    });

    const tasks = [
      {
        title: 'Set up project infrastructure',
        description: 'Configure CI/CD pipeline and deployment',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        createdById: owner.id,
        organizationId: parentOrg.id,
        order: 1,
      },
      {
        title: 'Design system architecture',
        description: 'Create technical design document',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        createdById: admin.id,
        assigneeId: admin.id,
        organizationId: techDept.id,
        order: 2,
      },
      {
        title: 'Implement authentication',
        description: 'Set up JWT-based authentication',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        createdById: admin.id,
        organizationId: techDept.id,
        order: 3,
      },
      {
        title: 'Create user dashboard',
        description: 'Build the main dashboard UI',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.WORK,
        createdById: admin.id,
        assigneeId: viewer.id,
        organizationId: techDept.id,
        order: 4,
      },
      {
        title: 'Review quarterly report',
        description: 'Review and approve Q4 sales report',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.WORK,
        createdById: salesAdmin.id,
        organizationId: salesDept.id,
        order: 5,
      },
      {
        title: 'Prepare client presentation',
        description: 'Create slides for upcoming client meeting',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        category: TaskCategory.WORK,
        createdById: salesAdmin.id,
        assigneeId: salesAdmin.id,
        organizationId: salesDept.id,
        order: 7,
      },
      {
        title: 'Schedule team meeting',
        description: 'Organize weekly sync meeting',
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        category: TaskCategory.PERSONAL,
        createdById: admin.id,
        assigneeId: viewer.id,
        organizationId: techDept.id,
        order: 6,
      },
    ];

    for (const task of tasks) {
      await this.taskRepository.save(task);
    }

    return {
      message: 'Database seeded successfully',
      data: {
        organizations: 3,
        users: 4,
        tasks: tasks.length,
        credentials: [
          { email: 'sarah.mitchell@acme.com', password: 'password123', role: 'owner', org: 'Acme Corporation' },
          { email: 'james.wilson@acme.com', password: 'password123', role: 'admin', org: 'Technology Department' },
          { email: 'emily.chen@acme.com', password: 'password123', role: 'viewer', org: 'Technology Department' },
          { email: 'michael.brown@acme.com', password: 'password123', role: 'admin', org: 'Sales Department' },
        ],
      },
    };
  }
}
