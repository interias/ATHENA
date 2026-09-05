# Arbeitsregeln für Codex

## Auftrag

Baue ein persönliches Lernstudio, keinen Trainingsplan-Generator und keine SaaS-Lernplattform. Sprache der Oberfläche und Inhalte: Deutsch. Code-Identifier: Englisch. Neue, eigenständige Anwendung; bestehende Projekte nicht verändern.

## Vor jedem Umsetzungsschritt lesen

`README.md`, `docs/10_IMPLEMENTATION_PLAN.md` und die Dokumente des ausdrücklich beauftragten Meilensteins. Für den ersten Auftrag gilt `START_CODEX.md`.

## Verbindlicher Umfang

Standardfreigabe ist ausschließlich **M0**. M1, M2 und M3 sind Spezifikation und Backlog, keine implizite Implementierungserlaubnis. Nach M0 Ergebnisse, Tests und offene Punkte berichten und anhalten. Keine weiteren Kapitel erzeugen.

## Inhaltliche Regeln

- Bestehende Lehrtexte und Quellenmarker erhalten. Fachliche Änderungen als nachvollziehbaren Diff ausweisen.
- Keine erfundenen Quellen, DOIs, Studienzahlen, geprüften Lizenzen oder Fachfreigaben.
- Keine automatisch errechnete Trainingsbereitschaft, Verletzungswahrscheinlichkeit, Ernährungstherapie oder persönliche Belastungsempfehlung.
- Fiktive Beispiele sichtbar kennzeichnen. Aus Modellgrafiken keine Vorhersagen ableiten.
- `editorial_approved` ist nicht gleich `expert_reviewed`. Die zweite Kennzeichnung nie selbst setzen.
- Externe Lehrbücher, Bilder oder PDFs nicht automatisch herunterladen, in Embeddings umwandeln oder an ein LLM senden. Das gilt insbesondere für als `external_reference_only` markierte Quellen.

## Technische Regeln

Next.js mit TypeScript und App Router, FastAPI mit Pydantic, SQLite für den Einzelbenutzer, Docker Compose. Unterstützte stabile Versionen bei Implementierung aus offiziellen Dokumentationen prüfen, kompatibel wählen und mit Lockfiles fixieren. Keine erfundenen Versionsnummern und keine `latest`-Container-Tags.

Secrets ausschließlich serverseitig. Keine ChatGPT-Passwörter, Session-Cookies oder OAuth-Token zweckentfremden. Die App braucht für M0/M1 keinen API-Key. Keine kostenpflichtigen Aufrufe oder Bildgenerierungen ohne separate Freigabe.

Keine fremden MDX-Dateien ausführen. Markdown nur als Daten verarbeiten; Komponenten aus einer festen Allowlist. Keine Remote-Fonts, Tracking-Skripte, Docker-Socket-Mounts oder öffentliche Ports hinzufügen.

## Arbeitsweise

Kleine, testbare Schritte. Tests tatsächlich ausführen und ausgeführte von nicht ausgeführten Prüfungen unterscheiden. Bei fehlendem Tool keine erfolgreiche Prüfung behaupten. Bei Unsicherheit eine begründete reversible Entscheidung dokumentieren, nicht das komplette Projekt blockieren.

Bei Widersprüchen gilt: aktueller ausdrücklicher Nutzerauftrag > diese Umfangsregeln > freigegebener Meilenstein > Detaildokument. Widerspruch im Abschlussbericht benennen.
