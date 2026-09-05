# M0-02: Lokale App und Kapitelübersicht

Stand: 5. September 2026 · Agentenprüfung, keine fachliche Expertenfreigabe.

## Ergebnis

Der Compose-Start liefert zwei reproduzierbare Container. Im Browser ist nur das
Web unter `http://127.0.0.1:3000` erreichbar. Die Kapitelübersicht bezieht Titel,
Reihenfolge und Verfügbarkeit über den festen Next.js-Proxy aus dem validierten
kanonischen Inhalt. Die erste Lektion ist verfügbar; drei weitere Lektionen sind
sichtbar als in Vorbereitung gekennzeichnet und nicht anklickbar. Der eigentliche
Reader folgt in Ticket #3, was die Oberfläche offen mitteilt.

## Abnahmekriterien

| AK | Umsetzung und Fundstelle |
|---:|---|
| 1 | `compose.yaml` baut `apps/web` und `services/api`. Nur Web veröffentlicht `127.0.0.1:3000`; API nutzt ausschließlich `expose`. Ein normales Web-Netz ermöglicht die Loopback-Freigabe, ein internes Netz verbindet Web und API. Keine Socket-Mounts oder Host-Netze. |
| 2 | `services/api/src/athena_api/content.py` und `models.py` validieren zuerst die gesamte kanonische Struktur. Geprüft werden unter anderem globale und lokale IDs, Referenzen, Block- und Rendererarten, Quellenmarker, Lernziel-/Aufgabenzuordnung sowie M0-Pflichtinhalte. Die Übersicht wird direkt daraus abgeleitet; es gibt kein zweites Manifest. Negative Tests verändern Kopien auch außerhalb von Lektion 1 und prüfen falsche Feldtypen sowie doppelte Options- und Rubrik-IDs. |
| 3 | `GET /v1/curriculum` liefert `content_version`, Kapitelreihenfolge, Titel und Verfügbarkeit. `apps/web/app/api/curriculum/route.ts` ist der einzige Proxyweg, verwendet ein festes API-Ziel und bricht nach fünf Sekunden ab. Freie URLs oder Dateipfade werden nicht angenommen. |
| 4 | `apps/web/app/page.tsx`, `components/Curriculum.tsx` und `app/globals.css` setzen die gewählte lebhafte Marmorbibliothek responsiv um. Verfügbare und vorbereitete Kapitel sind klar getrennt; vorbereitete Lektionen haben keine Links oder Schaltflächen. |
| 5 | `/healthz` prüft den Prozess, `/readyz` Inhalt und Datenbank. Strukturierte deutschsprachige Fehler nennen Datei, Code und Meldung. Ungültiger Inhalt verhindert Readiness und Curriculum. Die Oberfläche zeigt bei Proxy-/API-Ausfall einen erreichbaren Wiederholen-Zustand. |
| 6 | `services/api/migrations/001_initial.sql` enthält nur die Migrationsbasis. `database.py` aktiviert Foreign Keys und Busy Timeout pro Verbindung und führt kurze Migrationstransaktionen aus. Ein benanntes `learning_data`-Volume hält SQLite; der API-Container startet genau einen Worker. Content, Quellen und Assets sind read-only. |
| 7 | Laufzeit-, Paket- und Imageversionen sind ohne `latest` exakt fixiert; Details und offizielle Quellen stehen in `docs/IMPLEMENTED_STACK.md`. Beide Lockfiles liegen bei. Start und Übersicht benötigen keinen API-Key und nach der Installation keinen Netzzugriff. |
| 8 | Ein frischer Stack, Browser→Proxy→API, API-Ausfall mit Wiederholen, ungültige Content-Fixtures sowie die tatsächlichen Host-Portbindungen wurden geprüft. Start, Stopp, Update und SQLite-Sicherung stehen im `README.md`. |

## Ausgeführte Prüfungen

Alle Befehle liefen im Ticket-Worktree; der Compose-Projektname war exklusiv
`athena-m0-2`.

| Prüfung | Tatsächliches Ergebnis |
|---|---|
| `uv lock --check` | Exit 0 |
| `uv run --frozen pytest` mit eigenem `--basetemp` und Cache | 23 bestanden; Reviewer-Nachlauf in 1,86 s und Host-Endlauf in 1,78 s, jeweils zwei Deprecation-Warnungen aus dem FastAPI/Starlette-TestClient, keine Fehler |
| `python -m compileall src` | Exit 0 |
| `npm run typecheck` | Exit 0 |
| `npm run lint` | Exit 0 |
| `npm run build` | Exit 0; Next.js 16.3.4, Routen `/`, `/api/curriculum`, `/icon.svg` |
| `docker compose -p athena-m0-2 down` und `up --build -d --wait` | Finaler Hostlauf ohne Löschen des Volumes: API und Web neu gebaut und healthy |
| `npm run test:browser` | 3 bestanden, im finalen Hostlauf in 1,9 s: Übersicht, API-Ausfall/Wiederholen, 390-px-Ansicht; der Normalpfad hatte keine HTTP-Antwort ab Status 400 |
| Echter API-Stop/Start mit Playwright | API gestoppt, Fehlerüberschrift erreicht, API gestartet, Proxy wieder 200; Retry per Fokus und Enter lud anschließend den Pilottext |
| Interaktive Prüfung mit `agent-browser` | Desktop- und Mobilansicht geprüft; API gestoppt, Fehlerzustand gesehen, nach Neustart erfolgreich erneut geladen |
| Separater Host-Negativtest im Container | Unbekannter Block in einer Kopie von Lektion 4: `/healthz` 200, `/readyz` und `/v1/curriculum` 503 mit `invalid_block`; Testcontainer anschließend entfernt |

Die laufenden Container bestätigten zusätzlich:

- Web-Portbindung in HostConfig und NetworkSettings: `127.0.0.1:3000`;
  `GET /` und `GET /api/curriculum` antworteten mit 200.
- API-Portbindung am Host: `{}`; `http://127.0.0.1:8000` war nicht erreichbar.
- Der API-Log zeigte den internen Aufruf `GET /v1/curriculum` vom Web-Container.
- API läuft als Benutzer `athena` mit einem Uvicorn-Worker; Web als Benutzer `node`.
- `sqlite3.sqlite_version` im API-Image ist `3.40.1`. Über die API-Verbindung
  waren `foreign_keys=1`, `busy_timeout=5000` und Migration 1 aktiv.
- Die Mounts `/content`, `/research` und `/assets` waren read-only; `/data` lag
  schreibbar im Volume `athena-m0-2_learning_data`.

Beim ersten Compose-Versuch hing Web ausschließlich an einem `internal: true`-Netz.
Docker Desktop legte dadurch zwar eine HostConfig-Portbindung an, veröffentlichte
sie aber nicht in NetworkSettings. Die endgültige Trennung in `web_front` und
`api_internal` beseitigte den Fehler; der danach neu erzeugte Stack lieferte die
oben genannten realen Portwerte.

Ein späterer neuer `agent-browser`-Sitzungsstart scheiterte nach einem gemeldeten
Daemon-Versionswechsel mit `CDP response channel closed`. Das war kein App-Fehler:
Die vorherige interaktive Sitzung, die finale Playwright-Suite und die direkten
HTTP-Prüfungen waren erfolgreich. Für weitere pytest-Läufe ist wegen möglicher
Windows-ACLs der im API-README dokumentierte neue Laufname zu verwenden.

## Getrenntes Review

### Spec

Nach einer Implementer-Korrekturrunde sind keine offenen Spec-Befunde verblieben.
Der getrennte Reviewer reproduzierte zunächst drei Lücken außerhalb des M0-Filters:
eine Aufgabe ließ sich zusätzlich einer falschen Lektion zuordnen, `[S4]` wurde
nicht als ungültiger Quellenmarker erkannt und rohes HTML blieb in einer geplanten
Lektion unbeanstandet. Dieselben unveränderten Fixtures liefern nun jeweils
`failed` mit `invalid_assignment`, `invalid_source_marker` beziehungsweise
`invalid_html`. Die API-Suite bestätigt außerdem die symmetrischen Aufgaben-,
Grafik- und Interaktionsreferenzen. Ticket #3 und damit der Reader bleiben bewusst
außerhalb dieser Abnahme.

### Standards

Die dokumentierten Repositoryregeln sind erfüllt. Der Reviewer ergänzte den
exakten Hatchling-Pin samt Lockfile und offizieller Versionsquelle, schloss lokale
Umgebungsdateien aus dem API-Buildkontext aus, ignorierte das erzeugte
`tsconfig.tsbuildinfo` und begrenzte die README-Aussage auf den noch nicht als
Restore geprüften Stand. Als nicht blockierendes Ermessensurteil bleibt eine kleine
Duplizierung: `content.py` prüft Quellenmarker in Lektionstexten einmal mit
Lektionskontext und anschließend erneut im kapitelweiten Durchlauf.

Ergebnis: Spec 0 offene Befunde; Standards 0 Regelverstöße und 1 niedriger,
nicht blockierender Duplicated-Code-Hinweis.

## Grenzen

Der Reader, Aufgabenbearbeitung, Fortschritt und Feedback gehören nicht zu Ticket
#2. Es wurden keine M1-/M2-Tabellen angelegt. Kanonische D0-Inhalte und Assets
blieben unverändert; deshalb wurde die unveränderte D0-Suite nicht wiederholt.
Die visuelle Prüfung ist ein Agentenreview und setzt niemals `expert_reviewed`.
