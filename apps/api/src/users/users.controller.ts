import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, Role, Permission, IUserPayload } from '@task-management/data';
import { Roles, RolesGuard, RequirePermissions, PermissionsGuard, CurrentUser } from '@task-management/auth';
import { OrganizationsService } from '../organizations/organizations.service';

@Controller('users')
@UseGuards(RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @Roles(Role.OWNER)
  @RequirePermissions(Permission.USER_CREATE)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @RequirePermissions(Permission.USER_READ)
  async findAll(@CurrentUser() user: IUserPayload): Promise<User[]> {
    const orgIds = await this.organizationsService.getAccessibleOrganizations(user.organizationId);
    return this.usersService.findAll(orgIds);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: IUserPayload): Promise<User> {
    return this.usersService.findOne(user.sub);
  }

  @Get(':id')
  @RequirePermissions(Permission.USER_READ)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @RequirePermissions(Permission.USER_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @RequirePermissions(Permission.USER_DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
