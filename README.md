# Secure Task Management System

A full-stack task management application with role-based access control (RBAC) built using NX monorepo, NestJS, Angular, and TailwindCSS.

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd srembhotkar-99ec4171-8d32-4a84-8001-bea0a917d78e

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in `apps/api/` (optional - defaults are provided):

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=3000
```

### Running the Application

**Start the Backend:**
```bash
npx nx serve api
```
The API runs at `http://localhost:3000/api`. The database is automatically seeded with demo data on first run.

**Start the Frontend:**
```bash
npx nx serve dashboard
```
The dashboard runs at `http://localhost:4200`

### Demo Credentials

| Email | Password | Role | Organization |
|-------|----------|------|--------------|
| sarah.mitchell@acme.com | password123 | Owner | Acme Corporation |
| james.wilson@acme.com | password123 | Admin | Technology Department |
| emily.chen@acme.com | password123 | Viewer | Technology Department |
| michael.brown@acme.com | password123 | Admin | Sales Department |

### Running Tests

```bash
# Backend tests
npx nx test api

# Auth library tests
npx nx test auth
```

## Architecture Overview

### NX Monorepo Structure

```
apps/
  api/              # NestJS backend
  dashboard/        # Angular frontend

libs/
  data/             # Shared TypeScript interfaces & DTOs
  auth/             # Reusable RBAC logic and decorators
```

### Shared Libraries

**libs/data** - Contains all shared interfaces, enums, and DTOs used by both frontend and backend:
- Role and Permission enums with hierarchy logic
- User, Task, Organization interfaces
- Request/Response DTOs for API endpoints

**libs/auth** - Contains reusable authentication and authorization components:
- `@Roles()` decorator for role-based route protection
- `@RequirePermissions()` decorator for permission-based access
- `@CurrentUser()` decorator to inject authenticated user
- `RolesGuard` and `PermissionsGuard` for request authorization

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
├─────────────────┤
│ id (PK)         │
│ name            │
│ parentId (FK)   │◄──┐ Self-referential
│ createdAt       │   │ (2-level hierarchy)
│ updatedAt       │───┘
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐         ┌─────────────────┐
│      User       │         │    AuditLog     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ userId          │
│ firstName       │         │ userEmail       │
│ lastName        │         │ action          │
│ password        │         │ resource        │
│ role            │         │ resourceId      │
│ organizationId  │         │ details         │
│ createdAt       │         │ ipAddress       │
│ updatedAt       │         │ timestamp       │
└────────┬────────┘         └─────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│      Task       │
├─────────────────┤
│ id (PK)         │
│ title           │
│ description     │
│ status          │
│ priority        │
│ category        │
│ dueDate         │
│ order           │
│ createdById     │
│ assigneeId      │
│ organizationId  │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### Schema Details

- **Organization**: Supports 2-level hierarchy (parent-child). Used for scoping task visibility.
- **User**: Belongs to one organization. Roles: `owner`, `admin`, `viewer`. Passwords hashed with bcrypt.
- **Task**: Status (`todo`, `in_progress`, `done`), Priority (`low`, `medium`, `high`), Category (`work`, `personal`, `urgent`, `other`).
- **AuditLog**: Records all CRUD operations with user info, action type, and timestamp.

## Access Control Implementation

### Role Hierarchy

```
Owner (Level 3)
  └── Admin (Level 2)
       └── Viewer (Level 1)
```

Higher roles inherit permissions from lower roles.

### Permission Matrix

| Permission | Owner | Admin | Viewer |
|------------|-------|-------|--------|
| task:create | ✓ | ✓ | ✗ |
| task:read | ✓ | ✓ | ✓ |
| task:update | ✓ | ✓ | ✗ |
| task:delete | ✓ | ✓ | ✗ |
| user:read | ✓ | ✓ | ✓ |
| audit:read | ✓ | ✓ | ✗ |

### Organization Hierarchy & Task Visibility

The system implements downward-only visibility:

- Parent org users can see tasks in their org + all child orgs
- Child org users can only see tasks in their own org
- Users can always see tasks assigned to them (cross-org assignment)

**Example:**
```
Acme Corporation (Parent)
├── Technology Department (Child)
└── Sales Department (Child)
```

Sarah (Owner, Acme Corp) sees all tasks. James (Admin, Tech Dept) sees only Tech Dept tasks + tasks assigned to him.

### JWT Integration

1. User logs in via `POST /api/auth/login`
2. Server validates credentials and returns JWT token
3. Token contains: `sub` (userId), `email`, `role`, `organizationId`
4. All protected routes require `Authorization: Bearer <token>`
5. `JwtAuthGuard` validates token, `RolesGuard`/`PermissionsGuard` check access

## API Documentation

### Authentication

#### POST /api/auth/login

```json
// Request
{
  "email": "sarah.mitchell@acme.com",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "sarah.mitchell@acme.com",
    "firstName": "Sarah",
    "lastName": "Mitchell",
    "role": "owner",
    "organizationId": "uuid"
  }
}
```

### Tasks

#### GET /api/tasks
List accessible tasks (scoped by role/org).

Query params: `status`, `priority`, `category`, `search`, `sortBy`, `sortOrder`

```json
// Response
[
  {
    "id": "uuid",
    "title": "Task Title",
    "description": "Description",
    "status": "todo",
    "priority": "high",
    "category": "work",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "createdBy": { "firstName": "Sarah", "lastName": "Mitchell" },
    "assignee": null
  }
]
```

#### POST /api/tasks
Create a new task. Requires `task:create` permission.

```json
// Request
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category": "work"
}
```

#### PUT /api/tasks/:id
Update a task. Requires `task:update` permission.

#### DELETE /api/tasks/:id
Delete a task. Requires `task:delete` permission.

### Audit Log

#### GET /api/audit-log
View access logs. Owner/Admin only.

```json
// Response
[
  {
    "id": "uuid",
    "userId": "uuid",
    "userEmail": "sarah.mitchell@acme.com",
    "action": "create",
    "resource": "task",
    "resourceId": "uuid",
    "details": "Created task: Task Title",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

## Future Considerations

### Security Enhancements
- **JWT Refresh Tokens**: Implement short-lived access tokens with refresh token rotation
- **CSRF Protection**: Add CSRF tokens for state-changing operations
- **Rate Limiting**: Add request rate limiting to prevent brute force attacks

### Performance
- **RBAC Caching**: Cache user permissions in Redis with invalidation on role changes
- **Database Indexing**: Add indexes on frequently queried columns
- **Pagination**: Implement cursor-based pagination for large task lists

### Features
- **Advanced Role Delegation**: Allow owners to create custom roles with fine-grained permissions
- **Task Collaboration**: Comments, attachments, real-time updates via WebSockets
- **Reporting**: Task completion trends, export to PDF/CSV
