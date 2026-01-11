import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Role, Permission } from '@task-management/data';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  it('should allow access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: Role.VIEWER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow owner access to owner-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OWNER]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.OWNER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny viewer access to owner-required route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OWNER]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.VIEWER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow higher role access due to role hierarchy', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.OWNER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as any;
  };

  it('should allow access when no permissions required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: Role.VIEWER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow owner access to any permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.TASK_DELETE]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.OWNER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny viewer access to delete permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.TASK_DELETE]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.VIEWER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow viewer read permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.TASK_READ]);
    const context = createMockContext({
      sub: '123',
      email: 'test@test.com',
      role: Role.VIEWER,
      organizationId: 'org-123',
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
