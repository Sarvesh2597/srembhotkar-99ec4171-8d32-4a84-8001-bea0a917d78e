import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '@task-management/data';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrgDto: CreateOrganizationDto): Promise<Organization> {
    const org = this.organizationRepository.create(createOrgDto);
    return this.organizationRepository.save(org);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return org;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOne(id);
    Object.assign(org, updateOrgDto);
    return this.organizationRepository.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);
    await this.organizationRepository.remove(org);
  }

  async getOrganizationHierarchy(organizationId: string): Promise<string[]> {
    const orgIds: string[] = [organizationId];

    const children = await this.organizationRepository.find({
      where: { parentId: organizationId },
    });

    children.forEach((child) => orgIds.push(child.id));

    return orgIds;
  }

  async getAccessibleOrganizations(organizationId: string): Promise<string[]> {
    return this.getOrganizationHierarchy(organizationId);
  }
}
