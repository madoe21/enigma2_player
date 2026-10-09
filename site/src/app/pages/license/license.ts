import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getLicenseInfo } from '../../content/content';

/** What a licence covers, block by block. */
@Component({
  selector: 'site-license',
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
export class License extends PageBase {
  protected readonly title = this.translate.t('nav.license');
  protected readonly blocks = computed(() => getLicenseInfo(this.lang()));
}
