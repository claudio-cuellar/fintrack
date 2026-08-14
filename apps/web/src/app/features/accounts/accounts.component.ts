import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">Money locations</div><h1>Accounts</h1><p class="muted">Know where your money lives without losing the big picture.</p></div><button class="btn btn-primary">＋ Add account</button></div><section class="grid grid-2">@for (item of accounts; track item.name) {<article class="card card-pad account"><div class="account-top"><div class="account-icon">{{ item.icon }}</div><span class="pill">{{ item.visibility }}</span></div><div class="account-type">{{ item.type }}</div><h2>{{ item.name }}</h2><div class="balance">{{ item.balance }}</div><div class="account-foot"><span>{{ item.currency }}</span><span>{{ item.activity }}</span></div></article>}</section><section class="card card-pad note"><strong>Shared vs personal accounts</strong><p class="muted">Shared accounts are visible to eligible household members. Personal accounts stay attached to their owner while still contributing to their private view.</p></section></div>
  `,
  styles: [`
    .account { min-height:190px; } .account-top { display:flex; justify-content:space-between; align-items:center; } .account-icon { display:grid; place-items:center; width:2.6rem; height:2.6rem; border-radius:12px; background:#eff6ff; color:#2563eb; font-weight:900; } .account-type { margin-top:1.2rem; color:#64748b; text-transform:uppercase; letter-spacing:.07em; font-size:.68rem; font-weight:850; } .account h2 { margin:.25rem 0 .4rem; } .balance { font-size:1.7rem; letter-spacing:-.04em; font-weight:850; } .account-foot { display:flex; justify-content:space-between; margin-top:1rem; color:#64748b; font-size:.78rem; } .note { margin-top:1rem; } .note p { margin:.35rem 0 0; font-size:.85rem; line-height:1.5; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent {
  readonly accounts = [
    { name: 'Shared Checking', type: 'Bank account', icon: '▣', visibility: 'Shared', balance: '$8,420.32', currency: 'USD', activity: 'Updated today' },
    { name: 'Claudio Personal', type: 'Credit card', icon: '▤', visibility: 'Personal', balance: '$1,250.76', currency: 'USD', activity: 'Updated yesterday' },
    { name: 'Emergency Savings', type: 'Savings', icon: '◫', visibility: 'Shared', balance: '$12,100.00', currency: 'USD', activity: 'Updated Aug 1' },
    { name: 'Cash Wallet', type: 'Cash', icon: '◇', visibility: 'Personal', balance: '$240.00', currency: 'USD', activity: 'Updated Aug 10' },
  ];
}
