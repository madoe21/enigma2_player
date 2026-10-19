import { Component, computed } from '@angular/core';

import { PageBase } from '../page-base';
import { getFaq } from '../../content/content';

/**
 * Questions and answers, each answer behind its own disclosure.
 *
 * `<details>`/`<summary>` rather than a scripted accordion, because the
 * element IS the pattern: the browser supplies the keyboard operation and the
 * expanded state it reports to assistive technology, so there is nothing of
 * ours to get wrong, and it works with JavaScript off - which on this site is
 * a requirement and not a nicety (enigma2_player-a23).
 *
 * A closed `<details>` is closed, not absent: the answer stands in the
 * prerendered HTML either way, so a crawler indexes it and find-in-page
 * reaches it. That is the reason this is not the usual `hidden`-plus-script
 * accordion, which ships the text and then hides it from both.
 *
 * The question is an `<h2>` inside the `<summary>` - valid, since a summary
 * takes one heading element - so a reader navigating by heading still gets the
 * questions as a list, the way the `<dt>`s this replaces did.
 */
@Component({
  selector: 'site-faq',
  template: `
    <main class="page">
      <h1>{{ title() }}</h1>
      <div class="faq">
        @for (item of items(); track item.q) {
          <details class="faq__item">
            <summary class="faq__summary">
              <h2 class="faq__question">{{ item.q }}</h2>
            </summary>
            <p class="faq__answer">{{ item.a }}</p>
          </details>
        }
      </div>
    </main>
  `,
  styleUrls: ['../page.css', './faq.css'],
})
export class Faq extends PageBase {
  protected readonly title = this.translate.t('nav.faq');
  protected readonly items = computed(() => getFaq(this.lang()));
}
