# ATHENA

Persönliches Lernstudio für Sportwissenschaft, Krafttraining, Ausdauer und Ernährung.
Nutzbar ist das **Design Lab (D0)** mit der vollständigen Lektion 1
„Gleiche Aufgabe, andere Reaktion“. Die Produktimplementierung M0 wird anhand der
[GitHub-Tickets](https://github.com/interias/ATHENA/issues/1) aufgebaut;
M1–M3 bleiben Backlog.

## Start

### M0-Produkt

Voraussetzung ist Docker Desktop mit Compose. Beim ersten Build werden die exakt
fixierten Images und Pakete geladen; danach benötigen Start und Kapitelübersicht
keinen Internetzugang und keinen API-Key.

```sh
docker compose up --build -d
```

Öffnen: **http://127.0.0.1:3000**. Nur dieser Web-Port wird auf dem Host
veröffentlicht. Status und Logs lassen sich so prüfen:

```sh
docker compose ps
docker compose logs api web
```

Stoppen, ohne Lernstand zu löschen:

```sh
docker compose down
```

Nach einer Repository-Aktualisierung werden die weiterhin fixierten Basen und
Lockfiles neu gebaut und die Container ersetzt:

```sh
docker compose build --pull
docker compose up -d
```

Das benannte Volume `learning_data` bleibt dabei erhalten. Ein Backup der
SQLite-Datei wird bei gestoppter App erstellt:

```sh
docker compose stop web api
mkdir -p backups
docker compose cp api:/data/learning.db ./backups/learning.db
docker compose start api web
```

Der Rückweg in ein frisches Volume ist in diesem Stand noch nicht als vollständige
Wiederherstellung geprüft; insbesondere Containerbenutzer und Dateirechte müssen
dabei erhalten bleiben. Diese Abnahme folgt mit dem vollständigen Pilotpfad.
`docker compose down -v` löscht das benannte Volume und damit den lokalen Lernstand.

### Design Lab (D0)

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
| M0-Epic und gemeinsame Basis | [Ausführungsplan](.Codex/prd.md), [visueller Ticketplan](docs/reviews/m0-plan.html), [Ausgangscheck](docs/reviews/m0-01-baseline.md) |
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
