import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLanguage } from '../i18n/page-language';
import { ConsentGate } from './consent-gate';
import { CONSENT_COOKIE, ConsentStore } from './consent-store';

@Component({
  imports: [ConsentGate],
  template: `
    <site-consent-gate>
      <p data-testid="shop">shop embed</p>
    </site-consent-gate>
  `,
})
class Host {}

describe('ConsentGate', () => {
  let fixture: ComponentFixture<Host>;
  let store: ConsentStore;

  function clearCookie(): void {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=${new URL(document.baseURI).pathname}`;
  }

  beforeEach(async () => {
    clearCookie();
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    store = TestBed.inject(ConsentStore);
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(clearCookie);

  function content(): Element | null {
    return fixture.nativeElement.querySelector('[data-testid="shop"]');
  }

  it('keeps the gated content out until consent is given', () => {
    expect(content()).toBeNull();
  });

  it('explains why instead of just leaving a hole', () => {
    // The requirement, verbatim: blocked means visibly justified. A button
    // that does nothing is worse than one with an explanation beside it.
    const note = fixture.nativeElement.querySelector('[role="note"]');

    expect(note).not.toBeNull();
    expect(note.textContent).toContain('Zustimmung');
  });

  it('offers no second button while the dialog is still asking', () => {
    // The dialog is in front of the visitor at this point. A duplicate accept
    // button behind the scrim is one control too many - ambiguous to read out
    // and ambiguous to automate against, which is how the end-to-end test
    // found it.
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('offers consent where the visitor wanted the thing, once they declined', async () => {
    store.reject();
    await fixture.whenStable();

    const accept = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    accept.click();
    await fixture.whenStable();

    expect(store.accepted()).toBe(true);
    expect(content()).not.toBeNull();
  });

  it('shows the content when consent already exists', async () => {
    store.accept();
    await fixture.whenStable();

    expect(content()?.textContent).toContain('shop embed');
    expect(fixture.nativeElement.querySelector('[role="note"]')).toBeNull();
  });

  it('keeps blocking after a refusal', async () => {
    store.reject();
    await fixture.whenStable();

    expect(content()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="note"]')).not.toBeNull();
  });

  it('explains in the language of the page', async () => {
    TestBed.inject(PageLanguage).set('it');
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('consenso');
  });
});
