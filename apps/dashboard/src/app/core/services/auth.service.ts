import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organizationName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  firstName: string;
  lastName: string;
  organizationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  token = this.tokenSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());
  isOwner = computed(() => this.currentUserSignal()?.role === 'owner');
  isAdmin = computed(() => ['owner', 'admin'].includes(this.currentUserSignal()?.role || ''));

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSignal.set(token);
      this.currentUserSignal.set(JSON.parse(user));
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setAuth(response);
      })
    );
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap(response => {
        this.setAuth(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  private setAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.tokenSignal.set(response.accessToken);
    this.currentUserSignal.set(response.user);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
