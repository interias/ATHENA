# M0-Pilot: Ausführungsplan für Epic #8

Dieses Dokument steuert die Abarbeitung der GitHub-Tickets #1–#7. Es ist ein
Ausführungsplan, keine zusätzliche Produktfreigabe. Maßgeblich bleiben das jeweilige
Ticket, [CONTEXT](../CONTEXT.md), die [ADRs](../docs/adr/) sowie Architektur- und
Contentvertrag. Der visuelle Plan und die Ausgangsprüfung stehen unter
[docs/reviews/m0-plan.html](../docs/reviews/m0-plan.html) und
[docs/reviews/m0-01-baseline.md](../docs/reviews/m0-01-baseline.md).

## Repository und Ziel

- Forge/Repository: `github/interias/ATHENA`
- Epic: `#8`
- Basis: `main`
- Mergeziel der Tickets: `epic/8-m0-pilot`
- Ticketstatus für ausführbare Arbeit: `ready-for-agent`
- Worktrees: `.scratch/worktrees/<ticketnummer>` innerhalb dieses Repositorys
- Parallelität zum Start: ein Implementierungsslot; zwei Spuren bleiben frei

`blocked` bedeutet, dass eine konkrete Ticketabhängigkeit noch nicht abgeschlossen
ist. Der Status ist kein pauschaler Ausschluss autonomer Arbeit. Ein Plan oder
Arbeitsartefakt bleibt innerhalb des Repositorys.

## Produktgrenze

M0 entsteht ab #2 in der vorgesehenen Web-/API-Struktur neben `Design/`. Das
Design Lab bleibt eine getrennte D0-Referenz; sein Browserzustand wird nicht als
Lernfortschritt importiert. Die frühere Beschränkung von Anwendungscode auf
`Design/` galt dem damaligen D0-Auftrag. Die Trackerpublikation war dort ebenfalls
ausgenommen und wurde mit der M0-Ticketplanung gesondert beauftragt.

M0 liefert ausschließlich `ch01-l01`, `fig-ch01-load`, `fig-ch01-two-runs` mit
`int-ch01-load` sowie `q-ch01-01` und `q-ch01-02`. Kanonische Texte und
Quellenmarker bleiben Daten und werden nicht still umgeschrieben. Der Startstil ist
die lebhafte Marmorbibliothek: weiße Leseflächen, Domus · Pompejanisches Rot,
große Bildbühne, Reader, integrierte Fachgrafiken, dezente Mythologie sowie 18 px
bei 65 Zeichen mit Begrenzung auf die mobile Breite. Weitere Stilauswahl,
vollständige Anatomiearbeit und neue Schreibproben sind keine M0-Voraussetzung.

Die Anwendung verwendet Next.js/TypeScript mit App Router, einen schmalen
serverseitigen Proxy, FastAPI/Pydantic und SQLite. Zwei App-Container werden
vorgesehen; nur Web bindet `127.0.0.1:3000`, die API bleibt intern. Eine lokale
Person nutzt die App ohne Anmeldung. Nur die API schreibt in die versionierte
SQLite-Datenbank. Start und Migration erhalten bestehende Daten.

## Arbeitsgraph

Die konservative Ausführungsfolge lautet `1 → 2 → 3 → 4 → 5 → 6 → 7`. Sie erfüllt
den fachlichen Graphen `1 → 2 → 3 → 4 → 5 → 7` und `3 → 6 → 7`, verhindert aber
gleichzeitige Änderungen an den von #4 und #6 geteilten Web-, API- und
Datenbankmodulen. #2 belegt den Slot exklusiv, während Struktur, Lockfiles und die
erste Migration entstehen.

| Ticket | Ergebnis | Übergabe |
|---|---|---|
| #1 | Gemeinsame Implementierungsbasis und bestätigte Entscheidungen | Plan, Baseline und erreichbare D0-/Content-Referenzen |
| #2 | Lokale App starten und verfügbare Pilotlektion finden | `apps/web`, `services/api`, `compose.yaml`, fixierte Lockfiles und erste Migration |
| #3 | Kanonische Pilotlektion mit Quellen und interaktiven Fachgrafiken lesen | Validierter Contentpfad, Proxy/API, beide Pflichtgrafiken und Interaktion |
| #4 | Auswahlaufgabe beantworten und erklärendes Feedback dauerhaft speichern | Persistenter Versuch für `q-ch01-01` mit Feedback erst nach Antwort |
| #5 | Freie Erklärung speichern und anhand der Musterlösung selbst bewerten | Persistenter Versuch und Selbsteinschätzung für `q-ch01-02` |
| #6 | Lesestatus markieren und nach Neustart wiederfinden | Versionsgebundener, persistenter Lesestatus |
| #7 | Pilotlektion abschließen und persönliches Feedback dauerhaft abgeben | Vollständiger Pilotpfad, Pilotfeedback und abschließende M0-Prüfung |

GitHub führt #2 als abhängig von #1 und #7 als abhängig von #5 und #6. Die
zusätzliche serielle Reihenfolge ist eine lokale Kollisionskontrolle. Jede neue
Schemaänderung wird ebenfalls exklusiv bearbeitet.

## Ablauf je Ticket

1. Prüfe, dass alle Vorgänger in `epic/8-m0-pilot` gemergt sind, und erstelle den
   Ticket-Worktree aus diesem Stand. Fertig ist der Schritt, wenn Basis und
   Ticketnummer im Arbeitsbericht festgehalten sind.
2. Lies Root-`AGENTS.md`, das Ticket und die dort betroffenen Spezifikationen.
   Bei Laboränderungen gilt zusätzlich `Design/AGENTS.md`. Fertig ist der Schritt,
   wenn Umfang, Nicht-Ziele und betroffene Module benannt sind.
3. Verwende `COMPOSE_PROJECT_NAME=athena-m0-<ticketnummer>` und eigene temporäre
   SQLite-Dateien. Laufende gemeinsame Container oder Datenbanken bleiben unberührt.
   Fertig ist der Schritt, wenn Testzustand und Laufzeitdaten ticketlokal sind.
4. Implementiere den vollständigen Browserpfad einschließlich Backend,
   Persistenz soweit benötigt und gezielter Tests. Lies Befehle aus den tatsächlich
   vorhandenen Package-/Projekt-Scripts. Fertig ist der Schritt erst mit den im
   Ticket geforderten Content-/Backendtests, Typecheck, Lint, Build und Browsercheck
   oder einer konkret belegten, offen dokumentierten Grenze.
5. Prüfe Diff und Status. Secrets, persönliche Laufzeitdaten, Datenbanken,
   Abhängigkeiten und Buildartefakte bleiben unversioniert; Assetherkunft bleibt
   erhalten. Fertig ist der Schritt, wenn jede geänderte Datei zum Ticket gehört.
6. Übergib an einen vom Implementer getrennten Reviewer und arbeite Befunde ein.
   Nach erfolgreichem Hostcheck folgen kleine englische Commits mit Ticketnummer,
   zum Beispiel `feat: add local app shell (#2)`. Ein Coauthor-Eintrag nennt nur
   das tatsächlich eingesetzte Modell. Fertig ist der Schritt nach Merge in
   `epic/8-m0-pilot`; danach beginnt das nächste Ticket.

## Inhalts- und Reviewgrenzen

Neue oder überarbeitete Lerntexte, Skizzen und Bilder benötigen getrennte
Ersteller- und Reviewer-Agenten mit dokumentierter Korrekturschleife. Ein
Agentenreview ist keine menschliche Fachfreigabe; `expert_reviewed` wird dadurch
nie gesetzt. Externe Lehrbücher, Bilder und PDFs bleiben Referenzen und werden
nicht automatisch heruntergeladen oder an Modelle gesendet;
`external_reference_only` bleibt erhalten.

M0 enthält keinen Tutor, Scheduler, Kapitelrollout, Anatomie-Lehrinhalt,
automatische Trainingsberatung, Remote-Fonts, Tracker oder kostenpflichtige
Aufrufe. M1–M3 beginnen erst nach einem neuen Auftrag und der vorgesehenen
Pilotabnahme. Deployment, Force-Push und destruktive Git-Operationen benötigen
weiterhin einen ausdrücklichen Auftrag.
