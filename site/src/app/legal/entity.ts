/**
 * Every identity value a legal text on this site needs - in one place.
 *
 * The placeholder form is the one the licence server already uses,
 * `⟨UPPER_SNAKE⟩` (`license_server/compliance/legal/entity.yaml`), so the same
 * kind of script finds them and a fill-in is a swap of values rather than a
 * search through prose. Nothing here is invented: the company does not exist
 * yet, and an imprint with a made-up address is worse than one with a visible
 * gap - the gap is honest and it is findable.
 *
 * KNOWN COST, stated rather than discovered later: these fields also exist in
 * the licence server's `entity.yaml`. Two repositories cannot share one file,
 * so filling in means filling in twice, from the same facts. `tool/
 * check-placeholders.mjs` reports what is still open here; the licence server
 * has its own check for its own copy.
 */

/** Marks the file as not yet filled in; the check script keys off it. */
export const ENTITY_STATUS = 'PLACEHOLDERS_UNFILLED' as const;

/**
 * The identity fields, in the shape the texts consume them.
 *
 * The texts reference these keys and never restate a value, because the first
 * restated value is the one that stays wrong after a change.
 */
export const ENTITY = {
  /**
   * Full legal name INCLUDING the legal-form suffix. For a UG it has to read
   * "… UG (haftungsbeschränkt)" in full - abbreviating it is a common and
   * avoidable defect in an imprint.
   */
  legalName: '⟨COMPANY_LEGAL_NAME⟩',
  street: '⟨COMPANY_STREET⟩',
  postalCode: '⟨COMPANY_POSTAL_CODE⟩',
  city: '⟨COMPANY_CITY⟩',
  country: '⟨COMPANY_COUNTRY⟩',
  /** Every managing director has to be named (§5 DDG). */
  managingDirector: '⟨MANAGING_DIRECTOR_1⟩',
  /** §5 DDG: details allowing fast electronic contact. An address alone is not enough. */
  email: '⟨CONTACT_EMAIL⟩',
  phone: '⟨CONTACT_PHONE⟩',
  registerCourt: '⟨REGISTER_COURT⟩',
  registerNumber: '⟨REGISTER_NUMBER⟩',
  vatId: '⟨VAT_ID⟩',
  /** §18 MStV: the person answerable for the editorial content. */
  contentResponsible: '⟨CONTENT_RESPONSIBLE⟩',
  /** Where data-subject requests go; may be the same mailbox as [email]. */
  privacyEmail: '⟨PRIVACY_EMAIL⟩',
  /** Determined by the registered seat, and named in the privacy policy. */
  dpaName: '⟨DPA_NAME⟩',
  dpaUrl: '⟨DPA_URL⟩',
  /** Who hosts the site. GitHub Pages today, which is a processor and has to be named. */
  hostingProvider: 'GitHub, Inc., 88 Colin P Kelly Jr St, San Francisco, CA 94107, USA',
} as const;

/** The identity field names, for a check that wants to enumerate them. */
export type EntityField = keyof typeof ENTITY;
