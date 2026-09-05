# ATHENA — Codex-Startauftrag D0: Design Lab

> Ursprünglicher D0-Auftrag, als Herkunft erhalten. Die konsolidierte aktuelle
> [D0-Spezifikation](docs/specs/d0-design-lab.md) enthält auch die später bestätigten
> Gestaltungs- und Reviewentscheidungen. Nachfolgende Dateivorgaben und Verbote
> einzelner Explorationsschritte dokumentieren den damaligen Stand.

## 1. Ziel

Baue im Ordner `Design/` dieses Repositorys einen eigenständig startbaren, lokalen **ATHENA Design Lab**-Server. Der Ordner heißt exakt `Design`, mit großem D; der Paketname darf `athena-design-lab` heißen.

ATHENA steht für **Athletic Training, Health, Exercise & Nutrition Academy**. Es wird eine persönliche, deutschsprachige Lernplattform für Sportwissenschaft, Krafttraining, Ausdauer und Ernährung. Die spätere Anwendung soll Next.js, FastAPI und Docker verwenden. **Jetzt wird nur die Lernerfahrung exploriert.**

Ich möchte echte Seiten lesen, Grafiken betrachten, Aufgaben ausprobieren und Varianten vergleichen können, bevor ich Design, Schreibstil und Bildsprache festlege. Kapitel 1 ist der Pilot; als durchgängige Teststrecke dient zunächst Lektion 1 „Gleiche Aufgabe, andere Reaktion“.

Das Ergebnis ist ein benutzbarer Designprototyp, kein reines Konzeptpapier, kein Bild einer Webseite und noch nicht die fertige Lernplattform.

## 2. Repository zuerst verstehen

Prüfe Arbeitsverzeichnis, Git-Status und bestehende Dateien. Erhalte vorhandene Änderungen. Lies die geltenden `AGENTS.md`-Dateien und finde das Planungspaket; es kann direkt im Repository oder unter `sportwissenschaft-lernstudio/` liegen. Ein vorhandenes Archiv darfst du zur Inspektion sicher und ohne Überschreiben bestehender Dateien entpacken.

Lies aus dem Planungspaket:

- `README.md` und `START_CODEX.md` zur Einordnung des bisherigen Auftrags;
- `docs/01_PRODUCT_BRIEF.md`, `docs/03_CURRICULUM.md`;
- `docs/05_EDITORIAL_STYLE.md`, `docs/06_VISUAL_SYSTEM.md`;
- `docs/10_IMPLEMENTATION_PLAN.md`, `docs/11_PILOT_EVALUATION.md`;
- insbesondere `docs/12_ATHENA_STYLE_DIRECTIONS.md`;
- `content/ch01/00_CHAPTER.md`, `01_LOAD.md`, `05_QUESTIONS.md`, `06_VISUAL_BRIEFS.md`, `07_INTERACTIONS.md`, `08_GLOSSARY.md`;
- die für diesen Ausschnitt relevanten Einträge in `research/SOURCES.md` und `research/CLAIM_MAP.md`.

Die übrigen drei Pilotlektionen nur für Überblick und spätere Erweiterbarkeit sichten; jetzt nicht ebenfalls vollständig umsetzen. `PILOT_LESEFASSUNG.md` ist eine abgeleitete Lesehilfe, nicht die kanonische Textquelle.

**Umfangsklärung:** Der alte Einstieg „nur M0“ wird durch diesen ausdrücklichen Auftrag für D0 zurückgestellt. Insbesondere sind FastAPI, SQLite und zwei Produktcontainer für D0 nicht nötig. Sicherheits- und Inhaltsregeln bleiben gültig. Globale oder sicherheitsbezogene Agenteneinstellungen nicht ändern.

Ergänze im Root-`AGENTS.md` einen kurzen Abschnitt zum aktuell freigegebenen D0 und zum anschließenden Stopppunkt; bestehende Regeln erhalten. Lege außerdem `Design/AGENTS.md` mit den lokalen Laborregeln an und lies diese ausdrücklich, wenn du vom Repositorystamm aus arbeitest. Root-`README.md` darf einen knappen Verweis auf das Labor erhalten. Sonst Änderungen auf `Design/` begrenzen; keine Produktstruktur nebenbei anlegen.

Fehlt das Planungspaket, benenne die fehlenden Dateien. Baue trotzdem die Laborhülle und visuelle Presets, aber markiere den fehlenden Pilotinhalt als blockiert. Erfinde keine vermeintlich bereits recherchierten Texte oder Quellen.

## 3. Technische Grenze

Verwende für das Labor Next.js mit TypeScript und App Router. Nutze den normalen Next.js-Entwicklungsserver, keinen zusätzlichen Express- oder Python-Server. Prüfe kompatible stabile Abhängigkeiten anhand offizieller Dokumentation, dokumentiere die Wahl und sichere sie per Lockfile. Nutze vorhandene Paketmanager-Konventionen; ohne Vorgabe npm. Keine Monorepo-Umstellung nur für das Labor.

Einfacher Start aus dem Repositorystamm:

    cd Design
    npm install
    npm run dev

Das Dev-Script soll lokal an `127.0.0.1` auf Port `3100` binden. Ist der Port belegt, nutze einen dokumentierten Ersatz, ohne fremde Prozesse zu beenden. Ein Scaffold darf wegen des großgeschriebenen Ordners nicht am Paketnamen scheitern: wähle einen gültigen kleingeschriebenen Paketnamen und behalte den Ordner `Design/`.

Keine FastAPI-API, Datenbank, Anmeldung, echten Tutoraufrufe, Bild-API, Trainingsimporte, Lernstandsmaschine oder automatische Kapitelgenerierung. Kein separates Storybook zusätzlich zum Labor. Docker ist für D0 nicht erforderlich; den lokalen Dev-Start nicht zugunsten einer späteren Infrastruktur verzögern.

Einstellungen und Designfeedback dürfen ausschließlich lokal im Browser gespeichert werden. Keine Analyse- oder Trackingdienste, externen Schriftabrufe oder laufzeitabhängigen Cloudressourcen. Systemfonts sind für den Anfang ausreichend. Vorhandene, rechtlich geklärte lokale Schriftdateien dürfen genutzt werden.

## 4. Das Labor

Baue eine neutrale, einklappbare Laborleiste und eine davon klar abgegrenzte Lektionsvorschau. Die Laborleiste darf nicht das spätere Produktdesign vorwegnehmen oder beim Lesen dauernd Platz beanspruchen. Ein Fokusmodus blendet sie aus.

Folgende Bereiche sollen erreichbar sein, als Routen oder einfache Tabs:

**Übersicht / Galerie:** Die zehn Stilrichtungen mit je einer kleinen Vorschau aus echten UI-Elementen: Titel, kurzer Absatz, Merksatz, Grafikfragment, Aufgabenbutton. Nicht bloß Farbfelder oder zehn austauschbare Landingpage-Karten. Jede Richtung zeigt ihren Bearbeitungsstatus.

**Lektionslabor:** Die vollständige Lektion 1 mit ihren beiden Fachvisualisierungen, der vorgesehenen Interaktion und zwei Aufgaben. Umschalter verändern die Darstellung, nicht den zugrunde liegenden Fachinhalt.

**Schreibstile:** Eine begrenzte Passage aus Lektion 1 in mehreren redaktionellen Varianten. Unterschiede sollen am tatsächlichen Text erkennbar sein, nicht nur anhand einer Stilbeschreibung.

**Vergleich und Feedback:** Zwei Varianten derselben Passage vergleichen, Favoriten und begründete Notizen speichern und exportieren. Desktop bei ausreichender Breite nebeneinander; auf schmaleren Ansichten sinnvoller A/B-Wechsel statt zweier unlesbarer Minispalten.

Tutorpositionen höchstens als klar beschrifteten, statischen UI-Mock zeigen. Kein Chat, der Antworten oder Funktionsfähigkeit vortäuscht. Eine solche Vorschau ist keine Voraussetzung für D0.

## 5. Stilrichtungen und erste Auswahl

Alle zehn Richtungen aus der Spezifikation als erweiterbare Presets anlegen:

| ID | Richtung | Gestalterischer Ausgangspunkt |
|---|---|---|
| `marble-library` | Marmorbibliothek | Warmes Elfenbein, dezente Bronze, elegante Kapitelüberschriften, ruhiges digitales Fachbuch |
| `bronze-oracle` | Bronze-Orakel | Dunkler Stein, Bronzedetails, helle Leseflächen bzw. gut lesbarer heller Text, markante Kapitelinszenierung |
| `stoa` | Die Stoa | Reduziert, steinfarben, klare Typografie, beinahe ornamentfrei |
| `star-atlas` | Der Sternatlas | Nachtblau, Messing, Karten- und Navigationsmotive |
| `gymnasion-notebook` | Gymnasion-Notebook | Papier, Graphit, Terrakotta, Randnotizen und annotierte Lehrgrafiken |
| `mosaic-forum` | Mosaikforum | Kalkstein, Indigo, kontrollierte Mosaikakzente, modulare Struktur |
| `heroes-workshop` | Heroenwerkstatt | Sportliche Energie, Stein und Rotbraun, aktivierende Praxisstationen |
| `data-temple` | Tempel der Daten | Helle wissenschaftliche Oberfläche, präzise Diagramme, abstrahierte antike Motive |
| `amphora` | Amphorenillustration | Terrakotta, Schwarz und Creme, flächige Friese bei moderner, ruhiger UI |
| `marblepunk` | Marblepunk Athena | Marmor, Metall, Marineblau, zeitgemäße technische Formensprache |

**Zuerst drei Richtungen sorgfältiger ausarbeiten:**

1. **Marmorbibliothek:** seriöse, ruhige Referenz.
2. **Gymnasion-Notebook:** nahbarer, persönlicher Werkstattcharakter.
3. **Bronze-Orakel:** bewusst dunkler und atmosphärischer Gegenpol.

Diese drei müssen über Farben hinaus in Typografie, Oberflächen, Kapitelkopf, Merksatz und Grafikrahmung unterscheidbar sein. Baue trotzdem keine zehn unabhängigen Anwendungen: gemeinsame Komponenten mit überschaubaren Varianten und Design-Tokens genügen.

Die übrigen sieben Presets dürfen zunächst einfacher sein und müssen sichtbar „Erster Stilentwurf“ heißen. Die ersten drei heißen „Vertiefter Prototyp“, nicht „freigegeben“. Keinen endgültigen Gewinner wählen.

Mythologie ist eine Gestaltungsebene: Eule, Lorbeer, Schild, Säulenrhythmus, Friese, Stein oder Bronze dürfen eingesetzt werden. Keine Romanze aus Historienfilm, keine permanenten Partikel, keine unlesbare Runenschrift und kein Gladiatorenspiel. Fachliche Begriffe und normale Navigation bleiben klar benannt; ein Kapitel wird nicht nur noch „Prüfung des Olymps“ genannt.

## 6. Dimensionen getrennt explorieren

Halte folgende Eigenschaften technisch und redaktionell voneinander trennbar:

- **Visueller Stil:** die zehn Presets.
- **Schreibstimme:** unabhängig vom visuellen Preset.
- **Leseform:** ruhiger Reader versus Workbook mit Merksätzen und Reflexionsbereichen.
- **Bildpräsentation:** reduziert, integriert oder visuell geführt.
- **Mythologieanteil:** keiner, dezent oder markant; verändert nur dekorative Elemente.
- **Lesetypografie:** sinnvolle Ausgangswerte, z. B. 18 px Fließtext, Zeilenhöhe 1,6 und ungefähr 65–75 Zeichen Lesebreite; wenige praktische Anpassungen statt eines riesigen Editors.

Für D0 keine vollständige Kombinationsmatrix redaktionell produzieren. Die ganze Lektion erscheint zunächst ausschließlich im kanonischen Schreibstil. Andere Stimmen nur für die abgegrenzte Vergleichspassage anbieten und das in der UI kenntlich machen.

Bildpräsentation konkret:

- **Reduziert:** kompakte Fachgrafiken, keine Dekoration.
- **Integriert:** die zwei vorgesehenen Fachvisuals an ihren passenden Textstellen.
- **Visuell geführt:** dieselben Kernaussagen in größeren, schrittweise erfassbaren Diagrammabschnitten; keine neuen Behauptungen und keine zusätzlichen Bilder ohne Erklärungsaufgabe.

Die beiden Pflichtvisuals bleiben in allen Varianten inhaltlich verfügbar. Leserichtung und didaktische Reihenfolge müssen auch bei anderer Anordnung nachvollziehbar bleiben. Ein dekoratives Hero-Bild darf unabhängig davon später hinzukommen.

## 7. Schreibstilproben

Nimm den Abschnitt „Aufgabe und Reaktion“ als gemeinsamen Ausgangspunkt. Erstelle vier separat gespeicherte Proben von ungefähr 150–220 Wörtern; die Ausgangslänge ist eine Arbeitsvorgabe, keine Lernregel:

1. **Klar-sachlich:** verständliches, präzises Fachbuch.
2. **Trainingspartner:** direkte Du-Ansprache, praktische Brücke zum Gym oder Laufen.
3. **Fragend-sokratisch:** wenige gezielte Fragen mit anschließend zugänglicher Erklärung, kein Fragenfeuerwerk.
4. **Trocken-humorvoll:** dosierter Humor ohne Verlust von Fachlichkeit oder Respekt.

Alle Proben müssen dieselben Kernaussagen bewahren: dokumentierte Aufgabe und innere Reaktion unterscheiden; gleiche Distanz und Dauer erfassen nicht sämtliche Bedingungen; daraus folgen weder eine bewiesene Ursache noch eine bestimmte langfristige Anpassung. Quellenmarker exakt den unterstützten Aussagen zuordnen. Keine neuen Trainingsregeln oder vermeintlich historischen Lehrmeinungen ergänzen.

Die Proben sind **redaktionelle Designentwürfe**, nicht freigegebener Ersatz für die Lektion. Speichere Quellpfad, Quellversion bzw. Hash, Varianten-ID und Status. Die kanonischen Markdown-Dateien nicht verändern, keine Proben als Fließtext direkt in React-Komponenten verstecken. Keine externen LLM-Aufrufe zur Laufzeit.

Eine mythisch-erzählende Stimme und weitere Textlängen als nächste mögliche Exploration dokumentieren, aber nicht schon sämtliche Kombinationen schreiben.

## 8. Pilotinhalt und Grafiken

Verwende die Originalquelle `content/ch01/01_LOAD.md` vollständig, einschließlich Quellenzuordnung und Entwurfskennzeichnung. Lade Markdown als Daten; führe kein fremdes MDX oder eingebettetes HTML/JavaScript aus. Nutze eine feste Zuordnung der vorhandenen Grafik-, Aufgaben- und Interaktionsmarker zu Komponenten.

Entweder lies die freigegebenen Dateien aus einem fest konfigurierten Planungspfad oder erzeuge eine nachvollziehbare Design-Fixture mit Synchronisationsskript, Herkunft und Hash. Keine unmarkierten, auseinanderlaufenden Kopien. Kein generischer Dateileser mit vom Browser vorgegebenen Pfaden.

Setze nach den vorhandenen Briefings um:

- `fig-ch01-load`;
- `fig-ch01-two-runs` einschließlich `int-ch01-load`;
- `q-ch01-01` und `q-ch01-02`, jeweils Antwortversuch vor Lösungsanzeige.

Aufgabenfeedback ist deterministisch. Freitext nur mit Musterlösung und Kriterien zur Selbstbewertung, ohne erfundene automatische Benotung. Keine dauerhafte Lernstatistik aus Laborversuchen ableiten.

Fachgrafiken als überprüfbare SVG-/HTML-/React-Darstellungen mit echten Beschriftungen umsetzen. Keine erfundenen Zahlen, Pulsdaten, anatomischen Details oder Trainingsbereitschafts-Scores. Vor dem Aufdecken dürfen die verborgenen Interaktionsinformationen auch in Alttexten und zugänglichen Beschriftungen nicht vorweggenommen werden.

Keine kostenpflichtige Bildgenerierung. Für spätere Bildproduktion je vertieftem Stil ein kurzes Briefing erstellen: Motiv, Bildaufgabe, Seitenverhältnis, Stil, Negativvorgaben und vorgesehener Platz. Noch nicht vorhandene Bilder nicht als fertig ausgeben und keine defekten Bildlinks einbauen. Ein ausdrücklich provisorisches geometrisches Ornament ist erlaubt. Fachliche Darstellung und Dekoration bleiben getrennte Komponenten.

## 9. Zustand, Vergleich und Feedback

Verwende ein kleines serialisierbares Konfigurationsobjekt für Stil, Layout, Bildpräsentation, Mythologie und Typografie; bei Schreibproben zusätzlich eine Varianten-ID. Keine große neue Konfigurationsplattform bauen.

Verwende pro Vorschau einen eigenen Theme-Container mit CSS-Variablen. Verglichenen Panels dürfen sich weder CSS noch Formular-IDs oder Interaktionszustände gegenseitig überschreiben. Auch ein gegebenenfalls geöffnetes Quellenpanel muss zum richtigen Vorschau-Container gehören.

Konfigurationen und Vergleichspaare sollen sich über validierte URL-Parameter wieder aufrufen lassen. Nur Darstellungsparameter in die URL schreiben, keine Antworten oder persönlichen Notizen. Ungültige Werte auf nachvollziehbare Defaults zurücksetzen. Beim Reload dieselbe Ansicht herstellen; bei normalem Stilwechsel Antworten und Leseposition möglichst erhalten. Im Vergleich A und B unabhängige Antwortzustände verwenden.

Feedback ausdrücklich als **persönliche Designbewertung** speichern, nicht als Lernerfolgsnachweis. Wenige Bewertungen von 1–5 genügen: Lesekomfort, visuelle Klarheit, fachliche Wirkung, Bildnutzen und Lust weiterzulernen. Dazu freie Notizen: „behalten“, „stört“, „als Nächstes testen“.

Persistenz unter einem versionierten `athena-design-lab`-Namensraum in localStorage; Browserlöschung und Speicherfehler berücksichtigen. Einträge enthalten Konfiguration, Passage/Lektion, Inhaltsversion, Zeitpunkt und Notiz. Keine vorgefüllten angeblichen Nutzerbewertungen. Export per Browserdownload als JSON und lesbarem Markdown sowie gezieltes Zurücksetzen anbieten; nicht die gesamte localStorage fremder Anwendungen leeren. Export und Import müssen nicht zugleich gebaut werden: Import gehört nicht zu D0.

## 10. Empfohlene Explorationsrunden

Baue leicht auffindbare Einstiege für diese Reihenfolge:

**Runde A — Atmosphäre:** Gleiche vollständige Lektion, gleiche Inhalte und gleiche Bildpräsentation in Marmorbibliothek, Gymnasion-Notebook und Bronze-Orakel. Frage: „Wo möchte ich wirklich weiterlesen?“

**Runde B — Stimme:** Einen visuellen Favoriten beibehalten; die vier kurzen Schreibproben vergleichen. Frage: „Welche Erklärung ist verständlich, angenehm und weder trocken noch albern?“

**Runde C — Bilder und Lesen:** Den Schreibstil festhalten; erst die Bildpräsentation, anschließend Reader/Workbook vergleichen. Frage: „Welche Grafik hilft bei einer konkreten Unklarheit und welche Gestaltung lenkt nur ab?“

Nicht sämtliche Eigenschaften gleichzeitig verändern. Das ist eine persönliche Designerkundung, keine kontrollierte Studie. Wiederholtes Lesen desselben Inhalts und Reihenfolgeeffekte nicht als Beweis besserer Lernwirksamkeit behandeln. Keine automatische Gewinnerberechnung und keine endgültige Freigabe durch Codex.

## 11. Umsetzung, Prüfung und Stopppunkt

Arbeite in kleinen Schritten: Bestand prüfen → knappen Plan in `Design/PLAN.md` schreiben → startbare Hülle → vollständige Pilotstrecke → drei vertiefte Stile → weitere Presets und Schreibproben → Vergleich/Feedback → Tests. Beginne die Umsetzung nach dem kurzen Plan ohne zusätzliche Designfreigabe. Fehlende Werkzeuge oder Quellen offen ausweisen, aber sichere, reversible Teilschritte nicht blockieren.

Nutze die verfügbaren und freigegebenen Browser-/Screenshot-Werkzeuge zur visuellen Prüfung. Prüfe tatsächlich, soweit ausführbar:

- Start, Typecheck, Lint und Build;
- alle zehn Presets; die drei vertieften am vollständigen Pilot;
- Stilwechsel, Fokusmodus, Vergleich und reproduzierbare URL;
- Interaktion: Antwort vor Aufdecken, alle Rückmeldungen, Reset und Tastaturbedienung;
- Aufgaben, Quellenanzeige und sichtbare Entwurfs-/Mockkennzeichnungen;
- Feedback nach Reload, JSON-/Markdown-Export und gezielten Reset;
- 390 px und Desktop, 200 % Zoom, sichtbaren Fokus, sinnvolle Kontraste und reduzierte Bewegung;
- keine versehentlichen Cloud-/Modellanfragen, kein Informationsverlust durch Farbe und keine Fachtextänderungen im Original.

Browserzustand erst clientseitig lesen, ohne Hydrationfehler oder Überschreiben gespeicherter Werte durch Initialdefaults. Bei Fehlern im lokalen Speicher weiter benutzbar bleiben. Dokumentiere getestete und ungetestete Wege getrennt; kein pauschales „alles erfolgreich“ ohne Ausführung.

Lege mindestens `Design/README.md`, `Design/AGENTS.md`, `Design/PLAN.md`, `Design/EXPLORATION_GUIDE.md`, `Design/DECISIONS.md` und die drei Bildbriefings an. In `DECISIONS.md` gilt für die Gestaltung zunächst „offen“; technische Zwischenentscheidungen dürfen begründet festgehalten werden.

Berichte abschließend Startbefehl und lokale Adresse, vorhandene Ansichten, echte Varianten gegenüber Platzhaltern, Tests und Blocker sowie den Einstieg in Runde A. Prüfe den Server in dieser Sitzung, soweit möglich; behaupte nicht, er laufe auf meinem Rechner weiter, wenn das nicht zutrifft. Hinterlasse den reproduzierbaren Startbefehl. Keine Commits, Pushes oder Deployments ohne weiteren Auftrag.

**Stoppe nach D0. Noch kein M0, kein FastAPI-Backend, kein ganzes Curriculum und keine automatische Festlegung auf einen Design- oder Schreibstil.**

---

## Technische Referenzen zur Gegenprüfung

Offizielle Dokumentation, geprüft am 5. September 2026. Die konkreten installierten Versionen bei der Umsetzung erneut bestimmen. Diese Referenzen belegen Werkzeugkonfiguration, nicht die Wirksamkeit der entworfenen Lernoberfläche.

- Codex-Projektanweisungen: `https://developers.openai.com/codex/guides/agents-md` (Weiterleitung auf die offizielle ChatGPT-Learn-Dokumentation).
- Next.js-Installation/App Router: `https://nextjs.org/docs/app/getting-started/installation`.
- Next.js-CLI, Entwicklungsserver, Host und Port: `https://nextjs.org/docs/app/api-reference/cli/next`.
