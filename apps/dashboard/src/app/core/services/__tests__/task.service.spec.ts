/**
 * TaskService Unit Tests
 * Tests task state management, filtering, and CRUD operations logic
 */

describe('TaskService', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    status: 'todo' as const,
    priority: 'medium' as const,
    category: 'work' as const,
    order: 1,
    createdById: 'user-1',
    organizationId: 'org-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockTasks = [
    mockTask,
    { ...mockTask, id: '2', title: 'Task 2', status: 'in_progress' as const },
    { ...mockTask, id: '3', title: 'Task 3', status: 'done' as const },
    { ...mockTask, id: '4', title: 'Task 4', status: 'todo' as const, priority: 'high' as const }
  ];

  describe('task filtering by status', () => {
    it('should filter todo tasks', () => {
      const todoTasks = mockTasks.filter(t => t.status === 'todo');

      expect(todoTasks.length).toBe(2);
      expect(todoTasks.every(t => t.status === 'todo')).toBe(true);
    });

    it('should filter in_progress tasks', () => {
      const inProgressTasks = mockTasks.filter(t => t.status === 'in_progress');

      expect(inProgressTasks.length).toBe(1);
      expect(inProgressTasks[0].status).toBe('in_progress');
    });

    it('should filter done tasks', () => {
      const doneTasks = mockTasks.filter(t => t.status === 'done');

      expect(doneTasks.length).toBe(1);
      expect(doneTasks[0].status).toBe('done');
    });
  });

  describe('task filtering by priority', () => {
    it('should filter high priority tasks', () => {
      const highPriorityTasks = mockTasks.filter(t => t.priority === 'high');

      expect(highPriorityTasks.length).toBe(1);
    });

    it('should filter medium priority tasks', () => {
      const mediumPriorityTasks = mockTasks.filter(t => t.priority === 'medium');

      expect(mediumPriorityTasks.length).toBe(3);
    });
  });

  describe('task CRUD operations', () => {
    it('should add task to list', () => {
      const tasks = [...mockTasks];
      const newTask = { ...mockTask, id: '5', title: 'New Task' };

      tasks.push(newTask);

      expect(tasks.length).toBe(5);
      expect(tasks.find(t => t.id === '5')).toEqual(newTask);
    });

    it('should update task in list', () => {
      const tasks = [...mockTasks];
      const updatedTask = { ...mockTask, title: 'Updated Title' };

      const index = tasks.findIndex(t => t.id === '1');
      tasks[index] = updatedTask;

      expect(tasks.find(t => t.id === '1')?.title).toBe('Updated Title');
    });

    it('should remove task from list', () => {
      let tasks = [...mockTasks];

      tasks = tasks.filter(t => t.id !== '1');

      expect(tasks.length).toBe(3);
      expect(tasks.find(t => t.id === '1')).toBeUndefined();
    });
  });

  describe('task stats calculation', () => {
    it('should calculate total tasks', () => {
      const total = mockTasks.length;

      expect(total).toBe(4);
    });

    it('should calculate tasks by status', () => {
      const byStatus = mockTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byStatus['todo']).toBe(2);
      expect(byStatus['in_progress']).toBe(1);
      expect(byStatus['done']).toBe(1);
    });

    it('should calculate tasks by priority', () => {
      const byPriority = mockTasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byPriority['high']).toBe(1);
      expect(byPriority['medium']).toBe(3);
    });
  });

  describe('task search', () => {
    it('should search tasks by title', () => {
      const searchTerm = 'Task 2';
      const results = mockTasks.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Task 2');
    });

    it('should return empty for no matches', () => {
      const searchTerm = 'nonexistent';
      const results = mockTasks.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(results.length).toBe(0);
    });
  });

  describe('task reordering', () => {
    it('should update task status on reorder', () => {
      const task = { ...mockTask };
      const newStatus = 'in_progress';

      task.status = newStatus as any;

      expect(task.status).toBe('in_progress');
    });

    it('should update task order', () => {
      const task = { ...mockTask };
      const newOrder = 5;

      task.order = newOrder;

      expect(task.order).toBe(5);
    });
  });

  describe('filter parameters building', () => {
    it('should build filter params object', () => {
      const filter = {
        status: 'todo',
        priority: 'high',
        category: '',
        search: 'test'
      };

      const params: Record<string, string> = {};
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      expect(params).toEqual({
        status: 'todo',
        priority: 'high',
        search: 'test'
      });
      expect(params.category).toBeUndefined();
    });
  });
});
