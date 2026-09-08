# Seitenbreite und enthaltene Komponenten

Historischer Prüfstand vom 6. September 2026. Die Layoutmaße wurden durch den
[kompakten Kompass-Aufbau](kompass-layout.md) ersetzt; die Prüfung auf überstehende
Komponenten bleibt erhalten.

Ausgangspunkt: `15a8a1b`. Nutzerbefund vom 6. September 2026: Aufgaben und
Fachgrafiken ragen links und rechts über die weiße Leseseite hinaus.

Die Ursache waren getrennte Maximalbreiten: 860 px für die Seite und 1060 px
für Karten. Viewportabhängige Kartenbreiten, 50-Prozent-Ränder und eine
Translation zentrierten diese außerhalb der Seite. Auch der Mobilstil enthielt
eine solche überbreite Regel. Die bisherige Prüfung auf Bildschirmüberlauf
erfasste diesen Fehler innerhalb des Bildschirms nicht.

Die Seitenfläche ist jetzt maximal 1100 px breit. Karten beziehen ihre Breite
auf deren Inhaltsfläche und erhalten gemeinsame Innenabstände; negative
Positionierung und viewportabhängige Kartenbreiten entfallen. Illustrationen
dürfen bis zu 900 px nutzen. Fließtext und Abschnittsüberschriften bleiben auf
einer gemeinsamen schmaleren Achse: 43,875 rem, bei Standardschriftgröße 702 px.
Das entspricht bei der verwendeten 18-px-Georgia ungefähr 78 `ch`; tatsächliche
Zeichenanzahlen hängen vom Text und der Schrift ab.

Die Änderung betrifft ausschließlich das Produktlayout. D0, Lehrtexte, Aufgaben,
Bilder, Inhaltsversion und gespeicherte Lerndaten bleiben unverändert.

## Prüfung

Die beiden gezielten Chrome-Tests bestanden: Karten, Illustrationen, Lesestatus,
geöffnetes/geschlossenes Feedback und sichtbare Bedienelemente liegen bei 1440,
1024, 768, 390 und 320 px innerhalb der Reader-Inhaltsfläche (1 px Messtoleranz).
Der vorhandene Test mit echtem 200-Prozent-Chrome-Seitenzoom prüft diese Grenzen
ebenfalls. Typecheck, Lint und Produktionsbuild bestanden.

| Viewport | Kartenbreite | Fließtextbreite |
|---:|---:|---:|
| 1440 px | 1020 px | 702 px |
| 1024 px | 912 px | 702 px |
| 768 px | 656 px | 656 px |
| 390 px | 336 px | 336 px |
| 320 px | 266 px | 266 px |

Die Seitenscrollbreite entsprach in allen fünf Fällen der Viewportbreite. In der
320-px-Sichtprüfung fiel zusätzlich ein überstehendes Bewertungsraster auf. Für
sehr schmale Ansichten wurden dessen Innenabstände reduziert und die fünf
Bewertungsspalten flexibel begrenzt. Die erneute Prüfung zeigte das Raster
vollständig innerhalb seiner Karte.

Der getrennte GPT-5.6-Sol-High-Reviewer prüfte Code und die fünf Bildschirmbreiten
einschließlich des geöffneten Feedbacks. Ergebnis nach der Korrektur: keine
offenen Layoutbefunde. Generierte Entwicklungsdateien wurden vor dem Commit
bereinigt; der Produktionsbuild ist erfolgreich.

Die Tests verwenden eine isolierte Datenbank und lokale Testdienste. Die laufende
Docker-Instanz wurde nicht verändert.
