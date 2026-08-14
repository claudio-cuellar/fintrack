import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService, Language } from '../../core/i18n/i18n.service';
import { WorkspaceService } from '../../core/workspace/workspace.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">F</span><span>FinTrack</span></div>
        @if (workspace.selected(); as current) {
          <div class="workspace-card">
            <span class="workspace-label">{{ i18n.text('workspace.active') }}</span>
            <strong>{{ current.name }}</strong>
            <span class="pill">{{ current.type === 'FAMILY' ? i18n.text('workspace.sharedFamily') : i18n.text('workspace.personal') }}</span>
          </div>
        }
        <nav [attr.aria-label]="i18n.text('nav.primary')">
          <a routerLink="/dashboard" routerLinkActive="active"><span>◒</span> {{ i18n.text('nav.dashboard') }}</a>
          <a routerLink="/transactions" routerLinkActive="active"><span>↗</span> {{ i18n.text('nav.transactions') }}</a>
          <a routerLink="/accounts" routerLinkActive="active"><span>▣</span> {{ i18n.text('nav.accounts') }}</a>
          <a routerLink="/categories" routerLinkActive="active"><span>⌘</span> {{ i18n.text('nav.categories') }}</a>
          <a routerLink="/family" routerLinkActive="active"><span>♧</span> {{ i18n.text('nav.family') }}</a>
        </nav>
        <div class="sidebar-foot"><a class="settings-link" href="#" (click)="logout(); $event.preventDefault()">{{ i18n.text('auth.signOut') }}</a></div>
      </aside>
      <main class="content">
        <header class="topbar">
          <div><span class="topbar-context">{{ workspace.selected()?.name || i18n.text('topbar.yourWorkspace') }}</span><span class="topbar-divider">/</span><span class="topbar-page">{{ i18n.text('topbar.financeOverview') }}</span></div>
          <div class="topbar-actions">
            <label class="language-control"><span>{{ i18n.text('settings.language') }}</span><select [value]="i18n.language()" (change)="changeLanguage($event)" [attr.aria-label]="i18n.text('settings.language')"><option value="en">{{ i18n.text('language.english') }}</option><option value="es">{{ i18n.text('language.spanish') }}</option></select></label>
            @if (auth.user(); as user) { <div class="user-chip"><span class="avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</span><span>{{ user.firstName }} {{ user.lastName }}</span></div> }
          </div>
        </header>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .shell { min-height:100vh; display:grid; grid-template-columns: 248px minmax(0,1fr); }
    .sidebar { background:#0f172a; color:#cbd5e1; padding:1.15rem .9rem; display:flex; flex-direction:column; gap:1.4rem; }
    .brand { display:flex; align-items:center; gap:.65rem; color:white; font-size:1.05rem; font-weight:850; padding:.2rem .55rem; }
    .brand-mark { display:grid; place-items:center; width:2rem; height:2rem; border-radius:9px; background:#2563eb; color:#fff; }
    .workspace-card { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:13px; display:grid; gap:.4rem; padding:.85rem; }
    .workspace-label { color:#94a3b8; font-size:.62rem; letter-spacing:.08em; font-weight:800; }
    .workspace-card strong { color:#f8fafc; font-size:.9rem; }
    .workspace-card .pill { justify-self:start; color:#bfdbfe; background:rgba(37,99,235,.25); }
    nav { display:grid; gap:.25rem; }
    nav a, .settings-link { color:#94a3b8; padding:.7rem .75rem; border-radius:10px; text-decoration:none; display:flex; align-items:center; gap:.7rem; font-weight:650; }
    nav a span { color:#64748b; width:1rem; text-align:center; }
    nav a:hover, nav a.active { background:#1e293b; color:#fff; }
    nav a.active span { color:#60a5fa; }
    .sidebar-foot { margin-top:auto; border-top:1px solid rgba(255,255,255,.1); padding-top:.8rem; }
    .settings-link:hover { color:#fff; }
    .content { min-width:0; }
    .topbar { min-height:4.2rem; background:#fff; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:0 1.5rem; }
    .topbar-context { font-weight:800; color:#0f172a; }
    .topbar-divider { color:#cbd5e1; padding:0 .65rem; }
    .topbar-page { color:#94a3b8; font-size:.88rem; }
    .topbar-actions { display:flex; align-items:center; gap:1rem; }
    .language-control { display:flex; align-items:center; gap:.4rem; color:#64748b; font-size:.72rem; font-weight:750; }
    .language-control select { border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#334155; padding:.35rem .45rem; font:inherit; cursor:pointer; }
    .user-chip { display:flex; align-items:center; gap:.55rem; color:#334155; font-size:.85rem; font-weight:700; }
    .avatar { display:grid; place-items:center; width:2rem; height:2rem; border-radius:50%; background:#dbeafe; color:#1d4ed8; font-size:.72rem; }
    @media (max-width:760px) { .shell { display:block; } .sidebar { min-height:unset; padding:.75rem; display:block; } .brand { margin-bottom:.7rem; } .workspace-card { display:none; } nav { display:flex; overflow-x:auto; gap:.3rem; } nav a { white-space:nowrap; padding:.55rem .7rem; } nav a span { display:none; } .sidebar-foot { display:none; } .topbar { padding:0 1rem; min-height:3.6rem; } .topbar-page, .topbar-divider, .language-control span { display:none; } .topbar-actions { gap:.5rem; } .user-chip span:last-child { display:none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly workspace = inject(WorkspaceService);
  logout() { this.auth.logout(); }
  changeLanguage(event: Event): void { this.i18n.setLanguage((event.target as HTMLSelectElement).value as Language); }
}
