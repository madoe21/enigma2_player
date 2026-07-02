// @ts-check
import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Project page on GitHub Pages: https://madoe21.github.io/enigma2_player/.
// When a custom domain is set up (bead #25), change `site` and drop `base`.
export default defineConfig({
  site: 'https://madoe21.github.io',
  base: '/enigma2_player',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'es'],
    // `de` stays unprefixed at the root; `en`/`es` live under /en, /es.
    routing: {prefixDefaultLocale: false},
  },
});
