import { Routes } from '@angular/router';
import { authGuard, publicGuard, adminGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'audit-log',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/audit/audit-log.component').then(m => m.AuditLogComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
