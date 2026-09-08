# Agentenreview: informative Illustrationen für L2 und L3

Stand: 8. September 2026. Unabhängige Prüfung der neuen Bildfassungen,
Prompts und Einbindung in die Lektionen „Anpassung braucht eine Zielgröße“ und
„Progression ohne Tagesrekord“. Dieses Agentenreview bewertet Quellenbezug,
sichtbare Strukturen, Verständlichkeit, Gestaltung und Aussagegrenzen. Es ist
keine unabhängige menschliche Fachfreigabe und setzt nicht `expert_reviewed`.

## Prüfgrundlage

Geprüft wurden:

- die kanonischen Lektionsfassungen `content/ch01/02_ADAPTATION.md` und
  `content/ch01/05_PROGRESSION.md`;
- die tatsächlich gesendeten Prompts in
  `assets/ch01/illustrations/l2-l3-v2-prompts.json`;
- die beiden WebP-Dateien in Originalauflösung;
- Alttexte, sichtbare Begriffserklärungen und Captions in
  `apps/web/lib/publishedLessons.ts` sowie ihre Ausgabe durch
  `apps/web/components/LessonReader.tsx`;
- die Quellen- und Aussagegrenzen in `research/SOURCES.md`,
  `research/CLAIM_MAP.md` und
  `research/ch01-l02-l03-targets-progression.md`.

Der PubMed-Abstract von [Balshaw et al. 2017](https://pubmed.ncbi.nlm.nih.gov/28239775/)
wurde am 8. September 2026 erneut direkt geprüft. Die Studie erfasste bei 28
gesunden jungen Männern nach isometrischem Kniestreckertraining unter anderem
isometrisches maximales Drehmoment und Quadrizepsvolumen getrennt; das Volumen
wurde per MRT bestimmt. Ultraschall diente dort der Bestimmung des
Pennationswinkels. Das L2-Bild ist deshalb als fiktiver konzeptueller Vergleich
von Krafttest und MRT tragfähig, nicht als Rekonstruktion des Versuchsaufbaus.

## L2 – `l2-target-metric-v2.webp`

Geprüft wurde die Datei in 1536 × 1024 Pixeln und mit 184.432 Bytes. SHA-256:
`07A62A028468A00B6F149E07C61787AB360C0C835A465BE78ED35C76E9FE523F`.

Das gleich breite Diptychon trennt zwei Beobachtungen derselben erwachsenen
Person deutlich. Links sind Knieextensionsstation, kontrollierte Anstrengung und
beobachtende Prüferin erkennbar; rechts sind dieselbe Kleidung, derselbe
Körperbau und ein vereinfachtes MRT-Gerät zu sehen. Die helle Trennfuge und der
fehlende Richtungspfeil vermeiden eine zeitliche Vorher-nachher-Lesart. Weder
Messwerte noch Scanbild, innere Anatomie oder Körperveränderung sind dargestellt.

| Kriterium | Wertung | Begründung |
|---|---:|---|
| Sichtbare Struktur | 5/5 | zwei gleichwertige, klar getrennte Beobachtungssituationen |
| Inhaltsnähe | 4/5 | Krafttest und morphologische Beobachtung treffen die Kerntrennung; genaue Test- und MRT-Protokolle bleiben bewusst unbestimmt |
| Verständlichkeit | 4/5 | die Situationen sind erkennbar, ihre fachliche Bedeutung wird durch die sichtbaren HTML-Begriffe eindeutig |
| Gestaltung | 4/5 | konsistente Gouache-/Ink-Wirkung und ruhige ATHENA-Farbwelt; der Körper ist stärker definiert als im Prompt verlangt |
| Neutralität | 4/5 | keine Veränderungs- oder Erfolgscodierung; die deutlich athletische Darstellung setzt dennoch einen engen visuellen Körpertyp |

Die stärkere Muskeldefinition ist ein begrenzter Promptabweichungsbefund. Sie
wird in beiden Hälften konsistent gezeigt und nicht als Ergebnis, Größenänderung
oder Garantie inszeniert. Das toleriert die fiktive Lehrszene, ohne daraus
anatomische oder persönliche Aussagen abzuleiten. Die vereinfachten Apparaturen
sind als Illustration erkennbar und werden nicht als technische Anleitung oder
Studienrekonstruktion bezeichnet.

Alttext, die sichtbaren Begriffe „Kraftleistung“ und „Muskelgröße“ sowie die
Caption ergänzen sich sinnvoll. Der Alttext beschreibt die sichtbare
Zweiteilung; die Caption benennt die mögliche Beziehung und die zentrale Grenze,
dass ein Krafttest Muskelwachstum nicht direkt misst. Die während des Reviews
zunächst unscharfe Beschreibung unter „Muskelgröße“ wurde zu „Was zeigt eine
passende bildgebende Untersuchung über die Muskelgröße?“ präzisiert. Sie fragt
damit nach der Aussage der Beobachtung, ohne einen konkreten Messwert vorzugeben.

**Ergebnis L2:** inhaltlich und visuell angenommen. Der begrenzte Befund zum
idealisierten Körperbild rechtfertigt keine weitere Bildgeneration.

## L3 – `l3-progression-v2.webp`

Geprüft wurde die Datei in 1536 × 1024 Pixeln und mit 319.398 Bytes. SHA-256:
`1CB9D8010FE9202905C077C47D12A9D645A52DC53370392AE9C2172E0C75A0A3`.

Die Vogelperspektive zeigt drei gleich große Arbeitsbereiche: links eine Hand
beim Verschieben einer Aufgabenkarte, in der Mitte genau ein Protokoll und rechts
drei gleichartige Protokolle mit vergleichender Zeigegeste. Die Hände sind
plausibel, die Dokumente klar gezählt und die Bereiche durch breite Papierfugen
getrennt. Es gibt keine lesbaren Zahlen, Daten, Skalen, Kurven, Rangfolge oder
markierte Bestleistung.

| Kriterium | Wertung | Begründung |
|---|---:|---|
| Sichtbare Struktur | 5/5 | Planhandlung, Einzelblatt und mehrere Vergleichsblätter sind klar getrennt |
| Inhaltsnähe | 4/5 | die Relation Plan, Einzelbeobachtung und Verlauf ist erkennbar; die konkrete Art der Planänderung bleibt offen |
| Verständlichkeit | 4/5 | ein Blatt gegenüber drei Blättern ist sofort lesbar; die Bedeutung „über Zeit“ entsteht erst zusammen mit den HTML-Begriffen |
| Gestaltung | 5/5 | eigenständige Vogelperspektive, große Formen und reduzierte ATHENA-Materialwelt |
| Neutralität | 5/5 | keine erfundenen Ergebnisse, kein garantierter Trend und keine persönliche Vorgabe |

Die beiden Hantelkarten im linken Bereich unterscheiden keine Lasten,
Wiederholungen oder anderen Trainingsvariablen. Das Bild allein zeigt daher eine
Planänderung, aber keine konkrete Progressionsform. Diese Zurückhaltung ist hier
sachlich passend: Die HTML-Erklärung spricht allgemein von einer über Zeit
weiterentwickelten „Anforderung“, und die Caption trennt geplante Änderung,
Tageswert und Verlauf. Damit entsteht weder eine Last-only-Definition noch eine
scheinpräzise Datenreihe. S04 und S36 tragen den Progressionsbegriff; S33 und S37
tragen die Aussagegrenze des einzelnen Testwerts. Das Bild selbst bleibt als
fiktive didaktische Synthese gekennzeichnet.

**Ergebnis L3:** inhaltlich und visuell angenommen. Eine Zahlenkurve oder weitere
Bildcodierung würde keinen notwendigen Zusatznutzen bringen und könnte eine
nicht belegte Entwicklung vortäuschen.

## Vergleich mit den ersten Fassungen

Die ersten Fassungen wiederholten in beiden Lektionen dieselbe Grundidee eines
römischen Stilllebens mit Eule, Tischobjekten und einer indirekten Pointe. Sie
vermieden zwar falsche Messdaten, machten aber die jeweilige fachliche
Unterscheidung kaum sichtbar. Die damaligen Wertungen von 5/5 für Klarheit und
Lektionspassung waren deshalb zu großzügig: Sie bewerteten vor allem das Fehlen
problematischer Aussagen und die dekorative Stimmigkeit, nicht die konkrete
Inhaltsrepräsentation.

Die neuen Fassungen besitzen einen höheren Wiedererkennungswert zwischen den
Lektionen. L2 verwendet eine frontale menschliche Zweierszene für zwei
Zielgrößen; L3 eine abstraktere Vogelperspektive für Plan, Einzelwert und mehrere
Beobachtungen. Beide bleiben stilistisch verwandt, ohne Motiv und Bildlogik zu
wiederholen. Daraus folgt keine nachgewiesene Lernwirkung. Bewertbar ist nur,
dass die kanonischen Unterscheidungen jetzt näher und eindeutiger sichtbar sind.

## Prüfung der eingebundenen Ansichten

Geprüft wurden die tatsächlichen Browseraufnahmen bei 1440 und 390 Pixel
Viewportbreite für beide Lektionen. Auf Desktop bleibt die Illustration jeweils
auf 600 Pixel begrenzt. Die Begriffe stehen bei L2 passend unter den beiden
Bildhälften und bei L3 unter den drei Bildbereichen. Bild, Begriffe und Caption
bilden dadurch eine gemeinsame Lesefolge.

Bei 390 Pixeln bleiben die zwei L2-Szenen sowie die drei L3-Bereiche trotz der
Verkleinerung unterscheidbar. Die Begriffserklärungen werden untereinander
angeordnet; ihre Reihenfolge entspricht weiterhin der Bildfolge von links nach
rechts. Text und Bild werden nicht sichtbar abgeschnitten. Die feinen
Apparatedetails von L2 und die abstrakten Protokollstriche von L3 treten zurück,
die für die Aussage nötigen Hauptformen bleiben bestehen.

## Gesamturteil und Grenzen

Die neuen Bilder, Alttexte, sichtbaren Begriffserklärungen und Captions bilden
zusammen informative Lektionsillustrationen. Es gibt keinen fachlichen oder
gestalterischen Blocker und keinen Anlass zur Neugeneration. Die dokumentierten
Abweichungen begrenzen die Aussage, verhindern aber nicht die vorgesehene
Verwendung in den beiden privaten Pilotlektionen.
