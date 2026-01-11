export interface IOrganization {
  id: string;
  name: string;
  parentId?: string | null;
  parent?: IOrganization | null;
  children?: IOrganization[];
  createdAt: Date;
  updatedAt: Date;
}
