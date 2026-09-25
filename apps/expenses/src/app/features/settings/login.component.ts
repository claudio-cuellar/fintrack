import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@fintrack/shared';
import { I18nService } from '@fintrack/shared';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-toolbar"><div class="brand"><span class="brand-mark">F</span><strong>FinTrack</strong></div><label class="language-control"><span>{{ i18n.text('settings.language') }}</span><select [value]="i18n.language()" (change)="changeLanguage($event)" [attr.aria-label]="i18n.text('settings.language')"><option value="en">{{ i18n.text('language.english') }}</option><option value="es">{{ i18n.text('language.spanish') }}</option></select></label></div>
        <div class="eyebrow">{{ i18n.text('auth.personalFinanceSharedClearly') }}</div>
        <h1>{{ i18n.text('auth.welcomeBack') }}</h1>
        <p class="muted">{{ i18n.text('auth.signInDescription') }}</p>
        @if (error()) { <div class="error" role="alert">{{ i18n.text(error()) }}</div> }
        <form (ngSubmit)="submit()">
          <label>{{ i18n.text('auth.email') }}<input type="email" name="email" [(ngModel)]="email" autocomplete="email" required /></label>
          <label>{{ i18n.text('auth.password') }}<input type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required /></label>
          <button class="btn btn-primary" [disabled]="loading()">{{ loading() ? i18n.text('auth.signingIn') : i18n.text('auth.signIn') }}</button>
        </form>
        <p class="demo">{{ i18n.text('auth.demoAccount') }} <strong>demo@fintrack.local</strong> / <strong>ChangeMe123!ChangeMe123!</strong></p>
      </section>
    </main>
  `,
  styles: [`
    .auth-page { min-height:100vh; display:grid; place-items:center; padding:1rem; background:radial-gradient(circle at 10% 10%, #dbeafe, transparent 32%), #f8fafc; }
    .auth-card { width:min(100%, 430px); padding:2rem; border:1px solid #e2e8f0; border-radius:24px; background:#fff; box-shadow:0 30px 70px rgba(15,23,42,.1); }
    .auth-toolbar { display:flex; justify-content:space-between; align-items:flex-start; gap:.8rem; margin-bottom:2.2rem; }
    .brand { display:flex; align-items:center; gap:.6rem; font-size:1.05rem; }
    .brand-mark { display:grid; place-items:center; width:2rem; height:2rem; border-radius:9px; background:#2563eb; color:#fff; font-weight:800; }
    .language-control { display:flex; align-items:center; gap:.35rem; color:#64748b; font-size:.7rem; font-weight:750; }
    .language-control select { border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#334155; padding:.32rem .4rem; font:inherit; }
    .eyebrow { color:#2563eb; text-transform:uppercase; letter-spacing:.08em; font-size:.68rem; font-weight:850; }
    h1 { margin:.45rem 0 .35rem; font-size:2.2rem; letter-spacing:-.05em; }
    form { display:grid; gap:1rem; margin-top:1.55rem; }
    label { display:grid; gap:.4rem; color:#475569; font-size:.8rem; font-weight:750; }
    input { padding:.75rem .8rem; border:1px solid #cbd5e1; border-radius:10px; color:#0f172a; }
    button { width:100%; margin-top:.35rem; }
    .error { color:#991b1b; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:.7rem; margin-top:1rem; font-size:.85rem; }
    .demo { color:#64748b; font-size:.72rem; line-height:1.5; margin:1.3rem 0 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  email = 'demo@fintrack.local';
  password = 'ChangeMe123!ChangeMe123!';
  readonly loading = signal(false);
  readonly error = signal('');
  submit() { this.loading.set(true); this.error.set(''); this.auth.login(this.email, this.password).subscribe({ next: () => this.router.navigateByUrl('/dashboard'), error: () => { this.error.set('auth.signInFailed'); this.loading.set(false); }, complete: () => this.loading.set(false) }); }
  changeLanguage(event: Event): void { this.i18n.setLanguage((event.target as HTMLSelectElement).value as 'en' | 'es'); }
}
