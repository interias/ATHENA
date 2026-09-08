# Ausbau nach dem freigegebenen Pilotlayout

Stand: 8. September 2026. Ergebnis der Grilling-Runden Q1–Q10; Stefan hat alle
Empfehlungen bestätigt. Dieses Dokument legt den nächsten Ausbau fest.
Es dokumentiert die Planung, keine bereits umgesetzten oder freigeschalteten Inhalte.

## Bestätigte Entscheidungen

| Entscheidung | Vereinbarung |
|---|---|
| Lernziel | Training fachlich verstehen und Entscheidungen begründen; wissenschaftliche Tiefe dient diesem Ziel |
| Nächster Meilenstein | Kapitel 1 mit acht kurzen Einheiten abschließen |
| Erster Lieferumfang | Einheiten 2 und 3 plus die dafür notwendige technische Erweiterung |
| Zeit und Tiefe | Etwa fünf Minuten für Kernlektion samt Hauptaufgabe; Vertiefungen sind optional und benötigen zusätzliche Zeit |
| Aufgaben | Eine passende Hauptaufgabe je Einheit; Fallentscheidung, Zuordnung, Vorhersage und kurze Erklärung abwechslungsreich einsetzen |
| Wiederholung | Gelegentliche kurze Abruffragen zu früheren Lektionen und ein Kapiteltransfer; zunächst kein zeitgesteuerter Scheduler |
| Zugänglichkeit | Alle veröffentlichten Lektionen frei zugänglich, ohne Bestehenshürden |
| Vertiefungen | Keine Voraussetzung für die Hauptaufgabe und keine Pflicht für den Abschluss der Kernlektion |
| Bilder | Ein bis zwei generierte Illustrationen je neuer Lektion; erklärende Grafik oder Interaktion bei erkennbarem Lernnutzen; getrennter Review |
| Stil | Kompakter Kompass-Aufbau, ATHENA-Farben und trockener Humor bleiben; Schrift behutsam verkleinern |
| Weitere Themen | Nach Kapitel 1: Physiologie/Energiebereitstellung, Kraft/Hypertrophie, Ausdauer; benötigte Anatomie/Biomechanik passend einführen und später systematisieren |

„Gelesen“, „geübt“ und „später erinnert“ bleiben getrennte Aussagen. Eine gelöste
Aufgabe weist keine langfristige Erinnerung nach. Die Einführung der neuen
Lektionen setzt keinen Tutor, Prüfungskurs oder automatischen Trainingsplan voraus.

## Erstes Paket: Zielgrößen und Progression

Die [Aufteilung in acht Einheiten](ch01-five-minute-lessons.md) liefert die
inhaltlichen Grenzen. Einheit 1 bleibt die Voraussetzung im roten Faden und
wird nicht in jeder Folgelektions-Einleitung erneut erzählt.

1. **Technische Grundlage:** Die fest auf L1 und zwei Aufgaben begrenzten Loader,
   API-Freigaben und Webrouten auf explizit veröffentlichte Inhalte erweitern.
   Geplante Inhalte bleiben gesperrt. Navigation, Aufgaben und Grafiken werden
   aus den validierten Inhaltsdaten ausgewählt; fremdes Markdown bleibt Daten.
2. **Verlauf und Versionen:** Eine Änderung an L2 darf den unveränderten Lernstand
   von L1 nicht entwerten. Bestehende IDs und gespeicherte Antwortfassungen bleiben
   nachvollziehbar; Reihenfolge und Identität werden getrennt behandelt. Der
   bisherige globale Versionsgleichlauf muss dafür angepasst werden. Vor einer
   notwendigen Datenmigration werden Sicherung und Wiederherstellung geprüft.
3. **Einheit 2 – Anpassung braucht eine Zielgröße:** Ziel, Aufgabe und passende
   Beobachtung verbinden. Vorhandene Grundlage: erster Teil der bisherigen L2,
   Quellenzuordnung S04/S32. Hauptaufgabe: Krafttestergebnis und Muskelzuwachs
   als unterschiedliche Zielgrößen auseinanderhalten.
4. **Einheit 3 – Progression ohne Tagesrekord:** Veränderungen über Zeit beurteilen.
   Vorhandene Grundlage: zweiter Teil der bisherigen L2 und S04. Hauptaufgabe:
   eine Progressionsaussage begründet beurteilen. Ein kurzer Abruf greift L2 auf.
5. **Darstellung:** Optionale Vertiefungen klar absetzen und aufklappbar machen.
   Neue Illustrationen erhalten eigene Bildbriefings und dokumentierte Reviews.
   Die Schrift etwas verkleinern; konkrete Werte anhand von Desktop, Mobil und
   200-Prozent-Zoom bestimmen, bei weiterhin gut erreichbaren Bedienelementen.

Die Quellenzuordnungen sind Ausgangspunkte aus dem vorhandenen Material, keine
erneute Quellenprüfung. Vor dem Schreiben werden Aussagen und Belege geprüft;
neue fachliche Aussagen benötigen eigene Recherche. Fachliche Textänderungen
werden als Diff dokumentiert. Fiktive Fälle bleiben sichtbar gekennzeichnet.

## Arbeitsfolge und Abnahme

Technik und redaktionelle Vorbereitung können parallel erfolgen. Quellen- und
Lernzielprüfung gehen dem Schreiben voraus; freigegebene Bildbriefings gehen der
Bildgenerierung voraus. Integration folgt auf die jeweiligen Reviews.
Implementer und Reviewer arbeiten getrennt mit GPT-5.6 Sol High. Für neue Texte
und Bilder gilt ebenfalls der getrennte Ersteller-/Reviewer-Ablauf mit Korrektur
und erneuter Prüfung; Agentenreview ersetzt keine menschliche Fachfreigabe.

Das erste Paket ist zur Nutzung bereit, wenn:

- L1–L3 frei erreichbar und weitere geplante Einheiten weiterhin gesperrt sind;
- beide neuen Kernlektionen samt Hauptaufgabe ohne Vertiefung verständlich sind;
- Aufgaben erst nach dem Versuch Rückmeldungen beziehungsweise Lösungen zeigen;
- neue Inhalte bestehende Antworten, Lesestatus und Feedback nachvollziehbar erhalten;
- Quellen, Bildbewertungen und fachliche Diffs dokumentiert sind;
- Inhaltsvalidierung, passende API-/Persistenztests, Typecheck, Lint,
  Produktionsbuild und Browserprüfungen einschließlich Mobil/Tastatur/Zoom bestehen;
- Stefan beide Einheiten in der lokalen App auf Dichte, Verständlichkeit,
  Unterhaltung und tatsächlichen Zeitbedarf beurteilen kann.

Die Übergabe erfolgt als geprüfter Pull Request mit lokal betrachtbarer Vorschau.
Merge und Deployment werden als eigene Schritte behandelt. Die Fünf-Minuten-Angabe
bleibt bis zur tatsächlichen Nutzung ein Gestaltungsziel.

## Anschließende Pakete

Nach der Nutzung von L2/L3 folgen zusammenhängende Pakete: Tagesleistung und
Muskelkater (4/5), Beobachtung und Vergleichbarkeit (6/7), anschließend
Kapiteltransfer (8). Die konkrete Aufgabenzahl richtet sich nach den Lernzielen;
die alten Mengen von zwölf Kernaufgaben und acht Reviewkarten sind kein starres
Abnahmeziel für den neuen Zuschnitt.

Danach beginnt die Quellen- und Lektionsplanung für Physiologie und
Energiebereitstellung. Die Themen-IDs des bisherigen Curriculums bleiben vorerst
erhalten; die neue Veröffentlichungsreihenfolge erzwingt keine Umnummerierung.
Tutor, zeitgesteuerte Wiederholung und weitere Produktfunktionen sind spätere
eigenständige Entscheidungen und keine Voraussetzung für zusätzliche Kapitel.
