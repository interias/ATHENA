# ATHENA API

FastAPI-Basis für den lokalen M0-Piloten. Beim Start werden die kanonischen Dateien
unter `ATHENA_CONTENT_ROOT` und `ATHENA_SOURCES_PATH` vollständig geprüft und die SQLite-Migrationen
angewendet. Ungültige Inhalte lassen den Prozess für Diagnosen erreichbar, setzen
`GET /readyz` und `GET /v1/curriculum` jedoch auf HTTP 503.

M0 stellt Curriculum, Pilotlektion, versionsgebundenen Lesestatus, persistente
Aufgabenversuche mit Selbstbewertung und idempotentes Pilotfeedback unter `/v1/`
bereit. Nur die API schreibt in SQLite.

Konfiguration:

- `ATHENA_CONTENT_ROOT`: Wurzel des kanonischen `content/`-Verzeichnisses
- `ATHENA_SOURCES_PATH`: kanonische Datei `research/SOURCES.md`
- `ATHENA_DATABASE_PATH`: Pfad zur SQLite-Datei

Lokaler Testlauf mit uv 0.11.25. Unter Windows sollte jeder Agent für
`basetemp` und Cache einen neuen Namen verwenden, damit keine ACLs eines früheren
Laufs übernommen werden:

```powershell
uv sync --frozen
$runId = (New-Guid).ToString("N")
uv run --frozen pytest --basetemp "../../../.scratch/prd/pytest-$runId" -o "cache_dir=../../../.scratch/prd/pytest-cache-$runId"
```

Der Container läuft als nicht privilegierter Benutzer mit genau einem Uvicorn-
Worker. Compose mountet Content, Quellen und Assets schreibgeschützt nach
`/content`, `/research` und `/assets`; die SQLite-Ablage liegt schreibbar unter
`/data`.
