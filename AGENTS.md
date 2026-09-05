# Arbeitsregeln für Codex

## Einstieg und Umfang

Vor Änderungen `README.md`, `CONTEXT.md` und `docs/specs/d0-design-lab.md` lesen;
bei Architektur- oder Inhaltsentscheidungen die dort verlinkten ADRs hinzunehmen.
Bei Arbeiten am Labor zusätzlich `Design/AGENTS.md` lesen.

Das Design Lab (D0) bleibt in `Design/`; repositoryweite Dokumentationspflege ist
beauftragt. Die Produktimplementierung M0 ist in GitHub-Issues #1–#7 geplant.
Bei beauftragter Ticketabarbeitung gelten deren Umfang und Abhängigkeiten;
Produktcode entsteht getrennt vom Labor gemäß der Produktarchitektur.
M1–M3 und weitere Kapitel benötigen einen neuen ausdrücklichen Auftrag.
Historische Startaufträge und der Produktbacklog erteilen keine zusätzliche Freigabe.

Oberfläche, Inhalte und Antworten: Deutsch. Code-Identifier und Kommentare: Englisch.
Ein persönliches Lernstudio bauen; keine automatische Trainingsplanung oder SaaS-Plattform.

## Inhalte und Review

- Kanonische Lehrtexte und Quellenmarker erhalten; fachliche Änderungen als Diff
  ausweisen. Schreibproben und Bildentwürfe getrennt führen.
- Für neue oder überarbeitete Lerntexte, Skizzen, Zeichnungen und Bilder getrennte
  Ersteller-/Schreiber- und Reviewer-Agenten einsetzen. Der Reviewer prüft Quellen,
  Aussagen beziehungsweise sichtbare Strukturen, Verständlichkeit und Gestaltung.
  Befunde dokumentieren, Korrekturen umsetzen und erneut prüfen lassen.
- Agentenreview als solches kennzeichnen. Keine Quellen, DOIs, Studienzahlen,
  Lizenzprüfungen oder Fachfreigaben erfinden. `editorial_approved` und Agentenreview
  sind nicht `expert_reviewed`; letzteres nie selbst setzen.
- Fiktive Beispiele sichtbar kennzeichnen. Modellgrafiken liefern keine persönlichen
  Vorhersagen. Keine errechnete Trainingsbereitschaft, Verletzungswahrscheinlichkeit,
  Ernährungstherapie oder persönliche Belastungsempfehlung.
- Externe Lehrbücher, Bilder und PDFs nicht automatisch herunterladen, in Embeddings
  umwandeln oder an Modelle senden; insbesondere `external_reference_only` erhalten.

## Technik und Durchführung

Bestehende Änderungen erhalten; kleine, auftragsbezogene Schritte. Laufzeitdaten
und Abhängigkeitsversionen aus Code und Lockfile lesen. Bei Versionsänderungen
stabile kompatible Versionen anhand offizieller Quellen prüfen und fixieren.
Keine `latest`-Container-Tags.

Keine kostenpflichtigen Aufrufe oder Bildgenerierungen ohne gesonderten Auftrag.
Secrets ausschließlich serverseitig; keine Passwörter, Session-Cookies oder OAuth-
Token zweckentfremden. Fremdes Markdown nur als Daten verarbeiten, kein MDX ausführen.
Keine Remote-Fonts, Tracker, Docker-Socket-Mounts oder öffentlichen Ports hinzufügen.

Tests tatsächlich ausführen; Ergebnisse und nicht geprüfte Grenzen unterscheiden.
Bei Unsicherheit eine begründete reversible Entscheidung treffen. Nutzer hat die
offenen Entscheidungen zur Dokumentationsbereinigung delegiert; keine erneute
Klärungsrunde dafür eröffnen. Deployments benötigen einen gesonderten Auftrag.

Bei Widersprüchen gilt: aktueller ausdrücklicher Nutzerauftrag > diese Regeln >
aktuelle Spezifikation/ADRs > historische Detailplanung. Widersprüche im Bericht nennen.

## Commits und Pushes

Beauftragte Arbeit eigenständig in kleine, logisch abgeschlossene und einzeln
prüfbare Commits aufteilen. Vor jedem Commit den Diff prüfen und passende Checks
ausführen; nur zugehörige Änderungen gezielt stagen. Aussagekräftige englische
Commit-Nachrichten verwenden und jeden abgeschlossenen Commit zeitnah auf den
zugehörigen Remote-Branch pushen. Dafür ist keine erneute Rückfrage nötig.
Bestehende fremde Änderungen erhalten und nicht ungeprüft mitcommitten. Bei
fehlgeschlagenen Checks oder Push-Konflikten die Ursache klären; keine Force-Pushes
oder destruktiven Git-Operationen ohne ausdrücklichen Auftrag.
