import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** What the visitor decided, once they have. */
export type ConsentDecision = 'accepted' | 'rejected';

/** The decision, or the absence of one. */
export type ConsentState = ConsentDecision | 'undecided';

/**
 * The only cookie this site sets.
 *
 * It records the decision itself, which is why it may be set without consent:
 * without it the modal would reappear on every page view, so refusing would be
 * impossible to express (TDDDG section 25 paragraph 2 - strictly necessary).
 */
export const CONSENT_COOKIE = 'e2p_consent';

/** Six months. Long enough not to nag, short enough to be a decision and not a verdict. */
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/**
 * Holds the cookie decision and is the one place that writes a cookie.
 *
 * There is exactly one category here, the technically necessary one, so there
 * is no settings dialog with sliders: accept, or the site is not usable (PO,
 * 2026-10-09). A store rather than a signal in a component because three
 * places read the same answer - the modal, the gate in front of the shop, and
 * the footer control that takes the decision back.
 *
 * **Storage is a cookie, not `localStorage`.** Both are consent-relevant under
 * TDDDG and `localStorage` would transmit nothing on a static site, so it is
 * the slightly tidier mechanism. It still loses: the cookie policy has to name
 * what is stored, and a document that says "one technically necessary cookie"
 * while the code writes a storage entry is the mismatch between document and
 * reality this project keeps paying to fix. One cookie, named in the policy,
 * and the policy is true.
 */
@Injectable({ providedIn: 'root' })
export class ConsentStore {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly state = signal<ConsentState>(this.read());

  /** The decision, or `undecided`. */
  readonly current = this.state.asReadonly();

  /** Whether a decision exists at all - what the modal keys off. */
  readonly decided = computed(() => this.state() !== 'undecided');

  /** Whether the shop and every path into a purchase may run. */
  readonly accepted = computed(() => this.state() === 'accepted');

  /** Whether the visitor refused, which the page has to say out loud. */
  readonly rejected = computed(() => this.state() === 'rejected');

  accept(): void {
    this.write('accepted');
  }

  reject(): void {
    this.write('rejected');
  }

  /**
   * Forgets the decision, so the modal asks again.
   *
   * Deletes the cookie rather than storing "undecided": a site that keeps a
   * cookie after the visitor withdrew consent is storing the one thing they
   * just took back.
   */
  revoke(): void {
    this.state.set('undecided');
    if (this.isBrowser) {
      this.document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${this.path()}; SameSite=Lax`;
    }
  }

  private write(decision: ConsentDecision): void {
    this.state.set(decision);
    if (!this.isBrowser) {
      return;
    }
    const secure = this.document.location?.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie =
      `${CONSENT_COOKIE}=${decision}; Max-Age=${MAX_AGE_SECONDS}; ` +
      `Path=${this.path()}; SameSite=Lax${secure}`;
  }

  /**
   * The decision as the browser currently has it.
   *
   * `undecided` while prerendering, and that is the honest answer rather than a
   * limitation: the build emits one file for every visitor, so it cannot know
   * what any of them decided. The consequence is deliberate - the prerendered
   * HTML always contains the modal and the shop always starts blocked, so a
   * visitor without JavaScript gets the safe state instead of an open shop.
   */
  private read(): ConsentState {
    if (!this.isBrowser) {
      return 'undecided';
    }
    const match = this.document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
    const value = match?.slice(CONSENT_COOKIE.length + 1);
    // Anything else - a hand-edited cookie, a value from an older format - is
    // treated as no decision. Asking again is the safe failure; guessing
    // "accepted" from a string nobody recognises is not.
    return value === 'accepted' || value === 'rejected' ? value : 'undecided';
  }

  /**
   * The path the cookie is scoped to: the deployed base href, not `/`.
   *
   * The site lives under `/enigma2_player/` on GitHub Pages. A cookie on `/`
   * would be sent to every other project page on the same host, which is both
   * more than this site needs and more than its policy claims.
   */
  private path(): string {
    try {
      return new URL(this.document.baseURI).pathname;
    } catch {
      return '/';
    }
  }
}
