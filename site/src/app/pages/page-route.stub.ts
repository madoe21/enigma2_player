/**
 * A route as the pages read it: the data, and the path it was reached under.
 *
 * The path is there because `PageBase` builds the document title, the canonical
 * URL and the hreflang set from it - a stub without it would test a page that
 * cannot say which page it is.
 *
 * Shared rather than copied: four spec files already carry their own identical
 * copy of this (enigma2_player-4t1 added the fifth caller and stopped there -
 * migrating the existing four is its own change). Not a `.spec.ts`, so the test
 * runner does not pick it up as a suite of its own.
 */
export function routeStub(data: Record<string, unknown>) {
  const segments =
    data['lang'] === 'de' || data['lang'] === undefined ? [] : [String(data['lang'])];
  return {
    snapshot: {
      data,
      pathFromRoot: [{ url: segments.map((path) => ({ path })) }],
    },
  };
}
