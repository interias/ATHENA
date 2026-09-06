# M0-01 – Ausgangscheck der gemeinsamen Basis

Stand: 5. September 2026. Implementer-Prüfung für Ticket #1; keine fachliche
Freigabe und keine M0-Gesamtabnahme.

## Geprüfter Ausgangspunkt

- Worktree-Branch: `agent/1-shared-baseline`
- Basis vor Ticket #1: `07053ef7d1c9e3515e13a3ba34e669f6ba8c6547`
- Gemeinsame Quellen: [CONTEXT](../../CONTEXT.md),
  [D0-Spezifikation](../specs/d0-design-lab.md), [ADRs](../adr/),
  [Produktbrief](../01_PRODUCT_BRIEF.md),
  [Architektur](../07_TECH_ARCHITECTURE.md),
  [Content-/API-Vertrag](../08_CONTENT_AND_API_CONTRACT.md),
  [Implementierungsplan](../10_IMPLEMENTATION_PLAN.md) und
  [Pilot-Auswertung](../11_PILOT_EVALUATION.md)
- Kanonische Inhalte: `content/ch01/`; Quellen und Aussagenzuordnung: `research/`
- D0-Referenz: `Design/` einschließlich Lockfile, Testbericht, lokaler Assets und
  Herkunftsmanifest

Nach dem Merge von #1 ist der aktuelle Stand von `epic/8-m0-pilot` die gemeinsame
Basis der Folgetickets. #2 prüft vor Arbeitsbeginn, dass #1 dort enthalten ist;
ein späterer Commit-Hash wird deshalb nicht vorweggenommen.

## Umfang und Entscheidungen

Die Produktimplementierung M0 entsteht ab #2 getrennt von `Design/` in der
Web-/API-Struktur aus dem Architekturvertrag. Die D0-Regel, Anwendungscode im
Labor zu halten, begrenzte den damaligen Laborauftrag. Sie sperrt den ausdrücklich
beauftragten M0-Folgeauftrag nicht. D0 bleibt startbare Referenz, und seine lokalen
Designbewertungen werden nicht zu Lernfortschritt.

Die D0-Spezifikation hielt die Trackerpublikation aus dem Labor heraus und ordnete
sie der separaten M0-Planung zu. Diese Planung liegt mit den GitHub-Tickets #1–#7
und Epic #8 vor. Ticket #1 erzeugt keine weiteren Issues und noch keinen
Produktcode.

Für M0 ist keine neue Stilwahl offen. Verbindlich sind die lebhafte
Marmorbibliothek, weiße Leseflächen, Domus · Pompejanisches Rot mit großer
Bildbühne, Reader, integrierte Fachgrafiken, dezente Mythologie sowie 18 px und
65 Zeichen mit mobiler Begrenzung. Die älteren Aussagen „Stil offen“ und „ruhiges
Fachbuch“ in historischen Planungsdokumenten beschreiben den damaligen Stand und
werden für M0 durch diese neuere Entscheidung ersetzt.

M0 bleibt auf `ch01-l01`, `fig-ch01-load`, `fig-ch01-two-runs` mit
`int-ch01-load` sowie `q-ch01-01` und `q-ch01-02` begrenzt. Kanonische Lehrtexte
und Quellenmarker bleiben unverändert. Neue Schreibproben, eine komplette
Anatomiearbeit und weitere Stile sind keine Voraussetzung.

## Vorhandenes D0

Das Design Lab ist eine eigenständig startbare Next.js-Anwendung. Der vorhandene
[D0-Prüfbericht](../../Design/TEST_REPORT.md) dokumentiert seinen damaligen und
erneuten Prüfumfang. Im Ausgangscheck wurden 15 registrierte lokale PNG-Dateien
und 15 Manifesteinträge gefunden. Der D0-Inhaltstest prüft ihre Bytes gegen die
SHA-256-Werte sowie den Status und die Herkunftsfelder im Manifest. Das lokale,
ignorierte Quellzuordnungsfile `Design/content/image-sources.local.json` war nicht
vorhanden und wurde weder benötigt noch veröffentlicht.

Die Implementer-Prüfung in diesem Worktree ergab:

| Befehl | Ergebnis |
|---|---|
| `npm.cmd ci` in `Design/` | Erfolgreich, 229 Pakete aus dem vorhandenen Lockfile installiert |
| `npm.cmd run typecheck` | Erfolgreich |
| `npm.cmd run lint` | Erfolgreich |
| `npm.cmd test` | 10/10 Tests bestanden, darunter kanonischer Inhalt und 15 Asset-Hashes |
| `npm.cmd run build` | Erfolgreich; Next.js 16.3.4, statische Routen `/` und `/_not-found` |

Ein separater Hostcheck mit Node 22.23.1 und npm 10.9.8 bestätigte zusätzlich
dieselben vier Prüfbereiche und `npm run test:browser` mit 19/19 bestandenen Tests
in 22,0 Sekunden gegen den bestehenden D0-Server auf `127.0.0.1:3100`. Dieser
Browserlauf prüft D0 und ist keine Prüfung einer M0-Produktoberfläche.

## Noch nicht vorhandenes M0

Am Ausgangspunkt existierten weder `apps/web`, `services/api`, `compose.yaml` noch
`docs/IMPLEMENTED_STACK.md`. Deshalb konnten kein M0-Start, keine FastAPI-Endpunkte,
keine SQLite-Migration, keine Produktpersistenz und kein M0-Browserpfad geprüft
werden. Diese Arbeit beginnt mit #2 und endet nicht mit einem grünen D0-Lauf.

## Veröffentlichungscheck

- `git diff --exit-code -- content research Design/content Design/public/images`
  war vor den Dokumentationsänderungen leer: kanonische Inhalte, Quellen,
  Contentdaten und Bilddateien waren gegenüber der Basis unverändert.
- `git ls-files` enthielt keine `.env`-Dateien, Schlüssel, SQLite-/DB-Dateien,
  `node_modules`, `.next`, Playwright-Berichte oder Testergebnisse.
- Root-`.gitignore` schließt `.scratch/`, `.env` und `.env.*` aus; das D0-ignore
  deckt lokale Bildquellzuordnung, Node-/Next- und Playwright-Artefakte ab.
- Die 15 Bilddateien bleiben zusammen mit `Design/content/images.json` im
  Repository erreichbar; Prompt, Generator, ursprünglicher Dateiname, Abmessungen,
  Status und SHA-256 bleiben dort erhalten.

## Nachweis der Abnahmekriterien

| Abnahmekriterium | Nachweis |
|---|---|
| Bestand und lokale Assets erhalten | Leerer gezielter Diff vor #1; Pfade und D0-Checks oben |
| D0 und M0 eindeutig getrennt | Abschnitt „Umfang und Entscheidungen“ sowie [Ausführungsplan](../../.Codex/prd.md) |
| Stil- und Inhaltsregeln bestätigt | Produktgrenze im Ausführungsplan; keine Änderung an kanonischem Content |
| Keine Laufzeitdaten oder Buildartefakte veröffentlicht | `git ls-files`-Scan und Ignore-Prüfung oben |
| Folgetickets besitzen eine gemeinsame Basis | Mergeziel, Reihenfolge und Übergaben im Ausführungsplan; visueller [Graph](m0-plan.html) |
| D0-Prüfung von M0 getrennt | Abschnitte „Vorhandenes D0“ und „Noch nicht vorhandenes M0“ |

## Getrenntes Agentenreview

Dieses Agentenreview wurde getrennt vom Implementer durchgeführt und ist keine
menschliche Fachfreigabe.

- **Spezifikation:** Keine Befunde. Ticketumfang, D0-/M0-Trennung, bestätigte
  Gestaltung, Content- und Reviewgrenzen, Arbeitsgraph und gemeinsame Gitbasis
  sind vollständig und ohne zusätzlichen Produktumfang dokumentiert.
- **Standards:** Die getrennte Sichtprüfung bestätigte lesbare Abhängigkeiten,
  die klar unterschiedene Kollision zwischen #4 und #6, die serielle Slotfolge
  sowie passende Titel und Beschreibungen. Es waren keine Korrekturen am Plan
  nötig. Eine zusätzliche Leerzeile am Ende des Ausführungsplans wurde entfernt;
  weitere Standardverletzungen oder belastbare Code-Smells wurden nicht gefunden.
