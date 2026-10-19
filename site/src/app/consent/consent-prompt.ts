import { Injectable, computed, inject, signal } from '@angular/core';

import { ConsentStore } from './consent-store';

/**
 * Whether the cookie question is being asked right now.
 *
 * It used to be one condition - "no decision yet" - and the dialog therefore
 * covered the imprint and the privacy policy as well. That is the one place
 * where it must not be (enigma2_player-dki): §5 DDG wants the imprint directly
 * accessible, and the privacy policy is the text a visitor reads *in order to*
 * decide. A modal in front of it makes reading conditional on the answer and
 * traps the keyboard in a dialog arguing for a decision the reader is still
 * informing themselves about.
 *
 * So the question is suppressed on the pages the route list marks
 * `unconditional`, with one exception: the footer control. Someone who presses
 * "change my cookie decision" while reading the cookie policy has asked for
 * the dialog, and a control that does nothing on three pages of the site is
 * its own defect. [request] is that ask, and it lasts until the next
 * navigation - [enter] is called by every page as it renders.
 *
 * In the shell rather than in the modal component, because two pieces outside
 * the routed page need the same answer: the dialog itself, and the footer that
 * can summon it.
 */
@Injectable({ providedIn: 'root' })
export class ConsentPrompt {
  private readonly store = inject(ConsentStore);

  /** Whether the page on screen must stay readable without an answer. */
  private readonly unconditionalPage = signal(false);

  /** Whether the visitor asked for the dialog on such a page. */
  private readonly asked = signal(false);

  /** Whether the dialog is shown. */
  readonly visible = computed(
    () => !this.store.decided() && (!this.unconditionalPage() || this.asked()),
  );

  /**
   * A page has been rendered. Called by `PageBase`, so no page can forget it.
   *
   * It also clears a previous [request]: the ask belongs to the page it was
   * made on, and carrying it along would re-open the dialog on the next legal
   * page the visitor opens.
   */
  enter(unconditional: boolean): void {
    this.unconditionalPage.set(unconditional);
    this.asked.set(false);
  }

  /** The visitor asked to decide, on a page that does not ask by itself. */
  request(): void {
    this.asked.set(true);
  }
}
