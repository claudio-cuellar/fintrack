import { Routes } from '@angular/router';
import { TransactionsComponent } from './features/transactions/transactions.component';

export const remoteRoutes: Routes = [
  { path: '', component: TransactionsComponent, title: 'Expenses · FinTrack' },
  { path: 'new', component: TransactionsComponent, title: 'New expense · FinTrack' },
];
