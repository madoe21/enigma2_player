import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getSecurityInfo } from '../../content/content';

/**
 * What leaves the device, where to, and what the app never does.
 *
 * Every claim on it is traceable to the application source; the sources are
 * named in `content/content.ts` above `securityInfo`, which is where the text
 * lives (enigma2_player-6jv). The page is deliberately plain text in blocks:
 * the thing that makes a security page worth anything is that each sentence
 * can be checked, not that it looks reassuring.
 */
@Component({
  selector: 'site-security',
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
export class Security extends PageBase {
  protected readonly title = this.translate.t('nav.security');
  protected readonly blocks = computed(() => getSecurityInfo(this.lang()));
}
