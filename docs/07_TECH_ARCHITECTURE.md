# 07 — Technische Architektur

## Zielarchitektur

```text
Browser auf dem Docker-Host
  │ http://127.0.0.1:3000
  ▼
Next.js / TypeScript / App Router
  ├── sichere Markdown-Darstellung + erlaubte Lernkomponenten
  └── /api/*: schmaler serverseitiger Proxy, keine Geschäftslogik
          │ internes Compose-Netz
          ▼
      FastAPI / Pydantic
          ├── Content-Loader / Validator
          ├── SQLite: Fortschritt, Versuche, Feedback
          ├── Review-Scheduler [ab M1]
          └── Tutor-Adapter [ab M2, explizites Opt-in]
                  └── externer LLM-Anbieter ODER später lokaler Adapter

Repository: Markdown + Aufgaben + eigene Quelleninformationen
Lokale Assets: geprüfte SVGs / optionale Illustrationen
```

Next.js unterstützt Self-Hosting; FastAPI dokumentiert den Containerbetrieb. Der konkrete Zuschnitt oben ist unsere Architekturentscheidung, nicht eine Vorgabe dieser Projekte. [S21, S22]

## Warum diese kleine Lösung

Zwei App-Container und eine SQLite-Datei reichen als Start für eine lokale Person. Kein Postgres-, Redis-, Queue-, Vektordatenbank- oder Agenten-Orchestrierungsdienst. Python hält Contentvalidierung, Lernzustand und spätere Tutorlogik zusammen. Next.js bleibt Darstellung und schmaler Proxy.

**Kein notwendiges RAG-System im Pilot.** Das explizit gewählte Kapitel und der Abschnitt passen als abgegrenzter Kontext in einen Tutorrequest. Suchindex und Retrieval kommen erst hinzu, wenn ein reales Problem damit besteht.

## Repository nach Implementierung

```text
AGENTS.md
README.md                         # um Startanleitung ergänzen
START_CODEX.md
apps/web/                         # Next.js
services/api/                     # FastAPI
content/ch01/                     # kanonischer Markdown-Content
research/                         # Quellen und Aussagenzuordnung
assets/ch01/                      # später geprüfte lokale Assets
scripts/                          # Contentprüfung / Export / Backup
 tests/                           # ggf. innerhalb der Apps; Struktur dokumentieren
compose.yaml
.env.example                      # nur Platzhalter
.gitignore
```

Kein paralleles Kopieren der Texte in React-Dateien. Backend liest kanonische Dateien; Frontend bekommt validierte Daten. Generierte Manifestdateien sind abgeleitet und werden nicht manuell gepflegt.

### Veröffentlichung und Inhaltsversionen

Mit dem beauftragten L2/L3-Paket wird die bisherige feste Pilotfreigabe durch
eine explizite Veröffentlichungsliste ersetzt. Ein vorhandener Text oder ein
redaktioneller Prüfstatus allein schaltet keine Lektion frei. Geplante Inhalte
bleiben in der Navigation erkennbar und über die öffentlichen Lektions- und
Aufgabenwege gesperrt.

Lektions-ID und Anzeigereihenfolge sind unabhängig: Neue Einheiten können sich
zwischen vorhandene Einheiten einfügen, ohne deren Identität zu übernehmen.
Die Inhaltsversion einer Lektion bindet ihre Aufgaben und die dazu gespeicherten
Lernstände. Kapitel- und Aufgabenbankversionen erzwingen keinen Versionswechsel
unveränderter Lektionen. Bestehende Antwort- und Rückmeldungssnapshots bleiben
erhalten; eine Aufgabe weist weiterhin keine langfristige Erinnerung nach.

Der konkrete Umsetzungs- und Prüfstand steht im
[Bericht zum L2/L3-Paket](reviews/l2-l3-runtime.md).

## Daten und Persistenz

SQLite im benannten Volume `learning_data`; nur die API schreibt. Content und fertige Assets schreibgeschützt einhängen. Ein API-Worker für den Pilot. Kurze Transaktionen, Foreign Keys aktivieren, passende Busy-Timeouts; WAL-Modus bei Bedarf testen. Last- und Mehrnutzerbetrieb sind ausdrücklich nicht freigegeben.

Schemaänderungen über versionierte Migrationen. Start darf weder Daten löschen noch eine inkompatible Datenbank still überschreiben. Health-Endpunkt prüft Prozess, Readiness zusätzlich Content und Datenbankzugriff.

Backup als SQLite-sicherer Snapshot oder nach kontrolliertem Stoppen der API, nicht durch unkoordiniertes Kopieren einer aktiven Datei samt fehlendem WAL. Export separat als lesbares JSON mit Schema- und Inhaltsversion. Wiederherstellung in frischem Volume testen. `docker compose down -v` als datenlöschend dokumentieren.

## Netzwerk und lokale Sicherheit

Nur Next.js an `127.0.0.1:3000` veröffentlichen. API nicht am Host publizieren. Docker dokumentiert, dass veröffentlichte Ports ohne passende Bindung nicht automatisch lokal bleiben. Loopback-Bindung und tatsächliche Erreichbarkeit auf der verwendeten Docker-Version prüfen; spezielle Routingkonfigurationen können Annahmen ändern. [S23]

Kein `network_mode: host`. Keine Routerfreigabe. Keine Docker-Socket-Mounts. Prozesse nach Möglichkeit als nicht privilegierter Benutzer. Schreibbare Verzeichnisse bewusst begrenzen.

Der Web-Proxy hat eine feste API-Zieladresse und erlaubte Pfade/Methoden, keinen frei wählbaren Ziel-URL-Parameter. Mutierende Browserrequests prüfen erlaubte `Host`- und `Origin`-Werte sowie JSON-Content-Type. Fetch-Metadata kann ergänzen. Kein großzügiges CORS als Ersatz für Zugangsschutz.

M0/M1 enthalten keine Accounts, da nur der Host selbst zugreifen soll. **Das ist kein Konzept für öffentlichen oder LAN-Betrieb.** Android-/Tablet-Nutzung im Heimnetz ist ein späterer eigener Schritt mit Authentifizierung, TLS oder abgesichertem Zugang und neuer Sicherheitsprüfung. Ein bloßes Ändern auf `0.0.0.0` ist nicht ausreichend.

## Frontend-/Backend-Verantwortung

Backend: IDs, Versionen, Datenbank, Quellenauflösung, Aufgabenprüfung, Reviewzustand und Tutorzugriff. Frontend: Lesen, Eingaben, Visuals, Darstellungszustand. Nicht denselben Scheduler unabhängig in Python und JavaScript pflegen.

Fortschritt, Reviewlisten und Tutorantworten nicht über statische Next.js-Caches veralten lassen. Für diese Requests `no-store` beziehungsweise aktuelle explizite dynamische Behandlung verwenden. Statischer Lehrtext darf versionsgebunden gecacht werden. Den genauen Mechanismus für die gewählte Next.js-Version prüfen. [S21]

## Content-Sicherheit

Markdown ist Datenformat, kein ausführbarer Code. Rohes HTML, Scripts, beliebige MDX-Komponenten und externe iframes nicht zulassen. Komponenten anhand fester IDs auflösen. Links protokoll-/zielseitig validieren; keine `javascript:`- oder Daten-URLs. Contentpfade niemals direkt aus Benutzereingaben zusammensetzen.

## LLM- und Bildbetrieb

M0/M1 starten ohne API-Key und ohne Internet zur Laufzeit. Internet bleibt für den erstmaligen Paket-/Image-Download und spätere Updates erforderlich. Ein Quellennachweis führt gegebenenfalls zu einer externen Website; die Lektion selbst darf davon nicht abhängen.

Ab M2: API-Key nur in der API-Umgebung, niemals in `NEXT_PUBLIC_*`, Browser-Storage oder Git. `.env` ausschließen. Endnutzerpasswörter eines ChatGPT-Abos sind kein Integrationsweg. API-Nutzung wird laut OpenAI getrennt vom ChatGPT-Abo abgerechnet. [S18]

Lokales Hosting bedeutet bei aktiviertem Cloud-Tutor **nicht**, dass alle Inhalte lokal bleiben. Ausgewählter Abschnitt, Frage und freigegebener Verlauf verlassen den Rechner. `store=false` allein garantiert keine vollständige Nicht-Speicherung beim Anbieter. [S20]

## Versionsstrategie

Codex prüft aktuelle offizielle Runtime- und Paketanforderungen, wählt unterstützte stabile Versionen und schreibt sie in `docs/IMPLEMENTED_STACK.md`. Lockfiles und reproduzierbare Builds gehören zur Abnahme. Keine konkreten Patchstände aus dieser Planung ungeprüft übernehmen.

## Ziel-Startbefehl

```bash
# Nach Implementierung, nicht bereits mit diesem reinen Planungsordner ausführbar:
docker compose up --build -d
```

Die Implementierung muss außerdem Stop-, Update-, Backup- und Restoreanweisungen ergänzen. Die Planung behauptet keinen bereits erfolgreich durchgeführten Dockerstart.
