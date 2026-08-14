import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">Shared taxonomy</div><h1>Categories</h1><p class="muted">Keep spending labels consistent across the whole household.</p></div><button class="btn btn-primary">＋ Add category</button></div><section class="card card-pad"><div class="callout"><span class="callout-icon">⌘</span><div><strong>Owner-managed categories</strong><p>Members can select categories while owners and admins keep the shared taxonomy clean.</p></div></div><div class="category-list">@for (category of categories; track category.name) {<div class="category-row"><div class="category-leading"><span class="category-dot" [style.background]="category.color"></span><div><strong>{{ category.name }}</strong><small>{{ category.count }} transactions this month</small></div></div><span class="pill">{{ category.budget }}</span><button class="icon-btn" aria-label="Category actions">•••</button></div>}</div></section></div>
  `,
  styles: [`
    .callout { display:flex; gap:.8rem; align-items:flex-start; background:#eff6ff; border:1px solid #dbeafe; border-radius:13px; padding:1rem; margin-bottom:1rem; } .callout-icon { display:grid; place-items:center; width:2rem; height:2rem; border-radius:9px; background:#dbeafe; color:#2563eb; font-weight:900; } .callout strong { color:#1e3a8a; } .callout p { color:#475569; font-size:.8rem; margin:.25rem 0 0; line-height:1.45; } .category-list { display:grid; } .category-row { display:flex; align-items:center; gap:.85rem; padding:.85rem .2rem; border-bottom:1px solid #f1f5f9; } .category-row:last-child { border-bottom:0; } .category-leading { display:flex; align-items:center; gap:.75rem; flex:1; } .category-leading div { display:grid; gap:.2rem; } .category-leading small { color:#94a3b8; font-size:.74rem; } .category-dot { width:.75rem; height:.75rem; border-radius:50%; } .icon-btn { color:#64748b; background:transparent; border:0; letter-spacing:.1em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly categories = [
    { name: 'Housing', count: 12, budget: '$920 / $1,200', color: '#2563eb' }, { name: 'Food', count: 38, budget: '$420 / $600', color: '#10b981' }, { name: 'Transportation', count: 14, budget: '$280 / $450', color: '#f59e0b' }, { name: 'Utilities', count: 8, budget: '$360 / $400', color: '#8b5cf6' }, { name: 'Entertainment', count: 11, budget: 'No budget', color: '#ec4899' }, { name: 'Subscriptions', count: 7, budget: 'No budget', color: '#64748b' }, { name: 'Other', count: 10, budget: '$1,020 / $1,400', color: '#94a3b8' },
  ];
}
