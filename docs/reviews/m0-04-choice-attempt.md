# M0-04 – Auswahlversuch mit dauerhaftem Feedback

Stand: 5. September 2026
Prüfstatus: Implementierung und technische Abnahme abgeschlossen; Agentenreview ist keine unabhängige menschliche Fachfreigabe.

## Umfang

Ticket #4 aktiviert ausschließlich `q-ch01-01` an ihrer eingebetteten Stelle in `ch01-l01`. `q-ch01-02` bleibt bis Ticket #5 eine Vorschau. Kanonischer Inhalt, Quellenregister, D0-Labor und die veröffentlichte Migration `001_initial.sql` wurden nicht verändert. M1-Funktionen wie Review-Scheduler, Tutor und weitere Aufgaben sind nicht enthalten.

## Umsetzung

- `GET /v1/lessons/ch01-l01` liefert für q01 nur Frage und Optionen und kennzeichnet sie als `available`. q02 bleibt `in_development`. Richtige Option, Feedback und weitere Lösungsfelder fehlen weiterhin im öffentlichen Lektionspayload.
- `POST /v1/attempts` akzeptiert den strikten Vertrag aus Dokument 08. Pydantic weist Zusatzfelder, falsche Typen, ungültige UUIDs, Werte und überlange Felder mit `422` ab.
- Das Backend löst q01 gegen die validierte kanonische Aufgabenbank auf, bestimmt `objective_result` und `grading_source` selbst und gibt erst nach erfolgreichem SQLite-Commit das Feedback der gewählten Option zurück.
- Migration `002_attempts.sql` speichert UUID, Aufgaben-ID, Inhaltsversion, kanonisches Antwort-JSON, optionale Zuversicht, Modus, Hilfenutzung, UTC-Zeitstempel, Ergebnis, Bewertungsherkunft und Feedback-Snapshot. `BEGIN IMMEDIATE` serialisiert konkurrierende Schreibzugriffe.
- Ein identischer UUID-Replay liefert den gespeicherten Snapshot unverändert. Ein veränderter Replay kollidiert mit `409`. Der Replay wird vor der Prüfung gegen eine spätere aktuelle Inhaltsversion aufgelöst, damit vorhandene Versuche nicht still neu bewertet werden.
- Der Next.js-Proxy erlaubt nur den festen internen API-Pfad. Mutierende Browserrequests benötigen einen erlaubten Loopback-`Host`, die exakt dazugehörige `Origin` und `application/json`; Fremd- oder fehlende Origins ergeben `403`, ein falscher Content-Type `415`, ein Proxy-Body über 8 KiB `413`.
- Die Oberfläche hält Auswahl, Zuversicht und UUID bei einem fehlgeschlagenen oder verloren gegangenen Response. Ein unveränderter Retry nutzt dieselbe UUID. Wird die Eingabe nach unbekanntem Speicherstatus geändert oder nach einem Ergebnis „Erneut versuchen“ gewählt, entsteht beim nächsten Senden eine neue UUID. Antworten stehen weder in URL-Parametern noch in Anwendungslogs.

## Abnahmebefunde

| Kriterium | Befund |
|---|---|
| Eingebettete q01, Lösungsschutz | q01 ist bedienbar; alle drei Optionen stammen aus der Aufgabenbank. Browserprüfung fand die drei Feedbacktexte weder im initialen DOM noch in den geladenen Clientbundles. API-Tests schließen `correct_option`, `feedback_by_option`, Rubrik, Musterantwort und weitere interne Felder aus dem Lektionspayload aus. |
| Dauerhafte serverseitige Bewertung | Alle drei Optionen liefern nach `201 Created` das jeweils kanonische Feedback. UTC-Zeitstempel, Ergebnis und `canonical_single_choice` werden serverseitig gesetzt und gespeichert. |
| Korrigierbare Fehler | Leere Auswahl kann nicht gesendet werden; ungültige API-Antworten ergeben `422`. Bei `503` und bei einem simulierten verlorenen, tatsächlich erfolgreichen Response bleibt die Eingabe sichtbar und es erscheint kein Lösungsfeedback. |
| Idempotenz und Konflikte | Unit-/Integrationstests und ein unabhängiger Lauf mit acht parallelen identischen Proxyrequests lieferten denselben Body und Zeitstempel bei exakt einer SQLite-Zeile. Geänderter Inhalt oder Version unter derselben UUID ergibt `409`. |
| IDs und Freischaltung | q02, q03 und unbekannte IDs werden am Schreibendpunkt mit `404` abgewiesen. Eine neue UUID mit falscher Inhaltsversion ergibt `409`. |
| Proxygrenzen | Fremde und fehlende Origin wurden mit `403`, Text-Content-Type mit `415`, ein vom Client ergänzter `correct`-Wert mit `422` abgewiesen. Die API bleibt ohne Host-Port; veröffentlicht ist nur `127.0.0.1:3000`. |
| Neuversuch und Restart | „Erneut versuchen“ löscht keinen Datenbankeintrag und erzeugt für das nächste Senden eine neue UUID. Nach echtem `docker compose restart api` lieferte der identische Request exakt denselben gespeicherten Body; der isolierte SQLite-Datensatz blieb einmalig. Auch ein anschließendes Container-Recreate verwendete dasselbe Volume. |
| Mobil und Tastatur | Auswahl, Zuversicht, Senden, Feedbackfokus und Neuversuch wurden mit Tastatur geprüft. Bei 390 px sowie bei 200 % Emulation entstand kein horizontaler Überlauf. |

## Ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm.cmd ci` in `apps/web` | erfolgreich, 146 Pakete aus unverändertem Lockfile installiert |
| `uv sync --frozen` in `services/api` | erfolgreich mit ticketlokalem `UV_CACHE_DIR`; das globale Windows-Cacheverzeichnis war für den Sandbox-Benutzer nicht lesbar |
| `uv run pytest` mit einmaligem `--basetemp` und `cache_dir` | 53 bestanden in 5,33 s; zwei bekannte Dependency-Deprecation-Warnungen aus FastAPI/Starlette |
| `npm.cmd run typecheck` | bestanden |
| `npm.cmd run lint` | bestanden |
| `npm.cmd run build` | bestanden; dynamischer `/api/attempts`-Proxy im Produktionsbuild enthalten |
| `npm.cmd run test:browser` gegen Produktions-Compose und installiertes Chrome | 15 bestanden in 12,9 s; die 11 vorhandenen Wege sowie vier Ticket-#4-Wege |
| unabhängiger Proxy-/Restart-Lauf | acht parallele Replays, `409`/`404`/`422`, Host/Origin/JSON und identischer Replay nach echtem API-Restart bestanden; SQLite `COUNT(*)` für die geprüfte UUID war exakt 1 |
| `docker compose -p athena-m0-4 up --build -d` und `ps` | API und Web healthy; API nur `8000/tcp` intern, Web `127.0.0.1:3000->3000/tcp`; eigenes Volume `athena-m0-4_learning_data` |
| Containerlogs | nur Methode, Pfad und Status protokolliert; keine UUID, Auswahl oder Zuversicht im Log |
| `git diff --check` und Schutzbereichsprüfung | sauber; keine Änderungen in `content/`, `research/`, `Design/`, `001_initial.sql`, `package-lock.json` oder `uv.lock` |

`agent-browser` wurde gemäß Skill zuerst versucht, konnte unter Windows wegen des bekannten CDP-Fehlers `CDP response channel closed` aber keine Sitzung starten. Der geforderte reale Browserpfad lief deshalb mit dem im Projekt konfigurierten Playwright 1.63.0 und installiertem Chrome. Die gestartete Agent-Browser-Sitzung wurde anschließend geschlossen.

## Getrenntes Review und Korrekturrunde

Der unabhängige Reviewer bemerkte, dass q01 trotz aktivierter Oberfläche im öffentlichen Lektionspayload zunächst noch als `in_development` markiert war. Die Antwortmodelle und der Manifestaufbau wurden daraufhin so korrigiert, dass q01 `available` und q02 weiterhin `in_development` liefert. API-Gesamttest, Typecheck und Lint liefen nach der Korrektur erneut grün; der Produktions-Compose wurde neu gebaut.

### Standards

Der Reviewer verglich den vollständigen Arbeitsbaum mit
`ec4a63e912181d6451054a521f2cab79918d9c54` und prüfte ihn gegen `AGENTS.md`,
Architektur- und Inhaltsvertrag sowie die drei ADRs. Nach der Korrektur des
Entwicklungsstatus blieben keine offenen Standardsbefunde. Die Änderung bleibt auf
q01, den schmalen Schreibproxy und die notwendige SQLite-Migration begrenzt;
kanonische Inhalte, D0, Lockfiles und `001_initial.sql` sind unverändert.

### Spezifikation

Der anfängliche Statusfehler war ein echter Spezifikationsbefund: Eine bedienbare
Aufgabe wurde im öffentlichen Vertrag weiterhin als in Entwicklung bezeichnet.
Der Recheck des neu gebauten Stacks bestätigte anschließend `available` für q01 und
`in_development` für q02. Frage und Optionen entsprechen der kanonischen
Aufgabenbank; `correct_option`, `feedback_by_option` und die drei q01-Rückmeldungen
fehlen vor dem Versuch sowohl im Lektionspayload als auch im Clientbundle.

Der Reviewer führte die 53 API-Tests mit eigenem `UV_CACHE_DIR`, einmaligem
`--basetemp` und eigenem pytest-Cache aus; alle bestanden mit den zwei bekannten
Upstream-Deprecation-Warnungen. Fünf gezielte Playwright-/Chrome-Prüfungen bestanden:
Lösungsschutz im initialen DOM und Bundle, Tastaturantwort mit Feedbackfokus,
Fehler und identischer Retry, neue UUID nach verlorenem erfolgreichen Response und
geänderter Auswahl sowie Bedienbarkeit bei 390 px, 200-%-Emulation und reduzierter
Bewegung. Ein gesonderter Chrome-Recheck änderte nach einem verloren gegangenen,
serverseitig erfolgreichen Response ausschließlich die Zuversicht und bestätigte
ebenfalls eine neue UUID mit anschließendem Feedback. Ein zusätzlicher echter
Proxyversuch für Option c wurde zweimal mit
derselben UUID gesendet und lieferte bytegleich dieselbe fachlich passende
Rückmeldung, denselben UTC-Zeitstempel und denselben gespeicherten Ergebnis-Snapshot.
Der visuell geprüfte 390-px-Nachherzustand zeigte alle drei Optionen, Zuversicht,
Neuversuch und fokussiertes kanonisches Feedback ohne horizontalen Überlauf oder
abgeschnittene Bedienelemente.
Damit blieben nach der Korrekturrunde keine offenen Spezifikationsbefunde.

## Prüfgrenzen

Die lokale Einzelpersonen-App ist kein manipulationssicheres Prüfungssystem; Repository- und Datenbankzugriff erlauben weiterhin Einsicht in Lösungen. Der Test bewertet Persistenz und Bedienbarkeit, nicht Lernwirksamkeit oder fachliche Expertenfreigabe. Die zwei Deprecation-Warnungen stammen aus der fixierten Test-Toolchain und beeinflussten den Lauf nicht.
