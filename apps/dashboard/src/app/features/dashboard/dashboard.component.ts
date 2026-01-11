import { Component, inject, OnInit, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService, Task, TaskFilter, CreateTaskDto } from '../../core/services/task.service';
import { ThemeService } from '../../core/services/theme.service';
import { TaskCardComponent } from '../tasks/task-card.component';
import { TaskFormComponent } from '../tasks/task-form.component';
import { ChartComponent } from '../../shared/components/chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, TaskCardComponent, TaskFormComponent, ChartComponent],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900">
      <!-- Header -->
      <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo & Title -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-bold text-slate-900 dark:text-white">TaskFlow</h1>
                <span class="text-xs text-slate-500 dark:text-slate-400">Task Management</span>
              </div>
              <span [class]="getRoleBadgeClass()" class="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg">
                {{ authService.currentUser()?.role | uppercase }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <!-- Search -->
              <div class="relative hidden sm:block">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="onSearchChange()"
                  placeholder="Search tasks..."
                  class="input pl-10 pr-4 w-64 text-sm"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
                  {{ modKey }}K
                </kbd>
              </div>

              <!-- Audit Log (Admin/Owner only) -->
              @if (authService.isAdmin()) {
                <button
                  (click)="goToAuditLog()"
                  class="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/25"
                  title="View Audit Log"
                >
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span class="text-sm font-medium text-white hidden sm:inline">Audit Log</span>
                </button>
              }

              <!-- Dark mode toggle -->
              <button
                (click)="themeService.toggleDarkMode()"
                class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                [title]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                @if (themeService.isDarkMode()) {
                  <svg class="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                  </svg>
                } @else {
                  <svg class="h-5 w-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                }
              </button>

              <!-- Divider -->
              <div class="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

              <!-- User menu -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/25">
                  {{ authService.currentUser()?.firstName?.charAt(0) }}{{ authService.currentUser()?.lastName?.charAt(0) }}
                </div>
                <div class="hidden sm:block">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">
                    {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                  </p>
                  @if (authService.currentUser()?.organizationName) {
                    <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{{ authService.currentUser()?.organizationName }}</p>
                  }
                </div>
                <button
                  (click)="logout()"
                  class="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Logout"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Total Tasks -->
          <div class="card group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ taskService.stats()?.total || 0 }}</p>
          </div>

          <!-- To Do -->
          <div class="card group hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">To Do</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ taskService.stats()?.byStatus?.['todo'] || 0 }}</p>
          </div>

          <!-- In Progress -->
          <div class="card group hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/50 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</p>
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ taskService.stats()?.byStatus?.['in_progress'] || 0 }}</p>
          </div>

          <!-- Done -->
          <div class="card group hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/50 transition-all duration-300">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ taskService.stats()?.byStatus?.['done'] || 0 }}</p>
          </div>
        </div>

        <!-- Chart -->
        @if (taskService.stats()) {
          <div class="card mb-8">
            <div class="flex items-center gap-2 mb-4">
              <svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Task Overview</h3>
            </div>
            <app-chart [stats]="taskService.stats()!"></app-chart>
          </div>
        }

        <!-- Filters & Actions -->
        <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div class="flex flex-wrap gap-3">
            <div class="relative">
              <select [(ngModel)]="filter.category" (ngModelChange)="applyFilter()" class="input w-auto pr-10 appearance-none">
                <option value="">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="urgent">Urgent</option>
                <option value="other">Other</option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>

            <div class="relative">
              <select [(ngModel)]="filter.priority" (ngModelChange)="applyFilter()" class="input w-auto pr-10 appearance-none">
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          @if (authService.isAdmin()) {
            <button (click)="showTaskForm.set(true)" class="btn btn-primary">
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              New Task
            </button>
          }
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <!-- To Do Column -->
          <div class="kanban-column">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
              <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">To Do</h2>
              <span class="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                {{ todoTasks().length }}
              </span>
            </div>
            <div
              cdkDropList
              #todoList="cdkDropList"
              [cdkDropListData]="todoTasks()"
              [cdkDropListConnectedTo]="[inProgressList, doneList]"
              (cdkDropListDropped)="drop($event, 'todo')"
              class="min-h-[200px] flex-1 pb-8"
            >
              @for (task of todoTasks(); track task.id) {
                <app-task-card
                  cdkDrag
                  [task]="task"
                  (edit)="editTask($event)"
                  (delete)="deleteTask($event)"
                ></app-task-card>
              }
              @if (todoTasks().length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg class="h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <p class="text-sm">No tasks to do</p>
                </div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="kanban-column">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
              <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">In Progress</h2>
              <span class="ml-auto px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                {{ inProgressTasks().length }}
              </span>
            </div>
            <div
              cdkDropList
              #inProgressList="cdkDropList"
              [cdkDropListData]="inProgressTasks()"
              [cdkDropListConnectedTo]="[todoList, doneList]"
              (cdkDropListDropped)="drop($event, 'in_progress')"
              class="min-h-[200px] flex-1 pb-8"
            >
              @for (task of inProgressTasks(); track task.id) {
                <app-task-card
                  cdkDrag
                  [task]="task"
                  (edit)="editTask($event)"
                  (delete)="deleteTask($event)"
                ></app-task-card>
              }
              @if (inProgressTasks().length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg class="h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm">No tasks in progress</p>
                </div>
              }
            </div>
          </div>

          <!-- Done Column -->
          <div class="kanban-column">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
              <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200">Completed</h2>
              <span class="ml-auto px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                {{ doneTasks().length }}
              </span>
            </div>
            <div
              cdkDropList
              #doneList="cdkDropList"
              [cdkDropListData]="doneTasks()"
              [cdkDropListConnectedTo]="[todoList, inProgressList]"
              (cdkDropListDropped)="drop($event, 'done')"
              class="min-h-[200px] flex-1 pb-8"
            >
              @for (task of doneTasks(); track task.id) {
                <app-task-card
                  cdkDrag
                  [task]="task"
                  (edit)="editTask($event)"
                  (delete)="deleteTask($event)"
                ></app-task-card>
              }
              @if (doneTasks().length === 0) {
                <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg class="h-12 w-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm">No completed tasks</p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Keyboard shortcuts -->
        <div class="mt-10 flex items-center justify-center gap-6 text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">{{ modKey }}N</kbd>
            <span>New task</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">{{ modKey }}K</kbd>
            <span>Search</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">{{ modKey }}D</kbd>
            <span>{{ themeService.isDarkMode() ? 'Light mode' : 'Dark mode' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </main>

      <!-- Task Form Modal -->
      @if (showTaskForm()) {
        <app-task-form
          [task]="editingTask()"
          (save)="onTaskSave($event)"
          (cancel)="closeTaskForm()"
        ></app-task-form>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  showTaskForm = signal(false);
  editingTask = signal<Task | null>(null);
  searchQuery = '';
  filter: TaskFilter = { category: '', priority: '' };

  modKey = navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl+';

  todoTasks = computed(() => this.taskService.tasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.taskService.tasks().filter(t => t.status === 'in_progress'));
  doneTasks = computed(() => this.taskService.tasks().filter(t => t.status === 'done'));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.taskService.loadTasks(this.filter).subscribe();
    this.taskService.loadStats().subscribe();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'n' && this.authService.isAdmin()) {
      event.preventDefault();
      this.showTaskForm.set(true);
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.themeService.toggleDarkMode();
    }
    if (event.key === 'Escape') {
      this.closeTaskForm();
    }
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.taskService.reorderTask(task.id, event.currentIndex, newStatus).subscribe({
        next: () => {
          this.taskService.loadStats().subscribe();
        },
        error: () => {
          this.loadData();
        }
      });
    }
  }

  editTask(task: Task): void {
    this.editingTask.set(task);
    this.showTaskForm.set(true);
  }

  deleteTask(task: Task): void {
    if (confirm(`Delete task "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => this.taskService.loadStats().subscribe()
      });
    }
  }

  onTaskSave(taskData: CreateTaskDto): void {
    const editing = this.editingTask();
    if (editing) {
      this.taskService.updateTask(editing.id, taskData).subscribe({
        next: () => {
          this.closeTaskForm();
          this.loadData();
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.closeTaskForm();
          this.loadData();
        }
      });
    }
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.editingTask.set(null);
  }

  onSearchChange(): void {
    this.filter.search = this.searchQuery;
    this.applyFilter();
  }

  applyFilter(): void {
    this.taskService.loadTasks(this.filter).subscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(): string {
    const role = this.authService.currentUser()?.role;
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'admin': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  }

  goToAuditLog(): void {
    this.router.navigate(['/audit-log']);
  }
}
