import { Component, input } from '@angular/core';

import { Lang } from '../i18n/locales';

/**
 * The flag beside a language in the switcher, drawn inline.
 *
 * Inline SVG rather than an image or an emoji, for three reasons that are all
 * requirements on this site rather than preferences (enigma2_player-13h):
 *
 * - **No request.** A sprite, an icon font or a CDN flag set would be a
 *   network call on a site whose whole premise is that it makes none, and it
 *   would be made before anyone consented to anything.
 * - **It renders everywhere.** The regional-indicator emoji (🇩🇪) are the
 *   cheap option and Windows ships no font for them: Chrome and Firefox there
 *   draw the two letters "DE" instead of a flag, which would leave the switcher
 *   showing its code twice and its flag never.
 * - **It says nothing.** The flag is decoration: `aria-hidden`, so a screen
 *   reader is given the language's own name from the switcher and not a
 *   country. A flag is not a language - German is not spoken only in Germany,
 *   and the English entry carries a British flag for want of a better one. The
 *   objection was raised and the PO decided for flags; the name stays the
 *   accessible name precisely so that decision costs no reader anything.
 *
 * The colours are the flags' own and must not become theme tokens - a flag
 * that follows the dark mode is not that flag any more. One viewBox for all
 * five keeps them the same size without five CSS rules.
 */
@Component({
  selector: 'site-lang-flag',
  template: `
    <svg class="flag" viewBox="0 0 9 6" aria-hidden="true" focusable="false">
      @switch (lang()) {
        @case ('de') {
          <rect width="9" height="2" fill="#000000" />
          <rect y="2" width="9" height="2" fill="#dd0000" />
          <rect y="4" width="9" height="2" fill="#ffce00" />
        }
        @case ('en') {
          <!--
            The Union Flag, without the counterchange of the diagonals: at
            20 px wide the offset is a third of a pixel, and drawing it needs a
            clip path whose id would have to be unique per instance.
          -->
          <rect width="9" height="6" fill="#012169" />
          <path d="M0 0L9 6M9 0L0 6" stroke="#ffffff" stroke-width="1.2" />
          <path d="M0 0L9 6M9 0L0 6" stroke="#c8102e" stroke-width="0.7" />
          <path d="M4.5 0V6M0 3H9" stroke="#ffffff" stroke-width="2" />
          <path d="M4.5 0V6M0 3H9" stroke="#c8102e" stroke-width="1.2" />
        }
        @case ('es') {
          <rect width="9" height="6" fill="#aa151b" />
          <rect y="1.5" width="9" height="3" fill="#f1bf00" />
        }
        @case ('fr') {
          <rect width="3" height="6" fill="#002654" />
          <rect x="3" width="3" height="6" fill="#ffffff" />
          <rect x="6" width="3" height="6" fill="#ce1126" />
        }
        @case ('it') {
          <rect width="3" height="6" fill="#008c45" />
          <rect x="3" width="3" height="6" fill="#f4f5f0" />
          <rect x="6" width="3" height="6" fill="#cd212a" />
        }
      }
    </svg>
  `,
  styleUrl: './lang-flag.css',
})
export class LangFlag {
  /** The language whose flag to draw. Required: there is no neutral flag. */
  readonly lang = input.required<Lang>();
}
