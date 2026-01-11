import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, Role, Permission } from '@task-management/data';
import { Roles, RolesGuard, RequirePermissions, PermissionsGuard } from '@task-management/auth';
import { Public } from '../auth/public.decorator';

@Controller('organizations')
@UseGuards(RolesGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.OWNER)
  async create(@Body() createOrgDto: CreateOrganizationDto): Promise<Organization> {
    return this.organizationsService.create(createOrgDto);
  }

  @Get()
  @Public()
  async findAll(): Promise<Organization[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.ORG_READ)
  async findOne(@Param('id') id: string): Promise<Organization> {
    return this.organizationsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.OWNER)
  @RequirePermissions(Permission.ORG_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.update(id, updateOrgDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }
}
