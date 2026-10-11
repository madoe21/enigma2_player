# Verschobene Bead-Ids

Die Beads der Produktseite lagen bis zum 2026-10-09 in der Datenbank von `enigma2_player_source` und
wurden in die Datenbank DIESES Repositorys verschoben, damit jedes Produkt seine eigene
Warteschlange hat. Verschoben wurde mit **gleicher Endung und anderem Praefix**, deshalb ist die
Umrechnung mechanisch:

    enigma2_player_source-<endung>   ->   enigma2_player-<endung>

Aeltere Commits nennen die alte Id. Im Quell-Repository steht an jeder alten Id ein Zeiger auf
die neue - offene Beads wurden dort mit diesem Hinweis geschlossen, bereits geschlossene haben
ihn als Notiz. Gepflegt wird der Bead ab jetzt hier.

Abhaengigkeiten, deren Gegenstueck in einer anderen Datenbank liegt, stehen im jeweiligen Bead
nur noch als Text in den Notizen: eine Abhaengigkeit ueber zwei Datenbanken laesst sich nicht
ausdruecken, und sie vorzutaeuschen hiesse, einen Bead als bereit anzuzeigen, der es nicht ist.

| alte Id | neue Id | Status beim Umzug | Titel |
|---|---|---|---|
| `enigma2_player_source-1782845428743-11-493621e3` | `enigma2_player-1782845428743-11-493621e3` | closed | Cutover-Plan: altes Repo zur reinen Produktseite umbauen (Quellcode entfernen) |
| `enigma2_player_source-9v1` | `enigma2_player-9v1` | open | SEO der Produktseite bei der Umstellung nicht verlieren |
| `enigma2_player_source-bdb` | `enigma2_player-bdb` | closed | Angular 22 Workspace fuer die Produktseite anlegen: Prerender, fuenf Sprachen, Unterpfad |
| `enigma2_player_source-esp` | `enigma2_player-esp` | open | Impressum und Cookie-Richtlinie auf der Produktseite (Template) |
| `enigma2_player_source-hsf` | `enigma2_player-hsf` | open | [epic] Produktseite auf Angular 22: Astro wird abgeloest |
| `enigma2_player_source-iaa` | `enigma2_player-iaa` | open | Produktseite NVDA-fest machen: Angular Aria, WCAG 2.2 AA |
| `enigma2_player_source-n5j` | `enigma2_player-n5j` | open | Inhalte und Komponenten der Astro-Seite nach Angular 22 uebertragen |
| `enigma2_player_source-oik` | `enigma2_player-oik` | open | Produktseite bietet die Downloads aus dem Quell-Repo an, Webseite selbst unversioniert |
| `enigma2_player_source-q6p` | `enigma2_player-q6p` | open | Demo-Hinweis auf der Produktseite und TODO.md fuer die Template-Reste |
| `enigma2_player_source-vmk` | `enigma2_player-vmk` | open | Cookie-Modal auf der Produktseite: akzeptieren oder die Seite nicht nutzen |
| `enigma2_player_source-w83` | `enigma2_player-w83` | open | [bug] Produktseite: /fr und /it werden als Deutsch ausgezeichnet, Navigation bleibt deutsch |
| `enigma2_player_source-yrq` | `enigma2_player-yrq` | open | [security] Produktseite: 1 kritische und 10 hohe Schwachstellen im Astro-Abhaengigkeitsbaum |

## 2026-10-10: die Gegenrichtung - diese Datenbank traegt nur noch Webseiten-Beads

Der Umzug am 2026-10-09 hat die Produktseiten-Beads hierher geholt, aber den **Altbestand der
App nicht mitgenommen**: dieses Repository war bis zum Cutover das Repository der Flutter-App,
also lagen deren Beads weiter in dieser Datenbank. Von 128 Beads gehoerten 105 nicht zur
Webseite. Vorgabe des PO vom 2026-10-10: hier bleiben ausschliesslich Beads der Produktseite,
App-Arbeit gehoert nach `enigma2_player_source`, License-Server-Arbeit nach `license_server`.

**Archiv:** jeder der 105 entfernten Beads liegt vollstaendig (Beschreibung, AC, Notizen,
Kommentare, Labels, Zeitstempel) in `.beads/archive-2026-10-10-non-site-beads.jsonl`. Die Datei
ist der einzige Weg zurueck - `bd delete` ist endgueltig. Wiederherstellen einzelner Beads:
Zeile herausziehen und `bd import` im Zielrepository.

### Verschoben nach `enigma2_player_source` (5)

Gleiche Endung, neues Praefix - `enigma2_player-<endung>` -> `enigma2_player_source-<endung>`.
Diese fuenf tragen echte offene Arbeit: der Code ist da, die Pruefung an einem echten Receiver
fehlt (das braucht Hardware), oder sie sind noch nicht umgesetzt.

| alte Id | neue Id | Status | Titel |
|---|---|---|---|
| `enigma2_player-mxc` | `enigma2_player_source-mxc` | in_progress | AutoTimer CRUD: live OpenATV 7.6.1 + Plugin-Verifikation |
| `enigma2_player-bxh` | `enigma2_player_source-bxh` | in_progress | Current-Channel Info-Dialog: live OWIF 2.2.4 Verifikation |
| `enigma2_player-sd0` | `enigma2_player_source-sd0` | in_progress | PowerTimer: live OpenATV 7.6.1 Verifikation |
| `enigma2_player-xn4` | `enigma2_player_source-xn4` | open | Receiver-Kompatibilitaet fuer unterschiedliche Enigma2-Images testen |
| `enigma2_player-x3i` | `enigma2_player_source-x3i` | open | Phone: D-Pad-Verhalten auch im NavigationDrawer |

### Entfernt, weil im Quell-Repo erledigt (5)

Nicht verschoben, sondern geloescht: die Arbeit steht im Quell-Repo fertig im Code. Belegt
wurde das je Bead am Code und an geschlossenen Geschwister-Beads, nicht vermutet.

| Id | Titel | Beleg im Quell-Repo |
|---|---|---|
| `enigma2_player-61s` | Timer mit Receiver synchronisieren (Aufwach-/Ausschalt-Timer) | PowerTimer-Reiter in `lib/screens/timer_screen.dart`, `/api/powertimerlist|add|delete|togglestatus` in `enigma_api_service.dart`; `w7y` und `9lt` geschlossen |
| `enigma2_player-11a` | Tonspur-Umschaltung: Pause, Speedup, A/V async | Duplikat des spaeter angelegten und geschlossenen `6ct`; Fix (`demuxer-max-back-bytes`) in `lib/services/mpv_stream_tuning.dart` |
| `enigma2_player-b0k` | Teletext: Uhr laeuft nicht live, Page-Cache fehlt | `_latestHeaderClock` + `_withLiveClock` im Decoder, Seiten liegen in `TeletextState.pages`, Overlay rendert daraus |
| `enigma2_player-yg4` | Teletext: ARD-Logo falsch (Mosaic-Graphics) | Mosaic-Mode, Hold-Mosaic und Separated/Contiguous im Decoder plus Unit-Tests; live an Das Erste HD verifiziert (bd memory) |
| `enigma2_player-b6n` | Neuer Tab 'Receiver-Einstellungen' | `receiver_settings_screen.dart` + Provider + Model + `TabType`; `164` und `0yi` geschlossen, Live-Befunde `ep2` und `2f0` im Quell-Repo gefixt |

### Entfernt ohne Umzug (95)

- **70 geschlossene App-Beads** - Fire TV, Bouquet-Editor, Timer, Teletext, OSCam, Packaging,
  Tests. Die Arbeit liegt als Code und Git-Historie im Quell-Repo; ein zweites Mal als Bead
  braucht es sie nicht.
- **24 Beads mit Praefix `enigma2_player_source-`** - Dubletten aus der Zeit, in der beide
  Produkte eine Datenbank teilten. Alle 24 existieren in der Datenbank des Quell-Repos, dort
  ist der gepflegte Stand (drei standen hier noch `in_progress` und sind dort geschlossen).
- **1 License-Server-Bead** - `enigma2_player-h0i` (Preismodelle fuer die Anwendung enigma2).
  Dieselbe Sache wird in `license_server-zxod` gefuehrt und ist dort offen.

### Memories (15)

`bd remember` hatte in dieser Datenbank 15 Eintraege, alle App-Wissen (lamedb-Feldreihenfolge,
Teletext- und DVB-Untertitel-Decoder, mpv-Tonspurwechsel, OpenWebIF-Endpunkte, Windows-Build,
`file_picker`-Pinning, Passwortverschluesselung, Stream-Relay). Sie sind inhaltsgleich in die
Datenbank von `enigma2_player_source` uebernommen (Pruefung: 15/15 Zeichen fuer Zeichen gleich)
und hier mit `bd forget` entfernt. Diese Datenbank hat jetzt keine Memories - Webseiten-Wissen
kann neu entstehen.
