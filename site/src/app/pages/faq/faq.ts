import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getFaq } from '../../content/content';

/**
 * Questions and answers, as a description list.
 *
 * `<dl>` with `<dt>`/`<dd>` rather than headings and paragraphs, as the Astro
 * version had it: the pairing is the structure, and a screen reader announces
 * it as such.
 */
@Component({
  selector: 'site-faq',
  template: `
    <main class="page">
      <h1>{{ title() }}</h1>
      <dl class="qa-list">
        @for (item of items(); track item.q) {
          <div class="qa">
            <dt>{{ item.q }}</dt>
            <dd>{{ item.a }}</dd>
          </div>
        }
      </dl>
    </main>
  `,
  styleUrl: '../page.css',
})
export class Faq extends PageBase {
  protected readonly title = this.translate.t('nav.faq');
  protected readonly items = computed(() => getFaq(this.lang()));
}
