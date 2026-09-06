# D0 – Prüfbericht

Stand: 05.09.2026. Aktueller Lauf nach Dokumentationskonsolidierung unter Windows
mit Node 22.23.1 und lokalem Chrome. Keine fachliche Freigabe.

## Erneute Prüfung vor GitHub-Bereitstellung

Am 05.09.2026 erneut ausgeführt: Typecheck, Lint und Produktionsbuild erfolgreich,
alle 10 Inhaltstests und alle 19 Browsertests bestanden (22,5 s). Der Browserlauf
verwendete den vorhandenen lokalen Devserver auf 127.0.0.1:3100 und Chrome.
Ein separater Agent prüfte Konfiguration, Lockfile und Assetbestand auf
Veröffentlichungshindernisse; keine gefunden. Dies war keine fachliche Prüfung.
Die folgenden Angaben zur Dokumentationskonsolidierung beschreiben den früheren
Lauf; insbesondere der dortige 63-Dateien-Vergleich wurde nicht erneut ausgeführt.

## Tatsächlich ausgeführt

| Prüfung | Ergebnis |
|---|---|
| Typecheck, Lint, Produktionsbuild | Erfolgreich |
| `npm test` | 10 Tests bestanden |
| `npm run test:browser` | 19 Tests bestanden, 22,7 s |
| Lokale Markdown-Dateiverweise | Keine fehlenden Zieldateien |
| SHA-256-Vergleich gegen Bestand vor Bereinigung | 63 Inhalts-, Quellen-, Vorlagen-, Asset- und Codedateien unverändert |
| Separates Dokumentationsreview | Anforderungen, Statusgrenzen und Verweise geprüft; Befunde eingearbeitet |

Start- und Testbefehle stehen im [Laborhandbuch](README.md). Die Browsertests
liefen gegen den vorhandenen lokalen Devserver auf 127.0.0.1:3100.

## Abgedecktes Verhalten

- Vollständige Originallektion und Quellen S05/S06; sichere Markdown-Verarbeitung,
  Originalhash und Herkunft der vier getrennten Schreibproben.
- Zehn Presets, Fokusmodus, Reader/Workbook, Bildpräsentation und Mythologie;
  deterministische Interaktion und Aufgaben, Antwort vor Lösung, Reset und Tastatur.
- Unabhängige A/B-Ansichten, erhaltene Antworten beim Stilwechsel, URL und Reload;
  persönliche Bewertungen, echte JSON-/Markdown-Downloads und gezielter Reset.
- Speicherfehler, 390-px-Ansichten, reduzierte Bewegung und simuliertes CSS-Zoom 2;
  Texttoken-Kontrast in den zehn Presets. Keine horizontale Überbreite im Testpfad.
- Alle 15 lokalen PNGs, Filter, Favoriten, römische Vergleichspaare, Bildausschnitte;
  Herkunft, PNG-Abmessungen und SHA-256 stimmen mit dem Manifest überein.
- Gemeinsame Anatomiepfade in drei Darstellungen, Nummern/Legenden, URL-Erhalt;
  Versionsbindung und echter Prüfpaket-Export mit zwei SVG-Fassungen und Hashes.
- Keine externen Requests oder JavaScript-Seitenfehler in den überwachten
  Lern- und Bildlaborpfaden.

Desktop- und Mobilaufnahmen wurden während der ursprünglichen Implementierung
visuell betrachtet. Der aktuelle Browserlauf reproduziert die vorgesehenen
Screenshots; eine neue manuelle Sichtprüfung war für die unveränderte UI nicht nötig.

## Dokumentationsbereinigung

[CONTEXT](../CONTEXT.md) definiert Begriffe, die [Spezifikation](../docs/specs/d0-design-lab.md)
enthält Ziel und Abnahme, drei ADRs halten grundlegende Abwägungen fest.
Die übertragenen Doppelablagen `PLAN.md` und `DECISIONS.md` sind entfernt.
README und Agenteneinstiege sind aktualisiert; historische Startaufträge und
Produktbacklog bleiben als solche gekennzeichnet erhalten. Keine Appänderung.

Auf Empfehlung des Reviewers wurden Pflichtvisuals, Schutz verdeckter Antworten,
Selbstbewertung und direkte ADR-Verweise ergänzt. Überholte
Aussagen zur noch offenen Stilwahl sind durch den aktuellen Ziel-/Ist-Stand ersetzt.

## Erhalt der Inhaltsbasis am 6. September 2026

Das Labor liest jetzt den bytegleichen Inhaltsstand aus
`content/baseline-0.1.0/`, während die Produktlektion separat überarbeitet wird.
Alle zehn Inhaltstests, Typecheck und Lint bestanden. Die Schreibproben behalten
ihre Texte und Quellenhashes; nur der explizite Herkunftspfad wurde angepasst.
Für diese reine Pfadumstellung wurde kein neuer Browserlauf ausgeführt.

## Grenzen und ausstehende Arbeit

- Die gewählte lebhafte Marmorbibliothek ist spezifiziert; ihre vollständige
  Zusammenführung und humorvoll-geschichtenerzählende Schreibprobe sind noch offen.
- Anatomische Konturen, Proportionen und Projektion sind nicht unabhängig fachlich
  abgenommen. Agentenreview und Softwaretests ersetzen das nicht.
  [Konkrete Prüfgrundlage](ANATOMY_REVIEW.md).
- Keine Lernwirksamkeitsmessung, vollständige WCAG-Prüfung oder manuelle
  Screenreaderprüfung. Kontrastprüfung umfasst Texttokens, nicht jede Pixelkombination.
- Kein Firefox, Safari oder echtes Mobilgerät; CSS-Zoom ist kein natives Zoommenü.
  `npm start` und ein Portkonflikt wurden nicht als eigene Bedienstrecken geprüft.
- M0 ist inzwischen getrennt vom Labor implementiert; sein Prüfstand steht im
  [M0-Abnahmebericht](../docs/reviews/m0-07-pilot-feedback.md). Die obigen
  D0-Browserergebnisse prüfen diese Produktstrecke nicht mit.
