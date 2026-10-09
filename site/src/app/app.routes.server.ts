import { RenderMode, ServerRoute } from '@angular/ssr';

import { sitePaths } from './app.routes';

/**
 * Everything is prerendered; nothing is rendered on request.
 *
 * The build emits finished HTML files and `outputMode: static` means no server
 * is deployed at all - the website has no backend (PO, 2026-10-09). The server
 * entry exists only so Angular can render the pages while building.
 *
 * Every path is named explicitly, from the one list in `app.routes.ts`. A
 * wildcard cannot enumerate a parameter: Angular has to be told which values
 * of `:lang` exist, or `/en` and `/it` are simply not written out and the
 * deployed site is German only. Deriving the list instead of repeating it is
 * what keeps a new page from being routed but never emitted - which on a site
 * without a backend is a 404 for a page that works locally.
 */
export const serverRoutes: ServerRoute[] = sitePaths().map(({ path }) => ({
  // Angular wants the route without a leading slash; `sitePaths` yields site
  // paths, so `/` becomes '' and `/en/imprint` becomes 'en/imprint'.
  path: path.replace(/^\/+/, ''),
  renderMode: RenderMode.Prerender as const,
}));
