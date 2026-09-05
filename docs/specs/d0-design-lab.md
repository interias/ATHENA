# D0 – ATHENA Design Lab

Stand: 5. September 2026. Spezifikation des bestätigten D0-Auftrags.
D0 bleibt von M0–M3 getrennt. Der spätere Auftrag zur App-Ticketplanung ist als
[M0-Tickets #1–#7](https://github.com/interias/ATHENA/issues/1) veröffentlicht;
er erweitert diese Laborspezifikation nicht um Produktimplementierung.

## Problem Statement

Stefan möchte die Lernerfahrung mit echten Inhalten beurteilen, bevor eine
Produktplattform entsteht. Die ersten ruhigen Stilrichtungen reichen ihm als
Gesamtwirkung nicht: ATHENA soll lebhaft erzählen und kräftige römische Bildwelten
zeigen, dabei lesbar und fachlich nachvollziehbar bleiben. Besonders anatomische
Darstellungen dürfen gestalterische Qualität nicht mit nachgewiesener Richtigkeit
verwechseln. Verstreute Entscheidungen sollen eine gemeinsame Grundlage erhalten.

## Solution

Ein lokal startbares Design Lab verwendet ausschließlich die Pilotlektion als
vollständige Teststrecke. Galerie, Lektionslabor, Schreibproben, A/B-Vergleich und
Bildlabor erlauben unabhängige Entscheidungen zu Gestaltung, Sprache und Bildern.
Die bestätigte Arbeitsrichtung lautet **lebhafte Marmorbibliothek**; sie ist ein
Zielzustand, keine Behauptung einer bereits fertig umgestellten Oberfläche.

| Dimension | Bestätigter Zielzustand |
|---|---|
| Visueller Stil | Marmorbibliothek |
| Schreibstimme | Humorvoll-geschichtenerzählend |
| Leseform und Bildpräsentation | Reader, integriert |
| Mythologie | Dezent |
| Lesetypografie | 18 px, 65 Zeichen; mobil auf verfügbare Breite begrenzt |
| Anatomische Darstellung | Klarer Atlas; einfache, möglichst korrekte Darstellung |
| Atmosphäre | Domus · Pompejanisches Rot |
| Seitenhintergrund und Bildbühne | Weiß, große Bildbühne |
| Gesamtwirkung | Lebhaft, anschaulich, erzählerisch und mobil gut bedienbar |

„Spartacus: Blood & Sand“ dient als Referenz für Rot, dramatisches Licht, Bewegung
und Materialität in Bildern und Kapitelauftakten. Weiße, klare Leseflächen bleiben
ruhig; mythologische Figuren dezent. Die Referenz ist keine historische oder
anatomische Quelle und kein Auftrag für Gewaltmotive. Humor entsteht durch
lebhafte Einstiege, wiederkehrende sichtbar fiktive Figuren und Alltagsvergleiche;
Definitionen und fachliche Kernaussagen bleiben präzise.

## User Stories

1. Als Lernender möchte ich das Design Lab lokal ohne Anmeldung oder API-Key starten, damit ich unabhängig von Cloud-Diensten lesen kann.
2. Als Lernender möchte ich die vollständige Pilotlektion mit Originalquellen lesen, damit mein Vergleich auf echten Lerninhalten beruht.
3. Als Lernender möchte ich zehn Stile mit sichtbarem Bearbeitungsstatus sehen, damit ich vertiefte Prototypen von einfachen Presets unterscheiden kann.
4. Als Lernender möchte ich Marmorbibliothek, Gymnasion-Notebook und Bronze-Orakel über Typografie und Layout vergleichen, damit sich Lernatmosphären erkennbar unterscheiden.
5. Als Lernender möchte ich Schreibstimme und visuelle Gestaltung getrennt wechseln, damit ich ihre Wirkung gezielt beurteilen kann.
6. Als Lernender möchte ich vier Schreibproben derselben Passage vergleichen und künftig die bestätigte erzählerische Stimme erproben, damit Fachlichkeit und Humor zusammenpassen.
7. Als Lernender möchte ich kanonischen Lerntext und Schreibprobe unterscheiden, damit ein Entwurf nicht unbemerkt den Originaltext ersetzt.
8. Als Lernender möchte ich Bildpräsentation und anschließend Reader/Workbook bei sonst gleichen Einstellungen vergleichen, damit einzelne Unterschiede verständlich bleiben.
9. Als Lernender möchte ich Mythologie, Schriftgröße und Lesebreite unabhängig einstellen, damit Atmosphäre meine Lesbarkeit nicht bestimmt.
10. Als Lernender möchte ich die lebhafte Marmorbibliothek mit weißer Lesefläche und Pompeji-Atmosphäre erleben, damit die bestätigte Richtung konkret beurteilbar wird.
11. Als Lernender möchte ich Bildmotiv, Rahmen, Untergrund, Größe und Ausschnitt getrennt vergleichen, damit ich die passende Bildpräsentation finde.
12. Als Lernender möchte ich unterschiedliche römische Atmosphären und ihre Herkunft sehen, damit ich eine Bildwirkung bewusst auswähle.
13. Als Lernender möchte ich Anatomievarianten mit identischer Geometrie, klaren Legenden und sichtbaren Grenzen sehen, damit Gestaltung keine wechselnde Anatomie verdeckt.
14. Als Lernender möchte ich ein versioniertes Anatomie-Prüfpaket exportieren, damit die konkrete Darstellung nachvollziehbar geprüft werden kann.
15. Als Lernender möchte ich Aufgaben und Interaktionen erst beantworten und danach Lösungen aufdecken, damit ich selbst nachdenke statt vorab Antworten zu lesen.
16. Als Lernender möchte ich Quellen und den tatsächlichen Prüfstatus erkennen, damit ich Entwürfe nicht für fachlich freigegeben halte.
17. Als Lernender möchte ich Vergleichspaare per URL erneut öffnen sowie persönliche Bewertungen lokal speichern und exportieren, damit Entscheidungen nachvollziehbar bleiben.
18. Als Lernender möchte ich das Labor mobil, per Tastatur und im Fokusmodus nutzen sowie bei Speicherfehlern weiterarbeiten, damit die Exploration zugänglich bleibt.
19. Als Auftraggeber möchte ich neue Texte und Bilder von getrennten Ersteller- und Reviewer-Agenten bearbeiten lassen, damit Befunde dokumentiert, korrigiert und erneut geprüft werden.

## Implementation Decisions

- Eine gemeinsame Next.js-Anwendung mit TypeScript und App Router; normaler
  Entwicklungsserver auf Loopback-Port 3100. Gemeinsame Komponenten und gekapselte
  Themes statt unabhängiger Apps pro Stil. Abhängigkeiten sind per Lockfile fixiert.
- Kanonischer Inhalt wird als Daten aus festen Originalquellen geladen. Markdown
  führt kein MDX, HTML oder JavaScript aus; eine feste Registry löst die vorgesehenen
  zwei Fachgrafiken, die Interaktion und zwei Aufgaben auf.
  Beide Fachgrafiken bleiben in jeder Bildpräsentation verfügbar. Rückmeldungen
  sind deterministisch; Freitext nutzt Musterlösung und Selbstbewertung, keine
  automatische Benotung. Vor dem Antwortversuch verraten auch Alttexte und
  zugängliche Beschriftungen keine Lösung.
- Schreibproben bleiben separate Daten mit Herkunft, Originalhash und Entwurfsstatus.
  Vollständige Lehrfassungen werden nicht durch einen Stilwechsel umgeschrieben.
- Die ersten drei visuellen Stile bleiben „Vertiefter Prototyp“, die übrigen sieben
  „Erster Stilentwurf“. Die Arbeitsrichtung entfernt keine Vergleichsalternativen.
- Validierte Darstellungsparameter reproduzieren Ansichten per URL; Antworten und
  Notizen bleiben außerhalb der URL. Browserpersistenz ist versioniert, gezielt
  zurücksetzbar und erst nach Initialisierung schreibend aktiv. Vergleiche haben
  getrennte Antwortzustände. Bewertungen sind keine Lernstatistik.
- Einmalig beauftragte Bildgenerierungen liegen lokal mit Prompt und Datei-Hash vor;
  die Anwendung ruft weder Bilddienste noch Modelle auf. Atmosphärenbilder bleiben
  freie Interpretationen, generierte Schulterstudien bleiben Stilarchiv.
- Anatomische Stilvarianten teilen Geometrie und Beschriftungsziele. Quellen,
  Auslassungen, Version und Export-Hashes machen die Endfassung prüfbar. Eine
  Quellenangabe oder ein übereinstimmender Hash bestätigt keine Anatomie.
- Für neue oder überarbeitete Lerntexte, Skizzen, Zeichnungen und Bilder gilt ein
  getrennter Ersteller-/Reviewer-Ablauf: Quellen und Aussagen beziehungsweise
  sichtbare Strukturen prüfen, Befunde dokumentieren, korrigieren, erneut prüfen.
  Agentenreview ist für neue private Entwürfe verbindlich; Unsicherheiten bleiben
  sichtbar. Bestehende Entwürfe erhalten keinen rückwirkenden Prüfstatus.
- `expert_reviewed` setzt eine tatsächliche unabhängige menschliche Fachprüfung der
  konkreten Fassung voraus. Auch `editorial_approved` ersetzt diese nicht.

## Testing Decisions

Die Prüfgrenzen bleiben die vorhandenen Browserwege und gezielte Inhalts-/Herkunfts-
tests; keine zusätzliche Testschicht. Tests prüfen sichtbares Verhalten und
nachvollziehbare Artefakte, nicht interne Komponentenstrukturen.

- Browserprüfungen: vollständige Pilotlektion in allen Presets; kontrollierte
  A/B-Wechsel; Schreibproben, Quellen, Antwort vor Lösung und Reset; Fokusmodus,
  Tastatur, mobile Breite 390 px, vergrößerte Darstellung und reduzierte Bewegung.
- Zustand und Exporte: URL/Reload, unabhängige Vergleiche, lokale Bewertungen,
  echte JSON-/Markdown-Downloads, gezielter Reset und blockierter lokaler Speicher.
- Bildlabor und Anatomie: lokale Bilddateien, römische Vergleichspaare, erhaltene
  Geometrie beim Stilwechsel, Beschriftungen und tatsächlich exportierte SVGs.
- Datenprüfungen: Originaltext und Quellenmarker, Schreibprobenherkunft,
  Asset-Hashes, Anatomie-Versionsbezug und ehrliche Prüfstatus. Änderungen am
  geprüften Artefakt müssen einen veralteten Bezug erkennbar machen.
- Typecheck, Lint und Build ergänzen die bestehenden Tests. Externe Requests und
  Browserfehler werden im geprüften Laufzeitpfad überwacht. Anatomische Richtigkeit
  benötigt zusätzlich das dokumentierte Review; sie folgt nicht aus Softwaretests.

Dies definiert Anforderungen an Prüfungen, keine neuen Ausführungsergebnisse.
Der Prüfbericht dokumentiert tatsächliche Läufe und deren Grenzen getrennt.

## Out of Scope

M0–M3, FastAPI, Datenbank, Docker-Infrastruktur, Anmeldung, Cloud-Tutor,
Lernstandsmaschine, Trainingsimporte und weitere vollständige Lektionen oder
Kapitel. Keine laufzeitabhängige Bildgenerierung, bezahlten Aufrufe ohne gesonderte
Freigabe, Quellen-Downloads ohne Erlaubnis, automatischen Trainingsentscheidungen,
Lernwirksamkeitsbehauptungen oder fingierten Fachfreigaben. Kein Feedbackimport,
keine vollständige redaktionelle Kombinationsmatrix. Die Trackerpublikation war
nicht Teil des D0-Auftrags und wurde separat für die M0-Planung beauftragt.

## Further Notes

Begriffe: [CONTEXT](../../CONTEXT.md). Gründe und Abwägungen:
[lokales D0](../adr/0001-local-design-lab.md),
[kanonischer Inhalt](../adr/0002-canonical-content.md),
[Anatomie und Review](../adr/0003-anatomy-review.md).
Bedienung und Start: [Laborhandbuch](../../Design/README.md).
Tatsächlich ausgeführte Prüfungen: [Prüfbericht](../../Design/TEST_REPORT.md).

**Vorhanden:** eigenständig startbares Labor, vollständige Pilotlektion, zehn
visuelle Presets, vier abgegrenzte Schreibproben, Vergleich/Feedback, 15 generierte
Bildentwürfe (sechs Schulterstudien und neun Atmosphären) sowie eine gemeinsame
Schultergeometrie in drei Darstellungen mit Prüfpaket.

**Noch nicht umgesetzt:** die vollständige Zusammenführung der bestätigten
Arbeitsrichtung in der Oberfläche, insbesondere die humorvoll-geschichtenerzählende
Schreibprobe und die gemeinsame Inszenierung von weißer Lesefläche, Domus und
Atlas. Die vorhandene trocken-humorvolle Probe ist nicht diese neue Stimme.
Die Anatomiegrundlage bleibt ein quellenbasierter Entwurf ohne unabhängige
Fachfreigabe; Konturen, Proportionen und Projektion sind weiter zu prüfen.

Diese Konsolidierung verändert weder Anwendung noch kanonische Inhalte. Sie
ersetzt die verstreute D0-Entscheidungsnotiz als aktuelle Zielbeschreibung;
historische Startaufträge bleiben Herkunft. Weitere Umsetzung erfordert einen
entsprechenden Auftrag, M0 beginnt nicht automatisch.
