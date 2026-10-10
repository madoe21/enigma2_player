import { Component, computed, inject } from '@angular/core';

import { DEMO_MODE_FLAG } from '../content/site-flags';
import { Translate } from '../content/translate';

/**
 * Says once, on every page, that this is a demonstration.
 *
 * In the shell rather than per page, because "every page" is the requirement
 * and twelve copies is twelve chances to forget one (enigma2_player-q6p).
 *
 * Deliberately NOT a dialog, not a live region and not focusable: it is a
 * standing statement about the site, not an event. A banner that catches focus
 * on every page load is a banner that makes the site unusable with a screen
 * reader, which is the opposite of the point.
 *
 * A NAMED `complementary` landmark, which is the plain `<aside>` with a label
 * and was `role="note"` first. `note` is not a landmark, so overriding the
 * aside with it put the one piece of text that appears on every page outside
 * every landmark - axe's `region` rule caught it, and the consequence is real:
 * a screen reader user who navigates by landmarks would never reach the
 * sentence saying nothing can be bought here yet.
 *
 * It is also not dismissible, which is a decision rather than an omission:
 * dismissing it would need a cookie, and this site has exactly one cookie and
 * a policy that says so (enigma2_player-vmk).
 */
@Component({
  selector: 'site-demo-notice',
  template: `
    @if (shown) {
      <aside class="demo-notice" [attr.aria-label]="copy().label">
        <p>{{ copy().text }}</p>
      </aside>
    }
  `,
  styleUrl: './demo-notice.css',
})
export class DemoNotice {
  private readonly translate = inject(Translate);

  /** From the one flag, so go-live is a single edit. */
  protected readonly shown = inject(DEMO_MODE_FLAG);

  protected readonly copy = computed(() => ({
    label: this.translate.of('demo.label'),
    text: this.translate.of('demo.notice'),
  }));
}
