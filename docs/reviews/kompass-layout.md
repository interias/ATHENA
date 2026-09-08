# Kompakter Aufbau nach Stefans Fitness-Kompass

Nutzerauftrag vom 8. September 2026: ATHENA wirkt trotz des vorherigen Breitenfixes
zu ausladend und zu groß gesetzt. Struktur und Aufbau des vorhandenen
`stefans-fitness-kompass` sollen weitgehend übernommen werden, bei weiterhin
pompejanisch-roter Farbwelt und den vorhandenen generierten Bildern.

## Gelesene Referenz

Lokales Repository `C:/Users/stefa/git/stefans-fitness-kompass`, ausschließlich
als lesende Layoutreferenz verwendet:

| Datei | Übernommenes Prinzip |
|---|---|
| `DESIGN.md` | Kompaktes Wissensprodukt, stabile Lesespalte, feste Schriftgrößen, sparsame Karten |
| `client/app/globals.css` | 16-px-Oberfläche, 16,5-px-Lesetext, 34/25/17,5-px-Überschriften, dezente Linien |
| `client/app/_localized/chapter-page.tsx` | Desktop-Navigation links, Artikel mittig, Abschnittslinks rechts; mobile Inhaltsübersicht |
| `client/components/site-header.tsx` | Gemeinsamer kompakter Seitenkopf und direkte Orientierung |
| `client/components/chapter-nav.tsx` | Aktive Lektion eindeutig markieren und Titel in einer ruhigen Liste zeigen |
| `client/app/_localized/home-page.tsx` | Direkter Einstieg und kompakte Übersicht statt einer bildschirmfüllenden Bühne |

Die Referenz wurde nicht verändert. Ihre Texte, fremden Assets, Suchfunktion,
Sprachversionen und technische Abhängigkeiten wurden nicht übernommen.

## ATHENA-Umsetzung

Die Struktur betrifft Startseite und Pilotreader. ATHENAs Farben, Bilder und
Quellenkennzeichnung bleiben erhalten. Die drei redaktionellen Illustrationen
erscheinen kleiner, behalten aber ihren vollständigen Bildausschnitt. Nur das
dekorative Architekturbild wird als flaches Banner präsentiert.

Lektionsnavigation und Abschnittsübersicht verwenden vorhandene Inhalte.
Geplante Lektionen bleiben gesperrt. Der Lesetext, seine Quellenmarker, die
Aufgaben und die Inhaltsversion `0.2.0` bleiben unverändert; gespeicherte Antworten,
Selbstbewertungen und Pilotfeedback werden nicht migriert oder gelöscht.

Die Änderung ersetzt den am 6. September dokumentierten Zwischenstand des
[Breitenfixes](reader-width.md). Das dort erkannte Problem bleibt eine
Prüfanforderung: Komponenten dürfen ihre Inhaltsfläche nicht verlassen.
Das Design Lab bleibt als historischer Vergleich erhalten.

## Sichtprüfung

Startseite und Reader wurden bei 1440 und 390 px geprüft, einschließlich eines
Aufgabenabschnitts. Der Seitenkopf misst 60 px auf Desktop und 56 px auf Mobil;
der Seitentitel bleibt bei 34 px. Die Illustrationen sind auf Desktop höchstens
420 px breit und vollständig sichtbar. Das Architekturmotiv nutzt ein 4:1-Banner.

Die Browsermessung am Layoutwechsel ergab:

| Viewport | Darstellung | Artikel einschließlich Innenabständen |
|---:|---|---:|
| 1199 px | Eine Spalte, aufklappbare Navigationen | 760 px |
| 1200 px | Drei Spalten | 690 px |
| 1262 px | Drei Spalten | 720 px |
| 1440 px | Drei Spalten | 720 px |

Die Seitenscrollbreite entsprach jeweils der Viewportbreite. Die mittlere
Grid-Spalte schrumpft unterhalb ihrer Maximalbreite; sie erzeugt am Breakpoint
keinen horizontalen Überlauf. Die mobilen Navigationen haben sichtbare
Aufklappindikatoren. Eine fehlgeschlagene optionale Curriculum-Abfrage oder
deren nicht lesbare JSON-Antwort verhindert das Laden der Lektion nicht.

## Technische Prüfung und Agentenreview

- Web-Browsersuite: **31/31 bestanden**. Sie umfasst Aufgaben, Quellendialog,
  gespeicherte Antworten, Selbstbewertung, Lesestatus und Pilotfeedback.
- Überlauf und enthaltene Karten geprüft bei 320, 390, 768, 1024, 1199, 1200,
  1262 und 1440 px, jeweils mit geschlossenem und geöffnetem Feedback.
- Echter Chrome-Seitenzoom von 200 Prozent bestanden. Die Seitenleisten weichen
  dabei den mobilen Navigationen; die Inhalte bleiben innerhalb der Lesefläche.
- Mobile Navigation per Enter sowie Abschnittssprung unterhalb des festen
  Seitenkopfs geprüft. Ein Ausfall der optionalen Curriculum-Abfrage wurde
  gezielt simuliert; die Lektion bleibt verfügbar.
- Typecheck, Lint, Produktionsbuild und `git diff --check`: bestanden.

Der Kontrasttest berücksichtigt jetzt den tatsächlichen Vorfahrenhintergrund
transparenter Textelemente. Die frühere Messung gegen Schwarz war für die neue
helle Titelzeile unzutreffend; eine Farbkorrektur war nicht erforderlich.

Ein vom Implementer getrennter GPT-5.6-Sol-High-Reviewer prüfte Referenz,
React-/CSS-/Testdiff und sechs Desktop-/Mobilansichten. Ergebnis nach der
Prüfschleife: **keine offenen Befunde**. Dies ist ein Agentenreview der Oberfläche,
keine unabhängige fachliche Freigabe der Lerninhalte.

Die Tests liefen mit isolierter SQLite-Datenbank und eigenen lokalen Diensten;
deren Listener wurden anschließend beendet. Generierte Next-Entwicklungsdateien
wurden bereinigt. Gegenüber `main` gibt es keine Änderungen an Lehrinhalten,
Bilddateien, API, Datenbankschema, D0 oder Abhängigkeiten. API- und D0-Suiten wurden
für diese Oberflächenänderung nicht erneut ausgeführt. Die laufende
Docker-Instanz auf Port 3000 wurde nicht verändert.
