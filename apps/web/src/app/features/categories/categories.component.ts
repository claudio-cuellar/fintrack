import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  standalone: true,
  template: `
    <div class="page"><div class="page-header"><div><div class="eyebrow">{{ i18n.text('categories.sharedTaxonomy') }}</div><h1>{{ i18n.text('categories.title') }}</h1><p class="muted">{{ i18n.text('categories.subtitle') }}</p></div><button class="btn btn-primary">{{ i18n.text('categories.addCategory') }}</button></div><section class="card card-pad"><div class="callout"><span class="callout-icon">⌘</span><div><strong>{{ i18n.text('categories.ownerManaged') }}</strong><p>{{ i18n.text('categories.ownerManagedDescription') }}</p></div></div><div class="category-list">@for (category of categories; track category.name) {<div class="category-row"><div class="category-leading"><span class="category-dot" [style.background]="category.color"></span><div><strong>{{ i18n.text(category.name) }}</strong><small>{{ i18n.text('categories.transactionsThisMonth', { count: category.count }) }}</small></div></div><span class="pill">{{ category.budget === 'categories.noBudget' ? i18n.text('categories.noBudget') : category.budget }}</span><button class="icon-btn" [attr.aria-label]="i18n.text('transactions.moreActions')">•••</button></div>}</div></section></div>
  `,
  styles: [`
    .callout { display:flex; gap:.8rem; align-items:flex-start; background:#eff6ff; border:1px solid #dbeafe; border-radius:13px; padding:1rem; margin-bottom:1rem; } .callout-icon { display:grid; place-items:center; width:2rem; height:2rem; border-radius:9px; background:#dbeafe; color:#2563eb; font-weight:900; } .callout strong { color:#1e3a8a; } .callout p { color:#475569; font-size:.8rem; margin:.25rem 0 0; line-height:1.45; } .category-list { display:grid; } .category-row { display:flex; align-items:center; gap:.85rem; padding:.85rem .2rem; border-bottom:1px solid #f1f5f9; } .category-row:last-child { border-bottom:0; } .category-leading { display:flex; align-items:center; gap:.75rem; flex:1; } .category-leading div { display:grid; gap:.2rem; } .category-leading small { color:#94a3b8; font-size:.74rem; } .category-dot { width:.75rem; height:.75rem; border-radius:50%; } .icon-btn { color:#64748b; background:transparent; border:0; letter-spacing:.1em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly i18n = inject(I18nService);
  readonly categories = [
    { name: 'category.housing', count: 12, budget: '$920 / $1,200', color: '#2563eb' }, { name: 'category.food', count: 38, budget: '$420 / $600', color: '#10b981' }, { name: 'category.transportation', count: 14, budget: '$280 / $450', color: '#f59e0b' }, { name: 'category.utilities', count: 8, budget: '$360 / $400', color: '#8b5cf6' }, { name: 'category.entertainment', count: 11, budget: 'categories.noBudget', color: '#ec4899' }, { name: 'category.subscriptions', count: 7, budget: 'categories.noBudget', color: '#64748b' }, { name: 'category.other', count: 10, budget: '$1,020 / $1,400', color: '#94a3b8' },
  ];
}
