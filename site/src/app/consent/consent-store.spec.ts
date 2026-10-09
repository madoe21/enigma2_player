import { TestBed } from '@angular/core/testing';

import { CONSENT_COOKIE, ConsentStore } from './consent-store';

/**
 * The store is where the legal promise becomes code, so these tests are about
 * the promise and not about the API: exactly one cookie, nothing before a
 * decision, and nothing left behind after a withdrawal.
 */
describe('ConsentStore', () => {
  /** Clears the cookie on every path it could have been written to. */
  function clearCookie(): void {
    const path = new URL(document.baseURI).pathname;
    for (const p of new Set([path, '/'])) {
      document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${p}`;
    }
  }

  function store(): ConsentStore {
    TestBed.resetTestingModule();
    return TestBed.inject(ConsentStore);
  }

  beforeEach(clearCookie);
  afterEach(clearCookie);

  it('starts undecided when no cookie was set', () => {
    const consent = store();

    expect(consent.current()).toBe('undecided');
    expect(consent.decided()).toBe(false);
    expect(consent.accepted()).toBe(false);
  });

  it('sets no cookie at all before a decision', () => {
    store();

    expect(document.cookie).not.toContain(CONSENT_COOKIE);
  });

  it('records an acceptance, and that unlocks the gated regions', () => {
    const consent = store();

    consent.accept();

    expect(consent.accepted()).toBe(true);
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=accepted`);
  });

  it('records a refusal, and nothing else', () => {
    const consent = store();

    consent.reject();

    expect(consent.rejected()).toBe(true);
    expect(consent.accepted()).toBe(false);
    // The record of the refusal is allowed; a second cookie would not be.
    const names = document.cookie
      .split(';')
      .map((part) => part.trim().split('=')[0])
      .filter((name) => name.length > 0);
    expect(names).toEqual([CONSENT_COOKIE]);
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=rejected`);
  });

  it('survives a reload: a fresh store reads the decision back', () => {
    store().accept();

    // A new injector over the same document is what a page load looks like.
    expect(store().accepted()).toBe(true);
  });

  it('deletes the cookie when the decision is withdrawn', () => {
    const consent = store();
    consent.accept();

    consent.revoke();

    expect(consent.current()).toBe('undecided');
    expect(document.cookie).not.toContain(`${CONSENT_COOKIE}=accepted`);
    // And a fresh store asks again rather than finding a stale yes.
    expect(store().decided()).toBe(false);
  });

  it('treats an unrecognised cookie value as no decision', () => {
    // A hand-edited cookie, or one from a format this code no longer knows.
    // Asking again is the safe failure; reading "yes" out of it is not.
    document.cookie = `${CONSENT_COOKIE}=yes-please; Path=${new URL(document.baseURI).pathname}`;

    expect(store().current()).toBe('undecided');
  });

  it('scopes the cookie to the deployed base path, not to the whole host', () => {
    // The site is served from /enigma2_player/ on GitHub Pages. A cookie on /
    // would travel to every other project page on the same host.
    const consent = store();
    consent.accept();

    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
    expect(document.cookie).not.toContain(`${CONSENT_COOKIE}=accepted`);
  });
});
