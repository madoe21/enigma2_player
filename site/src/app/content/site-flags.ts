/**
 * The switches that change what the site claims about itself.
 *
 * One file, so going live is a diff a human can read rather than a search
 * through components.
 */
import { InjectionToken } from '@angular/core';

/**
 * Whether this is still a demonstration rather than a shop that can sell.
 *
 * `true` until the company exists. While it is set, every page says so once,
 * visibly - because a page that offers a purchase it cannot complete is worse
 * than one that admits what it is (PO, 2026-10-09).
 *
 * Switching it to `false` is one of the two steps at go-live; the other is
 * filling in the identity values in `legal/entity.ts`. Both are listed in
 * `TODO.md`, which is generated from this flag and those placeholders.
 */
export const DEMO_MODE = true;

/**
 * The same flag, as something a component is GIVEN rather than something it
 * reaches for.
 *
 * The constant above stays the switch - `tool/check-placeholders.mjs` reads it
 * as text to write TODO.md, and one line to edit is the point. The token exists
 * because a module constant cannot be substituted in a test: Angular's
 * unit-test system refuses `vi.mock` for relative imports and says to use the
 * TestBed, so "what the site looks like after go-live" is only provable if the
 * flag arrives through dependency injection. Default factory = the constant,
 * so nothing has to provide it in production.
 */
export const DEMO_MODE_FLAG = new InjectionToken<boolean>('DEMO_MODE', {
  factory: () => DEMO_MODE,
});
