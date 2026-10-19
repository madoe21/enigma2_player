import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getManual } from '../../content/content';

/**
 * The user manual: install, connect, and then one block per task.
 *
 * It is what replaced `/docs` (enigma2_player-1zl, -lk7). A flat list of
 * `h2` sections rather than a nested outline: the blocks are things to look
 * up, and a reader who jumps by heading gets a list of answers instead of a
 * tree to navigate.
 */
@Component({
  selector: 'site-manual',
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
export class Manual extends PageBase {
  protected readonly title = this.translate.t('nav.manual');
  protected readonly blocks = computed(() => getManual(this.lang()));
}
