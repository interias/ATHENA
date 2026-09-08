# Agentenreview: L2/L3-Laufzeit und Code

Stand: 8. September 2026. Geprüfter Vergleichspunkt:
`89fe87591aa052391c9c1edac2d2a4f2bbfb8ff5`. Gegenstand sind die Änderungen
in `services/api` und `apps/web` für das bestätigte L2/L3-Paket. Dieses
Agentenreview ist keine unabhängige Fachfreigabe.

## Ergebnis

Keine offenen Befunde. Zwei Publikationsgate-Randfälle und ein falscher
Breadcrumb-Fallback wurden während des Reviews behoben und erneut geprüft.

## Standards-Review

- Kanonisches Markdown bleibt serverseitig validiertes Datenformat. Rohes HTML,
  unbekannte Komponenten und unsichere Inhaltsreferenzen blockieren Readiness;
  React rendert nur strukturierte Blocktypen und Textknoten.
- Dynamische Lektions- und Fortschrittspfade akzeptieren nur explizit
  veröffentlichte IDs. Der mutierende Proxy behält feste Upstream-Adresse,
  Methodenpfad, JSON- und Größenprüfung sowie die lokale Host-/Origin-Prüfung.
- Aufzählungen werden als `ordered_list` bis zum semantischen `<ol>` erhalten.
  `Vertiefung:` und `Kurzabruf:` werden als native, initial geschlossene
  `<details>` ausgegeben.
- Die Lösungsschlüssel der Aufgaben fehlen im Lektionsvertrag. Feedback,
  Musterantwort und Rubrik werden erst als Antwort auf einen gespeicherten
  Versuch geliefert.

## Spezifikations-Review

- Nur `ch01-l01`, `ch01-l02` und `ch01-l05` sind veröffentlicht. `ch01-l03`
  und `ch01-l04` bleiben in Oberfläche, Webroute und API gesperrt.
- Identität und Anzeigeordnung bleiben getrennt: `ch01-l05` trägt die validierte
  Ordnung 3. Diese Ordnung gehört nun zum Lektionsvertrag und bleibt auch bei
  einem isolierten Ausfall der optionalen Curriculum-Navigation korrekt.
- Lernstand und Versuche sind an die jeweilige Lektions-/Aufgabenversion
  gebunden. Der Regressionstest hebt nur L2 auf `0.3.1` und bestätigt, dass
  L1-Lesestatus `0.2.0`, L1-Versuch und L1-Pilotfeedback erhalten bleiben.
- Beide neuen Lektionen liefern genau ihre veröffentlichte Hauptaufgabe, eine
  semantische Dreierschrittliste und je eine lokale Szenenillustration. Die
  Browserfälle prüfen den L2-Auswahlversuch, den L3-Freitext mit
  Selbstbewertung sowie einen gespeicherten Lesestatus bei geschlossener
  Vertiefung.

## Im Review behobene Befunde

1. **Mittel – falsche Lektionsnummer bei Teilfehler.** Bei einem isolierten
   Curriculum-Ausfall fiel jede Lektion im Breadcrumb auf „Lektion 01“ zurück.
   Der API-Vertrag liefert jetzt die validierte Ordnung der Lektion; ein
   L3-Regressionstest deckt den Teilfehler ab.
2. **Mittel – unvollständiges Grafik-Publikationsgate.** Eine registrierte Grafik
   konnte deklariert, aber weder direkt noch über eine veröffentlichte
   Interaktion verwendet sein. Die Validierung verlangt jetzt exakt die
   Vereinigung aus direkten Grafikblöcken und Grafikabhängigkeiten der
   veröffentlichten Interaktionen; ein negativer Test schützt das Gate.
3. **Hoch – nicht gerenderter veröffentlichter Aufgabentyp.** Eine veröffentlichte
   Matching-Aufgabe konnte den Loader passieren und wurde vom Lektionsvertrag
   still ausgelassen. Veröffentlichte Typen außerhalb `single_choice` und
   `free_text` blockieren jetzt Readiness. Der negative Test bestätigt zugleich,
   dass geplante Matching-Aufgaben gültig bleiben.

## Prüfungen

Eigenständig nach den Korrekturen ausgeführt:

- `services\\api\\.venv\\Scripts\\python.exe -m pytest services/api/tests/test_published_lessons_api.py services/api/tests/test_content.py services/api/tests/test_lesson_api.py services/api/tests/test_progress_api.py -q`: 32 Tests bestanden; zwei Deprecation-Warnungen aus Starlette/FastAPI-TestClient-Abhängigkeiten.
- `services\\api\\.venv\\Scripts\\python.exe -m pytest services/api/tests -q`: 85 Tests bestanden; dieselben zwei Deprecation-Warnungen.
- `npm.cmd run typecheck`: bestanden.
- `npm.cmd run lint`: bestanden.
- `npm.cmd run build`: Produktionsbuild bestanden; alle dynamischen API- und
  Lektionsrouten wurden erfolgreich erzeugt.
- `git diff --check 89fe875 -- services/api apps/web`: bestanden.

Vom Implementierer auf einer frischen Datenbank und über den lokalen Testproxy
ausgeführt und vom Reviewer anhand der finalen Testspezifikation nachgeprüft:

- `ATHENA_WEB_URL=http://127.0.0.1:3000`,
  `ATHENA_TEST_PROXY_SERVER=http://127.0.0.1:3218`,
  `npm.cmd run test:browser`: 36 Tests in 1,0 Minuten bestanden.
- Der enthaltene echte Chrome-200-Prozent-Zoomtest durchläuft L1, L2 und L3 und
  misst Responsive-Navigation, Details-Sichtbarkeit, horizontalen Überlauf sowie
  Begrenzungsverletzungen im Reader.

Die manuelle Screenshotprüfung liegt getrennt bei Root; dieses Review übernimmt
daraus keine unbestätigten Testresultate.

## Grenzen

Kein Deployment, keine Änderung bestehender Docker-Lernstände und kein
Mehrnutzer- oder LAN-Betrieb geprüft. Die Prüfung betrifft den lokalen
Einpersonen-Piloten und den oben genannten Diff; Inhalts- und Bildreviews sind
getrennt dokumentiert.
