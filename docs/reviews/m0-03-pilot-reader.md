# M0-03: Pilotlektion, Quellen und Fachvisualisierungen

Stand: 5. September 2026 · Implementer- und getrennte Reviewer-Prüfung, keine
fachliche Expertenfreigabe.

## Ergebnis

Die Kapitelübersicht führt jetzt in die vollständige Pilotlektion „Gleiche Aufgabe,
andere Reaktion“. Die API erzeugt daraus einen validierten, öffentlichen Blockstrom;
der Reader stellt die kanonischen Texte und Quellenmarker in Originalreihenfolge dar.
Zwei zugängliche Fachvisualisierungen erklären Aufgabe, Reaktion und Kontext. Die
zweite Grafik enthält die unbenotete Interaktion mit drei kanonischen Rückmeldungen.

## Abnahmekriterien

| AK | Umsetzung und Fundstelle |
|---:|---|
| 1 | `GET /v1/lessons/ch01-l01` in `services/api/src/athena_api/main.py` liefert den Pydantic-validierten `LessonResponse`. Andere IDs antworten mit 404. `lesson_response` in `content.py` filtert auf q01/q02 und S05/S06; q03 und private Aufgabenfelder fehlen im Payload. |
| 2 | `_lesson_blocks` erzeugt geordnete Überschriften-, Absatz- und Komponentenblöcke direkt aus `content/ch01/01_LOAD.md`. `LessonReader.tsx` rendert Textknoten und einen festen Inline-Dialekt ohne Raw HTML, MDX oder freie Komponenten-/Linkausführung. q01/q02 erscheinen nur mit öffentlichen Feldern und „in Entwicklung“. |
| 3 | Komma-separierte Marker öffnen S05 und S06 gemeinsam im tastaturbedienbaren Quellenpanel. Es zeigt Quellentyp, geprüften Zugang, Nutzungs- und Importgrenze sowie externe HTTP(S)-Nachweise; Escape/Schließen gibt den Fokus an den Marker zurück. `pilot_draft` und die fehlende unabhängige Fachprüfung stehen im Lektionskopf. |
| 4 | `StaticLoadFigure` trennt äußere Aufgabe, innere Reaktion und Kontext durch Karten, Linienarten, Symbole und Text. `TwoRunsInteraction` ist zugleich `fig-ch01-two-runs` und `int-ch01-load`; es gibt keine dritte Fachgrafik. Labels, Kurz- und Langbeschreibung kommen aus den validierten Briefingdaten. |
| 5 | Vor Auswahl stehen ausschließlich die dokumentierten Laufangaben im DOM. Reaktionen, Nachher-Langbeschreibung, `title` und ARIA-Texte werden auf vorzeitige Lösungshinweise geprüft. Nach jeder der drei Auswahlen erscheint die exakt kanonische Rückmeldung; erst danach wird die Reflexion verfügbar. |
| 6 | „Neu ansehen“ löscht nur Auswahl, Reveal und Reflexion des React-Zustands und gibt Fokus an die erste Auswahl zurück. Es gibt weder API-Schreibzugriff noch Benotung, Fortschritt, Pulsdaten, Ursachenbeweis oder Trainingsberatung. |
| 7 | `app/globals.css` setzt weiße 18-px-Leseflächen mit 65 Zeichen, große Bildbühnen, Pompejanisches Rot und dezente Ornamente um. `scene-pompeii.png` wurde bytegleich aus D0 übernommen; `assets/ch01/scene-pompeii.json` erhält Prompt, Herkunft, Status und Hash. Das Atmosphärenbild ist dekorativ und von den Fachvisuals getrennt. |
| 8 | Der getrennte Reviewer prüfte Quellenbezug, sichtbare Strukturen, Labels und Gestaltung. Seine Befunde und der Re-Review stehen im nachfolgenden Abschnitt. |
| 9 | API-Tests prüfen Inhaltsgleichheit, Blockreihenfolge, Payloadgrenzen, q03-Ausschluss und HTTP(S)-Links. Browserprüfungen decken Quellen/Fokus, drei Antwortpfade, Reset, 390 px, 200-%-Reflow, Tastatur, reduzierte Bewegung, Lösungshinweise und HTTP-Fehler ab. Kontrast wurde im Browser gemessen. |

## Ausgeführte Prüfungen

Alle Befehle liefen im Ticket-Worktree. Compose verwendete das isolierte Projekt
`athena-m0-3` und dessen eigenes Volume `athena-m0-3_learning_data`.

| Prüfung | Tatsächliches Ergebnis |
|---|---|
| `npm.cmd ci` | 146 Pakete exakt aus `package-lock.json` installiert |
| `uv sync --frozen` mit ticketlokalem `UV_CACHE_DIR` | Exit 0; exakt gelockte API-Umgebung erstellt |
| `.venv\Scripts\python.exe -m pytest --basetemp …/.scratch/api-3-final -o cache_dir=…/.scratch/api-3-final-cache` | 31 bestanden in 3,15 s; zwei Upstream-Deprecation-Warnungen aus Starlette/FastAPI |
| `npm.cmd run typecheck` | Exit 0 |
| `npm.cmd run lint` | Exit 0 |
| `npm.cmd run build` | Exit 0; Next.js-Routen für Übersicht, festen Proxy und Lektionsseite gebaut |
| `docker compose -p athena-m0-3 up --build -d` | API und Web neu gebaut; beide healthy, nur `127.0.0.1:3000` am Host veröffentlicht |
| `npm.cmd run test:browser` | 11 bestanden in 10,1 s gegen den Compose-Stack |
| Direkter PNG-Abruf | HTTP 200, `image/png`, 2.582.538 Bytes |
| SHA-256 D0-/Produkt-PNG | beide `6156611d91e8d1630d731cb818ab12897201e77b9f74932df04d5d471bfdf6a7` |
| Browser-Kontrastmessung | Fließtext auf Weiß 16,39:1; aktiver Primärbutton 10,03:1; Kapitel-Eyebrow 13,31:1 |
| Frische `docker compose … logs api web` | nur erfolgreiche Starts, Readiness- und Contentrequests; keine Laufzeitfehler |
| `git diff --check` | Exit 0 nach der dokumentierten Korrekturrunde |

Die interaktive `agent-browser`-Sitzung scheiterte trotz grünem Offline-Doctor
zweimal beim Windows-CDP-Autostart mit `CDP response channel closed`. Der verlangte
Browserpfad wurde deshalb mit Playwright im installierten Chrome tatsächlich
ausgeführt. Desktop-, 390-px-, Interaktions- und Quellenpanel-Screenshots liegen
im ignorierten `.scratch/review-3` und wurden im getrennten Review angesehen.

## Getrenntes Review

Ein vom Implementer getrennter Reviewer-Agent prüfte den Arbeitsbaum gegen
`cfc17a4b8d24c08b8ab0121dffaf3b54c1aa0297`, das vollständige Ticket sowie die
Projektregeln, Spezifikation, ADRs, kanonischen Inhalte, Bildbriefings,
Interaktionsvorgaben, Quellenregister und Aussagenkarte. Standards- und
Spezifikationsprüfung ergaben nach der Korrekturrunde keine offenen Befunde.

### Befunde und Korrekturen

1. Das Domus-PNG fehlte zunächst im Next.js-Runtime-Image. Der reale Browser zeigte
   ein defektes Hero-Bild und der direkte Abruf antwortete mit HTTP 404. Der
   Runtime-Build kopiert nun `public`; der Re-Review ergab HTTP 200, `image/png`,
   2.582.538 Bytes und ein vollständig sichtbares Bild bei Desktop und 390 px.
2. Die vollständige Langbeschreibung von `fig-ch01-two-runs` verriet anfangs vor
   der Auswahl beide Reaktionen. Die Beschreibung ist nun zustandsabhängig; der
   DOM-/ARIA-Recheck enthält vor dem Aufdecken weder Reaktion noch Feedback und
   ergänzt die Nachher-Beschreibung erst nach der Auswahl.
3. Das als modal deklarierte Quellenpanel begrenzte den Tastaturfokus zunächst
   nicht. Die ergänzte Fokusfalle hält Vorwärts- und Rückwärts-Tab im Panel;
   Escape und „Schließen“ geben den Fokus an den auslösenden Quellenmarker zurück.
4. Der erste 200-%-Test verwendete Seitenskalierung ohne Layout-Reflow. Der
   korrigierte Test emuliert 640 CSS-Pixel bei Device-Scale-Factor 2 und prüft den
   daraus entstehenden Reflow ohne horizontalen Überlauf. Das ist eine
   Browseremulation, kein manuell bedienter Zoomdialog.
5. Die Herkunftszeile des Atmosphärenbilds wurde anfangs durch die überlappende
   Lesefläche abgeschnitten. Nach angepasstem Abstand ist sie in den erneuten
   Desktop- und 390-px-Screenshots vollständig lesbar.
6. Der 12-px-Kapitel-Eyebrow lag mit `#bd5b3d` über dem variablen Foto je nach
   Hintergrundpixel nur bei etwa 1,59:1 bis 4,29:1. Eine feste Kombination aus
   `#ffe2b2` und `#3a100d` erreicht im Browser 13,31:1; der gezielte
   Kontrasttest und ein neuer 390-px-Screenshot bestätigten die Korrektur.

### Fachvisual- und Quellenprüfung

`fig-ch01-load` trennt äußere Aufgabe, innere Reaktion und Kontext sichtbar durch
eigene Karten, Linienarten, Symbole und Text. Zweck, Labels, Kurz- und
Langbeschreibung entsprechen dem kanonischen Briefing. `fig-ch01-two-runs` bleibt
die einzige Grafik der Interaktion: Beide Karten zeigen dieselbe dokumentierte
Distanz, Dauer und Strecke; Reaktionen erscheinen erst nach Auswahl. Der sichtbare
Nachher-Zustand für Auswahl 3 enthält die kanonische Rückmeldung wörtlich, hält die
Ursache offen und macht die unbenotete Reflexion klar erkennbar. Die drei
Feedbackpfade wurden zusätzlich einzeln im Browser geprüft.

S05 trägt die Trennung von interner und externer Belastung, S06 die Einordnung von
akuten und chronischen Effekten sowie Kontext. Die Visuals ergänzen daraus keine
Pulsdaten, Ursachenbeweise, Vorhersagen oder Trainingsempfehlungen. Das Quellenpanel
zeigt für beide Marker Titel, Urheber, Quellentyp, geprüften Zugang, Nutzungs- und
Importgrenze, DOI und externen Nachweis. Das Domus-Bild ist dekorativ, als freie
generierte und ungeprüfte Interpretation gekennzeichnet und bytegleich zur
D0-Datei (SHA-256
`6156611d91e8d1630d731cb818ab12897201e77b9f74932df04d5d471bfdf6a7`).
Ungeprüfte Schulterbilder sind nicht eingebunden.

### Eigene Re-Review-Läufe

- API: 31 Tests bestanden; zwei bekannte Upstream-Deprecation-Warnungen.
- Web: Typecheck, Lint und Produktionsbuild bestanden.
- Finaler gezielter Lektionslauf: 8 von 8 Browserprüfungen bestanden, einschließlich
  drei Feedbackpfaden, Reset, Quellenfokus, 390 px, Reflow-Emulation, reduzierte
  Bewegung, Lösungs-Leak und gemessenen Kontrasten.
- Vier finale Implementer-Screenshots und ein eigener 390-px-Kontrast-Recheck wurden
  tatsächlich angesehen; die sichtbaren Strukturen, Labels, Quelleninformationen
  und die Gestaltung waren danach ohne offenen Befund.

Dieses Agentenreview prüft Quellenbezug und sichtbare fachliche Strukturen, ist aber
keine unabhängige menschliche Fachprüfung. Externe Volltexte wurden nicht geöffnet
oder heruntergeladen; `expert_reviewed` bleibt ungesetzt.

## Host-Verifikation

Der Host führte die API-Suite unabhängig aus: 31 bestanden, zwei bekannte
Dependency-Warnungen (2,59 s). Typecheck, Lint und Produktionsbuild bestanden.
Der gesamte Browserlauf auf dem korrigierten Containerstand bestand mit
11 Tests (9,8 s), einschließlich der finalen Kontrastkorrektur. Der Host sah die
korrigierte Domus-Bildbühne selbst an und bestätigte den identischen PNG-Hash,
fehlerfreie Web-Startlogs und den unveränderten kanonischen Inhalt samt D0.
Der abschließende gestagte Diff bestand `git diff --cached --check`.

## Grenzen

Die Entwicklungsanzeigen für q01/q02 sind keine beantwortbaren oder gespeicherten
Aufgaben. Lesestatus, Versuche und Feedback folgen erst in den beauftragten
Folgetickets. Es wurden keine externen Volltexte importiert und keine neuen Bilder
generiert. Die Softwareprüfungen und das Agentenreview sind keine unabhängige
menschliche Fachprüfung und setzen niemals `expert_reviewed`.
