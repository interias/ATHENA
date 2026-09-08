# Illustrationen zur Pilotlektion

Drei zusätzliche Bildmotive für L1, am 6. September 2026 auf ausdrücklichen
Nutzerauftrag mit dem integrierten Imagegen-Werkzeug erzeugt. Die vollständigen
[Erzeugungsanweisungen](prompts.json), die [gezielte Korrektur](certificate-edit-prompt.txt)
und das [Dateimanifest](manifest.json) dokumentieren die Herkunft. Das konkrete
Modell wurde vom Werkzeug nicht genannt und bleibt deshalb `null`.

| Motiv | Produktdatei | Rolle |
|---|---|---|
| Trainingstagebuch als Orakel | [l1-oracle-v1.webp](../../../apps/web/public/images/lessons/l1-oracle-v1.webp) | Greift den ironischen Einstieg mit Notizbuch, Lorbeer und skeptischer Eule auf. |
| Römisches Trainingsstudio | [l1-training-studio-v1.webp](../../../apps/web/public/images/lessons/l1-training-studio-v1.webp) | Verbindet den fiktiven Lernraum mit modernen Trainingsgegenständen. |
| Kein automatisches Fortschrittszeugnis | [l1-no-certificate-v2.webp](../../../apps/web/public/images/lessons/l1-no-certificate-v2.webp) | Begleitet den Merksatz mit Laufschuh, leerem Blatt und streng blickender Eule. |

Alle drei Dateien haben 1536 × 1024 Pixel. Die PNG-Ausgaben wurden ohne Beschnitt,
Skalierung oder Montage als WebP mit Qualität 88 codiert. Zusammen benötigen die
ausgelieferten Dateien 967.592 Bytes. Die Anwendung lädt sie lokal und verzögert;
es gibt keinen Bilddienst zur Laufzeit.

Die Szenen sind fiktive redaktionelle Illustrationen. Sie sind weder historische
Rekonstruktionen noch Geräteanleitungen oder fachliche Messgrafiken. Die bereits
vorhandene interaktive Fachgrafik und ihre verdeckten Antworten bleiben getrennt.
Der kanonische Lehrtext und die Inhaltsversion `0.2.0` werden nicht verändert.

Beim dritten Erstentwurf wurden markenähnliche Seitenstreifen und ein logoartiges
Zungenemblem am Schuh beanstandet. Die gezielte Imagegen-Bearbeitung ersetzt diese
Details durch einen generischen Schuh. Der Erstentwurf wird nicht ausgeliefert;
sein Herkunftsdatensatz bleibt im Manifest als verworfen erhalten. Dies ist ein
sichtbarer Gestaltungsbefund, keine Aussage über einen Rechts- oder Lizenzstatus.

Bewertung und Nachprüfung durch einen getrennten GPT-5.6-Sol-High-Reviewer:
[Bildreview](../../../docs/reviews/l1-generated-illustrations.md).

## Zielgrößen und Progression

Für die beiden neuen Lektionen wurden am 8. September 2026 zwei weitere Szenen
mit dem integrierten Imagegen-Werkzeug erzeugt. Grundlage sind die getrennt
geprüften [Bildbriefings](l2-l3-briefs.md); die tatsächlich gesendeten
[Prompts](l2-l3-prompts.json) und das [Dateimanifest](l2-l3-manifest.json)
halten die Herkunft fest. Das Werkzeug nennt keinen konkreten Modellnamen.

| Motiv | Produktdatei | Rolle |
|---|---|---|
| Skeptische Eule im Messatelier | [l2-target-metric-v1.webp](../../../apps/web/public/images/lessons/l2-target-metric-v1.webp) | Dekorativer Einstieg in die Frage nach einer passenden Zielgröße. |
| Unbenutzter Rekordapparat | [l3-progression-v1.webp](../../../apps/web/public/images/lessons/l3-progression-v1.webp) | Trockene Pointe zur Erwartung eines Rekords bei jedem Besuch. |

Die Dateien haben je 1536 × 1024 Pixel und zusammen 573.502 Bytes. Die
PNG-Ausgaben wurden ausschließlich in WebP mit Qualität 88 umcodiert;
Bildausschnitt, Abmessungen und Motive wurden nicht nachbearbeitet. Die
Abbildung im Reader bleibt vollständig und lädt lokal. Die Szenen enthalten
keine Messdaten oder Aufgabenlösungen. Bildbewertungen und sichtbare
Abweichungen vom Briefing stehen im getrennten
[Agentenreview](../../../docs/reviews/l2-l3-generated-illustrations.md).

Die Dateinamen folgen der sichtbaren Lektionsreihenfolge: Die dritte Einheit
verwendet die neue Inhalts-ID `ch01-l05`, damit die ältere geplante
`ch01-l03` ihre Identität behält.
