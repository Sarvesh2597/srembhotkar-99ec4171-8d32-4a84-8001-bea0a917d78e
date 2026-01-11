import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'urgent' | 'other';
  dueDate?: string;
  order: number;
  createdById: string;
  createdBy?: { firstName: string; lastName: string };
  assigneeId?: string;
  assignee?: { firstName: string; lastName: string };
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  order?: number;
}

export interface TaskFilter {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private api = inject(ApiService);

  private tasksSignal = signal<Task[]>([]);
  private statsSignal = signal<TaskStats | null>(null);
  private loadingSignal = signal(false);

  tasks = this.tasksSignal.asReadonly();
  stats = this.statsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  loadTasks(filter?: TaskFilter): Observable<Task[]> {
    this.loadingSignal.set(true);
    const params: Record<string, string> = {};
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
    }
    return this.api.get<Task[]>('tasks', params).pipe(
      tap(tasks => {
        this.tasksSignal.set(tasks);
        this.loadingSignal.set(false);
      })
    );
  }

  loadStats(): Observable<TaskStats> {
    return this.api.get<TaskStats>('tasks/stats').pipe(
      tap(stats => this.statsSignal.set(stats))
    );
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.api.post<Task>('tasks', task).pipe(
      tap(newTask => {
        this.tasksSignal.update(tasks => [...tasks, newTask]);
      })
    );
  }

  updateTask(id: string, updates: UpdateTaskDto): Observable<Task> {
    return this.api.put<Task>(`tasks/${id}`, updates).pipe(
      tap(updatedTask => {
        this.tasksSignal.update(tasks =>
          tasks.map(t => t.id === id ? updatedTask : t)
        );
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.api.delete<void>(`tasks/${id}`).pipe(
      tap(() => {
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      })
    );
  }

  reorderTask(taskId: string, newOrder: number, newStatus?: string): Observable<Task> {
    return this.api.put<Task>('tasks/reorder', { taskId, newOrder, newStatus }).pipe(
      tap(updatedTask => {
        this.tasksSignal.update(tasks =>
          tasks.map(t => t.id === taskId ? updatedTask : t)
        );
      })
    );
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasksSignal().filter(t => t.status === status);
  }
}
