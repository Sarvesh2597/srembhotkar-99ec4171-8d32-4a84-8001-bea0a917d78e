export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.OWNER]: 3,
  [Role.ADMIN]: 2,
  [Role.VIEWER]: 1,
};

export function hasHigherOrEqualRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}
