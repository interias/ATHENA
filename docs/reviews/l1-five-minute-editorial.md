# Redaktioneller Fachdiff: L1 als Fünf-Minuten-Pilot

Stand: 6. September 2026. Schreiberbericht zur Überarbeitung von Lektion 1 auf
Basis `c32c786`. Der getrennte Agentenreview und die Nachprüfung der Korrekturen
sind abgeschlossen. Der Bericht ist keine redaktionelle Annahme und keine
unabhängige Fachfreigabe.

## Anlass und Umfang

Die persönliche Pilotbewertung ergab 5/5 für Verständlichkeit, 2/5 für passende
Textmenge, 2/5 für Grafiknutzen sowie 3/5 für praktische Relevanz und Bedienbarkeit.
Der Auftrag präzisiert das Ziel auf ungefähr fünf Minuten einschließlich Aufgaben:
höhere begriffliche Dichte, vorausgesetzte Grundlagen, kurz erklärte Fachbegriffe
und trockenen, pointierten Humor.

Fachlich geändert wurden der kanonische Text von L1 und q-ch01-01/q-ch01-02.
Die übrigen Lehrtexte und Aufgaben bleiben inhaltlich unverändert; weitere
Lektionen bleiben gesperrt. Das Grafikmanifest nimmt die doppelte statische
Darstellung aus dem aktiven Piloten. Der Kapitelplan dokumentiert den vorgesehenen
Neuschnitt, ohne ihn bereits freizuschalten.

## Fachlicher Diff

| Bereich | Vorher | Neue Fassung | Grund |
|---|---|---|---|
| Umfang | 506 Wörter Haupttext ohne Komponentenmarker | 293 Wörter nach derselben Zählweise | Wiederholungen entfernen und Zeit für Interaktion sowie eigene Antwort lassen |
| Struktur | sechs Textabschnitte, zwei Fachgrafiken, eine Interaktion und zwei Aufgaben | drei Textabschnitte, eine integrierte Zwei-Läufe-Interaktion und zwei Aufgaben | dieselbe Unterscheidung nicht nacheinander als Text, statische Grafik und Interaktion wiederholen |
| Begrifflicher Anspruch | vor allem Beispiele und alltagssprachliche Trennung | Operationalisierung als Auswahl erfassbarer Merkmale, Protokollierung der Werte, beobachtete Reaktion und Schlussfolgerungsgrenze als zusammenhängende Kette | mehr fachliche Dichte ohne ungestützte Mechanismen und klare Trennung von Operationalisierung und Protokollierung |
| äußere Belastung | Aufgabe anhand einzelner Beispiele beschrieben | ausdrücklich als dokumentierter Ausschnitt der absolvierten Aufgabe behandelt | gleiche Werte nicht mit vollständiger Gleichheit verwechseln |
| akute und langfristige Ebene | eigener kurzer Nachtrag am Ende | direkt in die Aussagegrenze des Falls eingebaut | o02 bleibt erhalten, ohne ein zweites Thema auszubreiten |
| Humor | mehrere weiche Pointen über die Lektion verteilt | zwei kurze Spitzen: Protokoll als Orakel und Erschöpfung als Fortschrittszeugnis | trockener und knapper; keine Person wird abgewertet |
| Interaktionsreveal | dieselben konkreten Reaktionswerte standen nach der Interaktion nochmals im Fließtext | der statische Text nennt weder Reaktionswerte noch das Ergebnis des Vergleichs | der Lernmoment bleibt bis zum Aufdecken erhalten |
| q-ch01-01 | einfache Wiedererkennung eines äußeren Aufgabenmerkmals | drei plausible Schlussfolgerungen zu Aufgabe, Reaktion und Anpassung an einem anderen fiktiven Ergometerfall | prüft die Reichweite einer Aussage statt nur ein Schlagwort und verrät die Reaktionen der Interaktion nicht |
| q-ch01-02 | Erklärung am bereits verwendeten Laufbeispiel | kurze Transfererklärung an einem neuen fiktiven Krafttrainingsfall | Abruf und Übertragung statt Wiederholung des Ausgangsfalls |

Die statische Komponente `fig-ch01-load` und ihr Eintrag in `figure_ids` wurden aus
L1 entfernt. `fig-ch01-two-runs` und `int-ch01-load` bleiben die einzige
integrierte Darstellung. IDs, `correct_option: b`, Rubrik-IDs c1–c3 sowie die
Lernziele o01/o02 bleiben stabil.

## Quellenzuordnung

| Aussage in der neuen Fassung | Grundlage | Grenze |
|---|---|---|
| äußere Belastung als erfassbare Merkmale der Aufgabe; innere Beanspruchung als individuelle körperliche und psychische Reaktion | S05, [erneut geprüftes Abstract des konzeptionellen Kommentars](https://pubmed.ncbi.nlm.nih.gov/30614348/) von Impellizzeri et al. | keine Behauptung, dass Distanz und Dauer die gesamte äußere Belastung abbilden; keine konkrete Ursache der Reaktion |
| akute und chronische Effekte sowie individuelle und kontextuelle Faktoren werden getrennt betrachtet | S06, [erneut geprüftes Abstract des aktualisierten konzeptionellen Rahmens](https://pubmed.ncbi.nlm.nih.gov/34519982/) | keine persönliche Vorhersageformel und kein Nachweis einer bestimmten Anpassung aus zwei Läufen |
| Operationalisierung als Festlegung erfassbarer Merkmale für eine Frage beziehungsweise ein Konstrukt; Protokollierung als Festhalten der gewählten Werte | kurze redaktionelle Arbeitsdefinition | kein neues Messverfahren und keine Aussage über die Güte einer bestimmten Kennzahl |
| q01 und q02 trennen dokumentierten Ausschnitt, Reaktion und offenen Schluss | logische Anwendung derselben Grenzen auf sichtbar fiktive Fälle | keine realen Personendaten, Ursachenbehauptung oder Trainingsvorgabe |

S05 und S06 wurden für diesen Auftrag nur anhand der vorhandenen Einträge und der
erneut gelesenen Abstracts verwendet; externe Volltexte wurden nicht übernommen.
Die neue Fassung ergänzt keine physiologischen Mechanismen.

## Bewusst entfernt oder nicht ergänzt

- Die erste statische Grafik entfällt, weil sie dieselbe Trennung vor der
  interaktiven Zwei-Läufe-Darstellung nochmals erklärte.
- Der zusätzliche Gym-Abschnitt entfällt; sein Zweck geht in den neuen
  Transferfall q02 über.
- Konkrete Ursachen einer unterschiedlichen Beanspruchung bleiben offen.
- Es gibt keine Dosierung, Trainingsfreigabe, Erholungsprognose oder persönliche
  Empfehlung.
- Die Fassung behauptet weder Lernwirksamkeit noch Bachelor-/Master-Gleichwertigkeit.
  Der höhere Anspruch liegt in Begriffs- und Schlussfolgerungsarbeit.

## Versionierung, Prüfung und offene Grenzen

Die Inhaltsversion wechselt auf `0.2.0`. Der vorhandene Loader verlangt eine
gemeinsame Kapitelversion; deshalb wechseln auch die Versionsmetadaten der
inhaltlich unveränderten, weiterhin gesperrten Lektionen und Aufgaben. Bestehende
Antworten und Bewertungen bleiben der alten Version zugeordnet. Der bytegenaue
D0-Ausgangsstand liegt separat unter
`Design/content/baseline-0.1.0/`; bestehende Schreibproben und Herkunftshashes
werden dadurch nicht rückwirkend umgedeutet.

Der Agentenreview fand keine verbleibenden Befunde zu Aussagegrenzen,
Quellenpassung, Anspruch, Humor oder Kapitelplan. Er ersetzt weder eine persönliche
Pilotmessung noch eine unabhängige Fachfreigabe. Das tatsächliche Zeitbudget und
die Verständlichkeit in der Zielgruppe bleiben im Pilotbetrieb zu prüfen.
`editorial_approved` und `expert_reviewed_by` bleiben unverändert. Nur L1 ist
überarbeitet; die geplante Kapitelaufteilung ist keine Freischaltung von M1.
