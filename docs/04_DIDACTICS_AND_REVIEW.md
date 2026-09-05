# 04 — Didaktik und nachhaltige Wiederholung

## Lernschleife

**Vermuten → verstehen → selbst erklären → anwenden → Feedback → später erneut abrufen.**

Abrufübungen und verteiltes Lernen bilden die wissenschaftliche Grundlage. Konkrete Oberflächenelemente, Intervalle und Bestehensschwellen sind unsere veränderbaren Produktentscheidungen, keine universellen Forschungsergebnisse. [S10–S12]

## Standardlektion

Eine alltagsnahe Einstiegsfrage, zwei bis drei Lernziele, ein kompakter Erklärungskern, ein bis zwei funktionale Visualisierungen, eine Aufgabe mit eigener Antwort und eine kurze Anwendung. Danach kann eine Vertiefung geöffnet werden.

Vor dem Aufdecken der Lösung eine Antwort versuchen. „Ich weiß es noch nicht“ bleibt ein vollwertiger Weg. Kein künstliches Warten, keine Beschämung, keine Pflichtstreaks.

**Drei Ebenen:** Kerntext für das Verstehen; Vertiefung für Mechanismen; Quellen für Prüfung und Unsicherheit. Der Quellenbereich ist jederzeit erreichbar, aber keine Pflichtlektüre für jede Sitzung.

## Aufgaben und Rückmeldung

Single-Choice dient der Unterscheidung typischer Denkfehler. Zuordnung prüft Begriffsgrenzen. Freitext und neue Fallvarianten prüfen, ob die Erklärung ohne die ursprüngliche Formulierung gelingt. Jeder Distraktor erhält eine inhaltliche Rückmeldung; „falsch“ allein genügt nicht.

Freitext wird im Pilot anhand einer sichtbaren Kriterienliste selbst bewertet. Das ist **Selbsteinschätzung**, keine objektive Diagnose des Wissens. Optionales LLM-Feedback darf später helfen, ist aber kein alleiniger Prüfer.

Vor der Lösung wird Zuversicht gespeichert: `unsicher`, `mittel`, `sicher`. Diese Angabe beeinflusst nicht automatisch die fachliche Richtigkeit. Besonders interessant sind sichere Fehlantworten.

## Fortschritt: drei getrennte Anzeigen

- **Gelesen:** Nutzer hat die Lektion als gelesen markiert.
- **Geübt:** Zugeordnete Kernaufgaben wurden bearbeitet; Fehler dürfen dabei vorkommen.
- **Verzögert erinnert:** Mindestens zwei erfolgreiche, nicht assistierte Abrufversuche zu einem Lernziel an verschiedenen Tagen, mindestens sieben volle Tage auseinander; mindestens ein Versuch ist eine freie Antwort oder neue Fallvariante.

Diese dritte Anzeige bedeutet nur „nach unserer Pilotregel gezeigt“, nicht „dauerhaft gemeistert“. Freitextbasierte Nachweise tragen den Zusatz „selbst bewertet“. Keine scheinpräzise Wissenswahrscheinlichkeit in Prozent.

## Wiederholungsplan für M1

Ein bewusst einfacher, austauschbarer Scheduler statt sofortiger komplexer Optimierung. Start mit acht Review-Karten aus der Aufgabenbank. Keine automatische Flut neuer Karten aus jedem Absatz.

Intervallfolge: **1, 3, 7, 14, 30 Tage**, jeweils vom Zeitpunkt des zuletzt gewerteten Versuchs an. Das sind Abstände, nicht kumulative Tage seit dem Erstlernen. Beispiel bei ausschließlich erfolgreichen Versuchen: Tag 0 → 1 → 4 → 11 → 25 → 55.

### Zustandsübergänge

`stage` beginnt bei -1. Nach der ersten erfolgreichen Bearbeitung wird stage 0 und der nächste Termin +1 Tag. Bei einer erfolgreichen fälligen Wiederholung steigt stage bis maximal 4; der neue Abstand ergibt sich aus dem neuen Index. Auf der höchsten Stufe weitere erfolgreiche Wiederholungen jeweils +30 Tage.

- `again`: falsch, nicht erinnert oder Lösung/Tutor vorher genutzt. Stage auf 0; nächster Termin +1 Tag. Ein unmittelbarer erneuter Versuch darf angeboten werden, zählt aber nicht als verzögerter Nachweis.
- `hard`: wesentliche Antwort vorhanden, aber nach eigener Prüfung noch unsicher/teilweise. Stage bleibt mindestens 0, nächster Termin +1 Tag. Kein erfolgreicher Nachweis.
- `good`: objektiv korrekt oder anhand aller Pflichtkriterien selbst bestätigt, ohne Hilfe. Nächste Stufe nach obiger Regel.

Eine als falsch bewertete Auswahlfrage darf vom Client nicht als `good` überschrieben werden. Für Freitext ist die Herkunft `self_assessment` zu speichern.

### Sonderfälle

Frühzeitiges Üben vor Fälligkeit wird gespeichert, erhöht aber nicht die Stufe und verschiebt den Termin nicht. Mehrere Browser-Tabs oder wiederholtes Senden derselben UUID erzeugen nur einen gewerteten Versuch. Ein geänderter Request unter derselben UUID wird abgelehnt.

Überfälligkeit löst keine Strafe und keinen globalen Reset aus. Nächster Abstand zählt ab tatsächlicher Bearbeitung. Ein optionales Tageslimit begrenzt die Anzeige, löscht jedoch keine fälligen Karten.

Bei wesentlicher Inhaltsänderung: betroffene Karten als `needs_revalidation` markieren und kurzfristig neu anbieten. Alte Versuche bleiben mit ihrer Inhaltsversion erhalten; kein stilles Umdeuten früherer Antworten.

## Zeit und Implementierung

Backend-Uhr ist maßgeblich. Alle Zeitstempel UTC und timezone-aware speichern. Ein Tag als Intervall bedeutet hier 24 Stunden. Oberfläche und Tagesgruppierung verwenden `Europe/Berlin`; Sommerzeit darf nicht zu doppelten Versuchen oder verlorenen Terminen führen.

Scheduler als reine Funktion mit injizierbarer Uhr implementieren. Keine Cronjobs nötig: Fälligkeit beim Öffnen der Review-Seite berechnen. Tests für Erstlernen, Fehler, höchste Stufe, verfrühtes Üben, Überfälligkeit, Doppelrequests und Sommerzeitwechsel schreiben.

## Lernexperiment mit einer Person

Nach dem ersten Kapitel beobachten: Was kann Stefan ohne Hilfe erklären? Welche Grafik wurde tatsächlich genutzt? Welche Begriffe bleiben unklar? Ein nach sieben Tagen bearbeiteter neuer Fall ist informativer für unser Ziel als allein die Zufriedenheit unmittelbar nach dem Lesen.

Keine Überlegenheitsbehauptung aus dem Pilot. Ein erneutes Bearbeiten derselben Frage kann Vertrautheit messen; deshalb neue Beispiele mit gleicher zugrunde liegender Kompetenz einsetzen.
