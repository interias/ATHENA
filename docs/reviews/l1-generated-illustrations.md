# Bewertung der generierten L1-Illustrationen

Stand: 6. September 2026. Ersteller: Host mit dem integrierten Imagegen-Werkzeug.
Getrennter Reviewer: `review_6`, GPT-5.6 Sol mit Reasoning High.
Dies sind subjektive Agentenbewertungen von 1 (schwach) bis 5 (sehr gut), keine
Messung von Lernwirksamkeit und keine unabhängige Fach- oder Lizenzfreigabe.

## Bildbewertung nach Korrektur

| Motiv | Sichtbare Struktur | Gestaltung | Verständlichkeit | Humor | Passung zur Lektion | Keine Spoiler oder ungestützten Fachbehauptungen |
|---|---:|---:|---:|---:|---:|---:|
| Trainingstagebuch als Orakel, v1 | 5 | 5 | 5 | 5 | 5 | 5 |
| Römisches Trainingsstudio, v1 | 4 | 5 | 5 | 3 | 5 | 5 |
| Kein automatisches Fortschrittszeugnis, v2 | 5 | 5 | 5 | 5 | 5 | 5 |

**Orakel:** Das leere Notizbuch auf einem überhöhten Podest, Lorbeer und skeptische
Eule machen den Witz unmittelbar erkennbar. Die Szene enthält keine Vorhersage,
Messdaten, Schrift oder Aufgabenlösung.

**Trainingsstudio:** Ergometer, Bank, Hanteln und Notizbuch ergeben einen klaren,
neutralen Trainingsraum. Sattel, Lenker, Stützen sowie Kurbel und sichtbares Pedal
sind in der illustrativen Perspektive plausibel; das zweite Pedal ist verdeckt.
Die Darstellung ist keine technische Geräteanleitung. Der Humor der kleinen
Eulenfigur bleibt bewusst subtil; dieses Bild dient vor allem der Atmosphäre.

**Fortschrittszeugnis:** Abgenutzter Laufschuh, leeres Blatt, unbenutzter Stempel
und streng blickende Eule begleiten die Pointe. Das Blatt bleibt unbeschriftet;
eine automatische Fortschrittsbescheinigung wird nicht dargestellt.

## Befund und Korrekturschleife

Beim ersten Schuhmotiv beanstandeten Ersteller und Reviewer die markenähnlichen
gekreuzten Seitenstreifen und ein logoartiges Zungenemblem. Der Erstentwurf erhielt
deshalb keine Freigabe. Eine gezielte Imagegen-Bearbeitung ersetzte ausschließlich
diese Gestaltung durch einen generischen Schuh. Die Nachprüfung von v2 fand keine
verbleibenden Bildbefunde. Alle drei finalen Dateien wurden einzeln visuell sowie
auf Maße, Dateigröße und SHA-256 gegen das Manifest geprüft.

## Herkunft und Einbindung

[Dateien, Prompts und Manifest](../../assets/ch01/illustrations/README.md).
Die drei WebP-Dateien werden lokal und verzögert geladen. Das Bildformat 3:2
bleibt vollständig sichtbar; kurze deutsche Captions kennzeichnen die Szenen
als fiktive Illustrationen. Leere Alttexte behandeln sie als ergänzende Dekoration,
während die sichtbaren Captions auch für Screenreader verfügbar bleiben.
Der Lehrtext enthält weiterhin alle erforderlichen Aussagen ohne die Bilder.

## Prüfung der Integration

Typecheck, Lint und Produktionsbuild bestanden. Die gezielten Chrome-Tests für Reader/Assets und
Reflow bestanden mit 2 von 2 Tests. Bei 390 Pixel Viewportbreite betrug die
Seitenbreite ebenfalls 390 Pixel; alle Bildflächen waren 336 Pixel breit.
Die getrennte Sichtprüfung der Desktop-/Mobilgesamtansichten und aller sechs
Einzelansichten fand keine abgeschnittenen Motive, Überläufe oder offenen Befunde.
Ein anfänglicher Anschnitt einer Caption war ein Element-Screenshotartefakt;
Live-DOM, normaler Viewport-Ausschnitt und erneuter Screenshot zeigten sie vollständig.

Das neue Material ergänzt ausschließlich die Präsentation der Pilotlektion.
Lehrtext, Quellenmarker, Aufgaben, Inhaltsversion und Persistenz bleiben unverändert.
Das Fünf-Minuten-Ziel bleibt eine Pilotannahme; zusätzliche Bilder belegen keine
verbesserte Lernwirkung. Die laufende Docker-Instanz wird nicht aktualisiert.
