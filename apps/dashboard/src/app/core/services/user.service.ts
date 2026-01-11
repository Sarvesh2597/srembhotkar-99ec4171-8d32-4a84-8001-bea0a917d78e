import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'viewer';
  organizationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(ApiService);

  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal(false);

  users = this.usersSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  loadUsers(): Observable<User[]> {
    this.loadingSignal.set(true);
    return this.api.get<User[]>('users').pipe(
      tap(users => {
        this.usersSignal.set(users);
        this.loadingSignal.set(false);
      })
    );
  }

  getUser(id: string): Observable<User> {
    return this.api.get<User>(`users/${id}`);
  }
}
