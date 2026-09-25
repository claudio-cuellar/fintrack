import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface SessionUser { id: string; email: string; firstName: string; lastName: string; }
interface AuthResponse { data: { accessToken: string; user: SessionUser }; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<SessionUser | null>(this.readUser());
  private accessToken = localStorage.getItem('fintrack.accessToken');
  private readonly api = '/api/v1';
  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  isAuthenticated(): boolean { return Boolean(this.accessToken && this.user()); }
  token(): string | null { return this.accessToken; }
  login(email: string, password: string): Observable<AuthResponse> { return this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password }, { withCredentials: true }).pipe(tap((response) => this.store(response.data))); }
  register(input: { email: string; password: string; firstName: string; lastName: string }): Observable<AuthResponse> { return this.http.post<AuthResponse>(`${this.api}/auth/register`, input, { withCredentials: true }).pipe(tap((response) => this.store(response.data))); }
  logout(): void { this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }).subscribe({ complete: () => this.clear() }); this.clear(); }
  clear(): void { this.accessToken = null; this.user.set(null); localStorage.removeItem('fintrack.accessToken'); localStorage.removeItem('fintrack.user'); void this.router.navigateByUrl('/login'); }
  private store(data: AuthResponse['data']): void { this.accessToken = data.accessToken; this.user.set(data.user); localStorage.setItem('fintrack.accessToken', data.accessToken); localStorage.setItem('fintrack.user', JSON.stringify(data.user)); }
  private readUser(): SessionUser | null { try { return JSON.parse(localStorage.getItem('fintrack.user') || 'null') as SessionUser | null; } catch { return null; } }
}
