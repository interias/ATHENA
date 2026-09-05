# Schulterzeichnung: Prüfgrundlage

Status: **quellenbasierter, schematischer Entwurf; unabhängige Fachprüfung offen**.
Die gemeinsame SVG-Geometrie ist keine validierte anatomische Vorlage. Diese
Checkliste dokumentiert Anforderungen, keine bereits bestandene Fachprüfung.
Die bisherigen sechs generierten Schulterbilder bleiben ausschließlich Stilarchiv.

## Bildaufgabe und Quellen

Rechte Schulter in leicht schräger Rückansicht: Schulterblatt und proximaler Oberarmknochen, ohne
Weichteile. Keine Bewegung, Belastung oder Erkrankung erklären. Textquellen am
5. September 2026 gelesen; keine externen Abbildungen heruntergeladen, kopiert oder
nachgezeichnet. Quellenbezug bedeutet keine Freigabe der konkreten Zeichnung.

| Referenz | Für diese Zeichnung relevante Aussagen |
|---|---|
| [OpenStax, Anatomy and Physiology 2e, 8.1 The Pectoral Girdle](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-1-the-pectoral-girdle) | Dreieckiges Schulterblatt; Spina auf der Rückseite mit lateralem Übergang ins Acromion. Schmale Fossa supraspinata oberhalb, breite Fossa infraspinata unterhalb. Flache Gelenkpfanne am oberen lateralen Winkel. |
| [OpenStax, 8.2 Bones of the Upper Limb](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb) | Proximaler Humeruskopf zeigt medial zur Gelenkpfanne. Tuberculum majus liegt lateral, Tuberculum minus anterior; keine Vorderseitenmerkmale unmarkiert auf die Rückseite übertragen. |
| [OpenStax, 9.6 Anatomy of Selected Synovial Joints, Shoulder Joint](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) | Das Glenohumeralgelenk entsteht zwischen Humeruskopf und Glenoid. Die Pfanne ist relativ klein und flach; keine tiefe knöcherne Umschließung wie an der Hüfte darstellen. Kapsel und Rotatorenmanschette tragen zur Stabilisierung bei, sind hier aber weggelassen. |

## Darstellungskonventionen

Grundlage: `content/shoulder-geometry.json`, Version `0.1.0`. Konturen und
Proportionen sind schematisch und nicht maßstäblich; ihre anatomische Plausibilität
ist noch nicht unabhängig geprüft.

Als Konstruktionsvorgabe aus der gewählten Ansicht: oben = kranial, unten = kaudal;
medial im Bild links, lateral rechts. Seitenangabe und Blickrichtung müssen im
Bild stehen. Eine schräge Ansicht ausdrücklich so benennen.

Das Glenoid wird als schmaler, lateral gerichteter Rand, nicht als frontale
Vollfläche angelegt. Die räumliche Projektion bleibt fachlich zu prüfen: Es darf in einer
strengen Rückansicht nicht wie eine frontal freigelegte Gelenkfläche erscheinen.
Nur den sichtbaren Bereich zeigen; bei einer erklärenden Freilegung diese nennen.
Das Acromion nicht als Gelenkpfanne für den Humeruskopf zeichnen. Ein didaktisch
vergrößerter Abstand braucht einen Hinweis; er ist kein maßstäblicher Gelenkspalt.

Bewusst ausgelassen: Schlüsselbein, Rippen, Wirbelsäule, Coracoid, Muskeln,
Sehnen, Bänder, Labrum, Knorpel, Schleimbeutel, Gefäße und Nerven. Der Humerus ist
nur ausschnittweise dargestellt. Keine Muskelansätze oder Gelenkstabilität aus
diesem reduzierten Bild lernen. Weggelassene Strukturen nicht als fehlende Anatomie
eines vollständigen Präparats missverstehen lassen.

## Abnahme der konkreten Endfassung

Eine unabhängige, anatomisch qualifizierte Person prüft:

- [ ] Rechte Seite und Rückansicht stimmen mit Konturen und Überlagerungen überein.
- [ ] Scapularänder, Spina und ihr Übergang zum Acromion sind plausibel.
- [ ] Lage, Orientierung und sichtbarer Anteil von Glenoid und Humeruskopf passen.
- [ ] Konturen suggerieren weder Verschmelzung noch Luxation oder falsches Gelenk.
- [ ] Vereinfachung, Proportionen und Ausschnitt erfüllen die begrenzte Bildaufgabe.
- [ ] Jede Beschriftung und Hinweislinie trifft die richtige sichtbare Struktur.
- [ ] Alle Auslassungen und Darstellungsgrenzen sind verständlich angegeben.
- [ ] Jede Stilfassung erhält die Geometrie und macht dieselben Strukturen erkennbar.

Prüfprotokoll je Endfassung: Bild-ID, Versionsnummer, SHA-256 der Geometrie und
Beschriftungsdaten, SHA-256 des geprüften Exports, Stilvariante, Name und Qualifikation
der prüfenden Person, Datum, Befund und offene Korrekturen. Diese Felder bleiben bis
zur tatsächlichen Prüfung leer; Codex setzt niemals selbst `expert_reviewed`.

Änderungen an Geometrie, Projektion, Beschriftung oder Pfeilzielen erfordern eine
neue Fachprüfung. Änderungen an Kontrast, Strichstärke oder Rahmung benötigen eine
erneute Sichtprüfung, weil auch unveränderte Geometrie verdeckt werden kann.
Automatische Hash- und Regressionstests belegen Übereinstimmung, keine anatomische
Richtigkeit. Vor unabhängiger Abnahme bleibt der Entwurf außerhalb der kanonischen
Lektion und sichtbar ungeprüft.
