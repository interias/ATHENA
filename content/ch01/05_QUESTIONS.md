# Aufgabenbank — Kapitel 1

**Redaktionelle Vorlage mit Lösungen.** Im Lernstudio erst nach dem Antwortversuch zeigen. Alle konkreten Fälle sind fiktiv. Freitext wird anhand der Pflichtkriterien selbst bewertet; alternative korrekte Formulierungen sind zulässig. Leere `source_ids` markieren hier selbst konstruierte logische Aufgaben, nicht versteckte externe Belege.

Aktuell veröffentlicht sind q-ch01-01, q-ch01-02, q-ch01-04 und q-ch01-05.
Die übrigen Kernaufgaben, acht Reviewkarten und zwei Transferfälle bleiben geplant.
q03/q06/q08/q11 ergänzen später die direkt eingebetteten Aufgaben in einem
Kapitel-Übungsbereich.

```yaml
schema_version: '1.0'
chapter_id: ch01
content_version: 0.3.0
questions:
- id: q-ch01-01
  lesson_id: ch01-l01
  objective_ids:
  - ch01-o01
  kind: single_choice
  content_version: 0.2.0
  prompt: Zwei fiktive Radergometer-Einheiten stimmen in Dauer und eingestellter Leistung überein; Einheit B
    wird deutlich anstrengender erlebt.
    Welche Schlussfolgerung trennt die drei Ebenen am saubersten?
  options:
  - id: a
    text: Einheit B setzte wegen der höheren Beanspruchung sicher den stärkeren langfristigen Anpassungsreiz.
  - id: b
    text: Die protokollierten äußeren Merkmale stimmen überein, die innere Reaktion unterscheidet sich; Ursache
      und langfristige Anpassung bleiben offen.
  - id: c
    text: Die unterschiedliche Reaktion beweist, dass auch die gesamte äußere Belastung verschieden war.
  correct_option: b
  feedback_by_option:
    a: Eine stärkere akute Beanspruchung beweist keine bestimmte langfristige Anpassung.
    b: 'Richtig: Dokumentierte Aufgabe, beobachtete Reaktion und weitergehende Erklärung bleiben getrennt.'
    c: Die Reaktion zeigt keine vollständige Gleichheit, beweist aber auch nicht, welches äußere Merkmal verschieden
      gewesen sein müsste.
  source_ids:
  - S05
  - S06
  misconception: Eine unterschiedliche akute Reaktion wird unmittelbar zur äußeren Ursache oder langfristigen
    Anpassung erklärt.
- id: q-ch01-02
  lesson_id: ch01-l01
  objective_ids:
  - ch01-o01
  - ch01-o02
  kind: free_text
  content_version: 0.2.0
  prompt: 'Neuer fiktiver Fall: Bei zwei Krafttrainingseinheiten stehen dieselbe Übung, Last, Satz- und Wiederholungszahl
    im Protokoll. Die zweite Einheit wird deutlich anstrengender erlebt. Erkläre kurz, was dokumentiert ist,
    was beobachtet wurde und was offenbleibt.'
  rubric:
  - id: c1
    criterion: Die übereinstimmenden protokollierten Aufgabenmerkmale als begrenzten Ausschnitt benennen.
    required: true
  - id: c2
    criterion: Das unterschiedliche Anstrengungserleben als innere Reaktion getrennt benennen.
    required: true
  - id: c3
    criterion: Ursache und bestimmte langfristige Anpassung ausdrücklich offenlassen.
    required: true
  model_answer: Übung, Last, Sätze und Wiederholungen stimmen im Protokoll überein. Das Anstrengungserleben
    als innere Reaktion unterscheidet sich. Ursache und langfristige Anpassung lassen sich daraus nicht bestimmen.
  feedback: Prüfe, ob deine Antwort den dokumentierten Ausschnitt, die Reaktion und die offene Schlussfolgerung
    klar voneinander trennt.
  source_ids:
  - S05
  - S06
  misconception: Gleiche protokollierte Aufgabenmerkmale beweisen gleiche Beanspruchung oder denselben langfristigen
    Effekt.
- id: q-ch01-03
  lesson_id: ch01-l01
  objective_ids:
  - ch01-o01
  kind: matching
  content_version: 0.2.0
  prompt: Ordne die Angaben aus einem fiktiven Training zu.
  items:
  - id: a
    text: 60 Minuten Laufdauer
  - id: b
    text: 48 tatsächlich absolvierte Wiederholungen
  - id: c
    text: als sehr anstrengend erlebt
  - id: d
    text: erfasste Herzfrequenz während der Aufgabe
  categories:
  - id: external
    label: Äußere Aufgabe
  - id: internal
    label: Innere Reaktion
  correct_mapping:
    a: external
    b: external
    c: internal
    d: internal
  feedback: Dauer und Wiederholungen beschreiben die Aufgabe. Anstrengungserleben und Herzfrequenz beschreiben
    Reaktionen; keine dieser Angaben bildet allein alles ab.
  source_ids:
  - S05
  misconception: Nur objektive Zahlen können eine innere Reaktion beschreiben.
- id: q-ch01-04
  lesson_id: ch01-l02
  objective_ids:
  - ch01-o02
  - ch01-o03
  kind: single_choice
  content_version: 0.3.0
  prompt: 'Fiktiver Fall: Eine Person erzielt in einem festgelegten Krafttest einen höheren Wert und sagt:
    „Damit ist mein Muskelwachstum genau gemessen.“ Welche Beurteilung passt am besten?'
  options:
  - id: a
    text: Der Kraftwert zeigt direkt und genau, wie stark die Muskeln gewachsen sind.
  - id: b
    text: Das Krafttestergebnis ist besser; ob und wie stark Muskeln gewachsen sind, misst dieser Test nicht direkt.
  - id: c
    text: Der Kraftzuwachs beweist, dass ausschließlich die nervale Ansteuerung verändert wurde.
  correct_option: b
  feedback_by_option:
    a: Kraftleistung und Muskelgröße können zusammenhängen, sind aber verschiedene Zielgrößen.
    b: 'Richtig: Der Test beantwortet eine Kraftfrage; Muskelwachstum braucht eine dazu passende Beobachtung.'
    c: Auch diese eindeutige Aufteilung der Anpassungsbeiträge liefert der Krafttest nicht.
  source_ids:
  - S32
  - S35
  misconception: Ein besserer Kraftwert wird als direkte und eindeutige Messung einer biologischen Anpassung gelesen.
- id: q-ch01-05
  lesson_id: ch01-l05
  objective_ids:
  - ch01-o03
  kind: free_text
  content_version: 0.3.0
  prompt: 'Fiktiver Fall: Eine Trainingsanforderung wird über mehrere Wochen weiterentwickelt. Ein einzelner
    Testtag liegt unter dem vorherigen Wert. Beurteile in zwei bis drei Sätzen die Aussage: „Ohne Bestleistung
    an jedem Testtag gab es keine Progression.“'
  rubric:
  - id: c1
    criterion: Progression als zielbezogene Weiterentwicklung über Zeit statt als Pflichtrekord jeder Einheit einordnen.
    required: true
  - id: c2
    criterion: Den einzelnen Testwert von einem Verlauf trennen.
    required: true
  - id: c3
    criterion: Zielgröße, Vergleichbarkeit oder Messunsicherheit als offene Prüfbedingung nennen.
    required: true
  model_answer: Die Aussage ist zu stark, weil Progression die zielbezogene Weiterentwicklung über Zeit meint
    und keinen Rekord an jedem Testtag verlangt. Der einzelne niedrigere Wert beschreibt diesen Tag; für den
    Verlauf müsste ich die passende Zielgröße unter ausreichend vergleichbaren Bedingungen betrachten und
    Messunsicherheit mitdenken.
  feedback: Prüfe, ob du den einzelnen Testtag, die geplante Weiterentwicklung und die Aussage über den Verlauf
    getrennt hast. Eine persönliche Trainingsänderung ist nicht gefragt.
  source_ids:
  - S33
  - S36
  - S37
  misconception: Ein einzelner Tageswert wird mit dem gesamten Progressionsverlauf gleichgesetzt.
- id: q-ch01-06
  lesson_id: ch01-l02
  objective_ids:
  - ch01-o03
  kind: free_text
  content_version: 0.3.0
  prompt: Formuliere ein fiktives Trainingsziel, eine dazu passende Beobachtung und eine Bedingung für einen
    brauchbaren Vergleich.
  rubric:
  - id: c1
    criterion: Konkretes Ziel nennen.
    required: true
  - id: c2
    criterion: Beobachtung passt zum Ziel.
    required: true
  - id: c3
    criterion: Mindestens eine Vergleichsbedingung oder Messgrenze nennen.
    required: true
  model_answer: Ich möchte bei derselben Übung mehr Wiederholungen mit derselben Last schaffen. Dafür würde
    ich Wiederholungen bei möglichst vergleichbarer Ausführung und Aufgabe beobachten. Das wäre noch keine
    direkte Messung des Muskelwachstums.
  feedback: Es gibt mehrere gute Antworten. Entscheidend ist die Passung, nicht ein bestimmtes Gewicht oder
    eine bestimmte Laufzeit.
  source_ids:
  - S04
  - S32
  misconception: Jede steigende Kennzahl zeigt dasselbe Ziel an.
- id: q-ch01-07
  lesson_id: ch01-l03
  objective_ids:
  - ch01-o04
  - ch01-o05
  kind: single_choice
  content_version: 0.2.0
  prompt: Heute stehen acht statt zehn Wiederholungen im Protokoll. Welcher Satz ist am besten abgesichert?
  options:
  - id: a
    text: Ich habe langfristig Kraft verloren.
  - id: b
    text: Die beobachtete Leistung war niedriger; die Ursache ist noch offen.
  - id: c
    text: Ich bin sicher nur kurzfristig müde.
  correct_option: b
  feedback_by_option:
    a: Eine einzelne Beobachtung beweist keinen langfristigen Rückgang.
    b: 'Richtig: Du beschreibst, was du weißt, ohne eine Ursache zu erfinden.'
    c: Müdigkeit ist eine mögliche Erklärung, aber nicht automatisch bewiesen.
  source_ids:
  - S06
  - S08
  misconception: Eine beruhigende Erklärung ist automatisch eine belegte Erklärung.
- id: q-ch01-08
  lesson_id: ch01-l03
  objective_ids:
  - ch01-o05
  kind: single_choice
  content_version: 0.2.0
  prompt: Wie verwendest du Muskelkater in diesem Kapitel?
  options:
  - id: a
    text: Als direkte Messung des Muskelwachstums.
  - id: b
    text: Als Beweis, dass ohne ihn kein Wachstum stattfindet.
  - id: c
    text: Als Beobachtung, aus der Wachstum nicht unmittelbar abgelesen wird.
  correct_option: c
  feedback_by_option:
    a: Die Gleichsetzung ist nicht gerechtfertigt.
    b: Auch der Umkehrschluss ist nicht gerechtfertigt.
    c: Richtig. Die Forschung zu Schädigung und Anpassung stützt keine einfache Wachstumsanzeige; unser Umgang
      damit ist eine vorsichtige Ableitung.
  source_ids:
  - S07
  misconception: Muskelkater funktioniert als Wachstumszertifikat.
- id: q-ch01-09
  lesson_id: ch01-l03
  objective_ids:
  - ch01-o04
  - ch01-o05
  kind: free_text
  content_version: 0.2.0
  prompt: Ein fiktiver Trainingstag fällt schlechter aus. Nenne zwei Klärungsfragen und eine Schlussfolgerung,
    die du noch nicht ziehen würdest.
  rubric:
  - id: c1
    criterion: Nach Vergleichbarkeit der Aufgabe fragen.
    required: true
  - id: c2
    criterion: Nach Kontext oder Wiederholung des Musters fragen.
    required: true
  - id: c3
    criterion: Keine Diagnose oder eindeutige langfristige Veränderung behaupten.
    required: true
  model_answer: War die Aufgabe mit gleicher Last und Ausführung vergleichbar? Zeigt sich das Ergebnis mehrfach
    und war sonst etwas anders? Ich würde daraus noch keinen dauerhaften Kraftverlust und keine Diagnose ableiten.
  feedback: Fragen dienen hier der Einordnung. Sie sind keine automatisierte Checkliste für eine Trainingsfreigabe.
  source_ids:
  - S06
  - S08
  misconception: Eine kurze Checkliste kann eine medizinische Diagnose ersetzen.
- id: q-ch01-10
  lesson_id: ch01-l04
  objective_ids:
  - ch01-o06
  kind: single_choice
  content_version: 0.2.0
  prompt: Du änderst zwei Dinge gleichzeitig und beobachtest danach eine Verbesserung. Was ist die stärkste
    zulässige Aussage?
  options:
  - id: a
    text: Die erste Änderung war die Ursache.
  - id: b
    text: Es gab eine Verbesserung; die Einzelursachen sind durch diesen Vergleich nicht isoliert.
  - id: c
    text: Die zweite Änderung war nutzlos.
  correct_option: b
  feedback_by_option:
    a: Der Vergleich trennt die Einflüsse nicht.
    b: Richtig. Der Ablauf liefert eine Beobachtung, aber keine isolierten Beiträge.
    c: Auch das lässt sich aus diesen Angaben nicht folgern.
  source_ids: []
  misconception: Zeitliche Reihenfolge wird mit isolierter Kausalität verwechselt.
- id: q-ch01-11
  lesson_id: ch01-l04
  objective_ids:
  - ch01-o05
  - ch01-o06
  kind: matching
  content_version: 0.2.0
  prompt: Ordne die drei Aussagen nach ihrer Rolle.
  items:
  - id: a
    text: Heute wurden elf Wiederholungen notiert.
  - id: b
    text: Die andere Reihenfolge könnte beigetragen haben.
  - id: c
    text: Die Reihenfolge wird immer überlegen sein.
  categories:
  - id: observation
    label: Beobachtung
  - id: hypothesis
    label: Mögliche Erklärung
  - id: overclaim
    label: Zu starker Schluss
  correct_mapping:
    a: observation
    b: hypothesis
    c: overclaim
  feedback: Das Beispiel ist selbst konstruiert. Die Unterscheidung folgt aus der Reichweite der jeweiligen
    Aussage, nicht aus einer Studie über diese konkrete Reihenfolge.
  source_ids: []
  misconception: Hypothese und allgemeingültiger Schluss werden nicht unterschieden.
- id: q-ch01-12
  lesson_id: ch01-l04
  objective_ids:
  - ch01-o05
  - ch01-o06
  kind: free_text
  content_version: 0.2.0
  prompt: 'Verbessere den Satz: „Seit ich die Reihenfolge geändert habe, bin ich stärker. Also ist diese Reihenfolge
    immer besser.“'
  rubric:
  - id: c1
    criterion: Beobachtung neutral beschreiben.
    required: true
  - id: c2
    criterion: Kausale Erklärung als möglich statt bewiesen kennzeichnen.
    required: true
  - id: c3
    criterion: Vergleichsbedingung oder alternative Erklärung nennen.
    required: true
  model_answer: Seit der Änderung habe ich bei dieser Aufgabe bessere Ergebnisse notiert. Die Reihenfolge könnte
    ein Grund sein. Ich müsste prüfen, ob Aufgabe, Ausführung und weitere Bedingungen vergleichbar waren; allgemeine
    Überlegenheit ist damit nicht gezeigt.
  feedback: Eine gute Antwort bleibt nützlich und konkret. Sie muss nicht mit „Man weiß gar nichts“ enden.
  source_ids:
  - S33
  misconception: Aus begrenzten Beobachtungen folgt entweder Gewissheit oder vollständige Nutzlosigkeit.
review_cards:
- id: r-ch01-01
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o01
  prompt: Erkläre äußere Aufgabe und innere Reaktion mit einem neuen Beispiel.
  rubric:
  - id: c1
    criterion: Ein korrektes Aufgabenmerkmal.
    required: true
  - id: c2
    criterion: Eine davon verschiedene Reaktion.
    required: true
  model_answer: Zum Beispiel eine bestimmte Laufstrecke als Aufgabe und das dabei erlebte Anstrengungsniveau
    als Reaktion.
  source_ids:
  - S05
- id: r-ch01-02
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o01
  - ch01-o02
  prompt: Zwei Radtouren dauern gleich lang. Ist damit die Beanspruchung gleich? Begründe.
  rubric:
  - id: c1
    criterion: Gleiche Dauer reicht nicht für vollständige Aufgabengleichheit.
    required: true
  - id: c2
    criterion: Innere Reaktion muss getrennt betrachtet werden.
    required: true
  model_answer: Nein. Bereits weitere äußere Merkmale können abweichen; außerdem ist die individuelle Reaktion
    eine eigene Ebene.
  source_ids:
  - S05
  - S06
- id: r-ch01-03
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o03
  prompt: Warum ist „jede Einheit schwerer“ keine notwendige Definition von Progression?
  rubric:
  - id: c1
    criterion: Weiterentwicklung über die Zeit nennen.
    required: true
  - id: c2
    criterion: Zielbezug statt Pflichtrekord nennen.
    required: true
  model_answer: Der Kursbegriff bezieht sich auf zielbezogene Weiterentwicklung im Verlauf, nicht auf einen
    erzwungenen Rekord bei jeder Sitzung.
  source_ids:
  - S04
- id: r-ch01-04
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o02
  prompt: Warum misst ein besserer Krafttest nicht direkt den Muskelzuwachs?
  rubric:
  - id: c1
    criterion: Mehrere mögliche Anpassungsbeiträge nennen.
    required: true
  - id: c2
    criterion: Messwert und biologische Ursache trennen.
    required: true
  model_answer: Kraftentwicklung kann unter anderem morphologische und nervale Beiträge enthalten. Ein Test
    teilt diese Beiträge nicht automatisch auf.
  source_ids:
  - S32
- id: r-ch01-05
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o04
  prompt: Du erzielst heute einen niedrigeren Leistungswert. Welche zusätzliche Aussage wäre voreilig?
  rubric:
  - id: c1
    criterion: Beobachtung nennen.
    required: true
  - id: c2
    criterion: Eindeutige langfristige Ursache oder Diagnose zurückweisen.
    required: true
  model_answer: Ein schlechterer Tageswert ist beobachtet; dauerhafter Kapazitätsverlust oder „sicher nur Müdigkeit“
    sind damit nicht bewiesen.
  source_ids:
  - S06
  - S08
- id: r-ch01-06
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o05
  prompt: Warum nutzen wir Muskelkater nicht als Wachstumsanzeige?
  rubric:
  - id: c1
    criterion: Keine direkte Gleichsetzung von Muskelkater und Wachstum.
    required: true
  - id: c2
    criterion: Auch fehlenden Muskelkater nicht als Nutzlosigkeitsbeweis deuten.
    required: true
  model_answer: Muskelkater wird nicht als direkte Wachstumsmessung behandelt; weder sein Vorhandensein noch
    Fehlen beweist den längerfristigen Trainingseffekt.
  source_ids:
  - S07
- id: r-ch01-07
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o05
  prompt: Was würdest du für einen brauchbaren Vergleich zweier Übungsergebnisse möglichst gleich halten?
  rubric:
  - id: c1
    criterion: Mindestens zwei passende Vergleichsmerkmale nennen.
    required: true
  - id: c2
    criterion: Eine verbleibende Messgrenze nennen.
    required: true
  model_answer: Zum Beispiel Last und Ausführung; selbst dann können Tages- und Messschwankungen bestehen.
  source_ids:
  - S33
- id: r-ch01-08
  kind: free_text
  content_version: 0.2.0
  objective_ids:
  - ch01-o06
  prompt: Formuliere Beobachtung und mögliche Erklärung getrennt an einem neuen Fall.
  rubric:
  - id: c1
    criterion: Beobachtung ohne Ursachenzusatz.
    required: true
  - id: c2
    criterion: Hypothese ausdrücklich als Möglichkeit.
    required: true
  - id: c3
    criterion: Nicht isolierte Einflüsse oder offenen Prüfbedarf nennen.
    required: true
  model_answer: Die notierte Leistung stieg. Eine Änderung könnte dazu beigetragen haben. Andere Einflüsse
    sind durch diesen Vergleich noch nicht ausgeschlossen.
  source_ids: []
transfer_cases:
- id: t-ch01-01
  content_version: 0.2.0
  objective_ids:
  - ch01-o01
  - ch01-o04
  - ch01-o05
  - ch01-o06
  prompt: 'Fiktiver Fall: Eine regelmäßig laufende und krafttrainierende Person schafft beim Beintraining einmal
    weniger Wiederholungen. Am Vortag wurde gelaufen. Sie sagt: „Laufen verhindert meinen Muskelaufbau.“ Trenne
    Beobachtung und Schluss, nenne zwei Klärungsfragen und formuliere eine angemessen begrenzte Antwort.'
  rubric:
  - id: c1
    criterion: Einzelne niedrigere Leistung als Beobachtung nennen.
    required: true
  - id: c2
    criterion: Kurzfristige Leistung nicht mit gemessenem langfristigem Muskelwachstum gleichsetzen.
    required: true
  - id: c3
    criterion: Vergleichbarkeit und mindestens eine weitere Kontextfrage nennen.
    required: true
  - id: c4
    criterion: Weder pauschales Laufverbot noch garantierte Wirkungslosigkeit behaupten.
    required: true
  model_answer: Beobachtet wurde eine niedrigere Leistung nach einem Tag mit Lauftraining. Wie vergleichbar
    waren Aufgabe und Ausführung, und tritt das Muster wiederholt auf? Daraus allein folgt keine Aussage über
    den längerfristigen Muskelaufbau. Das Verhältnis von Kraft und Ausdauer braucht eine gesonderte, zielbezogene
    Betrachtung.
  source_ids:
  - S05
  - S06
  - S08
  boundary: Keine konkrete Veränderung des individuellen Trainingsplans erforderlich.
- id: t-ch01-02
  content_version: 0.2.0
  objective_ids:
  - ch01-o05
  - ch01-o06
  prompt: 'Fiktiver Fall: Eine Person beginnt gleichzeitig ein neues Getränk zu nutzen und ihr Training anders
    zu strukturieren. Vier Wochen später ist eine Leistung besser. Eine Werbung erklärt das Getränk zur eindeutigen
    Ursache. Welche Aussage ist durch diese Beobachtung gedeckt, welche nicht, und welcher Vergleich wäre informativer?'
  rubric:
  - id: c1
    criterion: Verbesserung als Beobachtung anerkennen.
    required: true
  - id: c2
    criterion: Gleichzeitige Änderungen verhindern isolierte Zuschreibung.
    required: true
  - id: c3
    criterion: Einen kontrollierteren Vergleich oder passende unabhängige Forschung vorschlagen, ohne Konsum
      zu empfehlen.
    required: true
  model_answer: Die Leistung verbesserte sich im beobachteten Zeitraum. Der isolierte Anteil des Getränks ist
    nicht bestimmt. Informativer wären geeignete unabhängige Untersuchungen mit einem passenden Vergleich und
    klarer Zielgröße. Der Fall fordert keinen Selbstversuch mit dem Produkt.
  source_ids: []
  boundary: Kein Ernährungs- oder Supplementrat; logische Beurteilung eines konstruierten Werbebeispiels.
```
