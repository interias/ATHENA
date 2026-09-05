# ATHENA

Persönliches Lernstudio für Sportwissenschaft, Krafttraining, Ausdauer und Ernährung.
Nutzbar ist das **Design Lab (D0)** mit der vollständigen Lektion 1
„Gleiche Aufgabe, andere Reaktion“. Die Produktimplementierung M0 ist in
[GitHub-Tickets](https://github.com/interias/ATHENA/issues/1) vorbereitet;
M1–M3 bleiben Backlog.

## Start

Mit Node.js 22 und npm aus diesem Repository:

```sh
cd Design
npm ci
npm run dev
```

Öffnen: **http://127.0.0.1:3100**. Unter Windows bei gesperrten PowerShell-Skripten
`npm.cmd` verwenden. Weitere Start- und Testhinweise: [Design/README.md](Design/README.md).

## Orientierung

| Gesucht | Maßgebliche Stelle |
|---|---|
| Begriffe | [CONTEXT.md](CONTEXT.md) |
| Bestätigter Zielzustand und Abnahme | [D0-Spezifikation](docs/specs/d0-design-lab.md) |
| Grundlegende Entscheidungen | [Lokales Design Lab](docs/adr/0001-local-design-lab.md), [kanonische Inhalte](docs/adr/0002-canonical-content.md), [Anatomie und Review](docs/adr/0003-anatomy-review.md) |
| Agentenregeln | [AGENTS.md](AGENTS.md) |
| Nächste App-Implementierung | [M0-Tickets #1–#7](https://github.com/interias/ATHENA/issues/1), [Produktarchitektur](docs/07_TECH_ARCHITECTURE.md) |
| Labor bedienen | [Explorationsanleitung](Design/EXPLORATION_GUIDE.md) |
| Ausgeführte Prüfungen und Grenzen | [Prüfbericht](Design/TEST_REPORT.md) |
| Anatomische Prüfgrundlage | [Checkliste und Quellen](Design/ANATOMY_REVIEW.md) |

Die gewählte Arbeitsrichtung ist die **lebhafte Marmorbibliothek**. Ihre vollständige
gestalterische und erzählerische Umsetzung steht noch aus; die Spezifikation trennt
Ziel und vorhandenen Stand. Agentenreview ist keine unabhängige menschliche Fachfreigabe.

## Bestand und Planung

- `Design/`: lokale Anwendung, Entwurfsdaten und Bilder, Tests.
- `content/ch01/`: kanonische Pilottexte, Aufgaben und Visualbriefings.
- `research/`: [Quellenregister](research/SOURCES.md) und [Aussagenzuordnung](research/CLAIM_MAP.md).
- `docs/01_…12_…`: ursprüngliche Produkt-, Redaktions- und Stilplanung; spätere
  Infrastruktur ist kein D0-Auftrag. [Meilensteinbacklog](docs/10_IMPLEMENTATION_PLAN.md).
- `templates/`: Vorlagen für spätere Inhaltsarbeit.
- [Pilot-Lesefassung](PILOT_LESEFASSUNG.md): abgeleitete Lesehilfe, nicht separat pflegen.
- [Ursprünglicher D0-Auftrag](START_CODEX_DESIGN.md) und [früherer M0-Auftrag](START_CODEX.md):
  historische Auftragsquellen; aktuelle Entscheidungen stehen in der Spezifikation.
