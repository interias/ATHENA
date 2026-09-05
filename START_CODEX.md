# Erster Codex-Auftrag — nur M0

Kopiere den folgenden Auftrag in Codex, nachdem das gesamte Paket im neuen Repository liegt.

```text
Lies AGENTS.md, README.md und docs/10_IMPLEMENTATION_PLAN.md.

Implementiere ausschließlich Meilenstein M0 des persönlichen Sportwissenschaft-Lernstudios.
Lies dafür zusätzlich docs/01_PRODUCT_BRIEF.md, docs/05_EDITORIAL_STYLE.md,
docs/06_VISUAL_SYSTEM.md, docs/07_TECH_ARCHITECTURE.md und
 docs/08_CONTENT_AND_API_CONTRACT.md sowie die Pilotdateien, die M0 betreffen.

Baue eine lokal per Docker Compose startbare Anwendung mit Next.js/TypeScript,
FastAPI und SQLite. Der erste vertikale Ausschnitt besteht aus:
- einer reduzierten Startseite und Kapitelübersicht;
- ausschließlich der Lektion ch01-l01 aus content/ch01/01_LOAD.md;
- den Visuals fig-ch01-load und fig-ch01-two-runs;
- der Interaktion int-ch01-load als Teil des zweiten Visuals;
- den Aufgaben q-ch01-01 und q-ch01-02 einschließlich verzögertem Lösungszeigen;
- dauerhaft gespeichertem Lesestatus und Pilotfeedback;
- einem klaren Statushinweis, dass der Inhalt ein recherchegestützter Pilotentwurf ist.

Kein Tutor, keine echten LLM-Aufrufe, keine Bild-API, kein Vektorspeicher,
kein Login-System, keine Inhalte aus Kapitel 2–12. Noch keine Wiederholungsmaschine.
Die weiteren Pilotlektionen dürfen in der Übersicht als geplant erscheinen,
aber nicht vorzeitig als fertige Lernseiten implementiert werden.

Arbeite mit den vorhandenen Inhalten. Erfinde keine Quellen oder anatomischen Grafiken.
Erzeuge die beiden fachlichen Visuals als zugängliche SVG-/React-Komponenten
nach den vorhandenen Briefings. Für die optionale Szenenillustration keinen
leeren Bildrahmen einbauen: im M0 einfach weglassen.

Prüfe aktuelle kompatible stabile Abhängigkeiten anhand offizieller Dokumentation,
fixiere sie und dokumentiere die Wahl. Erzeuge Build-, Start- und Testanweisungen.
Prüfe Docker Compose, Typen, Kern-API, Content-Validierung und den vollständigen
Browserpfad. Berichte exakt, was tatsächlich getestet wurde.

Stoppe nach M0. Fasse Dateien, Startbefehl, Tests, offene Punkte und die drei
wichtigsten Rückfragen zur Pilotgestaltung zusammen. Starte M1 nicht automatisch.
```

## Was danach geprüft wird

Nicht zuerst die Anzahl der Komponenten beurteilen, sondern die konkrete Lernerfahrung: Ist die Erklärung verständlich? Erklären die Grafiken etwas? Kannst du die zentrale Unterscheidung ohne Nachlesen anwenden?

M0 ist ein Layout- und Inhaltsprototyp. Ein Erinnerungstest nach mehreren Tagen ist erst nach Nutzung möglich und wird nicht als bereits bestanden dargestellt.
