# M0-07 – Pilotfeedback und technische M0-Abnahme

Stand: 5. September 2026. Dieser Bericht dokumentiert die lokale Implementer- und
Hostprüfung von Ticket #7 sowie den vollständigen technischen M0-Pfad. Er enthält
keine persönliche Pilotbewertung, keine Wirksamkeitsmessung und keine menschliche
fachliche Freigabe.

## Ergebnis

Am Ende der Pilotlektion steht ein zugängliches Abschlussformular mit den fünf
verbindlichen Bewertungen Verständlichkeit, passende Textmenge, Nutzen der
Grafiken, praktische Relevanz und Bedienbarkeit. Jede Bewertung verlangt eine
Auswahl von 1 bis 5; die Oberfläche nennt ausdrücklich, dass keine positive
Antwort erwartet wird. Für „Passende Textmenge“ bedeutet 5 eine hohe Passung und
nicht möglichst viel Text.

Die optionalen Fragen lauten unverändert:

- „An welcher Stelle musste ich zurücklesen?“
- „Welche Darstellung hat eine konkrete Unklarheit beseitigt?“

Beide Freitexte sind auf 2.000 Unicode-Codepoints begrenzt. Überlange eingefügte
Texte bleiben sichtbar und korrigierbar, während der Versand gesperrt ist.

`POST /v1/pilot-feedback` bindet jeden Eintrag an Lektion und Inhaltsversion,
setzt den UTC-Zeitstempel serverseitig und speichert ihn mit Migration 005 in
SQLite. Ein erneuter Request mit derselben UUID und demselben Snapshot liefert
denselben Eintrag samt Zeitstempel. Ein abweichender Snapshot unter derselben UUID
liefert 409. Nach einer unbestätigten Antwort verwendet die Oberfläche für
unveränderte Eingaben dieselbe UUID; nach einer Änderung erzeugt sie eine neue.
Nach bestätigtem Speichern kann eine weitere Bewertung begonnen werden.

Der Web-Proxy verwendet einen festen internen Pfad, `no-store`, ein Limit von
16.384 Byte sowie Prüfungen für Loopback-Host, passende Origin und JSON-
Content-Type. Feedbackinhalte erscheinen weder in URLs noch in den geprüften
Anwendungslogs. Eine Erfolgsantwort entsteht erst nach dem SQLite-Commit.

## Abnahmekriterien

| Kriterium | Nachweis |
|---|---|
| Fünf Pflichtbewertungen und zwei vorgesehene Freitexte | `apps/web/components/PilotFeedback.tsx`; Browserfälle für Payload, native Pflichtfelder, neue Bewertung und exakte Fragen |
| Strikte API-Validierung | `services/api/src/athena_api/models.py` und `main.py`; API-Matrix für Integer 1–5, UUID, M0-Lektion, Version, zusätzliche Felder, Steuerzeichen und 2.000/2.001 Unicode-Codepoints |
| Dauerhafte SQLite-Speicherung | `services/api/migrations/005_pilot_feedback.sql` und transaktionales `save_pilot_feedback`; echter API-Containerneustart mit unverändertem Snapshot |
| Idempotenz bei Timeout und Doppelklick | identische UUID plus kanonischer Snapshot; acht parallele Replays erzeugten eine Zeile und denselben UTC-Zeitstempel; Browser simuliert einen verlorenen erfolgreichen Response |
| Späteres oder bearbeitetes Feedback | neue UUID ist zulässig; Browser erzeugt nach Änderung eines unbestätigten Snapshots eine neue UUID und bietet nach Erfolg „Weitere Bewertung abgeben“ |
| Korrigierbare Fehler | Eingaben bleiben erhalten; 2.001 Emoji bleiben sichtbar, Zeichenzähler und gesperrter Versand führen zur Korrektur; der Fehlertext behauptet bei verlorenem Response keinen fehlgeschlagenen Commit |
| Sicherer Proxy und keine Antwortdaten in URL/Logs | Host-/Origin-/JSON-/Bodygrenzen geprüft; API-Logs enthalten nur Methode, Pfad und Status |
| Vollständiger M0-Browserpfad | 28 Chrome-Fälle für Übersicht, Originallektion, Quellen, beide Fachgrafiken, Interaktion, beide Aufgaben, Selbstbewertung, Lesestatus und Pilotfeedback |
| Zugänglichkeit und Reflow | Tastaturpfad mit sichtbarem Fokus bei 390 px ohne horizontales Überlaufen; isoliertes Chrome-Profil mit echter Seiteneinstellung 200 %, nicht Device-Metrics-Emulation |

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Gelockte API-Umgebung | Abhängigkeiten aus der bereits geprüften, identischen Ticket-#6-Umgebung verwendet; keine Version geändert |
| API-Gesamtsuite | 80 bestanden in 11,2 s; zwei bekannte Deprecation-Warnungen aus Starlette/AnyIO |
| Gezielte Feedback-/Migrationstests | 8 bestanden; UTC, Replay, Konflikt, spätere UUID, Grenzen und Schema-004-Erhalt |
| `npm.cmd ci --offline` | bestanden; 146 Pakete installiert, keine gemeldete Schwachstelle |
| `npm.cmd run typecheck` | bestanden |
| `npm.cmd run lint` | bestanden |
| `npm.cmd run build` | bestanden; `/api/pilot-feedback` als dynamische Route enthalten |
| `docker compose -p athena-m0-7 up --build -d --wait` | bestanden; API und Web healthy, eigenes frisches Volume `athena-m0-7_learning_data`, nur `127.0.0.1:3000` veröffentlicht |
| Browser-Gesamtsuite nach API-Neustart | 28 bestanden in 34,9 s |
| Finaler unabhängiger Host-Browserlauf nach Review | 28 bestanden in 34,4 s |
| Unabhängige Host-API-Suite | 80 bestanden in 10,4 s; dieselben zwei bekannten Warnungen |
| Echte Schema-004→005-Migration | bestanden mit dem zuvor gesicherten Ticket-#6-API-Image; alte Versuche, Selbstbewertung, Lesestatus, Antworten, UTC-Zeitstempel und Checksummen 001–004 exakt erhalten; `integrity_check` ok |
| Host-Requestmatrix | bestanden: 2.000 Emoji je Feld, 2.001 abgelehnt, strikte Ratings, acht parallele UUID-Replays, Konflikt, spätere UUID, leere optionale Texte, Scope, Version und Proxygrenzen |
| Persistenz nach echtem API-Neustart | bestanden; zwei vor dem Neustart gesicherte Feedbacksnapshots blieben einschließlich ihrer serverseitigen Zeitstempel exakt erhalten |
| Echte 200-%-Zoom- und Tastaturprüfung | bestanden im isolierten Chrome-Profil: `innerWidth=632`, `outerWidth=1280`, `devicePixelRatio=2`, `visualViewport.scale=1`, Dokumentbreite 632; Speichern per Tastatur, 0 Seitenfehler, 0 externe Requests |
| D0-Regression | 10 Contenttests, Typecheck, Lint, Build und 19 Browsertests in 17,3 s bestanden |

Der lokale Stack wurde mit API-Image
`sha256:3cebe673fe4c03ecb3d95b00e15246bbc398e287dc5cfa74457d819d5e5c73c4`
gebaut. Die genauen Laufzeit- und Paketversionen stehen in
[`docs/IMPLEMENTED_STACK.md`](../IMPLEMENTED_STACK.md). Die bereits abgenommenen
Migrationen 001–004, kanonische Inhalte, Forschung, D0, ADRs, Assets und beide
Lockfiles sind gegenüber der geprüften Basis `49cd215` unverändert. Die direkte
DB-Prüfung fand jede der beiden Host-Feedback-UUIDs nach Replays und Neustart genau
einmal; Schema 5, Fremdschlüsselprüfung und `integrity_check` waren grün. Die
API-Logs enthielten keinen der synthetischen Feedbacktexte.

Die finale Laufzeitabfrage bestätigte Python 3.13.7, SQLite 3.40.1, FastAPI
0.141.1, Pydantic 2.13.5, Uvicorn 0.52.4 und Node.js 22.23.1; damit stimmt der
laufende Stack mit der Versionsdokumentation überein.

Die Host-Sichtprüfung der 200-%-Ansicht vor und nach dem Speichern ist in den
lokalen Prüfartefakten `.scratch/prd/final-zoom-feedback.png` und
`.scratch/prd/final-zoom-saved.png` festgehalten. Das Formular blieb lesbar und
ohne Clipping; der blaue Fokusrahmen der Erfolgsbestätigung war deutlich sichtbar.

## Unabhängiger Review

Ein getrennter Reviewer-Agent (GPT-5.6 Sol High), der Ticket #7 nicht implementiert
hat, prüfte den vollständigen lokalen Arbeitsbaum gegen die Basis
`49cd2152ce4f7ab448d3d32ac6dea2b9d31a3d33`.

### Standards

Keine offenen Befunde. Datenbank, API, Proxy, React-Oberfläche, Tests und
Dokumentation entsprechen den Repositoryregeln und den vorhandenen Mustern. Die
Prüfung gegen die Code-Smell-Baseline ergab keine relevante Auffälligkeit.

Ein Dokumentationsbefund wurde während des Reviews korrigiert: Der neue Hinweis in
`docs/reviews/m0-plan.html` bezeichnete die unabhängige Ticketprüfung auch nach
ihrem Abschluss noch als ausstehenden nächsten Schritt. Der nachgeprüfte Text nennt
die unabhängige technische Prüfung nun als abgeschlossen und lässt nur Stefans
persönliche Pilotabnahme offen. `git diff --check` war danach sauber. Migrationen
001–004, kanonische Inhalte, Forschung, D0, ADRs, Assets und Lockfiles sind
gegenüber der Basis unverändert.

### Spec

Keine Befunde. Alle acht Abnahmekriterien sind im Diff und durch ausführbare
Nachweise abgedeckt: fünf strikte Pflichtbewertungen, die zwei exakten optionalen
Fragen, 2.000 Unicode-Codepoints je Feld, M0-Lektions- und Versionsbindung,
UTC-Serverzeit, SQLite-Migration 005, idempotente UUID-Snapshots mit Konflikt für
geänderte Inhalte, Commit vor Erfolgsantwort, korrigierbare Eingaben und ein sicherer
Lost-Response-Retry. Der vollständige M0-Pfad enthält keine Entwicklungsplatzhalter,
vorzeitig ausgelieferten Lösungen oder angebotenen Tutor-/Reviewfunktionen. M1 und
die persönliche Pilotabnahme bleiben ausdrücklich getrennt.

Der Reviewer führte mit neuen einmaligen `--basetemp`-, `cache_dir`- und
`UV_CACHE_DIR`-Pfaden 8 gezielte Feedback-/Migrationstests aus: 8 bestanden in
1,03 s; zwei bekannte Deprecation-Warnungen aus FastAPI/Starlette. Ein eigener
echter Chrome-Lauf bestand alle 6 Feedbacktests in 6,4 s, einschließlich verlorenem
erfolgreichen Response, UUID-Wechsel nach Eingabeänderung, Unicodegrenze und realem
200-%-Seitenzoom. Eine zusätzliche sichtbare 390-×-844-px-Prüfung bestätigte den
vollständigen Tastaturpfad, den Fokuswechsel zur Erfolgsbestätigung, 390 px
Dokumentbreite ohne horizontalen Überlauf sowie 0 externe Requests und 0
Seitenfehler. Die gemessenen Kontraste lagen bei mindestens 6,71:1 für Text,
4,72:1 für Auswahlrahmen, 6,87:1 für den Fokusindikator und 10,03:1 für den
Primärbutton. Alle Reviewer-Browser wurden anschließend geschlossen.

## Grenzen und Stopppunkt

Die gespeicherten Testdaten sind technische Fixtures und keine Bewertung durch
Stefan. Das Freigabeprotokoll in `docs/11_PILOT_EVALUATION.md` bleibt deshalb
`pending`; alle persönlichen Ratings bleiben `null`. Die App erhebt weder einen
Wissensnachweis noch langfristige Erinnerung oder Lernwirksamkeit. Vollständiger
Export sowie getestete Backup-/Restore-Abläufe gehören zu M1.

M0 endet nach technischer Abnahme und Stefans persönlicher Pilotentscheidung.
Weitere Lektionen, M1–M3, Tutor- oder Reviewfunktionen benötigen einen neuen
ausdrücklichen Auftrag.
