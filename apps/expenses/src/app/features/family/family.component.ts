import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">{{ i18n.text('family.sharedWorkspace') }}</div><h1>{{ i18n.text('family.title') }}</h1><p class="muted">{{ i18n.text('family.subtitle') }}</p></div><button class="btn btn-primary">{{ i18n.text('family.inviteMember') }}</button></div><section class="grid grid-4 member-stats"><div class="card card-pad"><div class="stat-label">{{ i18n.text('family.members') }}</div><div class="stat-value">4</div><div class="stat-foot">{{ i18n.text('family.allActive') }}</div></div><div class="card card-pad"><div class="stat-label">{{ i18n.text('family.sharedExpenses') }}</div><div class="stat-value">$2,630</div><div class="stat-foot">{{ i18n.text('family.thisMonth') }}</div></div><div class="card card-pad"><div class="stat-label">{{ i18n.text('family.workspaceRole') }}</div><div class="stat-value role">{{ i18n.text('family.owner') }}</div><div class="stat-foot">{{ i18n.text('family.fullAccess') }}</div></div><div class="card card-pad"><div class="stat-label">{{ i18n.text('family.invitations') }}</div><div class="stat-value">1</div><div class="stat-foot">{{ i18n.text('family.awaitingResponse') }}</div></div></section><section class="card card-pad"><div class="section-title"><div><h2>{{ i18n.text('family.members') }}</h2><p class="muted">{{ i18n.text('family.membersDescription') }}</p></div></div><div class="member-list">@for (member of members; track member.email) {<div class="member-row"><div class="avatar">{{ member.initials }}</div><div class="member-details"><strong>{{ i18n.text(member.name) }}</strong><small>{{ member.email }}</small></div><span class="member-amount">{{ member.amount }}</span><span class="pill" [class.owner]="member.role === 'family.owner'">{{ i18n.text(member.role) }}</span><button class="icon-btn" [attr.aria-label]="i18n.text('transactions.moreActions')">•••</button></div>}</div></section></div>
  `,
  styles: [`
    .member-stats { margin-bottom:1rem; } .role { font-size:1.45rem; } .section-title { margin-bottom:1rem; } .section-title h2 { margin-bottom:.25rem; } .section-title p { margin:0; font-size:.8rem; } .member-list { display:grid; } .member-row { display:flex; align-items:center; gap:.8rem; padding:.85rem .1rem; border-bottom:1px solid #f1f5f9; } .member-row:last-child { border-bottom:0; } .member-details { display:grid; gap:.18rem; flex:1; } .member-details small { color:#64748b; font-size:.75rem; } .member-amount { color:#334155; font-size:.85rem; font-weight:750; } .pill.owner { background:#dcfce7; color:#166534; } .icon-btn { border:0; background:transparent; color:#64748b; letter-spacing:.1em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyComponent {
  readonly i18n = inject(I18nService);
  readonly members = [
    { name: 'member.claudio', email: 'claudio@example.com', initials: 'CC', amount: '$1,240', role: 'family.owner' }, { name: 'member.maria', email: 'maria@example.com', initials: 'MC', amount: '$920', role: 'family.admin' }, { name: 'member.juan', email: 'juan@example.com', initials: 'JC', amount: '$320', role: 'family.member' }, { name: 'member.ana', email: 'ana@example.com', initials: 'AC', amount: '$150', role: 'family.viewer' },
  ];
}
