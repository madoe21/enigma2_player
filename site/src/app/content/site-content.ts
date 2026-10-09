import { Injectable, signal } from '@angular/core';

import {
  PriceModel,
  ReleaseData,
  ReleaseNote,
  latestRelease,
  priceModels,
  releaseNotes,
} from './site-data';

/**
 * The seam between the pages and the data the build baked in.
 *
 * The pages could import `site-data.ts` directly - they did at first - and
 * then there is no way to render a page for data the committed file does not
 * happen to contain. The price table could only be tested in the state the
 * licence server is in today, which is "no models at all", so the interesting
 * half of that component had no test.
 *
 * So: one injectable holding signals, which a test replaces or sets. Same
 * rule as everywhere else in this project - what crosses a boundary does so
 * through something that can be substituted.
 */
@Injectable({ providedIn: 'root' })
export class SiteContent {
  /** The release on offer, or null when the build knew none. */
  readonly release = signal<ReleaseData | null>(latestRelease());

  /** The release notes, newest first. */
  readonly notes = signal<readonly ReleaseNote[]>(releaseNotes());

  /** The purchasable models, empty while the shop has none configured. */
  readonly prices = signal<readonly PriceModel[]>(priceModels());
}
