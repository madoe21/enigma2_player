import { TestBed } from '@angular/core/testing';

import { DemoNotice } from './demo-notice';
import { DEMO_MODE_FLAG } from '../content/site-flags';

/**
 * What the site looks like after go-live, proven rather than promised.
 *
 * Its own file because it is its own state of the world: the rest of
 * `demo-notice.spec.ts` asserts what a visitor sees TODAY, and a test that
 * flips the flag in the middle of that file reads as if the banner came and
 * went at runtime. It does not - switching it is one edit in
 * `content/site-flags.ts`, which is what TODO.md asks for at go-live
 * (enigma2_player-q6p).
 */
describe('DemoNotice with the flag off', () => {
  it('renders nothing at all', async () => {
    await TestBed.configureTestingModule({
      imports: [DemoNotice],
      providers: [{ provide: DEMO_MODE_FLAG, useValue: false }],
    }).compileComponents();
    const fixture = TestBed.createComponent(DemoNotice);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    // Not merely hidden: gone. A visually hidden banner would still be read
    // out by a screen reader, and would still claim the site cannot sell.
    expect(element.querySelector('aside.demo-notice')).toBeNull();
    expect(element.textContent?.trim()).toBe('');
  });
});
