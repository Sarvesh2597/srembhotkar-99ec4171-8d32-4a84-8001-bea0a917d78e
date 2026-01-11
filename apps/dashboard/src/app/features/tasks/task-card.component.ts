import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card group mb-3">
      <!-- Header with title and actions -->
      <div class="flex justify-between items-start gap-2 mb-3">
        <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">
          {{ task.title }}
        </h3>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          @if (canEdit()) {
            <button
              (click)="edit.emit(task); $event.stopPropagation()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
              title="Edit task"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          }
          @if (canDelete()) {
            <button
              (click)="delete.emit(task); $event.stopPropagation()"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              title="Delete task"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Description -->
      @if (task.description) {
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
          {{ task.description }}
        </p>
      }

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5 items-center mb-3">
        <span [class]="getPriorityClass()">
          <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            @if (task.priority === 'high') {
              <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            } @else if (task.priority === 'medium') {
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            } @else {
              <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            }
          </svg>
          {{ task.priority }}
        </span>
        <span [class]="getCategoryClass()">
          <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (task.category === 'work') {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            } @else if (task.category === 'personal') {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            } @else if (task.category === 'urgent') {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            }
          </svg>
          {{ task.category }}
        </span>
      </div>

      <!-- Footer - Created By & Assigned To -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-600 space-y-2">
        <!-- Created By -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Created by</span>
          <div class="flex items-center gap-1.5">
            @if (task.createdBy) {
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-[10px] font-medium">
                {{ task.createdBy.firstName?.charAt(0) }}{{ task.createdBy.lastName?.charAt(0) }}
              </div>
              <span class="text-xs text-slate-700 dark:text-slate-300 font-medium">
                @if (task.createdById === authService.currentUser()?.id) {
                  You
                } @else {
                  {{ task.createdBy.firstName }} {{ task.createdBy.lastName }}
                }
              </span>
            }
          </div>
        </div>

        <!-- Assigned To -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned to</span>
          <div class="flex items-center gap-1.5">
            @if (task.assignee) {
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-medium">
                {{ task.assignee.firstName?.charAt(0) }}{{ task.assignee.lastName?.charAt(0) }}
              </div>
              <span class="text-xs text-slate-700 dark:text-slate-300 font-medium">
                @if (task.assigneeId === authService.currentUser()?.id) {
                  You
                } @else {
                  {{ task.assignee.firstName }} {{ task.assignee.lastName }}
                }
              </span>
            } @else {
              <span class="text-xs text-slate-500 italic">Unassigned</span>
            }
          </div>
        </div>

        <!-- Due Date -->
        @if (task.dueDate) {
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Due date</span>
            <div [class]="getDueDateClass()" class="flex items-center gap-1">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-xs font-medium">{{ formatDate(task.dueDate) }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  authService = inject(AuthService);

  canEdit(): boolean {
    return this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.authService.isAdmin();
  }

  getPriorityClass(): string {
    const base = 'badge inline-flex items-center capitalize';
    switch (this.task.priority) {
      case 'high': return `${base} badge-red`;
      case 'medium': return `${base} badge-yellow`;
      case 'low': return `${base} badge-green`;
      default: return `${base} badge-gray`;
    }
  }

  getCategoryClass(): string {
    const base = 'badge inline-flex items-center capitalize';
    switch (this.task.category) {
      case 'work': return `${base} badge-blue`;
      case 'personal': return `${base} badge-purple`;
      case 'urgent': return `${base} badge-red`;
      default: return `${base} badge-gray`;
    }
  }

  getDueDateClass(): string {
    if (!this.task.dueDate) return 'text-slate-400';
    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return 'text-red-500';
    } else if (dueDate.getTime() === today.getTime()) {
      return 'text-amber-500';
    }
    return 'text-slate-500 dark:text-slate-400';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
