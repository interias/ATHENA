# Interaktionen — Kapitel 1

**Spezifikation, keine bereits implementierten Komponenten.** M0 setzt nur I01 um. Zustände, Rückmeldungen und Navigation sind deterministisch; ein LLM ist dafür nicht nötig. Beide Beispiele sind fiktiv. Die Aufgabenbank ist davon getrennt: Eine Exploration zählt nicht automatisch als unabhängiger Wissensnachweis.

## I01 — Zwei gleiche Protokolle?

- Stabile ID: `int-ch01-load`
- Zugehörige Visualisierung: `fig-ch01-two-runs`
- Lektion: `ch01-l01`; Lernziele: `ch01-o01`, `ch01-o02`
- Quellen: `[S05, S06]`
- Umfang: M0

### Ausgangszustand: erst überlegen

Zwei Karten zeigen Lauf A und Lauf B, jeweils zehn Kilometer und sechzig Minuten, gleiche beschriebene flache Strecke. Keine Angaben zu Puls, Wetter oder Erholung ergänzen. Über den Karten steht „Fiktives Beispiel“.

Frage: **„Was kannst du allein aus diesen Angaben sagen?“**

Drei mit Tastatur bedienbare Auswahlmöglichkeiten:

1. „Die dokumentierten Merkmale der äußeren Aufgabe stimmen überein.“ — passend.
2. „Die innere Beanspruchung war sicher gleich.“ — nicht ableitbar.
3. „Die langfristige Anpassung wird gleich sein.“ — nicht ableitbar.

Nach Auswahl wird „Reaktionen aufdecken“ aktiv. Eine Auswahl genügt; nicht so lange raten lassen, bis die richtige Antwort getroffen wird. Die Antwort wird für diesen Interaktionszustand gehalten, nicht als zusätzliche benotete Kernaufgabe gespeichert.

### Aufgedeckter Zustand: ergänzen statt umdeuten

Lauf A: „Angenehm erlebt.“ Lauf B: „Deutlich anstrengender erlebt.“

Rückmeldung für Auswahl 1: „Die dokumentierten Merkmale stimmen überein. Jetzt kennst du zusätzlich eine unterschiedliche innere Reaktion. Warum sie verschieden war, ist noch offen.“

Rückmeldung für Auswahl 2: „Gleiche dokumentierte Strecken- und Zeitangaben reichen nicht für diese Aussage. Das aufgedeckte Erleben unterscheidet sich.“

Rückmeldung für Auswahl 3: „Eine langfristige Veränderung lässt sich aus diesem Vergleich nicht ablesen. Du kennst jetzt erst zwei unmittelbare Reaktionen.“

Darunter eine unbenotete Denkfrage: „Welche zusätzliche Information könnte bei der Einordnung helfen?“ Beim freiwilligen Aufklappen erscheinen Beispiele wie weitere Aufgabenmerkmale, Kontext und Erfassung des Erlebens. **Keine dieser Fragen beweist eine Ursache.**

### Zustände und Bedienung

`predict_unselected → predict_selected → revealed → reflection_open`.

„Neu ansehen“ setzt Auswahl und aufgedeckte Texte zurück, ohne gespeicherte Lektionsergebnisse zu löschen. Kein Timer, kein Drag-and-drop-Zwang, kein automatisches Scrollen bei Auswahl. Fokus bleibt nachvollziehbar; eine kurze `aria-live=polite`-Meldung kündigt das Aufdecken an. Reduzierte Bewegung respektieren.

Vor dem Aufdecken dürfen die Reaktionen weder visuell noch über zugängliche Texte oder versteckte Lösungshinweise verraten werden. Das ist didaktische Präsentation, keine Sicherheitsbehauptung: Ein lokaler Repositorybesitzer kann die Vorlagen lesen.

### Abnahmetests

Start ohne Antwort; Aufdecken zunächst deaktiviert. Alle drei Antwortpfade zeigen exakt ihre Rückmeldung. Gleichheit wird stets auf **dokumentierte Merkmale** begrenzt. Alttexte folgen dem Zustand. Bedienung funktioniert mit Tab, Leertaste beziehungsweise Enter und auf einem Touchdisplay. Reset funktioniert; Zurücknavigation beschädigt keine gespeicherten Antworten. Keine Netzwerkanfrage an einen Modellanbieter.

## I02 — Was erklärt acht statt zehn?

- Stabile ID: `int-ch01-performance`
- Zugehörige Visualisierung: `fig-ch01-performance`
- Lektion: `ch01-l03`; Lernziele: `ch01-o04`, `ch01-o05`
- Quellen: `[S06, S08]`
- Umfang: M1

### Beobachtung

Eine Karte zeigt: **„Fiktives Protokoll: Früher zehn Wiederholungen, heute acht.“** Weitere Bedingungen gelten zunächst als unbekannt. Die Karte verändert sich beim Umschalten nicht.

Darunter drei unabhängig aufklappbare Erklärungsgruppen:

| Gruppe | Erläuterung | Passende Klärungsfrage |
|---|---|---|
| Aufgabe verändert? | Die Vergleichbarkeit wurde bisher nicht geklärt. | Waren Last und Ausführung vergleichbar? |
| Kurzfristiger Einfluss? | Eine kurzfristige Veränderung könnte die Tagesleistung betreffen. | War im Kontext etwas anders und zeigt sich das Muster erneut? |
| Längerfristige Veränderung? | Auch diese Erklärung lässt sich nicht allein aus dem Einzelwert bestätigen oder ausschließen. | Welche vergleichbaren Beobachtungen über einen längeren Zeitraum liegen vor? |

Jede geöffnete Gruppe trägt sichtbar **„Möglich, nicht bewiesen“**. Keine Gruppe erhält eine Wahrscheinlichkeit. Ein Umschalten rechnet keine körperlichen Vorgänge aus und verändert keine Trainingsvorgabe.

### Abschlussfrage

„Welche Information würdest du zuerst klären?“ Drei Vorschläge: Vergleichbarkeit der Aufgabe, Kontext, weitere Beobachtungen. Jede Wahl ist als begründbare Erkundungsrichtung zulässig. Rückmeldung jeweils: „Das kann bei der Einordnung helfen; eine eindeutige Ursache steht dadurch noch nicht fest.“ Freier Begründungssatz optional, nicht bewertet.

Es gibt ausdrücklich **keinen Knopf „Training heute geeignet?“**, keine Erholungsampel und keine Empfehlung zu Satzanzahl, Laufumfang oder Pausenlänge. Das Lernziel ist die Reichweite einer Beobachtung, nicht Trainingsberatung.

### Abnahmetests

Alle Gruppen unabhängig erreichbar und wieder schließbar. Das Ausgangsprotokoll bleibt unverändert. Kein bestimmter Erklärungsweg als bewiesen markiert. Keine numerischen Vorhersagen, keine Personal- oder Gesundheitsdaten erforderlich. Tastatur, Touch, Screenreadertext und reduzierte Bewegung wie bei I01 prüfen.

## Abgrenzung zur Lernerfolgsmessung

Interaktionen machen Unterscheidungen erfahrbar. Erst die separat gespeicherten Aufgaben und zeitversetzten Antworten fließen nach den Regeln aus Dokument 04 in die Lernanzeigen ein. Wer sich eine Erklärung aufgedeckt hat, hat damit noch keinen unabhängigen Abrufversuch erbracht.
