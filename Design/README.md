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

Der Loader liest die fünf festen Dateien der [Inhaltsbasis 0.1.0](content/baseline-0.1.0/README.md).
Diese bytegenau erhaltene Fassung hält die D0-Vergleiche stabil, während die
Produktlektion überarbeitet wird. Markdown wird als Daten verarbeitet.
Die [Schreibproben](content/voices.json) behalten ihre ursprünglichen Texte und
Quellenhashes; nur der Pfad zeigt jetzt auf die gesicherte Originalfassung.
Eine spätere Änderung dieser Basis verlangt eine erneute redaktionelle Prüfung;
ein neuer Hash allein ersetzt sie nicht.

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
