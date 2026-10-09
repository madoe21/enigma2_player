# Offene Stellen der Produktseite

Erzeugt von `site/tool/check-placeholders.mjs`. **Nicht von Hand pflegen** -
ausfüllen heißt: den Wert in `site/src/app/legal/entity.ts` eintragen und das
Skript erneut laufen lassen.

Diese Liste steht bewusst hier und nicht in Beads: es sind keine Aufgaben mit
Reihenfolge und Abhängigkeiten, sondern Werte, die erst existieren, wenn das
Unternehmen existiert (`license_server-xwl0`).

Stand: 16 offene Platzhalter an 16 Stellen.

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
| `⟨UPPER_SNAKE⟩` | src/app/legal/entity.ts:5 |
| `⟨VAT_ID⟩` | src/app/legal/entity.ts:45 |

Dieselben Angaben werden im License Server ein zweites Mal gebraucht
(`compliance/legal/entity.yaml`). Zwei Repositorys können keine Datei teilen,
also wird zweimal aus derselben Tatsache ausgefüllt.
