# Zielgrößen und Progression: Umsetzung und Prüfung

Stand: 8. September 2026. Umsetzung des bestätigten
[ersten Ausbaupakets](../plans/content-expansion.md).

## Umfang

Zwei zusätzliche Fünf-Minuten-Lektionen mit je einer Hauptaufgabe, optionaler
Vertiefung und einer generierten Illustration. Der kompakte Kompass-Aufbau
bleibt; die Schrift wird behutsam kleiner. Die fünf Minuten sind ein
Gestaltungsziel einschließlich Hauptaufgabe, keine gemessene Nutzungsdauer.

Lektionsidentität und Reihenfolge werden getrennt: Die vorhandene Zielgrößen-
Lektion behält `ch01-l02`. Die neue Progressionslektion erhält `ch01-l05` und
steht an dritter Stelle. Die ältere geplante Lektion `ch01-l03` behält ihre
Identität. Veröffentlichte Inhalte sind ohne Bestehenshürde zugänglich.

## Technische Umsetzung

Die API veröffentlicht explizit `ch01-l01`, `ch01-l02` und `ch01-l05` mit den
zugehörigen Aufgaben. Lektionsdateien und redaktioneller Status allein erteilen
keine Freigabe. Die Webrouten lassen nur die explizit freigeschalteten IDs zu
und leiten ausschließlich an den festgelegten API-Pfad weiter; die API prüft
die Veröffentlichung nochmals gegen ihr validiertes Inhaltsmanifest.
Die Host-/Origin-Prüfung für Schreibzugriffe bleibt erhalten.

Kapitel und Aufgabenbank tragen Version `0.3.0`; L1 bleibt bei `0.2.0`. Aufgaben
folgen ihrer jeweiligen Lektionsversion. Die vorhandenen Datenbankstrukturen
genügen: Es gibt keine neue Migration und keine Änderung an gespeicherten
Antwortsnapshots. Eine unveränderte L1-Datei wurde bytegenau gegen den
Ausgangsstand `89fe875` geprüft; die YAML-Blöcke von q01/q02 sind nach
Zeilenendennormalisierung unverändert.

Markdown bleibt Daten. Die kontrollierten Überschriftenpräfixe `Vertiefung:` und
`Kurzabruf:` werden als native aufklappbare Bereiche gerendert. Beim Kurzabruf
steht die Frage im sichtbaren Aufklapptitel, die Einordnung dahinter.
Hauptaufgaben bleiben außerhalb dieser Bereiche. Nummerierte Prüffragen werden
als semantische Listen angezeigt; Quellenmarker bleiben bedienbar.

## Ausgeführte Prüfungen

- ContentLoader: Status `ok`, keine Inhaltsbefunde.
- Backend: 85 Tests bestanden; zwei bestehende Deprecation-Warnungen.
- Web-Typecheck, Lint und Produktionsbuild bestanden.
- Beide neuen Illustrationen: Abmessungen, Dateigröße, SHA-256 und lesbares
  WebP-Format geprüft; zusammen 573.502 Bytes ohne Beschnitt oder Skalierung.
- Root-Sichtprüfung beider neuer Lektionen bei 1440 und 390 px: je eine
  vollständige Illustration, geschlossene optionale Bereiche und keine
  horizontale Überbreite. Desktop-Artikelbreite 720 px.
- Schrift: Fließtext 16 px, Seitentitel 32 px, Abschnitte 23 px. Die lange
  Aufgabenschrift wurde nach der mobilen Sichtprüfung nochmals auf 18 px bei
  1,4-facher Zeilenhöhe reduziert und erneut angesehen.

- Browser: 36 Tests bestanden, einschließlich Speichern der neuen Auswahl- und
  Freitextaufgaben, Selbstbewertung, Lesestatus nach Neuladen und optionaler
  Vertiefung. Echter Chrome-Seitenzoom von 200 Prozent prüft L1, L2 und L3.
  Tastaturbedienung, Quellendialog, Mobilansicht und geplante gesperrte Inhalte
  sind abgedeckt.

Zwei zwischenzeitliche Browserfehler stammten von zuvor gesetzten
Test-Lesemarkierungen. Die Verfügbarkeitsprüfung ist jetzt unabhängig vom
Lesestatus; der Fortschrittstest stellt seinen Ausgangszustand selbst her,
und die neue Lernstrecke räumt ihre Lesemarkierung nach der Prüfung auf.

## Getrennte Prüfung

Die redaktionelle Quellenprüfung und der fachliche Diff stehen in
[L2/L3-Redaktion](l2-l3-editorial.md). Texte, Bilder und Code wurden jeweils von
einem vom Ersteller getrennten GPT-5.6-Sol-High-Agenten geprüft. Das
[Code-Review](l2-l3-code-review.md) ist ohne offene Befunde abgeschlossen.
Korrigiert wurden eine falsche Lektionsnummer bei ausgefallener Navigation,
eine unvollständige Grafikabhängigkeitsprüfung und ein nicht unterstützter
veröffentlichter Aufgabentyp. Die zugehörigen negativen Tests bestehen.
Agentenreview ist keine unabhängige menschliche Fachfreigabe.

## Lokale Vorschau und bestehende Installation

Entwicklung und Browserprüfungen verwenden eine eigene SQLite-Datei. Die
bestehende Docker-Installation und ihr Lernstand werden durch diese Arbeit
nicht ersetzt. Die alte API hält ihre Inhaltsfassung seit dem Start im Speicher;
ein Neustart mit den geänderten eingebundenen Inhaltsdateien benötigt auch den
dazu passenden neuen API-Stand.

Die lokale Testvorschau verwendet API-Port 8137, Web-Port 3217 und einen auf
die erlaubten lokalen App-Hosts begrenzten Testproxy auf Port 3218. Dadurch
lassen sich die unveränderten Host-/Origin-Regeln mit der App-Adresse
`http://127.0.0.1:3000` in einem eigenen Browserprofil prüfen. Die normale
Browser-Sitzung erreicht unter dieser Adresse weiterhin die Docker-App.

Aufnahmen und Starthelfer liegen lokal unter `.scratch/l2-l3-runtime/`.
Nach den automatischen Tests wurde die Vorschau auf die frische Datei
`preview.db` umgestellt: keine Testantworten und zunächst 0 von 3 Lektionen
gelesen. Eingaben in dieser Vorschau gehören zu dieser separaten Datei.
Der Agent-Browser-Skill wurde herangezogen; sein Chrome-Autostart scheiterte
mit `CDP response channel closed`. Die tatsächlichen Browserprüfungen verwenden
deshalb das vorhandene Playwright mit installiertem Chrome.

Merge und Deployment sind eigene Schritte nach Übergabe des geprüften PRs.
