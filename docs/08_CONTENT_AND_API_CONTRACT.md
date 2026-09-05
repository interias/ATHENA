# 08 — Content-, Daten- und API-Verträge

## Single Source of Truth

Lerntext: `content/ch01/01_LOAD.md` bis `04_OBSERVATION.md` mit YAML-Frontmatter. Aufgaben und Reviewkarten: YAML-Block in `05_QUESTIONS.md`. Visuals: YAML-Manifest in `06_VISUAL_BRIEFS.md`. Quellen: einzelne YAML-Datensätze in `research/SOURCES.md`.

Backend baut daraus ein validiertes Contentmanifest. Keine zweite manuell gepflegte JSON-Version. Die separat angebotene Lesefassung ist ausdrücklich abgeleitet.

## Lektion: Frontmatter

```yaml
lesson_id: ch01-l01
chapter_id: ch01
order: 1
title: Gleiche Aufgabe, andere Reaktion
content_version: 0.1.0
status: pilot_draft
editorial_approved_by: null
expert_reviewed_by: null
llm_eligible: false
objectives: [ch01-o01, ch01-o02]
prerequisites: []
source_ids: [S05, S06]
figure_ids: [fig-ch01-load, fig-ch01-two-runs]
question_ids: [q-ch01-01, q-ch01-02, q-ch01-03]
```

Erlaubte Statuswerte: `pilot_draft`, `editorial_approved`, `retired`. Expertenprüfung zusätzlich separat als Person/Datum/Umfang dokumentieren. Auch redaktionell angenommener Inhalt darf ohne Expertenprüfung nicht so bezeichnet werden.

## Minimaler Markdown-Dialekt

Standard-Markdown für Text. Quellenmarker `[S05]` beziehungsweise `[S05, S06]` werden gegen das Register aufgelöst. Bereichsschreibweisen wie `[S01–S03]` dürfen in Planungsdokumenten vorkommen; **Lerntexte verwenden ausschließlich einzelne IDs oder kommaseparierte IDs**.

Fachkomponenten als einzelne Zeile:

```text
[[figure:fig-ch01-load]]
[[interaction:int-ch01-load]]
[[exercise:q-ch01-01]]
```

Erlaubte Blocktypen nur `figure`, `interaction`, `exercise`. Keine Ausführung, keine frei importierbaren Komponenten. Die Loader erzeugen strukturierte Blöcke; gewöhnliches Markdown wird mit deaktiviertem Raw-HTML sicher gerendert. Nicht über breite reguläre Ausdrücke HTML bereinigen.

Abschnitts-IDs werden aus festgelegten Überschriften abgeleitet und im Manifest fixiert; bei Umbenennung Alias behalten. Tutor erhält diese IDs und die dazugehörigen Texte, nicht den gesamten Repositoryinhalt.

## Aufgabenvertrag

Jede Aufgabe: `id`, `lesson_id`, `objective_ids`, `kind`, `prompt`, `source_ids`, `misconception`, `content_version`. Je Typ zusätzlich:

- `single_choice`: `options` mit stabilen IDs, `correct_option`, Feedback je Option.
- `free_text`: `rubric` mit Kriterien-IDs, `model_answer`, `feedback` und erwartete Grenzen.
- `matching`: `items`, `categories`, `correct_mapping` und Erklärung.

`review_cards` verweisen auf Lernziele und eigene Rubriken; sie werden nicht als versteckte Kopien ganzer Lektionen erzeugt. `transfer_cases` sind neue Fälle, keine formale Lizenzprüfung.

## Datenmodell

| Tabelle | Mindestfelder |
|---|---|
| lesson_progress | lesson_id, content_version, read_at, updated_at |
| attempts | id/UUID, item_id, content_version, answer_json, confidence, mode, assisted, created_at, objective_result, grading_source |
| self_assessments | attempt_id, checked_criterion_ids, rating, created_at |
| review_states | card_id, content_version, stage, due_at, needs_revalidation, updated_at |
| pilot_feedback | id, lesson_id, content_version, ratings_json, free_text, created_at |
| tutor_usage [M2] | request_id, provider, model, token_counts, estimated_cost, outcome, created_at |

Fremdschlüssel und Unique Constraints für Idempotenz verwenden. Fortschrittsanzeigen aus Ereignissen/Versuchen ableiten, nicht drei voneinander unabhängige Wahrheitsfelder pflegen. Keine Körperdaten für die Lernfunktion erforderlich.

## API: M0

Alle folgenden Pfade gehören zur internen FastAPI. Browser greift über den Next.js-Proxy darauf zu.

| Methode | Pfad | Ergebnis |
|---|---|---|
| GET | /healthz | Prozess erreichbar |
| GET | /readyz | Content und Datenbank bereit |
| GET | /v1/curriculum | Kapitelübersicht; nur M0-Lektion als verfügbar |
| GET | /v1/lessons/{lesson_id} | validierte Blöcke, Quellenmetadaten, öffentliche Aufgabenfelder |
| GET | /v1/progress | lokaler Lesefortschritt |
| PUT | /v1/progress/{lesson_id} | Lesestatus für konkrete Version |
| POST | /v1/attempts | Antwort speichern; erst danach Lösung/Feedback zurückgeben |
| POST | /v1/attempts/{attempt_id}/self-assessment | Freitext-Selbstbewertung speichern |
| POST | /v1/pilot-feedback | Pilotfeedback speichern |

Für M0 nur q-ch01-01 und q-ch01-02 exponieren. Die übrige kanonische Aufgabenbank bleibt für M1 vorbereitet. Fortschrittsanzeige berücksichtigt den tatsächlich freigeschalteten Umfang.

Pilotfeedback enthält `feedback_id` als UUID, `lesson_id`, `content_version`, die
Pflichtbewertungen `readability`, `text_amount`, `visual_usefulness`,
`practical_relevance` und `usability` als strikte Ganzzahlen von 1 bis 5 sowie die
optionalen Texte `reread_location` und `clarifying_visual` mit höchstens 2.000
Unicode-Codepoints je Feld. Der Server setzt `created_at`. Ein identischer Replay
derselben UUID gibt denselben Snapshot mit demselben Zeitstempel zurück; ein
geänderter Snapshot unter derselben UUID liefert 409. Neues späteres Feedback
verwendet eine neue UUID.

## API: M1 ergänzen

`GET /v1/reviews/due`, `POST /v1/reviews/{card_id}/attempts`, `POST /v1/reviews/{card_id}/ratings`, `GET /v1/export` sowie lokal geschützte Import-/Resetaktionen. Reset benötigt eine explizite Bestätigung in der Oberfläche und darf nicht durch Seitenaufruf geschehen.

Review-Rating referenziert einen bestehenden Versuch; nicht bloß eine frei manipulierbare `correct=true`-Angabe. Erst nach Prüfung/Selbsteinschätzung atomar Zustand aktualisieren. Der Review-Scheduler steht in Dokument 04.

## API: M2 ergänzen

`GET /v1/tutor/status` und `POST /v1/tutor/messages`. Antworten als vollständiges validiertes JSON, zunächst ohne Streaming. Bei deaktiviertem Tutor liefert Status eine verständliche Ursache; Lesefunktionen bleiben verfügbar.

## Beispielrequest

```json
{
  "attempt_id": "ee0cf6fd-3fd3-4c8b-8e06-a786da96ac26",
  "item_id": "q-ch01-01",
  "content_version": "0.1.0",
  "mode": "practice",
  "answer": {"option_id": "b"},
  "confidence": "mittel",
  "assisted": false
}
```

Backend setzt `created_at`. Unbekannte IDs → 404; falsche Version → 409; Schemafehler → 422; identischer wiederholter Request → dasselbe gespeicherte Ergebnis. Gleiche UUID mit anderem Inhalt → 409. Für Freitext begrenzte Eingabelänge, beispielsweise 4.000 Zeichen als konfigurierbare Produktgrenze.

## Contentprüfung

IDs eindeutig; alle Referenzen auflösbar; Quellenmarker in der jeweiligen `source_ids`-Liste; keine unbekannten Renderer; jede Frage mindestens ein Lernziel; jede Pflichtgrafik Beschreibung und Herkunft; richtige Option vorhanden; Matching vollständig; Reviewkarten mit Rubrik; keine Absätze mit scheinbaren fehlenden Bilddateien.

Bei invalidem Content Readiness fehlschlagen und einen verständlichen Report erzeugen. Im Produktionsmodus nicht still halbe Kapitel ausliefern. Ein gezielter M0-Manifestfilter ist zulässig, aber muss auf der bereits validierten Gesamtstruktur basieren.

## Prüfungsgrenze

Musterantworten nicht vor der Antwort in der normalen UI zeigen. Die lokale Einzelbenutzer-App ist dennoch **kein manipulationssicheres Prüfungssystem**. Wer Zugriff auf Repository oder Datenbank hat, kann Antworten einsehen. Keine Zertifizierung oder Betrugserkennung behaupten.
