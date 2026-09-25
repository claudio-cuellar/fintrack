import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

interface TransactionView { id: string; description: string; category: string; member: string; date: string; amount: string; type: 'EXPENSE' | 'INCOME'; }

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header"><div><div class="eyebrow">{{ i18n.text('dashboard.month') }}</div><h1>{{ i18n.text('dashboard.goodMorning') }}</h1><p class="muted">{{ i18n.text('dashboard.subtitle') }}</p></div><a class="btn btn-primary" routerLink="/transactions" [queryParams]="{ add: 'expense' }">{{ i18n.text('dashboard.addExpense') }}</a></div>
      <section class="grid grid-4 stats" aria-label="Monthly totals">
        <div class="card card-pad"><div class="stat-label">{{ i18n.text('dashboard.totalIncome') }}</div><div class="stat-value">$5,200</div><div class="stat-foot positive">{{ i18n.text('dashboard.incomeChange') }}</div></div>
        <div class="card card-pad"><div class="stat-label">{{ i18n.text('dashboard.totalExpenses') }}</div><div class="stat-value">$3,420</div><div class="stat-foot negative">{{ i18n.text('dashboard.expenseChange') }}</div></div>
        <div class="card card-pad"><div class="stat-label">{{ i18n.text('dashboard.netBalance') }}</div><div class="stat-value">$1,780</div><div class="stat-foot positive">{{ i18n.text('dashboard.savingsRate') }}</div></div>
        <div class="card card-pad"><div class="stat-label">{{ i18n.text('dashboard.budgetRemaining') }}</div><div class="stat-value">$1,146</div><div class="stat-foot">{{ i18n.text('dashboard.budgetPlan') }}</div></div>
      </section>
      <section class="grid grid-2 insights">
        <div class="card card-pad"><div class="section-title"><div><h2>{{ i18n.text('dashboard.spendingByCategory') }}</h2><p class="muted">{{ i18n.text('dashboard.currentMonth') }}</p></div><a routerLink="/reports">{{ i18n.text('dashboard.viewReport') }}</a></div><div class="bars">@for (item of categories; track item.name) {<div class="bar-row"><div class="bar-meta"><span>{{ i18n.text(item.name) }}</span><strong>{{ item.amount }}</strong></div><div class="bar-track"><div class="bar-fill" [style.width.%]="item.percent"></div></div></div>}</div></div>
        <div class="card card-pad"><div class="section-title"><div><h2>{{ i18n.text('dashboard.budgetProgress') }}</h2><p class="muted">{{ i18n.text('dashboard.augustPlan') }}</p></div><a routerLink="/budgets">{{ i18n.text('dashboard.manage') }}</a></div><div class="budget-item"><div class="budget-meta"><span>{{ i18n.text('category.food') }}</span><strong>$420 / $600</strong></div><div class="progress"><span style="width:70%"></span></div><small>{{ i18n.text('dashboard.remaining', { amount: '$180' }) }}</small></div><div class="budget-item"><div class="budget-meta"><span>{{ i18n.text('category.transportation') }}</span><strong>$280 / $450</strong></div><div class="progress blue"><span style="width:62%"></span></div><small>{{ i18n.text('dashboard.remaining', { amount: '$170' }) }}</small></div><div class="budget-item"><div class="budget-meta"><span>{{ i18n.text('category.entertainment') }}</span><strong>$190 / $250</strong></div><div class="progress amber"><span style="width:76%"></span></div><small>{{ i18n.text('dashboard.remaining', { amount: '$60' }) }}</small></div></div>
      </section>
      <section class="card card-pad recent"><div class="section-title"><div><h2>{{ i18n.text('dashboard.recentTransactions') }}</h2><p class="muted">{{ i18n.text('dashboard.latestActivity') }}</p></div><a routerLink="/transactions">{{ i18n.text('dashboard.seeAllTransactions') }}</a></div><div class="table-wrap"><table><thead><tr><th>{{ i18n.text('table.transaction') }}</th><th>{{ i18n.text('table.category') }}</th><th>{{ i18n.text('table.addedBy') }}</th><th>{{ i18n.text('table.date') }}</th><th>{{ i18n.text('table.amount') }}</th></tr></thead><tbody>@for (item of recent; track item.id) {<tr><td><strong>{{ i18n.text(item.description) }}</strong></td><td><span class="tag">{{ i18n.text(item.category) }}</span></td><td>{{ i18n.text(item.member) }}</td><td>{{ i18n.text(item.date) }}</td><td [class.amount-expense]="item.type === 'EXPENSE'" [class.amount-income]="item.type === 'INCOME'">{{ item.type === 'EXPENSE' ? '-' : '+' }}{{ item.amount }}</td></tr>}</tbody></table></div></section>
    </div>
  `,
  styles: [`
    .stats { margin-bottom:1rem; } .positive { color:#059669; } .negative { color:#dc2626; }
    .insights { margin-bottom:1rem; } .section-title { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.3rem; } .section-title h2 { margin-bottom:.25rem; } .section-title p { margin:0; font-size:.8rem; } .section-title a { color:#2563eb; font-size:.8rem; font-weight:750; text-decoration:none; white-space:nowrap; }
    .bars { display:grid; gap:1rem; } .bar-row { display:grid; gap:.4rem; } .bar-meta, .budget-meta { display:flex; justify-content:space-between; gap:1rem; font-size:.83rem; } .bar-meta strong, .budget-meta strong { font-weight:800; }
    .bar-track, .progress { height:8px; border-radius:99px; background:#eff6ff; overflow:hidden; } .bar-fill { height:100%; border-radius:99px; background:#2563eb; }
    .budget-item { display:grid; gap:.45rem; margin-bottom:1.1rem; } .budget-item small { color:#64748b; font-size:.72rem; } .progress span { display:block; height:100%; border-radius:99px; background:#10b981; } .progress.blue span { background:#2563eb; } .progress.amber span { background:#f59e0b; }
    .tag { color:#475569; background:#f1f5f9; border-radius:999px; padding:.25rem .5rem; font-size:.72rem; font-weight:700; }
    .recent { margin-bottom:1rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly i18n = inject(I18nService);
  readonly categories = [{ name: 'category.housing', amount: '$920', percent: 82 }, { name: 'category.food', amount: '$640', percent: 68 }, { name: 'category.transportation', amount: '$480', percent: 51 }, { name: 'category.utilities', amount: '$360', percent: 38 }, { name: 'category.other', amount: '$1,020', percent: 29 }];
  readonly recent: TransactionView[] = [
    { id: '1', description: 'transaction.electricity', category: 'category.utilities', member: 'member.maria', date: 'date.aug12', amount: '$200.00', type: 'EXPENSE' },
    { id: '2', description: 'transaction.grocery', category: 'category.food', member: 'member.claudio', date: 'date.aug11', amount: '$126.40', type: 'EXPENSE' },
    { id: '3', description: 'transaction.salary', category: 'category.salary', member: 'member.claudio', date: 'date.aug10', amount: '$5,200.00', type: 'INCOME' },
    { id: '4', description: 'transaction.gas', category: 'category.transportation', member: 'member.juan', date: 'date.aug09', amount: '$74.20', type: 'EXPENSE' },
  ];
}
