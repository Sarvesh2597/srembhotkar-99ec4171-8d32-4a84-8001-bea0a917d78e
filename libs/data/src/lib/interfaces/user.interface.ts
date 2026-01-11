import { Role } from './role.enum';
import { IOrganization } from './organization.interface';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: Role;
  organizationId: string;
  organization?: IOrganization;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId: string;
}
