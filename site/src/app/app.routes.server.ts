import { RenderMode, ServerRoute } from '@angular/ssr';

import { prefixedLocales } from './i18n/locales';
import { pageRoutes } from './app.routes';

/**
 * Everything is prerendered; nothing is rendered on request.
 *
 * The build emits finished HTML files and `outputMode: static` means no server
 * is deployed at all - the website has no backend (PO, 2026-10-09). The server
 * entry exists only so Angular can render the pages while building.
 *
 * The prefixed languages are named explicitly, because a wildcard cannot
 * enumerate a parameter: Angular has to be told which values of `:lang` exist,
 * or `/en` and `/it` are simply not written out and the deployed site is
 * German only.
 */
export const serverRoutes: ServerRoute[] = [
  ...prefixedLocales.map((lang) => ({
    path: `${lang}/**`,
    renderMode: RenderMode.Prerender as const,
  })),
  ...pageRoutes.map((page) => ({
    path: page.path,
    renderMode: RenderMode.Prerender as const,
  })),
];
