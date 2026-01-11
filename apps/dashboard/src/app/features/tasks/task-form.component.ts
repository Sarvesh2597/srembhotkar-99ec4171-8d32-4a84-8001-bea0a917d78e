import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CreateTaskDto } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" (click)="cancel.emit()">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              @if (task) {
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              } @else {
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              }
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                {{ task ? 'Edit Task' : 'Create New Task' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ task ? 'Update the task details below' : 'Fill in the task details below' }}
              </p>
            </div>
          </div>
          <button
            (click)="cancel.emit()"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6">
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  class="input pl-11"
                  placeholder="What needs to be done?"
                />
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                [(ngModel)]="formData.description"
                name="description"
                rows="3"
                class="input resize-none"
                placeholder="Add more details about this task..."
              ></textarea>
            </div>

            <!-- Assignee -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assign To
              </label>
              <div class="relative">
                <select [(ngModel)]="formData.assigneeId" name="assigneeId" class="input pl-11 pr-10 appearance-none">
                  <option value="">Unassigned</option>
                  @for (user of users(); track user.id) {
                    <option [value]="user.id">
                      @if (user.id === currentUserId()) {
                        Myself ({{ user.firstName }} {{ user.lastName }})
                      } @else {
                        {{ user.firstName }} {{ user.lastName }}
                      }
                    </option>
                  }
                </select>
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Status & Priority -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <div class="relative">
                  <select [(ngModel)]="formData.status" name="status" class="input pr-10 appearance-none">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <div class="relative">
                  <select [(ngModel)]="formData.priority" name="priority" class="input pr-10 appearance-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Category & Due Date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <div class="relative">
                  <select [(ngModel)]="formData.category" name="category" class="input pr-10 appearance-none">
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="urgent">Urgent</option>
                    <option value="other">Other</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Due Date
                </label>
                <div class="relative">
                  <input
                    type="date"
                    [(ngModel)]="formData.dueDate"
                    name="dueDate"
                    class="input"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button type="button" (click)="cancel.emit()" class="btn btn-secondary">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="!formData.title">
                @if (task) {
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Update Task
                } @else {
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Create Task
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<CreateTaskDto>();
  @Output() cancel = new EventEmitter<void>();

  private userService = inject(UserService);
  private authService = inject(AuthService);
  users = this.userService.users;
  currentUserId = () => this.authService.currentUser()?.id;

  formData: CreateTaskDto = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'work',
    dueDate: '',
    assigneeId: ''
  };

  ngOnInit(): void {
    this.userService.loadUsers().subscribe();

    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        category: this.task.category,
        dueDate: this.task.dueDate ? this.task.dueDate.split('T')[0] : '',
        assigneeId: this.task.assigneeId || ''
      };
    }
  }

  onSubmit(): void {
    if (this.formData.title) {
      const data: any = { ...this.formData };
      if (!data.dueDate) {
        delete data.dueDate;
      }
      if (data.assigneeId === '') {
        data.assigneeId = null;
      }
      this.save.emit(data);
    }
  }
}
