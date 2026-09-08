# Redaktioneller Fachdiff: Zielgrößen und Progression

Stand: 8. September 2026. Schreiberbericht für das erste Ausbaupaket aus
`docs/plans/content-expansion.md`. Der getrennte Quellen-, Text- und Aufgabenreview
durch den Reviewer-Agenten `source_research` einschließlich Korrekturschleife ist
abgeschlossen. Das Agentenreview ist keine unabhängige menschliche Fachfreigabe;
`editorial_approved_by` und `expert_reviewed_by` bleiben `null`.

## Umfang und Identität

Lektion `ch01-l02` behält ihre ID und wird als „Anpassung braucht eine Zielgröße“
neu gefasst. Die neue Progressionslektion erhält die freie stabile ID `ch01-l05`,
steht aber mit `order: 3` an dritter Stelle. Dadurch behält die bisherige
Variabilitätslektion ihre ID `ch01-l03` und rückt auf Position 4; `ch01-l04` rückt
auf die im Acht-Lektionen-Plan vorgesehene Position 6. Reihenfolge und Identität
bleiben damit getrennt.

L2 und L3 verwenden jeweils `content_version: 0.3.0`. Die L1-Datei bleibt bytegleich
in Version `0.2.0`; q-ch01-01 und q-ch01-02 bleiben inhaltlich unverändert und
ebenfalls in Version `0.2.0`. `q-ch01-04` bleibt die stabile L2-Hauptaufgabe und
prüft nun die Trennung von Krafttestergebnis und
Muskelwachstum. `q-ch01-05` bleibt als ID erhalten, gehört jetzt zur neuen
Progressionslektion und verlangt eine kurze begründete Beurteilung. `q-ch01-06`
bleibt als nicht eingebettete Zusatzaufgabe von L2 erhalten und folgt deren
Version.

## Fachlicher Diff

| Bereich | Vorher | Neue Fassung | Grund |
|---|---|---|---|
| L2-Umfang | 522 Wörter Kerntext nach derselben vereinfachten Zählweise | 259 Wörter Kerntext plus optionale Vertiefung | Zielgröße, Aufgabe und Beobachtung in das Fünf-Minuten-Budget bringen |
| L2-Grenze | Zielgrößen und Progression in einer Lektion | ausschließlich Zielgröße, Testpassung und Krafttest gegenüber Muskelwachstum | die zwei Lernfragen nacheinander statt gleichzeitig bearbeiten |
| Kraft und Muskelgröße | narrativer Hinweis auf morphologische und nervale Beiträge | Krafttest als Beobachtung einer festgelegten Leistungsaufgabe; Muskelgröße als getrennte, möglicherweise zusammenhängende Zielgröße | eine bessere Kraftleistung nicht als direkte oder proportionale Wachstumsmessung lesen |
| L3 | Progression als zweiter Teil der bisherigen L2 | eigene Lektion mit 301 Wörtern einschließlich kurzem verdecktem L2-Abruf; 256 Wörter bis zu diesem Abruf | Progression über Zeit beurteilen, ohne Tagesbestleistung zur Definition zu machen |
| Progressionsaussage | Last-/Wiederholungsbeispiel im Fließtext | geplante Anforderung, Tageswert und zielbezogener Verlauf werden getrennt | Planänderung und beobachteten Erfolg nicht gleichsetzen |
| Aufgaben | q04 fragte nach einer Progressionsdefinition; q05 nach Anpassungsbeiträgen | q04 ist eine Auswahlentscheidung zu Krafttest und Muskelwachstum; q05 ist eine kurze freie Beurteilung eines Progressionsfalls | unterschiedliche Aufgabenformen und jeweils eine Hauptaufgabe pro Lektion |
| Vertiefung | nicht getrennt | optionale Abschnitte mit `## Vertiefung:`; L3-Abruf mit `## Kurzabruf:` | zusätzliche Tiefe und Abruf bleiben aufklappbar und außerhalb der Pflichtaufgabe |
| Bilder | geplante Fachgrafik in L2 | je eine separat erzeugte und geprüfte dekorative Szene in L2/L3; keine neue Fachgrafik im Markdown | Atmosphäre und trockener Humor, ohne Daten, Anatomie oder Aufgabenlösung vorwegzunehmen |

Alle Fälle und Zahlen sind als fiktiv gekennzeichnet. Die Texte enthalten keine
Dosierung, Trainingsfreigabe, Bereitschaftsberechnung, Wachstumsprognose oder
persönliche Belastungsempfehlung.

## Quellenzuordnung

| Aussage | Quellen | Reichweite |
|---|---|---|
| Krafttest und Muskelgröße sind getrennte, möglicherweise zusammenhängende Zielgrößen; ein Krafttest quantifiziert Muskelwachstum nicht direkt. | S32, S34, S35; Claim C15 | S34 untersucht Testspezifität bei 22 krafttrainingserfahrenen Männern; S35 morphologische und nervale Beiträge bei 28 jungen Männern. Keine universelle Aufteilung für Einzelpersonen. |
| Kraft und Hypertrophie werden als unterschiedliche Zielgrößen behandelt. | S04 | ACSM-Position-Stand und Übersicht von Reviews; Suchstand laut Abstract Oktober 2024, kein Einzelplan für jede Person. |
| Progression ist in diesem Kurs eine zielbezogene Weiterentwicklung über Zeit und nicht auf Laststeigerung in jeder Einheit beschränkt. | S04, S36; Claim C16 | S36 vergleicht Last- und Wiederholungsprogression bei 43 Trainingserfahrenen über acht Wochen. Keine universelle Methode und kein direkter Studienbeleg zu täglichen Rekorden. |
| Ein einzelner Testwert kann Messstreuung enthalten und begründet allein keinen sicheren Verlauf. | S33, S37; Claim C17 | S37 ist eine Test-Retest-Studie mit 36 männlichen jugendlichen Athleten im Power Clean. Keine Übertragung konkreter Fehlergrenzen auf andere Tests. |

Vor dem Schreiben wurden S04, S32 und S33 erneut über ihre offiziellen
PubMed-Seiten geprüft. Die neue claim-genaue Recherche wertete zusätzlich neun
experimentelle Primärstudien auf offiziellen PubMed-Metadaten- und Abstractseiten
aus; S34–S37 sind die im Lerntext verwendeten neuen Quellen. Es wurden keine PDFs,
Bücher oder externen Volltexte heruntergeladen. Die vollständige Zuordnung und
ihre Grenzen stehen in
[`research/ch01-l02-l03-targets-progression.md`](../../research/ch01-l02-l03-targets-progression.md).
Der Abstractzugriff trägt die engen qualitativen Aussagen dieses privaten
Lernentwurfs, ist aber kein Volltextreview.

## Getrennter Agentenreview

Der erste Review fand vier Integrationsbefunde: Die neuen Quellen-IDs mussten im
Register und in der Aussagenkarte auflösbar sein; L3 musste S32 für den Kurzabruf
deklarieren; S04 brauchte einen konkreten Marker im Progressionsabsatz; der
L3-Kerntext lag vor dem Kurzabruf knapp unter dem geplanten Wortkorridor.

S34–S37 und C15–C17 wurden ergänzt. L3 deklariert S32, ordnet S04 der begrenzten
Progressionsdefinition zu und unterscheidet zusätzlich geplante Änderung,
beobachtete Leistung und langfristige Anpassung. Die Nachprüfung bestätigte 256
Kernwörter vor dem Kurzabruf und schloss alle Befunde. Sie fand keine verbleibende
unzulässige Ursache, persönliche Vorgabe oder Responder-Aussage. Die sicheren
H2-Präfixe `Vertiefung:` und `Kurzabruf:` entsprachen dem validierten
Markdown-Vertrag.

Der separate Bildreview und die Pixelprüfung stehen in
[`l2-l3-generated-illustrations.md`](l2-l3-generated-illustrations.md). Sie prüfen
Gestaltung und sichtbare Strukturen, nicht die fachliche Wirksamkeit der Lektionen.

## Offene Grenzen

Die Fünf-Minuten-Angabe ist weiterhin ein Gestaltungsbudget und muss in der
tatsächlichen Nutzung geprüft werden. Ebenso offen bleiben Verständlichkeit,
Unterhaltungswert und Bildnutzen für Stefan. Eine gelöste Hauptaufgabe weist keine
langfristige Erinnerung nach. Die neuen Inhalte bleiben als `pilot_draft`
gekennzeichnet und sind nicht `expert_reviewed`.
