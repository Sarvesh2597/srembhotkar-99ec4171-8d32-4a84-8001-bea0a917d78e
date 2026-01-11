import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditService, AuditLog } from '../../core/services/audit.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900">
      <!-- Header -->
      <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo & Title -->
            <div class="flex items-center gap-3">
              <button (click)="goBack()" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <svg class="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
              </button>
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-bold text-slate-900 dark:text-white">Audit Log</h1>
                <span class="text-xs text-slate-500 dark:text-slate-400">Activity History</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
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

              <!-- User info -->
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {{ authService.currentUser()?.firstName?.charAt(0) }}{{ authService.currentUser()?.lastName?.charAt(0) }}
                </div>
                <div class="hidden sm:block">
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">
                    {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ authService.currentUser()?.role | uppercase }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="card">
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Total Logs</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">{{ auditService.logs().length }}</p>
          </div>
          <div class="card">
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Creates</p>
            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ countByAction('create') }}</p>
          </div>
          <div class="card">
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Updates</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ countByAction('update') }}</p>
          </div>
          <div class="card">
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Deletes</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{{ countByAction('delete') }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4 items-center mb-6">
          <div class="relative">
            <select [(ngModel)]="filterAction" class="input w-auto pr-10 appearance-none">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          <div class="relative">
            <select [(ngModel)]="filterResource" class="input w-auto pr-10 appearance-none">
              <option value="">All Resources</option>
              <option value="task">Tasks</option>
              <option value="auth">Auth</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          <span class="text-sm text-slate-500 dark:text-slate-400">
            Showing {{ filteredLogs().length }} of {{ auditService.logs().length }} logs
          </span>
        </div>

        <!-- Logs Table -->
        <div class="card overflow-hidden p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Timestamp</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Action</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Resource</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                @for (log of filteredLogs(); track log.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {{ formatDate(log.timestamp) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                          {{ getInitials(log.userEmail) }}
                        </div>
                        <span class="text-sm text-slate-900 dark:text-slate-100">{{ log.userEmail }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getActionBadgeClass(log.action)">
                        {{ log.action | uppercase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {{ log.resource }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {{ log.details || '-' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <svg class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <p>No audit logs found</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  auditService = inject(AuditService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  filterAction = '';
  filterResource = '';

  filteredLogs = computed(() => {
    let logs = this.auditService.logs();
    if (this.filterAction) {
      logs = logs.filter(l => l.action.toLowerCase() === this.filterAction.toLowerCase());
    }
    if (this.filterResource) {
      logs = logs.filter(l => l.resource.toLowerCase() === this.filterResource.toLowerCase());
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  ngOnInit(): void {
    this.auditService.loadLogs().subscribe();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  countByAction(action: string): number {
    return this.auditService.logs().filter(l => l.action.toLowerCase() === action.toLowerCase()).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(email: string): string {
    const name = email.split('@')[0];
    const parts = name.split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getActionBadgeClass(action: string): string {
    const base = 'badge';
    switch (action.toLowerCase()) {
      case 'create': return `${base} badge-green`;
      case 'update': return `${base} badge-blue`;
      case 'delete': return `${base} badge-red`;
      case 'read': return `${base} badge-gray`;
      case 'login': return `${base} badge-purple`;
      default: return `${base} badge-gray`;
    }
  }
}
