import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './shared/ui/app-shell.component';
import { LoginComponent } from './features/settings/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TransactionsComponent } from './features/transactions/transactions.component';
import { AccountsComponent } from './features/accounts/accounts.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { FamilyComponent } from './features/family/family.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Sign in · FinTrack' },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard], children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · FinTrack' },
      { path: 'transactions', component: TransactionsComponent, title: 'Transactions · FinTrack' },
      { path: 'accounts', component: AccountsComponent, title: 'Accounts · FinTrack' },
      { path: 'categories', component: CategoriesComponent, title: 'Categories · FinTrack' },
      { path: 'family', component: FamilyComponent, title: 'Family · FinTrack' },
    ],
  },
  { path: '**', redirectTo: '' },
];
