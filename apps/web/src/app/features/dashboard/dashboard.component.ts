import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/workspace/workspace.service';

interface TransactionView { id: string; description: string; category: string; member: string; amount: string; type: 'EXPENSE' | 'INCOME'; date: string; }

@Component({
  standalone: true,
  template: `
    <div class="page">
      <div class="page-header"><div><div class="eyebrow">August 2026</div><h1>Good morning, {{ firstName }}.</h1><p class="muted">Here’s how your household is doing this month.</p></div><a class="btn btn-primary" routerLink="/transactions" [queryParams]="{ add: 'expense' }">＋ Add expense</a></div>
      <section class="grid grid-4 stats" aria-label="Monthly totals">
        <div class="card card-pad"><div class="stat-label">Total income</div><div class="stat-value">$5,200</div><div class="stat-foot positive">↑ 8.4% vs last month</div></div>
        <div class="card card-pad"><div class="stat-label">Total expenses</div><div class="stat-value">$3,420</div><div class="stat-foot negative">↑ 4.2% vs last month</div></div>
        <div class="card card-pad"><div class="stat-label">Net balance</div><div class="stat-value">$1,780</div><div class="stat-foot positive">34% savings rate</div></div>
        <div class="card card-pad"><div class="stat-label">Budget remaining</div><div class="stat-value">$1,146</div><div class="stat-foot">68% of monthly plan</div></div>
      </section>
      <section class="grid grid-2 insights">
        <div class="card card-pad"><div class="section-title"><div><h2>Spending by category</h2><p class="muted">Current month</p></div><a routerLink="/reports">View report</a></div><div class="bars">@for (item of categories; track item.name) {<div class="bar-row"><div class="bar-meta"><span>{{ item.name }}</span><strong>{{ item.amount }}</strong></div><div class="bar-track"><div class="bar-fill" [style.width.%]="item.percent"></div></div></div>}</div></div>
        <div class="card card-pad"><div class="section-title"><div><h2>Budget progress</h2><p class="muted">August plan</p></div><a routerLink="/budgets">Manage</a></div><div class="budget-item"><div class="budget-meta"><span>Food</span><strong>$420 / $600</strong></div><div class="progress"><span style="width:70%"></span></div><small>-$180 remaining</small></div><div class="budget-item"><div class="budget-meta"><span>Transportation</span><strong>$280 / $450</strong></div><div class="progress blue"><span style="width:62%"></span></div><small>-$170 remaining</small></div><div class="budget-item"><div class="budget-meta"><span>Entertainment</span><strong>$190 / $250</strong></div><div class="progress amber"><span style="width:76%"></span></div><small>-$60 remaining</small></div></div>
      </section>
      <section class="card card-pad recent"><div class="section-title"><div><h2>Recent transactions</h2><p class="muted">Latest activity across the workspace</p></div><a routerLink="/transactions">See all transactions →</a></div><div class="table-wrap"><table><thead><tr><th>Transaction</th><th>Category</th><th>Added by</th><th>Date</th><th>Amount</th></tr></thead><tbody>@for (item of recent; track item.id) {<tr><td><strong>{{ item.description }}</strong></td><td><span class="tag">{{ item.category }}</span></td><td>{{ item.member }}</td><td>{{ item.date }}</td><td [class.amount-expense]="item.type === 'EXPENSE'" [class.amount-income]="item.type === 'INCOME'">{{ item.type === 'EXPENSE' ? '-' : '+' }}{{ item.amount }}</td></tr>}</tbody></table></div></section>
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
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly workspace = inject(WorkspaceService);
  private readonly http = inject(HttpClient);
  readonly firstName = 'there';
  readonly categories = [{ name: 'Housing', amount: '$920', percent: 82 }, { name: 'Food', amount: '$640', percent: 68 }, { name: 'Transportation', amount: '$480', percent: 51 }, { name: 'Utilities', amount: '$360', percent: 38 }, { name: 'Other', amount: '$1,020', percent: 29 }];
  readonly recent: TransactionView[] = [
    { id: '1', description: 'Electricity bill', category: 'Utilities', member: 'Maria Cuellar', date: 'Aug 12, 2026', amount: '$200.00', type: 'EXPENSE' },
    { id: '2', description: 'Grocery run', category: 'Food', member: 'Claudio Cuellar', date: 'Aug 11, 2026', amount: '$126.40', type: 'EXPENSE' },
    { id: '3', description: 'Monthly salary', category: 'Salary', member: 'Claudio Cuellar', date: 'Aug 10, 2026', amount: '$5,200.00', type: 'INCOME' },
    { id: '4', description: 'Gas and parking', category: 'Transportation', member: 'Juan Cuellar', date: 'Aug 9, 2026', amount: '$74.20', type: 'EXPENSE' },
  ];
}
