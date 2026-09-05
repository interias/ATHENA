# Vorlage für eine neue Lektion

**Nicht als freigegebenen Lerninhalt importieren.** Platzhalter ersetzen, Aussagen belegen und Renderer ergänzen, bevor eine Lektion in das Contentmanifest aufgenommen wird. Bei neuen Kapiteln zuerst recherchieren, nicht Quellen nachträglich an einen fertigen Text kleben.

## Frontmatter-Vorlage

```yaml
lesson_id: REPLACE
chapter_id: REPLACE
order: 1
title: REPLACE
content_version: 0.1.0
status: pilot_draft
editorial_approved_by: null
expert_reviewed_by: null
llm_eligible: false
objectives: []
prerequisites: []
source_ids: []
figure_ids: []
question_ids: []
```

## Aufbau der kanonischen Datei

# Eine konkrete Frage als Titel

## Einstieg aus der Praxis

Ein kurzer, ausdrücklich fiktiver Gym-, Lauf- oder Ernährungsfall. Keine Daten von Stefan erfinden. Benenne, was am Ende erklärt oder angewendet werden kann.

## Das zentrale Konzept

Alltagssprache zuerst, danach den Fachbegriff in einem Satz definieren. Eine tragende fachliche Aussage pro Gedankenschritt. Quellenmarker direkt an die Aussagen, die sie tatsächlich stützen.

Eine Grafik nur anfordern, wenn sie eine Beziehung, Bewegung, Struktur, Abfolge oder Vergleichbarkeit erklärt. In der fertigen Lektion lautet der Block etwa `[[figure:STABILE_ID]]`; die ID muss im eigenen Visualmanifest existieren.

## Übertragung

Ein zweites Beispiel aus einem anderen Kontext. Beobachtung, Erklärungsmodell und praktische Ableitung ausdrücklich trennen. Keine Diagnose, individuelle Dosis oder Erfolgsgarantie aus allgemeinen Befunden ableiten.

## Denkpause

Eine echte Abruffrage oder eine kleine Entscheidung. Keine rhetorische Frage, deren Antwort schon im selben Satz steht. Aufgaben vollständig in der kanonischen Aufgabenbank definieren; in der Lektion nur `[[exercise:STABILE_ID]]` referenzieren.

## Merksatz

Ein kurzer Satz mit dem wichtigsten Unterschied, nicht fünf neue Begriffe.

## Redaktionelle Prüfung außerhalb des Lerntextes

Zielkorridor zunächst 400–650 Wörter Kerntext. Das ist eine veränderbare Stilentscheidung. Optional 100–200 Wörter klar getrennte Vertiefung, wenn sie wirklich gebraucht wird. Quellenzugriff, Population, Zielgröße und Unsicherheit im Quellenregister und in der Aussagenzuordnung dokumentieren. Keine ungeprüften Abbildungen übernehmen. Antworten und Bewertungsraster gegen die tatsächlichen Lernziele prüfen. Änderungen versionieren; abgeleitete Lesefassung neu erzeugen.
