# 10 — Stufenweiser Bauplan

## Aktueller Ausbau und historische Meilensteine

M0 ist umgesetzt und das kompakte Pilotlayout wurde mit PR #11 freigegeben.
Seit dem 8. September 2026 gilt der [bestätigte Ausbauplan](plans/content-expansion.md):
zuerst Lektionen 2/3, danach Kapitel 1 in insgesamt acht kurzen Einheiten
abschließen. Kurze Abruffragen und Kapiteltransfer gehören dazu; Scheduler und
Tutor sind keine Voraussetzung für weitere Inhalte. Die nachfolgenden M0–M3-
Abschnitte dokumentieren die historische Planung. Ihre Paketgrößen und feste
Abfolge werden durch den aktuellen Ausbauplan ersetzt.

Das vorhandene Labor folgt der [D0-Spezifikation](specs/d0-design-lab.md).
Für die eigentliche App wurden [M0-Tickets #1–#7](https://github.com/interias/ATHENA/issues/1)
mit Abnahmekriterien und nativen Abhängigkeiten erstellt. Bei beauftragter
Abarbeitung sind diese Tickets maßgeblich; die historische Aufteilung unten
dient als Hintergrund. Die bestätigte lebhafte Marmorbibliothek wird übernommen.

## Reihenfolge nach D0

M0: Stil und erste Lernerfahrung → M1: vollständiges Pilotkapitel und Wiederholung → M2: Tutor → M3: weitere Kapitel einzeln.

Die Ticketplanung implementiert M0 noch nicht. M1–M3 benötigen weiterhin einen
gesonderten Folgeauftrag. Weiterführende Spezifikationen dienen dazu, Sackgassen
zu vermeiden, nicht dazu, alles sofort zu bauen. Keine Zeitschätzung für die
Softwareentwicklung aus dieser Planung ableiten.

## M0 — Eine Lektion wirklich erleben

### Arbeitsaufträge

M0-01: Repositorystruktur, stabile Abhängigkeiten und Lockfiles; zwei Container; nur Web-Port lokal binden. Kleine Start- und Fehlerseite.

M0-02: Contentloader mit ID-/Referenzprüfung; L1 aus Markdown rendern; Quellenmarker auflösen; Entwurfsstatus zeigen. Keine Textkopien in React.

M0-03: `fig-ch01-load` und `fig-ch01-two-runs` inklusive `int-ch01-load` nach Briefing als SVG/React umsetzen. Keine generative Bild-API.

M0-04: q-ch01-01 und q-ch01-02; Antwort vor Lösung; Zuversicht; erklärendes Feedback; Freitext-Selbstbewertung. Lesestatus und Feedback in SQLite speichern.

M0-05: responsive Darstellung, Tastaturbedienung, Quellenpanel, leere-/Fehlerzustände und Startdokumentation. Pilotfeedback am Ende anbieten.

### Abnahmekriterien

- Frischer Start über dokumentierten Compose-Befehl; Seiten und Quelleninformationen funktionieren ohne API-Key.
- L1 ist vollständig, in der vorgesehenen Reihenfolge und ohne fachliche Umformulierungen vorhanden.
- Zwei Fachvisuals funktionieren auch ohne Farbe/Animation; die Interaktion verrät vor dem Aufdecken keine Lösung.
- Antwort, Rückmeldung, „gelesen“ und Feedback funktionieren; Persistenz über Containerneustart nachgewiesen.
- Browserpfad bei 390 px und Desktop geprüft, keine horizontale Pflichtnavigation; Tastaturpfad vollständig.
- Contentprüfung, Backendtests, Typecheck und Browser-Smoke-Test tatsächlich ausgeführt oder fehlende Ausführbarkeit ausdrücklich berichtet.
- Kein Cloudrequest im normalen Lernpfad. Kein API-Port am Host. Keine Secrets im Clientbundle.

### Stopppunkt

Stefan beurteilt den Pilot. Schreibstil und Layout werden gegebenenfalls überarbeitet. Noch keine weiteren Lektionen oder Kapitel ausrollen. Der erste Rückblick prüft Bedienung und Verständlichkeit, nicht bereits langfristige Erinnerung.

## M1 — Das ganze erste Kapitel

Nach expliziter Freigabe die drei übrigen Lektionen, alle sechs Visuals, zwölf Kernaufgaben, acht Reviewkarten und zwei Transferfälle integrieren. `int-ch01-performance` ergänzen. Review-Scheduler, getrennte Fortschrittsanzeigen, Datenexport und getestetes Backup/Restore bauen.

Alle Musterantworten aus der Aufgabenbank übernehmen, nicht frei generieren. Persönliche Trainingsdaten weiterhin unnötig. Die Kapitelübersicht darf andere Kapitel als geplant anzeigen, ohne leere Contentseiten zu versprechen.

### Abnahmekriterien

Alle sechs Lernziele werden mit Aufgaben abgedeckt. Review-Sonderfälle aus Dokument 04 bestehen. Inhaltsversionen bleiben in Versuchen nachvollziehbar. Neues Lernmaterial verändert alte Ergebnisse nicht still. Neuer Fall lässt sich ohne LLM bearbeiten. Offline-Laufzeit bleibt erhalten.

### Stopppunkt

Inhalt und Bilder anhand der Pilot-Auswertung kalibrieren. Redaktionelle Annahme getrennt von fachlicher Expertenprüfung dokumentieren. Die Stilversion nach Freigabe auf 1.0 setzen, nicht schon jetzt.

## M2 — Kontextbezogener Tutor

Mockadapter und optionalen Anbieteradapter bauen, Opt-in und Kostenlimit, Abschnittsauswahl, Quellen-ID-Prüfung und transparente Sendevorschau. Statische, redaktionell kontrollierte Inhalte bleiben maßgeblich. Zunächst keine Websuche, Tools oder Vektordatenbank.

### Abnahmekriterien

Alle Testprompts aus Dokument 09 bewerten; fehlende Quellen führen nicht zu erfundenen Belegen; Hinweise werden als Hilfe markiert; normale Lernerfahrung überlebt Timeout, ungültige Antwort und Budgetstopp. Schlüssel und Chattext erscheinen nicht in Logs.

## M3 — Kapitelweise erweitern

Pro Kapitel derselbe Zyklus: konkrete Lernziele → aktuelle Quellenprüfung → Aussagenkarte → Text → Visuals → Aufgaben → Contentvalidierung → fachliche/gestalterische Prüfung → Nutzung → verzögerter Transfer.

Nicht alle restlichen Kapitel in einem einzigen LLM-Lauf generieren. Kapitel 2 und 3 benötigen eine stärkere Prüfung von Anatomie und Biomechanik; Ernährungs- und Sicherheitskapitel besondere Prüfung ihrer Grenzen.

## Späteres Backlog — nicht automatisch bauen

Volltextsuche im eigenen Content; lokaler Modelladapter; Audioerklärungen; alternative Darstellungstiefe; explizites Mapping auf einen ausgewählten Lizenzanbieter; abgesicherter Zugriff vom Smartphone; optionaler Anki-Export. Erst eine reale Nutzungslücke rechtfertigt den jeweiligen Aufwand.

## Definition of Done für jeden Meilenstein

Funktion implementiert, dokumentiert und geprüft. Keine unbekannten Quellen oder defekten Referenzen. Inhalt und Version nachvollziehbar. Datenschutz- und Sicherheitsgrenzen eingehalten. Abnahmebericht nennt konkrete Tests, nicht pauschal „alles funktioniert“.
