import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">Shared workspace</div><h1>Family</h1><p class="muted">Manage who can see and contribute to your household finances.</p></div><button class="btn btn-primary">＋ Invite member</button></div><section class="grid grid-4 member-stats"><div class="card card-pad"><div class="stat-label">Members</div><div class="stat-value">4</div><div class="stat-foot">All active</div></div><div class="card card-pad"><div class="stat-label">Shared expenses</div><div class="stat-value">$2,630</div><div class="stat-foot">This month</div></div><div class="card card-pad"><div class="stat-label">Workspace role</div><div class="stat-value role">Owner</div><div class="stat-foot">Full access</div></div><div class="card card-pad"><div class="stat-label">Invitations</div><div class="stat-value">1</div><div class="stat-foot">Awaiting response</div></div></section><section class="card card-pad"><div class="section-title"><div><h2>Members</h2><p class="muted">Roles control what each member can do.</p></div></div><div class="member-list">@for (member of members; track member.email) {<div class="member-row"><div class="avatar">{{ member.initials }}</div><div class="member-details"><strong>{{ member.name }}</strong><small>{{ member.email }}</small></div><span class="member-amount">{{ member.amount }}</span><span class="pill" [class.owner]="member.role === 'Owner'">{{ member.role }}</span><button class="icon-btn" aria-label="Member actions">•••</button></div>}</div></section></div>
  `,
  styles: [`
    .member-stats { margin-bottom:1rem; } .role { font-size:1.45rem; } .section-title { margin-bottom:1rem; } .section-title h2 { margin-bottom:.25rem; } .section-title p { margin:0; font-size:.8rem; } .member-list { display:grid; } .member-row { display:flex; align-items:center; gap:.8rem; padding:.85rem .1rem; border-bottom:1px solid #f1f5f9; } .member-row:last-child { border-bottom:0; } .member-details { display:grid; gap:.18rem; flex:1; } .member-details small { color:#64748b; font-size:.75rem; } .member-amount { color:#334155; font-size:.85rem; font-weight:750; } .pill.owner { background:#dcfce7; color:#166534; } .icon-btn { border:0; background:transparent; color:#64748b; letter-spacing:.1em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyComponent {
  readonly members = [
    { name: 'Claudio Cuellar', email: 'claudio@example.com', initials: 'CC', amount: '$1,240', role: 'Owner' }, { name: 'Maria Cuellar', email: 'maria@example.com', initials: 'MC', amount: '$920', role: 'Admin' }, { name: 'Juan Cuellar', email: 'juan@example.com', initials: 'JC', amount: '$320', role: 'Member' }, { name: 'Ana Cuellar', email: 'ana@example.com', initials: 'AC', amount: '$150', role: 'Viewer' },
  ];
}
