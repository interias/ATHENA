# M0-05 – Freitextversuch und Selbstbewertung

Stand: 5. September 2026

## Umfang und Ergebnis

Ticket #5 aktiviert `q-ch01-02` an ihrer kanonischen Stelle. Die Aufgabe speichert
eine nicht leere freie Antwort mit höchstens 4.000 Unicode-Codepoints und optionaler
Zuversicht. Erst die Antwort auf den erfolgreich gespeicherten Versuch enthält den
kanonischen Lösungssnapshot mit Musterantwort, Feedback und Rubrik; die initiale
Lektionsantwort und das Clientbundle enthalten diese Felder nicht.

Die Oberfläche stellt den gespeicherten eigenen Text der Musterantwort und drei
kanonischen Pflichtkriterien gegenüber. `again`, `hard` und `good` werden als
Selbsteinschätzung erklärt; `good` ist nur wähl- und speicherbar, wenn alle
Pflichtkriterien markiert sind. Alternative korrekte Formulierungen werden
ausdrücklich zugelassen. Es gibt keine automatische Sprachbewertung und keinen
LLM-Aufruf. Entsprechend bleiben Freitextversuche bei
`objective_result = not_assessed` und `grading_source = self_assessment`.

Auswahlaufgabe `q-ch01-01`, kanonischer Inhalt, Research, D0 und die veröffentlichten
Migrationen `001_initial.sql` und `002_attempts.sql` wurden inhaltlich nicht geändert.
M1-Funktionen wie Scheduler, Tutor oder weitere Aufgaben sind nicht enthalten.

## Verträge und Persistenz

- `POST /v1/attempts` akzeptiert für `q-ch01-02` exakt `answer: {"text": "…"}`.
  Pydantic weist Leertext, falsche Typen, Zusatzfelder und mehr als 4.000
  Unicode-Codepoints mit `422` ab. Der Proxy erlaubt bis zu 32.768 Request-Bytes,
  sodass der Browserrequest mit 4.000 per `JSON.stringify` serialisierten
  Nicht-BMP-Codepoints samt Vertragsoverhead passt.
- Die API speichert Antwort, Metadaten, UTC-Zeit und den kanonischen Lösungssnapshot
  in einer Transaktion. Identische UUID-Replays liefern den gespeicherten Snapshot;
  geänderte Requests unter derselben UUID ergeben `409`.
- `POST /v1/attempts/{attempt_id}/self-assessment` akzeptiert genau
  `content_version`, `checked_criterion_ids` und `rating`. Kriterien werden gegen
  den Lösungssnapshot dieses Freitextversuchs geprüft und kanonisch geordnet.
  Unbekannte Versuche, Auswahlversuche, Versionen, Kriterien, Duplikate und Extras
  werden abgewiesen. Identische Replays sind idempotent, abweichende mit derselben
  Versuchs-ID ergeben `409`.
- Migration `003_free_text_attempts.sql` baut die in Migration 002 zu eng
  beschränkte Versuchstabelle transaktional um, kopiert alle vorhandenen Felder
  unverändert und ergänzt `solution_json`. `self_assessments` bindet genau einen
  Datensatz per Fremdschlüssel an einen Versuch. Ein Test migriert eine echte
  v2-Struktur mit Choice-Snapshot und festem UTC-Zeitstempel und vergleicht jedes
  Feld nach dem Upgrade.
- Nach unklarem Antwortstatus behält der Client Text, Zuversicht und UUID für einen
  identischen Retry. Eine Eingabeänderung erzeugt eine neue UUID. Nach unklarem
  Selbstbewertungsstatus bleiben Kriterien und Rating gesperrt, bis derselbe Request
  wiederholt oder ein neuer Freitextversuch begonnen wird.

Persönlicher Antworttext bleibt ausschließlich im JSON-Body und in SQLite; er wird
weder in URLs noch in Anwendungslogs geschrieben.

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm.cmd ci` | bestanden; 146 Pakete aus dem vorhandenen Lockfile installiert |
| API-Suite mit Python 3.13.2 und einmaligem `--basetemp`/`cache_dir` | 71 bestanden; zwei bekannte Deprecation-Warnungen aus TestClient/httpx |
| `npm.cmd run typecheck` | bestanden |
| `npm.cmd run lint` | bestanden |
| `npm.cmd run build` | bestanden; beide dynamischen Attempt-Proxy-Routen im Produktionsbuild |
| `docker compose -p athena-m0-5 up --build -d` | bestanden; API und Web healthy, ausschließlich Web auf `127.0.0.1:3000` |
| `npm.cmd run test:browser` gegen Compose | 19 bestanden; die bisherigen 15 Prüfungen plus Freitext, Unicode, Retry und Selbstbewertung |
| finaler `playwright test tests/lesson.spec.ts` nach Reviewkorrektur | 16 bestanden; vollständig deutsche sichtbare Ratinglabels mit geprüft |
| Unabhängiger Host-Upgradetest v2 → v3 | bestanden; echtes API-Image aus #4 erzeugte v2-Daten, das neue Image migrierte auf 1/2/3; Choice-Response-Snapshot exakt gleich, `foreign_key_check` leer, `integrity_check` ok |
| Unabhängige Host-Proxy-/Restartmatrix | bestanden; 4.000 Nicht-BMP-Codepoints original gespeichert, 4.001/Leertext `422`, Kriterien- und Pflichtfehler `422`, sechs parallele identische Selbstbewertungen gleich, Konflikt `409`, unbekannter Versuch `404`; beide Snapshots nach echtem API-Restart exakt gleich |
| 390-px- und Tastatur-Screenshots | vollständiger Reader ohne horizontalen Überlauf; Freitextfeld, Zähler, Zuversicht, Lösung und Selbstbewertung lesbar; Fokus nach Enter auf dem Feedback |
| `git diff --check` | bestanden |

Die API-Prüfungen decken 4.000 und 4.001 ASCII- sowie Nicht-BMP-Zeichen, Leertext,
Antworttypen, Extras, Versionen, Kriterien, Pflichtkriterien, UUID-Konflikte,
Parallelzugriff, getrennte neue Versuche, Replays und Persistenz ab. Die Browsertests
prüfen Lösungssperre in DOM und Bundle, Tastaturfokus, 390 px, 200 Prozent,
reduzierte Bewegung, reale Kontraste und beide unklaren Speicherstatus.

Der `agent-browser`-Start scheiterte wie in diesem Lauf bekannt mit
`CDP response channel closed`; der vorgesehene Playwright/Chrome-Fallback lief
vollständig. Die visuell geprüften Screenshots liegen im ignorierten `.scratch`-Bereich unter
`.scratch/m0-05-free-text-390.png` und `.scratch/m0-05-free-text-keyboard.png`.

## Unabhängiges Reviewergebnis

### Standards

Der Diff ab `e11dd2a4a459cdb31cc2506754d47c3d4eafaa7d` hält die dokumentierten
Projektstandards und die bestehende Architektur ein. Next.js bleibt ein schmaler,
methoden- und pfadgebundener Proxy; FastAPI validiert die Domänenregeln, und nur
die API schreibt SQLite. Die veröffentlichten Migrationen 001 und 002 haben exakt
ihre bisherigen Git-Blob-Hashes. Es wurden keine neuen Abhängigkeiten, externen
Laufzeitrequests, Logs mit Antworttexten oder nicht beauftragten Funktionen
eingeführt. Im abschließenden Diff blieb kein berichtspflichtiger
Standardsverstoß oder Code-Smell offen.

Ein früher Reviewbefund wurde vor der Abnahme korrigiert: Die sichtbaren
Selbsteinschätzungen verwenden jetzt durchgehend die deutschen Bezeichnungen
„Noch einmal“, „Schwierig“ und „Gut“; die stabilen API-Werte bleiben intern
`again`, `hard` und `good`.

### Spec

Alle sechs Abnahmekriterien aus Ticket #5 sind im geprüften Stand erfüllt. Der
Reviewer glich Prompt, Musterantwort, Feedback und alle drei Rubrikkriterien direkt
mit `content/ch01/05_QUESTIONS.md` ab. Der initiale Lesson-Payload sowie DOM,
zugängliche Beschriftungen und Produktionsbundle enthielten weder Musterantwort
noch Rubrik. Nach dem erfolgreichen Commit des Versuchs wurden genau der
gespeicherte Originaltext und der kanonische Lösungssnapshot ausgeliefert. Die
Selbstbewertung bleibt versuchs- und versionsgebunden, kanonisch geordnet und
ehrlich als `objective_result = not_assessed` und
`grading_source = self_assessment` markiert.

Eigene Reviewer-Läufe auf dem finalen Stand:

| Prüfung | Ergebnis |
|---|---|
| API-Gesamtsuite mit separatem `uv`-Cache, `--basetemp` und `cache_dir` | 71 bestanden; zwei bekannte Deprecation-Warnungen |
| `npm.cmd run typecheck` und `npm.cmd run lint` | bestanden |
| Eigener Chrome-End-to-End-Lauf bei 390 px | Tastaturpfad, Fokus, deutsche Labels, Pflichtkriterien, `good`-Rücksetzung und Speicherung bestanden; `scrollWidth = clientWidth = 390` |
| Initiales Lesson-JSON, DOM/ARIA und Produktionsbundle | keine Musterantwort und keine Rubrikkriterien gefunden |
| Proxy mit 4.000 per `JSON.stringify` escaped serialisierten NUL-Codepoints (24.175 Bytes) | `201`, Originaltext unverändert; 4.001 Codepoints `422` |
| q01-Regression über den realen Proxy | `201`, `objective_result = correct` |
| Proxy-Schutz | fremder Origin `403`, `text/plain` `415`; Hostprüfung separat ebenfalls `403` |

Die Hostprüfung migrierte zusätzlich ein echtes v2-Volume mit vorhandenem
Choice-Snapshot auf Migration 003. Snapshot und Anzahl blieben erhalten,
`foreign_key_check` war leer und `integrity_check` meldete `ok`. Nach echtem
API-Containerneustart blieben Freitextversuch und Selbstbewertung exakt stabil;
sechs parallele identische Selbstbewertungen erzeugten genau einen Datensatz.

Der unabhängige Review ist ein Agentenreview der Ticketumsetzung. Er bewertet
weder die fachliche Richtigkeit einer individuellen Antwort noch Lernerfolg und
ersetzt keine redaktionelle oder unabhängige menschliche Fachprüfung.

## Host-Endprüfung

Der Host bestätigte unabhängig 71 API-Tests mit zwei bekannten Warnungen (9,20 s),
Typecheck, Lint, Produktionsbuild und den vollständigen Browserlauf mit 19 Tests
(21,5 s). Nach der Label- und Proxykorrektur bestanden die vier gezielten
Freitext-, Unicode- und Selbstbewertungsprüfungen erneut (9,5 s). Die reale
Proxy-Matrix einschließlich fremdem Host/Origin und falschem Content-Type blieb
grün. Upgrade, Containerrestart und die direkte SQLite-Prüfung sind oben belegt.

## Prüfgrenzen

Die Prüfungen belegen deterministische Speicherung und Selbsteinschätzung, keine
inhaltliche Richtigkeit der freien Antwort und keinen Lernerfolg. Der kanonische
Inhalt bleibt `pilot_draft`; das Ergebnis ist weder eine redaktionelle noch eine
unabhängige menschliche Fachfreigabe.
