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
