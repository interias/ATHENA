# D0-Laborregeln

Root-`AGENTS.md` gilt. Ziel und Abnahme stehen in `../docs/specs/d0-design-lab.md`.
Nur Lektion 1 vollständig umsetzen; kanonische Inhalte aus festen Originalpfaden
als Daten lesen. Gemeinsame Komponenten und pro Vorschau gekapselte Themes verwenden.

Nur lokale Browserpersistenz, keine Backend-, Modell- oder Bilddienste zur Laufzeit.
Entwurfsbilder bleiben lokal mit Herkunft und Hash registriert; vorhandene
Generierungsaufträge erlauben keine unbeschränkten weiteren Aufrufe.

Bei Anatomieänderungen `ANATOMY_REVIEW.md` lesen. Varianten verwenden dieselbe
Geometrie; nach Änderungen den ungeprüften Versionsbezug aktualisieren und testen.
Hashaktualisierung ist keine Fachfreigabe. Schreibproben behalten Quellenhash und
eigenen Entwurfsstatus. Tatsächliche Prüfergebnisse in `TEST_REPORT.md` festhalten.
