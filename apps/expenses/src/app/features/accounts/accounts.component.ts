import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '@fintrack/shared';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">{{ i18n.text('accounts.moneyLocations') }}</div><h1>{{ i18n.text('accounts.title') }}</h1><p class="muted">{{ i18n.text('accounts.subtitle') }}</p></div><button class="btn btn-primary">{{ i18n.text('accounts.addAccount') }}</button></div><section class="grid grid-2">@for (item of accounts; track item.name) {<article class="card card-pad account"><div class="account-top"><div class="account-icon">{{ item.icon }}</div><span class="pill">{{ i18n.text(item.visibility) }}</span></div><div class="account-type">{{ i18n.text(item.type) }}</div><h2>{{ i18n.text(item.name) }}</h2><div class="balance">{{ item.balance }}</div><div class="account-foot"><span>{{ item.currency }}</span><span>{{ i18n.text(item.activity) }}</span></div></article>}</section><section class="card card-pad note"><strong>{{ i18n.text('accounts.sharedVsPersonal') }}</strong><p class="muted">{{ i18n.text('accounts.sharedVsPersonalDescription') }}</p></section></div>
  `,
  styles: [`
    .account { min-height:190px; } .account-top { display:flex; justify-content:space-between; align-items:center; } .account-icon { display:grid; place-items:center; width:2.6rem; height:2.6rem; border-radius:12px; background:#eff6ff; color:#2563eb; font-weight:900; } .account-type { margin-top:1.2rem; color:#64748b; text-transform:uppercase; letter-spacing:.07em; font-size:.68rem; font-weight:850; } .account h2 { margin:.25rem 0 .4rem; } .balance { font-size:1.7rem; letter-spacing:-.04em; font-weight:850; } .account-foot { display:flex; justify-content:space-between; margin-top:1rem; color:#64748b; font-size:.78rem; } .note { margin-top:1rem; } .note p { margin:.35rem 0 0; font-size:.85rem; line-height:1.5; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent {
  readonly i18n = inject(I18nService);
  readonly accounts = [
    { name: 'account.sharedChecking', type: 'accounts.bankAccount', icon: '▣', visibility: 'workspace.sharedFamily', balance: '$8,420.32', currency: 'USD', activity: 'accounts.updatedToday' },
    { name: 'account.claudioPersonal', type: 'accounts.creditCard', icon: '▤', visibility: 'workspace.personal', balance: '$1,250.76', currency: 'USD', activity: 'accounts.updatedYesterday' },
    { name: 'account.emergencySavings', type: 'accounts.savings', icon: '◫', visibility: 'workspace.sharedFamily', balance: '$12,100.00', currency: 'USD', activity: 'accounts.updatedAug1' },
    { name: 'account.cashWallet', type: 'accounts.cash', icon: '◇', visibility: 'workspace.personal', balance: '$240.00', currency: 'USD', activity: 'accounts.updatedAug10' },
  ];
}
