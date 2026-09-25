import { Routes } from '@angular/router';
import { authGuard } from '@fintrack/shared';
import { AppShellComponent } from './shared/ui/app-shell.component';
import { LoginComponent } from './features/settings/login.component';
import { remoteRoutes } from './remote.routes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Sign in · FinTrack' },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard], children: remoteRoutes,
  },
  { path: '**', redirectTo: '' },
];
