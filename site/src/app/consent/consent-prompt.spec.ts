import { TestBed } from '@angular/core/testing';

import { CONSENT_COOKIE, ConsentStore } from './consent-store';
import { ConsentPrompt } from './consent-prompt';

/**
 * Whether the question is asked, which is a legal condition and not a UI
 * preference: the imprint and the privacy policy must be readable without
 * answering it (enigma2_player-dki). So the three cases below are the three
 * the law and the PO care about - ordinary page asks, legal page does not,
 * legal page asks when the visitor asked for it.
 */
describe('ConsentPrompt', () => {
  /** Clears the cookie on every path it could have been written to. */
  function clearCookie(): void {
    const path = new URL(document.baseURI).pathname;
    for (const p of new Set([path, '/'])) {
      document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${p}`;
    }
  }

  function prompt(): { prompt: ConsentPrompt; store: ConsentStore } {
    TestBed.resetTestingModule();
    return { prompt: TestBed.inject(ConsentPrompt), store: TestBed.inject(ConsentStore) };
  }

  beforeEach(clearCookie);
  afterEach(clearCookie);

  it('asks on an ordinary page while the decision is open', () => {
    const { prompt: p } = prompt();

    p.enter(false);

    expect(p.visible()).toBe(true);
  });

  it('stays silent on a page that must be readable without an answer', () => {
    const { prompt: p } = prompt();

    p.enter(true);

    expect(p.visible()).toBe(false);
  });

  it('asks on such a page when the visitor asked for it', () => {
    const { prompt: p } = prompt();
    p.enter(true);

    p.request();

    expect(p.visible()).toBe(true);
  });

  it('forgets that request on the next page', () => {
    const { prompt: p } = prompt();
    p.enter(true);
    p.request();

    p.enter(true);

    expect(p.visible(), 'the ask belonged to the page it was made on').toBe(false);
  });

  it('never asks once a decision exists, wherever the visitor is', () => {
    const { prompt: p, store } = prompt();
    store.accept();

    p.enter(false);
    expect(p.visible()).toBe(false);

    p.enter(true);
    p.request();
    expect(p.visible()).toBe(false);
  });

  it('asks again after a withdrawal', () => {
    const { prompt: p, store } = prompt();
    store.accept();
    p.enter(false);

    store.revoke();

    expect(p.visible()).toBe(true);
  });

  it('starts out asking, because a page has not been entered yet', () => {
    // The prerendered HTML has to contain the dialog: the build cannot know
    // what any visitor decided, so the file ships the safe state.
    const { prompt: p } = prompt();

    expect(p.visible()).toBe(true);
  });
});
