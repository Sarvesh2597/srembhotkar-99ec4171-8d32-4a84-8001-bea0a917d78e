import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
  ReorderTaskDto,
  Permission,
  IUserPayload,
  Role,
} from '@task-management/data';
import {
  CurrentUser,
  RequirePermissions,
  PermissionsGuard,
  Roles,
  RolesGuard,
} from '@task-management/auth';

@Controller('tasks')
@UseGuards(RolesGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions(Permission.TASK_CREATE)
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: IUserPayload,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @RequirePermissions(Permission.TASK_READ)
  async findAll(
    @CurrentUser() user: IUserPayload,
    @Query() filterDto: TaskFilterDto,
  ): Promise<Task[]> {
    return this.tasksService.findAll(user, filterDto);
  }

  @Get('stats')
  @RequirePermissions(Permission.TASK_READ)
  async getStats(@CurrentUser() user: IUserPayload) {
    return this.tasksService.getTaskStats(user);
  }

  @Get(':id')
  @RequirePermissions(Permission.TASK_READ)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: IUserPayload,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user);
  }

  @Put('reorder')
  @RequirePermissions(Permission.TASK_UPDATE)
  async reorder(
    @Body() reorderDto: ReorderTaskDto,
    @CurrentUser() user: IUserPayload,
  ): Promise<Task> {
    return this.tasksService.reorder(reorderDto, user);
  }

  @Put(':id')
  @RequirePermissions(Permission.TASK_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: IUserPayload,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @RequirePermissions(Permission.TASK_DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: IUserPayload,
  ): Promise<void> {
    return this.tasksService.remove(id, user);
  }
}
