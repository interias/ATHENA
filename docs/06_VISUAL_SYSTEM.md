# 06 — Oberfläche, Bilder und Interaktion

## Gestaltungsrichtung

Ein ruhiges, gut illustriertes digitales Fachbuch mit Werkstattcharakter. Keine überladene Fitness-App und kein Dashboard, das den eigentlichen Text verdrängt. Heller Standardmodus, dunkler Modus später optional. Systemschriften oder lokal eingebundene Schriftdateien; keine externen Font-Aufrufe.

Zentrale Lesespalte ungefähr 65–75 Zeichen breit, Fließtext als Ausgangspunkt 18 px, Zeilenhöhe ungefähr 1,6. Fachbegriffe, Quellen und optionale Vertiefungen sind erreichbar, ohne die Hauptlektüre zu unterbrechen. Diese Werte werden am Pilot geprüft.

### ATHENA-Rahmen

Das Projekt trägt den Arbeitsnamen **ATHENA**: **Athletic Training, Health, Exercise & Nutrition Academy**. Die Marke darf griechisch-römische und mythologische Anklänge verwenden, soll aber im Kern eine **glaubwürdige Lernumgebung** bleiben. Säulen, Eulen, Sternkarten, Lorbeer, Marmor, Bronze, Friese oder Amphorenmotive sind als Formensprache erlaubt, jedoch nur, wenn sie die Benutzbarkeit nicht verdrängen.

Die konkrete Stil-Exploration ist separat dokumentiert in [docs/12_ATHENA_STYLE_DIRECTIONS.md](12_ATHENA_STYLE_DIRECTIONS.md). Für M0/M1 wird **noch kein endgültiger Stil festgeschrieben**. Stattdessen testen wir zuerst ausgewählte Richtungen am ersten Kapitel.

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

## Bildbudget des Piloten

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

Die Spezifikation enthält keine fertigen Bilddateien. Vor der Implementierung deshalb kein defektes `<img>` verlinken. Nicht umgesetzte Fachgrafiken können vorübergehend ihre erklärende Textfassung zeigen und werden als offen markiert. Für M0 sind die beiden L1-Grafiken jedoch Pflichtbestandteil der Abnahme.

## Kalibrierung

Stefan bewertet an L1 Verständlichkeit, Textmenge, Bildnutzen und Bedienung. Erst Textdichte ändern, dann Bilddichte — nicht beides gleichzeitig, wenn wir die Ursache einer Verbesserung verstehen wollen. Das ist ein kleines Gestaltungsverfahren, kein kontrolliertes Lernexperiment.
