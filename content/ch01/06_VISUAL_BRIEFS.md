# Bildbriefings — Kapitel 1

**Sechs fachliche Visualisierungen, davon zwei interaktiv, plus eine optionale Szenenillustration. Keine Bilddatei wurde mit diesem Paket erzeugt.** Die Interaktionen besitzen jeweils eine dieser sechs Grafiken; sie werden nicht zusätzlich als weitere Pflichtbilder gezählt.

## Produktionsregeln

Der überarbeitete M0-Pilot verwendet ausschließlich die grafische Darstellung von `int-ch01-load`. `fig-ch01-load` bleibt als unzugeordnetes historisches Briefing erhalten. M1 ergänzt die übrigen vier Fachvisualisierungen. Die optionale Szene erfordert einen gesonderten Produktionsauftrag; nicht automatisch einen kostenpflichtigen Bilderdienst aufrufen.

Fachgrafiken als eigenständig erstellte SVG/HTML-Komponenten umsetzen. Beschriftungen sind echter Text. Ein Link zu einer Publikation gibt keine Erlaubnis, deren Abbildung zu kopieren. Die hier beschriebenen eigenen Grafiken visualisieren selbst formulierte Konzepte; Rechte und Herkunft dennoch dokumentieren.

Für die Szene kommt nach expliziter Freigabe `gpt-image-2` infrage, soweit der dann verwendete Zugang das Modell anbietet. Modell, übermittelten Prompt, Datum, Nachbearbeitung und Herkunft im Assetmanifest eintragen. Keine medizinische oder anatomische Richtigkeit aus dem Aussehen ableiten. [S17]

`asset_path: null` bedeutet eine **geplante** Grafik, nicht eine fehlende bereits veröffentlichte Datei. Der Contentloader darf geplante Briefings validieren; eine freigeschaltete Lektion muss aber ihre benötigten Renderer tatsächlich besitzen. Für eine SVG-Komponente ist eine Datei nicht zwingend nötig: In diesem Fall bindet die Renderer-Registry die stabile ID an die geprüfte Komponente. Keine kaputten Bildlinks anzeigen.

Eine Bildunterschrift nennt „Schema“, „Fiktives Beispiel“ beziehungsweise „Illustration“ und bietet bei Fachgrafiken die zugeordneten Quellen an. Allgemeine Layoutwerte, Farbwahl und Abstände stehen in Dokument 06. Breite und Lesbarkeit vor Dekoration optimieren.

## Kanonisches Manifest

Die ausführliche Produktionsbeschreibung kann Antworten enthalten. Vor dem Aufdecken darf die Benutzeroberfläche jedoch nur die zum aktuellen Zustand passende Kurz- und Langbeschreibung bereitstellen. Der vollständige Produktionsdatensatz ist kein ungefilterter Screenreadertext.

```yaml
schema_version: '1.0'
chapter_id: ch01
figures:
- id: fig-ch01-load
  lesson_ids: []
  render_kind: svg
  interaction_id: null
  status: planned
  required_in: null
  source_ids:
  - S05
  - S06
  asset_path: null
  learning_purpose: Aufgabe, individuelle Reaktion und Kontext als verschiedene Ebenen unterscheiden.
  alt_text: Die absolvierte Aufgabe und die individuelle Reaktion sind unterschiedliche Informationen.
  long_description: 'Links steht die äußere Aufgabe mit den Beispielen Strecke, Dauer, Last und Wiederholungen.
    Rechts steht die innere Reaktion mit den Beispielen Anstrengungserleben und Herzfrequenz. Ein beschrifteter
    Verbindungspfeil bedeutet: Reaktion auf die Aufgabe. Eine eigene Kontextzeile zeigt, dass Bedingungen bei
    der Interpretation mitgedacht werden. Die Grafik behauptet keine eindeutige Ursache und zeigt keinen berechneten
    Trainingseffekt.'
  composition: Zwei ruhige Karten nebeneinander, auf kleinen Displays untereinander. Aufgabenkarte mit Weg-
    und Hantelsymbol, Reaktionskarte mit Text und Herzsymbol. Kontext als eigener, deutlich beschrifteter Bereich.
  exact_labels:
  - Äußere Aufgabe
  - Innere Reaktion
  - Kontext mitdenken
  - Strecke · Dauer · Last · Wiederholungen
  - Anstrengungserleben · Herzfrequenz
  avoid:
  - Keine Pfeilkette Anstrengung → Muskelwachstum.
  - Keine Größe oder Farbe als quantitative Effektstärke ausgeben.
  - Herzsymbol nicht als EKG-Messung oder Gesundheitsdiagnose darstellen.
  expert_review: null
- id: fig-ch01-two-runs
  lesson_ids:
  - ch01-l01
  render_kind: interactive_svg_html
  interaction_id: int-ch01-load
  status: planned
  required_in: M0
  source_ids:
  - S05
  - S06
  asset_path: null
  learning_purpose: Gleiche protokollierte Aufgabenmerkmale garantieren keine gleiche innere Reaktion.
  alt_text: Zwei fiktive Läufe mit je zehn Kilometern in einer Stunde; die Reaktionen werden erst nach deiner
    Einschätzung gezeigt.
  long_description: 'Zustand vor dem Aufdecken: Lauf A und Lauf B zeigen jeweils zehn Kilometer, sechzig Minuten
    und eine gleich beschriebene flache Strecke. Angaben zur Reaktion sind noch nicht verfügbar. Zustand nach
    dem Aufdecken: A wurde als angenehm erlebt, B als deutlich anstrengender. Die Ursache bleibt offen. Keine
    vollständige Gleichheit aller äußeren Bedingungen behaupten.'
  composition: Zwei gleich große Laufkarten mit einfacher Streckensilhouette. Das Verbergen und Aufdecken betrifft
    Text, zugängliche Beschreibung und sichtbare Grafik gemeinsam.
  exact_labels:
  - Fiktives Beispiel
  - Lauf A
  - Lauf B
  - 10 km
  - 60 min
  - Reaktion noch nicht gezeigt
  - Angenehm erlebt
  - Deutlich anstrengender erlebt
  - Ursache offen
  avoid:
  - Keine versteckte Lösung in alt-Text, title, aria-label oder unsichtbarem Livebereich.
  - Keine erfundenen Pulsdaten.
  - Keine numerische Anstrengungsskala als validiertes Messinstrument ausgeben.
  expert_review: null
- id: fig-ch01-adaptation
  lesson_ids:
  - ch01-l02
  render_kind: svg
  interaction_id: null
  status: planned
  required_in: M1
  source_ids:
  - S04
  - S32
  asset_path: null
  learning_purpose: Ziel, passende Aufgabe und aussagekräftige Beobachtung miteinander verbinden.
  alt_text: Ein Trainingsziel bestimmt, welche Aufgabe und welche Beobachtung dazu passen.
  long_description: 'Drei beschriftete Felder zeigen Ziel, passende Aufgabe und Beobachtung. Darunter stehen
    zwei getrennte Beispiele: Wiederholungsleistung bei einer festgelegten Aufgabe und Muskelwachstum als anderes
    Ziel. Ein besserer Krafttest wird nicht als direkte Messung von Muskelwachstum dargestellt. Die Verbindung
    bedeutet Auswahl und Einordnung, nicht eine garantierte biologische Wirkung.'
  composition: Drei verbundene Felder mit kurzem Beispielband. Auf kleinen Displays vertikale Reihenfolge.
    Symbole unterstützen die Wörter, ersetzen sie nicht.
  exact_labels:
  - Ziel klären
  - Aufgabe passend wählen
  - Passend beobachten
  - Krafttestergebnis ≠ direkte Muskelwachstumsmessung
  avoid:
  - Kein universeller Wachstumszeitplan.
  - Keine proportional wachsende Muskelsilhouette als Messwert.
  - Keine Behauptung, dass eine Trainingsform ausschließlich eine Anpassung erzeugt.
  expert_review: null
- id: fig-ch01-performance
  lesson_ids:
  - ch01-l03
  render_kind: interactive_svg_html
  interaction_id: int-ch01-performance
  status: planned
  required_in: M1
  source_ids:
  - S06
  - S08
  asset_path: null
  learning_purpose: Eine schlechtere Tagesleistung von einer eindeutig bestimmten Ursache trennen.
  alt_text: Acht statt zehn Wiederholungen sind beobachtet. Verschiedene Erklärungen bleiben zunächst möglich.
  long_description: 'Oben steht das fiktive Protokoll: früher zehn, heute acht Wiederholungen. Darunter lassen
    sich drei Erklärungsgruppen öffnen: veränderte Aufgabe, kurzfristige Einflüsse und längerfristige Veränderung.
    Bei jeder Gruppe stehen passende Klärungsfragen. Keine Gruppe wird allein aufgrund dieser Zahlen als tatsächliche
    Ursache ausgewählt.'
  composition: Beobachtungskarte oben, darunter drei anwählbare Hypothesenkarten mit dem sichtbaren Kennzeichen
    möglich, nicht bewiesen. Keine Kurve, Achse, Punktzahl oder Physiologiesimulation.
  exact_labels:
  - 'Beobachtet: 8 statt 10 Wiederholungen'
  - Aufgabe verändert?
  - Kurzfristiger Einfluss?
  - Längerfristige Veränderung?
  - Möglich, nicht bewiesen
  avoid:
  - Keine erfundene Fitness-minus-Ermüdung-Formel.
  - Keine Prozentberechnung der Erholung.
  - Keine pauschale 48-Stunden-Regel.
  - Keine Trainingsfreigabe oder Diagnose.
  expert_review: null
- id: fig-ch01-soreness
  lesson_ids:
  - ch01-l03
  render_kind: svg
  interaction_id: null
  status: planned
  required_in: M1
  source_ids:
  - S07
  asset_path: null
  learning_purpose: Muskelkater nicht als unmittelbaren Wachstumsnachweis behandeln.
  alt_text: Muskelkater ist eine Beobachtung und keine direkte Messung von Muskelwachstum.
  long_description: 'Eine Karte mit dem Wort Muskelkater und eine Karte mit dem Wort Muskelwachstum sind durch
    ein gut lesbares Nicht-gleich-Zeichen getrennt. Darunter steht: Vorhandensein und Fehlen sind kein direkter
    Wachstumsbeweis. Der Quellenhinweis benennt die vorsichtige Ableitung aus Forschung zu Schädigung und Anpassung;
    die Grafik stellt keine direkte Messstudie zum Muskelkater vor.'
  composition: Einfache begriffliche Gegenüberstellung. Ein kleines neutrales Armsymbol ist zulässig, eine
    anatomische Schnittzeichnung unnötig.
  exact_labels:
  - Muskelkater
  - Keine direkte Wachstumsmessung
  - Muskelwachstum
  avoid:
  - Keine gerissenen Muskelfasern als Erklärung jedes Muskelkaters.
  - Keine Gleichsetzung von Muskelkater und gemessener Muskelschädigung.
  - Kein Verharmlosen von Schmerzen als grundsätzlich ungefährlich.
  expert_review: null
- id: fig-ch01-observation
  lesson_ids:
  - ch01-l04
  render_kind: svg_html
  interaction_id: null
  status: planned
  required_in: M1
  source_ids:
  - S33
  asset_path: null
  learning_purpose: Beobachtung, mögliche Erklärung und offene Prüfung auseinanderhalten.
  alt_text: Elf statt zehn notierte Wiederholungen sind eine Beobachtung; die Ursache und allgemeine Überlegenheit
    einer Reihenfolge sind nicht bewiesen.
  long_description: 'Das fiktive Beispiel wird in drei Spalten dargestellt. Beobachtung: Nach einer Änderung
    der Reihenfolge wurden elf statt zehn Wiederholungen notiert. Mögliche Erklärung: Die Reihenfolge könnte
    beigetragen haben. Noch offen: Vergleichbarkeit, weitere Einflüsse und Wiederholbarkeit. Die logische Fallkonstruktion
    stammt aus dem Kurs; die Quelle stützt die Bedeutung der Zuverlässigkeit von Messungen.'
  composition: Drei beschriftete Karten mit Blick-, Frage- und Prüfzeichen. Inhalte müssen als echtes HTML
    auch ohne Grafik erreichbar sein.
  exact_labels:
  - Beobachtung
  - Mögliche Erklärung
  - Noch offen
  - Fiktives Beispiel
  avoid:
  - Keine Quelle als Beleg für die erfundene konkrete Reihenfolge ausgeben.
  - Keine automatische Ampelbewertung des Trainings.
  - Keine Information allein durch Farbe vermitteln.
  expert_review: null
optional_scenes:
- id: scene-ch01-hero
  lesson_ids:
  - ch01-l01
  render_kind: generated_scene
  interaction_id: null
  status: planned_optional
  required_in: null
  source_ids: []
  asset_path: null
  generation_model: null
  generated_at: null
  learning_purpose: Gym und Laufen als gemeinsamen Lernkontext etablieren; keine fachliche Erklärung ersetzen.
  alt_text: Illustration einer anonymen sportlichen Person zwischen Krafttraining und Laufstrecke.
  prompt: Breite redaktionelle Illustration für eine deutschsprachige persönliche Lernplattform über Sportwissenschaft.
    Eine anonyme erwachsene sportliche Person in einer ruhig gestalteten Szene, die ein gewöhnliches Fitnessstudio
    und eine Laufstrecke miteinander verbindet. Sachlich, freundlich, erwachsen, verständliche Silhouetten,
    ausgewogene realistische Körperproportionen, kein Bodybuilding-Werbeposter. Große ruhige Flächen für benachbarten
    UI-Text, ohne selbst Text einzubetten. Keine Wörter, Zahlen, Logos, anatomischen Schnittbilder, Verletzungen,
    Leistungsdaten oder Vorher-nachher-Versprechen. Klar als Illustration und nicht als wissenschaftliche Grafik
    erkennbar. Querformat etwa 16:9; Hauptmotiv bleibt auch bei mobilem Beschnitt verständlich.
  avoid:
  - Kein Porträt von Stefan ohne von ihm bereitgestelltes Foto und eigenen Auftrag.
  - Keine eingebetteten Lernbeschriftungen.
  - Keine unechten anatomischen Details als Lernstoff.
  expert_review: null
```
