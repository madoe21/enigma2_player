# Offene Stellen der Produktseite

Erzeugt am 2026-10-10 von `site/tool/check-placeholders.mjs`.
**Nicht von Hand pflegen**: Wert eintragen, dann
`npm run check:placeholders -- --write` erneut laufen lassen.

Diese Liste steht bewusst hier und nicht in Beads: es sind keine Aufgaben mit
Reihenfolge und Abhängigkeiten, sondern Werte, die erst existieren, wenn das
Unternehmen existiert (`license_server-xwl0`). Technisch funktioniert die
Seite; was hier steht, bringt ein Unternehmen mit.

## Stand

| | |
|---|---|
| Demo-Hinweis | **sichtbar** (`DEMO_MODE = true`) |
| Identitätsangaben | 15 offen |
| Prüfung scheitert bei Platzhaltern | nein, erst ab `FILLED` |

## Beim Livegang zu tun

1. **Die 15 Platzhalter unten ausfüllen**, alle in
   `site/src/app/legal/entity.ts`. Danach dort `ENTITY_STATUS` auf `FILLED`
   setzen: ab dann **scheitert** die Prüfung bei jedem verbliebenen
   Platzhalter, damit kein Rechtstext mit ⟨…⟩ online geht.
2. **Den Demo-Hinweis abschalten**: `DEMO_MODE = false` in
   `site/src/app/content/site-flags.ts`. Er steht auf jeder Seite und sagt,
   dass noch nichts gekauft werden kann.
3. **Dieselben Angaben im License Server eintragen**, dort in
   `compliance/legal/entity.yaml`. Zwei Repositorys können keine Datei
   teilen, also wird zweimal aus derselben Tatsache ausgefüllt.
4. **Preismodelle anlegen**, sonst sagt die Preisseite weiter „Preise sind
   bald verfügbar": der Endpunkt des License Servers antwortet, seine Liste
   ist leer.

## Die Platzhalter

| Platzhalter | Stellen |
|---|---|
| `⟨COMPANY_CITY⟩` | src/app/legal/entity.ts:36 |
| `⟨COMPANY_COUNTRY⟩` | src/app/legal/entity.ts:37 |
| `⟨COMPANY_LEGAL_NAME⟩` | src/app/legal/entity.ts:33 |
| `⟨COMPANY_POSTAL_CODE⟩` | src/app/legal/entity.ts:35 |
| `⟨COMPANY_STREET⟩` | src/app/legal/entity.ts:34 |
| `⟨CONTACT_EMAIL⟩` | src/app/legal/entity.ts:41 |
| `⟨CONTACT_PHONE⟩` | src/app/legal/entity.ts:42 |
| `⟨CONTENT_RESPONSIBLE⟩` | src/app/legal/entity.ts:47 |
| `⟨DPA_NAME⟩` | src/app/legal/entity.ts:51 |
| `⟨DPA_URL⟩` | src/app/legal/entity.ts:52 |
| `⟨MANAGING_DIRECTOR_1⟩` | src/app/legal/entity.ts:39 |
| `⟨PRIVACY_EMAIL⟩` | src/app/legal/entity.ts:49 |
| `⟨REGISTER_COURT⟩` | src/app/legal/entity.ts:43 |
| `⟨REGISTER_NUMBER⟩` | src/app/legal/entity.ts:44 |
| `⟨VAT_ID⟩` | src/app/legal/entity.ts:45 |
