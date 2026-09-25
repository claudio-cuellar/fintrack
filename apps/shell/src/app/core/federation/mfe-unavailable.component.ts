import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'ft-mfe-unavailable',
  template: `
    <section class="unavailable" role="alert">
      <p class="eyebrow">FinTrack module</p>
      <h1>{{ name() }} is unavailable</h1>
      <p>We could not load this area right now. The rest of FinTrack is still available.</p>
      <button type="button" (click)="reload()">Try again</button>
    </section>
  `,
  styles: [`
    .unavailable { max-width: 38rem; margin: 4rem auto; padding: 2rem; border: 1px solid #fecaca; border-radius: 16px; background: #fff; color: #334155; box-shadow: 0 16px 40px rgba(15, 23, 42, .08); }
    .eyebrow { color: #dc2626; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    h1 { color: #0f172a; margin: .35rem 0 .7rem; }
    button { border: 0; border-radius: 9px; background: #2563eb; color: #fff; padding: .7rem 1rem; font-weight: 700; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfeUnavailableComponent {
  readonly name = input('This module');
  reload(): void { window.location.reload(); }
}
