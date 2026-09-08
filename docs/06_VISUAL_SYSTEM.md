# 06 — Oberfläche, Bilder und Interaktion

## Gestaltungsrichtung

Ein ruhiges, gut illustriertes digitales Fachbuch mit Werkstattcharakter. Keine überladene Fitness-App und kein Dashboard, das den eigentlichen Text verdrängt. Heller Standardmodus, dunkler Modus später optional. Systemschriften oder lokal eingebundene Schriftdateien; keine externen Font-Aufrufe.

Seit dem Nutzerauftrag vom 8. September 2026 folgt das Produkt in Struktur,
Typografie und Dichte dem vorhandenen Projekt `stefans-fitness-kompass`.
Diese Entscheidung ersetzt die Zwischenlösung mit einer 1100-px-Buchseite und
18-px-Fließtext. ATHENAs pompejanisches Rot, Bronze, helle Flächen und die bereits
generierten Illustrationen bleiben erhalten. Der historische D0-Vergleichsstand
wird nicht verändert.

- Kompakter gemeinsamer Seitenkopf, direkter Einstieg in die Kapitelübersicht.
- Desktop: Lektionsnavigation links, mittlere Lesespalte, Abschnittslinks rechts.
  Unterhalb des Desktop-Breakpoints sind die Navigationen kompakt aufklappbar.
- Fließtext 16 px in serifenloser Schrift mit 1,6-facher Zeilenhöhe.
  Feste Überschriftengrößen statt mit der Fensterbreite wachsender Schrift:
  Seitentitel 32 px, Abschnitte 23 px, kleinere Zwischenüberschriften etwa 17,5 px.
  Längere Aufgabenfragen verwenden 18 px bei 1,4-facher Zeilenhöhe.
  Die behutsame Verkleinerung gegenüber PR #11 gehört zum L2/L3-Ausbau.
- Zentrale Artikelspalte ungefähr 680–720 px einschließlich Innenabständen;
  Textlänge ungefähr 70–80 Zeichen. `ch` bleibt eine typografische Näherung.
- Flaches dekoratives Kapitelbanner, kompakte vollständige 3:2-Illustrationen
  im Text. Aufgaben, Grafiken und Hinweise bleiben innerhalb der Lesespalte.
- Dezente Trennlinien und Abstände, kaum Schatten; keine dekorativen Großkarten
  um jeden Abschnitt. Antworten, Quellendialog und Rückmeldungen bleiben erreichbar.

Die Referenz liefert das Layout, keine zusätzlichen Produktfunktionen. Der
anschließend beauftragte [L2/L3-Ausbau](plans/content-expansion.md) ergänzt kurze
Lektionen mit optionalen Vertiefungen und eigenen Illustrationen. Suche,
Sprachwechsel und Trainingswerkzeuge bleiben außerhalb dieses Pakets. Die
ursprüngliche Layoutprüfung steht im [Vergleichsbericht](reviews/kompass-layout.md),
der aktuelle Prüfstand im [L2/L3-Bericht](reviews/l2-l3-runtime.md).

### ATHENA-Rahmen

Das Projekt trägt den Arbeitsnamen **ATHENA**: **Athletic Training, Health, Exercise & Nutrition Academy**. Die Marke darf griechisch-römische und mythologische Anklänge verwenden, soll aber im Kern eine **glaubwürdige Lernumgebung** bleiben. Säulen, Eulen, Sternkarten, Lorbeer, Marmor, Bronze, Friese oder Amphorenmotive sind als Formensprache erlaubt, jedoch nur, wenn sie die Benutzbarkeit nicht verdrängen.

Die frühere Stil-Exploration bleibt in [docs/12_ATHENA_STYLE_DIRECTIONS.md](12_ATHENA_STYLE_DIRECTIONS.md)
dokumentiert. Für den aktuellen M0-Piloten gilt die oben beschriebene Verbindung
von Kompass-Struktur und ATHENA-Farb- und Bildwelt.

## Seitenaufbau

```text
Trainingswissen                          Lernen | Wiederholen | Einstellungen

Kapitel 1 · Lektion 1                          Recherchegestützter Entwurf
Gleiche Aufgabe, andere Reaktion

Einstiegsfall
[Kurzer Text: zwei vergleichbare Läufe, unterschiedliches Erleben]

Das lernst du
[Zwei konkrete Ziele]

Erklärung  ──────────  Quellenmarker am passenden Absatz
[Fachliche Grafik mit Legende und Bildbeschreibung]

Probiere es aus
[Interaktion; zuerst Vermutung, dann Aufdecken]

Erkläre es selbst
[Eigene Antwort] [Zuversicht] [Lösung vergleichen]

[Vertiefung öffnen]                 [Frage zum Abschnitt — ab M2]

[Als gelesen markieren]             [Nächste Lektion — erst ab M1]
```

Auf dem Smartphone bleibt eine einzige Lesespalte. Der Tutor ist ab M2 ein separat öffnendes Panel, kein dauerhaft halbierter Bildschirm. Funktionen dürfen nicht ausschließlich per Hover oder Drag-and-drop bedienbar sein.

## Ursprüngliches Bildbudget und aktueller Einsatz

Die folgende Tabelle dokumentiert die ursprünglichen fachlichen Briefings mit
ihren damaligen Lektionsnummern. Aktuell verwendet L1 die Zwei-Läufe-Interaktion
und drei redaktionelle Illustrationen. Die neuen Einheiten 2/3 ergänzen je eine
[separat bewertete Szene](reviews/l2-l3-generated-illustrations.md).
`fig-ch01-load` und `fig-ch01-adaptation` bleiben unzugeordnete historische
Briefings; die weiteren Fachvisualisierungen sind noch geplant.

| ID | Einsatz | Zweck | Umsetzung |
|---|---|---|---|
| fig-ch01-load | L1 | Aufgabe, innere Reaktion, Kontext trennen | statisches SVG |
| fig-ch01-two-runs | L1 | gleiche dokumentierte Aufgabe, verschiedene Reaktion | SVG/HTML mit int-ch01-load |
| fig-ch01-adaptation | L2 | Ziel, Reiz und passende Beobachtung verbinden | statisches SVG |
| fig-ch01-performance | L3 | Tagesleistung ist nicht gleich langfristige Kapazität | SVG/HTML mit int-ch01-performance |
| fig-ch01-soreness | L3 | Muskelkater nicht als direkte Wachstumsmessung lesen | statisches SVG |
| fig-ch01-observation | L4 | Daten, Kontext und Schlussfolgerung unterscheiden | SVG/HTML-Tabelle |
| scene-ch01-hero | optional, Kapitelkopf | Gym und Laufen als gemeinsames Thema | einmalig generierte Szenenillustration |

Sechs fachliche Visuals insgesamt, zwei davon interaktiv. Die Szenenillustration ist **zusätzlich und optional**. Derselbe Inhalt wird nicht zweimal als statisches und interaktives Bild gezählt.

## Zwei getrennte Produktionswege

### Präzise Darstellungen

Diagramme, Formeln, Kurven, Beschriftungen und Daten kommen aus SVG/React oder einer überprüfbaren Datendarstellung. Werte bleiben editierbar. Keine Diagramme mit erfundenen Achsen oder Einheiten. Keine automatisch aussehenden Belastungs-Prozentwerte ohne Modell und Validierung.

### Generative Illustration

`gpt-image-2` ist in der geprüften OpenAI-Dokumentation als Bildmodell verfügbar. Es ist für Szenen, Vergleiche und gestalterische Elemente vorgesehen, nicht als fachliche Wahrheitsquelle. Das Modell bleibt konfigurierbar. Präzise Lehrtexte und Labels werden in HTML/SVG ergänzt. [S17]

Im Pilot werden Bilder nicht bei jedem Seitenaufruf generiert. Einmalige Produktion außerhalb der Lernlaufzeit, fachliche/gestalterische Prüfung, lokale Speicherung mit Prompt und Herkunft. M0 verwendet keine Bild-API.

## Anatomie später

Keine nicht überprüfte KI-Anatomie als Prüfungsgrundlage. Für jede relevante Struktur prüfen: Lage, Verlauf, Gelenkbezug, Seitenorientierung, Anzahl und Beschriftung. Eine zweite KI-Meinung ersetzt keine qualifizierte fachliche Prüfung.

Fremde Bilder nur mit geklärtem Recht für die konkrete Datei und die konkrete Nutzung; Quellen-, Lizenz- und Änderungsangaben am Asset hinterlegen. Kein pauschales „OpenStax ist offen, also dürfen wir alles übernehmen“. [S25]

## Zugänglichkeit

Jede informative Grafik bekommt eine knappe Textalternative und, falls komplex, eine ausführliche zugängliche Beschreibung oder Datentabelle. Dekorative Szenen erhalten eine leere Alternative, sofern sie keine eigene Information tragen. Wichtige Unterschiede zusätzlich durch Form, Linie oder Beschriftung darstellen, nicht nur durch Farbe. [S24]

Eigene Anforderungen: alle Interaktionen per Tastatur; klare Fokusmarkierung; keine Pflichtanimation; `prefers-reduced-motion` beachten; Touch-Ziele ausreichend groß; Zoom bis 200 % ohne verlorene Inhalte; 390-px-Ansicht prüfen. Als Kontrastziel mindestens 4,5:1 für normalen Text, 3:1 für große Schrift und relevante grafische Bedienelemente verwenden und tatsächlich messen, nicht lediglich behaupten.

## Fehlende Assets

Nur vorhandene und für den jeweiligen Lektionsstand vorgesehene Assets einbinden.
Geplante Fachgrafiken bleiben außerhalb des veröffentlichten Readers; dort gibt
es weder defekte Bildverweise noch einen behaupteten Prüfstatus für fehlende Bilder.

## Kalibrierung

Stefan bewertet an L1 Verständlichkeit, Textmenge, Bildnutzen und Bedienung. Erst Textdichte ändern, dann Bilddichte — nicht beides gleichzeitig, wenn wir die Ursache einer Verbesserung verstehen wollen. Das ist ein kleines Gestaltungsverfahren, kein kontrolliertes Lernexperiment.
