# M0-06 – Versionsgebundener Lesestatus

Stand: 5. September 2026. Dieser Bericht dokumentiert die lokale Implementer- und
Hostprüfung von Ticket #6. Er ist keine M0-Gesamtabnahme und keine menschliche
fachliche Freigabe.

## Ergebnis

`GET /v1/progress` und `PUT /v1/progress/{lesson_id}` lesen und schreiben den
Lesestatus der aktuell verfügbaren Pilotlektion in SQLite. Der Schreibrequest
enthält ausschließlich Inhaltsversion und Zielstatus:

```json
{"content_version":"0.1.0","read":true}
```

Die Antwort enthält `lesson_id`, `content_version`, `read`, `read_at` und
`updated_at`. `GET` ergänzt die Zähler `available_lessons`, `planned_lessons` und
`read_lessons`. Im aktuellen M0-Manifest sind eine Lektion verfügbar und drei
Lektionen geplant.

Migration `004_lesson_progress.sql` verwendet `(lesson_id, content_version)` als
Primärschlüssel. Alte Versionszeilen bleiben erhalten und werden bei einer neuen
Inhaltsversion nicht als aktueller Lesestatus ausgegeben. Der Server setzt
timezone-aware UTC-Zeitstempel. Identische Updates lesen die vorhandene Zeile
unverändert zurück; ihr Zeitstempel bleibt stabil.

Die Kapitelübersicht und die Lektion laden den Status ohne statischen Cache. Die
Lektion bietet „Als gelesen markieren“ und „Lesemarkierung zurücknehmen“. Beide
Ansichten erklären, dass gelesen weder geübt noch später erinnert bedeutet. Ein
fehlgeschlagener oder verlorener Response ändert den zuletzt bestätigten
Oberflächenstatus nicht. Der erneute Versuch sendet denselben Zielstatus und ist
dadurch auch dann sicher, wenn der erste Request bereits gespeichert wurde.

## Abnahmekriterien

| Kriterium | Nachweis |
|---|---|
| Versionsgebundene SQLite-Persistenz und Serverzeit | `services/api/migrations/004_lesson_progress.sql:1`, `services/api/src/athena_api/database.py:152` und `:167`; API-Test für UTC, Markierung, Rücknahme und stabile Wiederholung |
| ID, M0-Verfügbarkeit und Version validiert | `services/api/src/athena_api/main.py:154` und `:187`; API- und Hosttests für unbekannte/geplante IDs, falsche Version und strikt boolesches `read` |
| Rücknahme verändert nur den Lesestatus | getrennte Tabelle und Transaktion; `services/api/tests/test_progress_api.py:132` sowie Host-Snapshotvergleich für Choice-Versuch, Freitextversuch und Selbstbewertung |
| Übersicht und Lektion bleiben konsistent | `apps/web/components/Curriculum.tsx:98`, `apps/web/components/LessonReader.tsx:134` und `apps/web/tests/progress.spec.ts:16`; Hostprüfung über echten API-Containerrestart |
| Kein stiller Versionsübertrag | `services/api/tests/test_progress_api.py:99` prüft eine historische Zeile `0.0.9`, während die aktuelle Fassung ungelesen bleibt; historische Zeile anschließend weiterhin vorhanden |
| Tatsächlicher M0-Umfang | `GET` und Übersicht zeigen 1 verfügbar, 3 geplant und den gelesenen Anteil nur bezogen auf die verfügbare Lektion |
| Verständlicher Fehler und sicherer Retry | `apps/web/tests/progress.spec.ts:39` simuliert einen serverseitig erfolgreichen PUT mit verlorenem Response (`route.fetch()` gefolgt von `route.abort()`); identischer Retry bestätigt den Status |
| Proxygrenzen | `apps/web/app/api/progress/route.ts:8` und `apps/web/app/api/progress/[lessonId]/route.ts:10`: fester API-Pfad, dynamische No-store-Routen, erlaubter Loopback-Host mit passender Origin, JSON-Content-Type und Größenlimit; Hosttests bestätigen 403/415 |
| Tastatur und 390 px | Browser markiert und widerruft per Fokus/Enter; 390-px-Test bestätigt sichtbare Bedienung ohne horizontales Überlaufen |

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `uv sync --frozen` mit ticketlokalem `UV_CACHE_DIR` | bestanden; 28 gelockte Pakete geprüft |
| API-Gesamtsuite mit einmaligem `--basetemp` und `cache_dir` | 75 bestanden in 7,68 s; zwei bekannte Deprecation-Warnungen aus FastAPI/Starlette |
| `npm.cmd ci --offline` | bestanden; 146 Pakete installiert, keine gemeldete Schwachstelle |
| `npm.cmd run typecheck` | bestanden |
| `npm.cmd run lint` | bestanden |
| `npm.cmd run build` | bestanden; dynamische Progress-Proxyrouten im Produktionsbuild |
| `docker compose -p athena-m0-6 up --build -d --wait` | bestanden; API und Web healthy, eigenes Volume `athena-m0-6_learning_data` |
| Browser-Gesamtsuite | 22 bestanden in 26,7 s; Markierung/Rücknahme, Reload, Navigation, Lost-Response-Retry, Tastatur und 390 px enthalten |
| Unabhängige Host-Requestmatrix und echter API-Restart | bestanden; Status blieb erhalten, identische Zeiten blieben stabil, Zähler und 404/409/422/403/415 entsprachen dem Vertrag |
| Host-Snapshotvergleich vor/nach Rücknahme und Restart | bestanden; Choice-, Freitext- und Selbstbewertungszeilen exakt unverändert |

Die veröffentlichten Migrationen 001, 002 und 003, kanonische Inhalte,
Quellendaten und beide Lockfiles sind gegenüber der geprüften Basis
`de7b72d72d42a64b1aac736d673828b31862e0dd` unverändert.

## Unabhängiger Review

Ein getrennter Reviewer-Agent (GPT-5.6 Sol High) hat den vollständigen lokalen
Arbeitsbaum gegen die Basis
`de7b72d72d42a64b1aac736d673828b31862e0dd` geprüft.

### Standards

Keine Befunde. Der Diff hält die Repositoryregeln und die vorhandenen Muster für
API, Datenbank, schmalen Proxy und deutsche Oberfläche ein. Die Prüfung gegen die
Code-Smell-Baseline ergab ebenfalls keine relevante Auffälligkeit. `git diff
--check` war sauber; Migrationen 001–003, kanonische Inhalte, D0 und Lockfiles sind
gegenüber der Basis unverändert.

### Spec

Keine Befunde. Alle sechs Abnahmekriterien sind im Diff und durch ausführbare
Nachweise abgedeckt: aktuelle Inhaltsversion und M0-Verfügbarkeit, UTC-Serverzeit,
idempotente Zielzustände, Erhalt historischer Versionszeilen, unabhängige Versuchs-
und Selbstbewertungsdaten, No-store-Proxys, verlorener Response mit sicherem Retry,
Navigation/Reload/Restart sowie die Anzeige 1 verfügbar und 3 geplant ohne
fiktive Übungs-, Erinnerungs- oder Kompetenzwerte.

Der Reviewer führte mit neuen einmaligen `--basetemp`-, `cache_dir`- und
`UV_CACHE_DIR`-Pfaden 7 gezielte Progress-/Migrationstests aus: 7 bestanden in
1,08 s; zwei bekannte Deprecation-Warnungen aus FastAPI/Starlette. Ein eigener
echter Chrome-Lauf der Progress-Suite bestand 3 Tests in 5,8 s. Zusätzlich wurde
der Fokus-/Enter-Pfad bei 390 × 844 px sichtbar geprüft: Fokusrahmen und Bedienung
sind klar, die Übersicht zeigt 1 von 1 verfügbaren Lektionen und 3 geplante, und
die Dokumentbreite blieb bei 390 px ohne horizontales Überlaufen. Der Lesestatus
wurde anschließend auf ungelesen zurückgesetzt und alle Reviewer-Browser wurden
geschlossen. Der zunächst versuchte Agent-Browser brach wegen des bekannten
CDP-Problems ab; die Prüfung lief deshalb über den freigegebenen Playwright/Chrome-
Fallback.

## Korrekturen aus der Prüfung

Die erste Fehlermeldung behauptete, der Status sei nicht gespeichert worden. Das
war bei einem verlorenen erfolgreichen Response nicht belegbar. Sie wurde auf
„Der Speicherstatus konnte nicht bestätigt werden“ korrigiert; die Oberfläche
zeigt ausdrücklich den zuletzt bestätigten Status und wiederholt denselben
Zielrequest.

Der erste Browserlauf hatte außerdem einen zu breiten `role=alert`-Selektor, der
mit Next.js' Route-Announcer kollidierte. Der Test adressiert nun den konkreten
Progress-Fehler. Der vollständige Browserlauf war danach grün.

## Grenzen

Der abschließende vollständige Host-Browserlauf nach dem unabhängigen Review
bestand alle 22 Tests in 27,6 s. Der Host prüfte außerdem 75 API-Tests mit zwei
bekannten Warnungen sowie Typecheck, Lint und Produktionsbuild erfolgreich.

Geprüft ist eine lokale Einzelperson mit genau der freigeschalteten M0-Lektion.
Geübt- und Erinnerungsstatus sowie M1-Scheduler sind nicht implementiert. Der
Lesestatus ist eine persönliche Markierung und kein Nachweis von Verständnis,
Kompetenz oder langfristigem Erinnern.
