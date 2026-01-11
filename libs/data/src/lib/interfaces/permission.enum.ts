export enum Permission {
  // Task permissions
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',

  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // Organization permissions
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',

  // Audit log permissions
  AUDIT_READ = 'audit:read',
}

export const RolePermissions: Record<string, Permission[]> = {
  owner: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.ORG_READ,
    Permission.ORG_UPDATE,
    Permission.AUDIT_READ,
  ],
  admin: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.USER_READ,
    Permission.ORG_READ,
    Permission.AUDIT_READ,
  ],
  viewer: [
    Permission.TASK_READ,
    Permission.USER_READ,
    Permission.ORG_READ,
  ],
};
