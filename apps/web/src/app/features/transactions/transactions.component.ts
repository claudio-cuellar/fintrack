import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TransactionRow { id: string; description: string; category: string; account: string; member: string; date: string; amount: string; type: 'EXPENSE' | 'INCOME'; }

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header"><div><div class="eyebrow">Workspace ledger</div><h1>Transactions</h1><p class="muted">Track every expense, income, and transfer in one place.</p></div><button class="btn btn-primary" (click)="showForm.set(true)">＋ Add expense</button></div>
      @if (showForm()) { <section class="card card-pad composer"><div class="section-title"><div><h2>New expense</h2><p class="muted">Fast entry keeps your records current.</p></div><button class="btn btn-ghost" type="button" (click)="showForm.set(false)">Close</button></div><form class="form-grid" (ngSubmit)="save()"><div class="field"><label for="amount">Amount</label><input id="amount" name="amount" type="number" min="0.01" step="0.01" [(ngModel)]="draft.amount" required /></div><div class="field"><label for="date">Date</label><input id="date" name="date" type="date" [(ngModel)]="draft.date" required /></div><div class="field"><label for="category">Category</label><select id="category" name="category" [(ngModel)]="draft.category"><option>Food</option><option>Housing</option><option>Transportation</option><option>Utilities</option><option>Other</option></select></div><div class="field"><label for="account">Account</label><select id="account" name="account" [(ngModel)]="draft.account"><option>Shared Checking</option><option>Cash</option><option>Credit Card</option></select></div><div class="field full"><label for="description">Description</label><input id="description" name="description" [(ngModel)]="draft.description" placeholder="What was this expense for?" required /></div><div class="actions full"><button class="btn btn-secondary" type="button" (click)="showForm.set(false)">Cancel</button><button class="btn btn-primary" type="submit">Save expense</button></div></form></section> }
      <section class="card card-pad"><div class="filters"><div class="search"><span>⌕</span><input aria-label="Search transactions" placeholder="Search transactions" [(ngModel)]="search" /></div><select aria-label="Filter category"><option>All categories</option><option>Food</option><option>Housing</option><option>Transportation</option></select><select aria-label="Filter member"><option>All members</option><option>Claudio</option><option>Maria</option><option>Juan</option></select></div><div class="table-wrap"><table><thead><tr><th>Transaction</th><th>Category</th><th>Account</th><th>Added by</th><th>Date</th><th>Amount</th><th></th></tr></thead><tbody>@for (item of filtered(); track item.id) {<tr><td><strong>{{ item.description }}</strong></td><td>{{ item.category }}</td><td>{{ item.account }}</td><td>{{ item.member }}</td><td>{{ item.date }}</td><td [class.amount-expense]="item.type === 'EXPENSE'" [class.amount-income]="item.type === 'INCOME'">{{ item.type === 'EXPENSE' ? '-' : '+' }}{{ item.amount }}</td><td><button class="icon-btn" aria-label="More actions">•••</button></td></tr>}</tbody></table></div>@if (!filtered().length) { <div class="empty">No transactions match these filters.</div> }<div class="pagination"><span>Showing {{ filtered().length }} of 248 transactions</span><button class="btn btn-secondary">Load more</button></div></section>
    </div>
  `,
  styles: [`
    .composer { margin-bottom:1rem; border-color:#bfdbfe; box-shadow:0 12px 30px rgba(37,99,235,.08); } .section-title { display:flex; justify-content:space-between; gap:1rem; margin-bottom:1.2rem; } .section-title h2 { margin-bottom:.25rem; } .section-title p { margin:0; font-size:.8rem; }
    .filters { display:flex; flex-wrap:wrap; gap:.65rem; margin-bottom:1rem; } .filters select, .search { min-height:2.5rem; border:1px solid #e2e8f0; border-radius:10px; background:#fff; color:#334155; padding:.55rem .7rem; } .search { display:flex; align-items:center; gap:.4rem; flex:1; min-width:190px; } .search input { border:0; outline:0; min-width:0; width:100%; }
    .icon-btn { color:#64748b; background:transparent; border:0; padding:.35rem; letter-spacing:.1em; } .pagination { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding-top:1rem; color:#64748b; font-size:.78rem; }
    @media (max-width:620px) { .filters select { flex:1; } .pagination { align-items:flex-start; flex-direction:column; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  readonly showForm = signal(false);
  search = '';
  draft = { amount: '', date: new Date().toISOString().slice(0, 10), category: 'Food', account: 'Shared Checking', description: '' };
  readonly rows: TransactionRow[] = [
    { id: '1', description: 'Electricity bill', category: 'Utilities', account: 'Shared Checking', member: 'Maria Cuellar', date: 'Aug 12, 2026', amount: '$200.00', type: 'EXPENSE' },
    { id: '2', description: 'Grocery run', category: 'Food', account: 'Shared Checking', member: 'Claudio Cuellar', date: 'Aug 11, 2026', amount: '$126.40', type: 'EXPENSE' },
    { id: '3', description: 'Monthly salary', category: 'Salary', account: 'Checking', member: 'Claudio Cuellar', date: 'Aug 10, 2026', amount: '$5,200.00', type: 'INCOME' },
    { id: '4', description: 'Gas and parking', category: 'Transportation', account: 'Claudio Personal', member: 'Juan Cuellar', date: 'Aug 9, 2026', amount: '$74.20', type: 'EXPENSE' },
    { id: '5', description: 'Streaming bundle', category: 'Subscriptions', account: 'Shared Checking', member: 'Maria Cuellar', date: 'Aug 8, 2026', amount: '$31.99', type: 'EXPENSE' },
  ];
  filtered() { const term = this.search.trim().toLowerCase(); return term ? this.rows.filter((row) => `${row.description} ${row.category} ${row.member}`.toLowerCase().includes(term)) : this.rows; }
  save() { this.showForm.set(false); this.draft = { amount: '', date: new Date().toISOString().slice(0, 10), category: 'Food', account: 'Shared Checking', description: '' }; }
}
