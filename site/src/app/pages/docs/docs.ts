import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getDocs } from '../../content/content';

/** The documentation blocks, heading and body per block. */
@Component({
  selector: 'site-docs',
  template: `
    <main class="page">
      <h1>{{ title() }}</h1>
      @for (block of blocks(); track block.heading) {
        <section class="block">
          <h2>{{ block.heading }}</h2>
          <p>{{ block.body }}</p>
        </section>
      }
    </main>
  `,
  styleUrl: '../page.css',
})
export class Docs extends PageBase {
  protected readonly title = this.translate.t('nav.docs');
  protected readonly blocks = computed(() => getDocs(this.lang()));
}
