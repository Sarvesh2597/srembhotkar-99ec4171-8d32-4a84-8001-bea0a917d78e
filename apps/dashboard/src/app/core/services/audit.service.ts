import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private api = inject(ApiService);

  private logsSignal = signal<AuditLog[]>([]);
  private loadingSignal = signal(false);

  logs = this.logsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  loadLogs(): Observable<AuditLog[]> {
    this.loadingSignal.set(true);
    return this.api.get<AuditLog[]>('audit-log').pipe(
      tap(logs => {
        this.logsSignal.set(logs);
        this.loadingSignal.set(false);
      })
    );
  }
}
