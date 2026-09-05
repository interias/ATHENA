# ATHENA Design Lab · Betrieb

Zielauswahl, Umfang und Umsetzungsstand: [D0-Spezifikation](../docs/specs/d0-design-lab.md).
Bedienung: [Explorationsanleitung](EXPLORATION_GUIDE.md).

## Start und Prüfungen

Node.js 22 verwenden. Im Ordner `Design/`:

```sh
npm ci
npm run dev
```

Adresse: **http://127.0.0.1:3100**. Unter Windows bei gesperrten Skripten `npm.cmd`
verwenden. Bei belegtem Port `npm run dev -- --port 3101` und
http://127.0.0.1:3101 öffnen; keine fremden Prozesse beenden.
Installation benötigt Netzwerk, die Laborlaufzeit keine Cloud.
Die Startskripte deaktivieren Next-Telemetrie vor dem normalen Next-CLI-Aufruf.

```sh
npm run typecheck
npm run lint
npm test
npm run build
# Bei laufendem Dev-Server und lokal installiertem Chrome:
npm run test:browser
```

Versionen stehen in `package.json` und `package-lock.json`.
Tatsächliche Ergebnisse und Grenzen: [TEST_REPORT.md](TEST_REPORT.md).

## Daten und Persistenz

Der Loader liest fünf feste Originalpfade im übergeordneten Repository; `Design/`
deshalb innerhalb dieses Repositorys starten. Markdown wird als Daten verarbeitet.
Nach einer Änderung am Original müssen die [Schreibproben](content/voices.json)
redaktionell geprüft werden; ein neuer Hash allein ersetzt diese Prüfung nicht.

| Bereich | Browser-Speicher | URL |
|---|---|---|
| Lektion, Schreibvergleich und Designfeedback | `athena-design-lab:v1` | Darstellungsparameter |
| Bildvergleich, Favoriten und Notizen | `athena-design-lab:images:v1` | `img.*` |
| Gemeinsame Anatomiegrundlage | `athena-design-lab:anatomy:v1` | `anat.*` |

URLs enthalten keine Notizen oder Antworten. Aufgabenversuche bleiben beim
Stilwechsel erhalten, können bei Reload oder Bereichswechsel zurückgesetzt werden.
Feedback vor Browserlöschung als JSON/Markdown exportieren; Import gehört nicht zu D0.

## Assets und Review

[Bildmanifest](content/images.json): lokale PNGs, Prompts, Herkunft und SHA-256.
`node scripts/register-images.mjs` registriert vorhandene Originaldateien anhand
der lokalen, ignorierten Zuordnung `content/image-sources.local.json`.
Es erzeugt keine Bilder; bei fehlender Zuordnung ist es nicht für den Appstart nötig.

[Anatomie-Prüfgrundlage](ANATOMY_REVIEW.md): Quellen, Auslassungen und Abnahmecheckliste.
Das Bildlabor exportiert ein Prüfpaket mit Geometrie und beiden SVG-Fassungen.
Nach beabsichtigten Änderungen an Geometrie, Renderer oder Stilen:
`node scripts/anatomy-review.mjs`. Dies aktualisiert den ungeprüften Versionsbezug,
erteilt keine Fachfreigabe. Ein Inhaltstest erkennt veraltete Datei-Hashes.
