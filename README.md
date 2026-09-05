# Trainingswissen — das persönliche Sportwissenschaft-Lernstudio

**Planungs- und Contentpaket für Stefan · Version 0.1 · 5. September 2026**

Ein eigenständiges, deutschsprachiges Lernprojekt zu Krafttraining, Ausdauer und Ernährung. Ziel ist belastbares Verständnis mit möglicher späterer Trainerqualifikation — nicht die automatische Optimierung deines Trainingsplans.

## Was dieses Paket enthält

Eine recherchierte Lernarchitektur, einen roten Faden mit zwölf Kapiteln, vier ausgeschriebene Pilotlektionen, Aufgaben mit Musterantworten, Wiederholungsfragen, Bildbriefings, einen LLM-Tutor-Vertrag und umsetzbare Arbeitspakete für Next.js, FastAPI und Docker.

**Nicht enthalten:** eine bereits implementierte oder getestete Webanwendung, fertige Bilddateien, ein akkreditierter Lehrgang oder eine unabhängige sportwissenschaftliche Begutachtung. Die Bildbeschreibungen sind Produktionsvorlagen, keine bereits erzeugten Grafiken. Recherchegestützte Inhalte bleiben als Entwurf gekennzeichnet.

## Einstieg für dich

1. Lies [den roten Faden](docs/03_CURRICULUM.md) und die [Pilot-Lesefassung](PILOT_LESEFASSUNG.md).
2. Prüfe an Lektion 1 die gewünschte Texttiefe, Bilddichte und Tonalität. Nutze dafür [die Pilot-Auswertung](docs/11_PILOT_EVALUATION.md).
3. Übernimm dieses gesamte Verzeichnis in ein leeres Git-Repository und starte Codex mit [START_CODEX.md](START_CODEX.md). Der erste Auftrag baut **nur M0**, nicht den ganzen Kurs.

## Dokumentenkarte

| Frage | Datei |
|---|---|
| Was soll die Anwendung leisten? | [Produktbrief](docs/01_PRODUCT_BRIEF.md) |
| Welche Forschung und welche Lizenzrichtung? | [Recherche und Einordnung](docs/02_RESEARCH_AND_LICENSE.md) |
| Was lerne ich in welcher Reihenfolge? | [Curriculum](docs/03_CURRICULUM.md) |
| Wie bleiben die Inhalte hängen? | [Didaktik und Wiederholung](docs/04_DIDACTICS_AND_REVIEW.md) |
| Wie schreiben wir? | [Redaktionsstil](docs/05_EDITORIAL_STYLE.md) |
| Wie sehen Seiten und Bilder aus? | [Visuelles System](docs/06_VISUAL_SYSTEM.md) |
| Welche ATHENA-Designrichtungen testen wir? | [ATHENA-Stilrichtungen](docs/12_ATHENA_STYLE_DIRECTIONS.md) |
| Wie wird lokal gebaut? | [Architektur](docs/07_TECH_ARCHITECTURE.md) |
| Wie passen Content, Datenbank und API zusammen? | [Verträge](docs/08_CONTENT_AND_API_CONTRACT.md) |
| Wie funktioniert der Tutor? | [LLM-Konzept](docs/09_LLM_TUTOR.md) |
| Was wird zuerst implementiert? | [Umsetzungsplan](docs/10_IMPLEMENTATION_PLAN.md) |
| Wann ist der Pilot gut genug? | [Auswertung](docs/11_PILOT_EVALUATION.md) |
| Welche Quelle trägt welche Aussage? | [Quellen](research/SOURCES.md), [Aussagenzuordnung](research/CLAIM_MAP.md) |
| Wo ist der eigentliche Lernstoff? | [Kapitel 1](content/ch01/00_CHAPTER.md) |

## Entscheidungen in Version 0.1

- **Lernen vor Plattformbau:** Erst eine gute Lektion erleben, dann das Kapitel und erst danach den Tutor erweitern.
- **Inhalte vor KI:** Lehrtext, Aufgaben und Quellen liegen versioniert im Repository. Der Tutor erklärt sie; er schreibt den Lehrplan nicht unkontrolliert um.
- **Bilder mit Funktion:** Sechs fachliche Visualisierungen im vollständigen Pilot, davon zwei interaktiv. Eine zusätzliche Szenenillustration ist optional.
- **Stil zuerst erkunden:** Für ATHENA sind zehn griechisch-römisch inspirierte Stilrichtungen als Explorationsraum dokumentiert. Erst Kapitel 1 testen, dann festlegen.
- **Lokal ohne Pflicht-Cloud:** Lesen, Übungen und Fortschritt funktionieren nach Installation ohne externe Dienste. Cloud-LLM und Bildgenerierung sind optionale, gesondert aktivierte Vorgänge.
- **Kein Scheindiplom:** Die App kann auf Theorie vorbereiten, ersetzt aber weder einen offiziellen Ausbildungsanbieter noch praktische Anleitung und Prüfung.

## Status und Quellengebrauch

Quellenmarker wie `[S05]` verweisen auf das Quellenregister. Dort stehen URL, Publikationsjahr, geprüfter Zugriffsumfang und Verwendungsgrenzen. Die Recherche ist eine kuratierte Grundlage, **keine systematische Vollrecherche**. Spätere Fachkapitel benötigen ihre eigene Aktualisierung und Aussagenprüfung.

Die kanonischen Lerntexte liegen ausschließlich in `content/ch01/01_LOAD.md` bis `04_OBSERVATION.md`. `PILOT_LESEFASSUNG.md` ist daraus abgeleitet und darf nicht separat weitergepflegt werden.
