import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const enriched = request.clone({ setHeaders: { 'X-Request-ID': crypto.randomUUID(), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, withCredentials: true });
  return next(enriched);
};
