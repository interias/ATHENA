# Technische Prüfung der Fünf-Minuten-Pilotlektion

Stand: 6. September 2026. Ausgangspunkt `c32c786`, Arbeitsbranch
`agent/l1-five-minute-pilot`.

## Verhalten und Versionswechsel

L1 verwendet die Inhaltsversion `0.2.0`, eine integrierte Fachgrafik und zwei
Aufgaben. Ein kompakterer Einstieg nennt ungefähr fünf Minuten einschließlich
Aufgaben. Pilotfeedback ist danach ausdrücklich optional aufklappbar.
Die übrigen Lektionen bleiben gesperrt.

Vorhandene Antworten, Selbstbewertungen und Pilotbewertungen bleiben an ihre
ursprüngliche Inhaltsversion gebunden. Ein identischer wiederholter Feedbackrequest
liefert auch nach dem Versionswechsel den gespeicherten Stand zurück. Veränderte
Wiederholungen und neue Einreichungen zu einer alten Version werden abgelehnt.
Der Lesestatus einer alten Version markiert die neue Lektion nicht als gelesen.
Die bestehenden Datenbankmigrationen bleiben unverändert.

## Design Lab

Die fünf benötigten Quelldateien der Fassung `0.1.0` sind bytegleich zu `c32c786`
unter `Design/content/baseline-0.1.0/` gesichert. Der Loader und die Herkunftspfade
der Schreibproben lesen diesen festen Stand. Texte und Quellenhashes der Proben
bleiben unverändert. Zehn Inhaltstests, Typecheck und Lint bestanden; für diese
Pfadumstellung wurde kein neuer D0-Browserlauf ausgeführt.

## Review

Der unabhängige API-Gesamtlauf bestand mit 81 von 81 Tests. Enthalten sind
Versionswechsel, gespeicherte Antwort- und Feedbackwiederholungen sowie der
getrennte Lesestatus. Es erschienen nur die zwei bereits bekannten
Deprecation-Warnungen. Der API-Diff hatte im Review keine offenen Befunde.

Web-Typecheck, Lint und Produktionsbuild bestanden ebenfalls.

Der vollständige Chrome-Browserlauf bestand mit 28 von 28 Tests in 36,4 Sekunden.
Er nutzte eine eigene SQLite-Datei und einen ausschließlich lokalen Testproxy:
Browser-Origin `127.0.0.1:3000` → Proxy `3218` → Test-Web `3217` → Test-API `8137`.
Der Proxy akzeptiert ausschließlich die lokalen Testhosts und verbindet nie mit
dem produktiven Port 3000. Die Produktionsregeln für Host und Origin bleiben
unverändert. Geprüft wurden Aufgaben, Antworten, Lesestatus, Feedback,
Fehlerwiederholung, Tastaturbedienung, Mobilansicht und 200-Prozent-Chrome-Zoom.

In der anschließenden Sichtprüfung wurden die längeren Aufgabenüberschriften
kleiner und linksbündig gesetzt und die mobile Ablaufanzeige auf drei kompakte
Spalten verkürzt. Danach bestanden der Produktionsbuild und die
gezielte Reflow-Nachprüfung für 390 Pixel, Zoom und reduzierte Bewegung (1/1).
Die aktualisierten Desktop-/Mobilaufnahmen und das geöffnete Feedback wurden
visuell geprüft; keine sichtbaren Überläufe oder abgeschnittenen Inhalte.

Schreiber und Implementierer: getrennte GPT-5.6-Sol-Agenten mit Reasoning High.
Der unabhängige Reviewer `review_6` prüfte Quellen, Aussagen und Darstellung.
Die korrigierten Inhaltsbefunde und die Nachprüfung stehen im
[Fachdiff](l1-five-minute-editorial.md). Agentenreview ist keine unabhängige
menschliche Fachfreigabe.

## Betriebsgrenze

Die bestehende Docker-Instanz `athena-m0-7` und ihr persönlicher Datenbestand
werden für diese Prüfung nicht verändert. Ein Deployment dieser Überarbeitung
ist nicht Bestandteil des aktuellen Auftrags.
