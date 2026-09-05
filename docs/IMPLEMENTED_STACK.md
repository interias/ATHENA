# Implementierter Stack für M0

Stand: 5. September 2026. Diese Versionen sind direkt in Lockfiles und
Containerdefinitionen fixiert. Zur Laufzeit lädt die Kapitelübersicht keine
externen Dienste, Fonts oder Tracker und benötigt keinen API-Key.

| Bereich | Fixierte Version | Auswahl und Nachweis |
|---|---:|---|
| Node.js-Container | `node:22.23.1-bookworm-slim` · `sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3` | Offizielles [Node-Image](https://hub.docker.com/_/node); Registry-Manifest am 05.09.2026 geprüft. Erfüllt Next.js ≥20.9. |
| Next.js / React | `16.3.4` / `19.2.8` | [Next.js-Installation](https://nextjs.org/docs/app/getting-started/installation) nennt 16.3.4 als aktuellen Stand und dokumentiert App Router, Node-Anforderung und direkten ESLint-Aufruf. npm-Pakete und Lockfile wurden geprüft. |
| Python-Container | `python:3.13.7-slim-bookworm` · `sha256:adafcc17694d715c905b4c7bebd96907a1fd5cf183395f0ebc4d3428bd22d92d` | Offizielles [Python-Image](https://hub.docker.com/_/python); Registry-Manifest am 05.09.2026 geprüft. |
| FastAPI / Pydantic | `0.141.1` / `2.13.5` | Veröffentlichte Metadaten auf [PyPI FastAPI](https://pypi.org/project/fastapi/0.141.1/) und [PyPI Pydantic](https://pypi.org/project/pydantic/2.13.5/); Python-Anforderungen sind mit 3.13 erfüllt. |
| API-Laufzeit | Uvicorn `0.52.4`, PyYAML `6.0.3`, uv `0.11.25` | Exakt in `uv.lock` beziehungsweise im Dockerfile; Containerbetrieb folgt der offiziellen [FastAPI-Docker-Anleitung](https://fastapi.tiangolo.com/deployment/docker/). |
| Python-Buildbackend | Hatchling `1.32.0` | Exakt als Build- und Entwicklungsabhängigkeit fixiert; [PyPI](https://pypi.org/project/hatchling/1.32.0/) kennzeichnet die Version als stabil und Python 3.13 als unterstützt. |
| SQLite | `3.40.1` in Python 3.13.7 | `sqlite3.sqlite_version` wurde im finalen API-Image abgefragt. Eine Datei liegt im Volume `learning_data`; Foreign Keys und Busy Timeout werden pro API-Verbindung aktiviert. Migration 005 ergänzt idempotentes, versionsgebundenes Pilotfeedback und erhält die Daten aus Schema 004. |
| Tests | pytest `9.1.1`, HTTPX `0.28.1`, Playwright `1.63.0` | Nur Entwicklungsabhängigkeiten; exakt in den jeweiligen Lockfiles. |

Die Web-Entwicklungswerkzeuge sind ebenfalls exakt im npm-Lockfile fixiert:
TypeScript 5.9.3, ESLint 10.10.0 und die passenden Next-/React-Typen. Compose
veröffentlicht gemäß [Docker-Portdokumentation](https://docs.docker.com/engine/network/port-publishing/)
nur `127.0.0.1:3000`. Das Web hängt zusätzlich am internen API-Netz; die API
besitzt keine Host-Portzuordnung.

Mutierende Web-Proxys prüfen Loopback-Host und passende Origin, akzeptieren nur
JSON innerhalb fester Größenlimits und verwenden feste interne API-Pfade. Antworten
zu Versuchen, Lesestatus und Pilotfeedback werden nicht gecacht; Eingaben stehen
weder in URLs noch in Anwendungslogs.
