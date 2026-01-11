export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export interface IAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}
