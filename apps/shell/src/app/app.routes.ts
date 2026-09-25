import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './shared/ui/app-shell.component';
import { LoginComponent } from './features/settings/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AccountsComponent } from './features/accounts/accounts.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { FamilyComponent } from './features/family/family.component';
import { loadMfe, MfeManifest } from './core/federation/mfe-manifest';
import { MfeUnavailableComponent } from './core/federation/mfe-unavailable.component';

const expensesRoutes = () => loadMfe<{ remoteRoutes: Routes }>(
  (window as Window & { __fintrackMfeManifest?: MfeManifest }).__fintrackMfeManifest!,
  'expenses',
  './Routes',
).then((module) => module.remoteRoutes).catch(() => [{ path: '', component: MfeUnavailableComponent }]);

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Sign in · FinTrack' },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard], children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · FinTrack' },
      { path: 'expenses', loadChildren: expensesRoutes, title: 'Expenses · FinTrack' },
      { path: 'transactions', loadChildren: expensesRoutes, title: 'Transactions · FinTrack' },
      { path: 'accounts', component: AccountsComponent, title: 'Accounts · FinTrack' },
      { path: 'categories', component: CategoriesComponent, title: 'Categories · FinTrack' },
      { path: 'family', component: FamilyComponent, title: 'Family · FinTrack' },
    ],
  },
  { path: '**', redirectTo: '' },
];
