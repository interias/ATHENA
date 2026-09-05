"use client";

import { useEffect, useState } from "react";
import AnatomyStudy from "./AnatomyStudy";
import { presets } from "../lib/presets";
import { imageAssets, imageDefaults, imageStorageKey, imageStateUrl, readImageUrl, validateImageState, validateImageFeedback, imageFeedbackMarkdown, type ImageAsset, type ImagePanel, type ImageState, type ImageFeedback } from "../lib/image-config";
import "../styles/image-lab.css";

function AssetImage({ asset, thumbnail = false, panel }: { asset?: ImageAsset; thumbnail?: boolean; panel?: ImagePanel }) {
  const [failed, setFailed] = useState(false);
  if (!asset?.src || failed) return <div className="image-unavailable">Bild derzeit nicht verfügbar. Der Entwurf bleibt über seine Metadaten nachvollziehbar.</div>;
  // Local files are deliberately shown without a transformation service.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={asset.src} alt={asset.alt} width={asset.width || undefined} height={asset.height || undefined} loading={thumbnail ? "lazy" : "eager"} onError={() => setFailed(true)} style={panel?.presentation === "detail" ? { transform: `scale(${Number(panel.zoom) / 100})`, transformOrigin: panel.position === "top" ? "50% 0%" : panel.position === "bottom" ? "50% 100%" : "50% 50%" } : undefined} />;
}

function Panel({ id, config, update, active }: { id: "a" | "b"; config: ImagePanel; update: (patch: Partial<ImagePanel>) => void; active: boolean }) {
  const asset = imageAssets.find(image => image.id === config.image);
  return <section className="image-compare-panel" data-active={active} aria-label={`Bildvariante ${id.toUpperCase()}`}>
    <div className="image-panel-title"><span>{id.toUpperCase()}</span><h2>{asset?.title || "Bildentwurf"}</h2></div>
    <div className="image-panel-controls">
      <label>Bild {id.toUpperCase()}<select value={config.image} onChange={event => update({ image: event.target.value })}>{imageAssets.map(image => <option key={image.id} value={image.id}>{image.title}</option>)}</select></label>
      <label>Rahmendesign {id.toUpperCase()}<select value={config.theme} onChange={event => update({ theme: event.target.value })}>{presets.map(preset => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
      <label>Ansicht {id.toUpperCase()}<select value={config.presentation} onChange={event => update({ presentation: event.target.value as ImagePanel["presentation"] })}><option value="full">Ganzes Bild</option><option value="detail">Detailausschnitt</option></select></label>
      <label>Bilduntergrund {id.toUpperCase()}<select value={config.backdrop} onChange={event => update({ backdrop: event.target.value as ImagePanel["backdrop"] })}><option value="paper">Warmes Papier</option><option value="light">Weiß</option><option value="dark">Dunkler Stein</option></select></label>
      <label>Bildgröße {id.toUpperCase()}<select value={config.size} onChange={event => update({ size: event.target.value as ImagePanel["size"] })}><option value="large">Große Bildbühne</option><option value="compact">Kompakte Abbildung</option></select></label>
      <label>Bildtext {id.toUpperCase()}<select value={config.caption} onChange={event => update({ caption: event.target.value as ImagePanel["caption"] })}><option value="expanded">Mit Entwurfsbeschreibung</option><option value="short">Nur Titel und Status</option></select></label>
      {config.presentation === "detail" && <><label>Vergrößerung {id.toUpperCase()}<select value={config.zoom} onChange={event => update({ zoom: event.target.value as ImagePanel["zoom"] })}><option value="100">100 %</option><option value="150">150 %</option><option value="200">200 %</option></select></label><label>Ausschnittposition {id.toUpperCase()}<select value={config.position} onChange={event => update({ position: event.target.value as ImagePanel["position"] })}><option value="top">Oben</option><option value="center">Mitte</option><option value="bottom">Unten</option></select></label></>}
    </div>
    <figure className="theme image-preview" data-style={config.theme} data-size={config.size}>
      <div className="image-stage" data-backdrop={config.backdrop} data-presentation={config.presentation}><AssetImage key={asset?.id} asset={asset} panel={config} /></div>
      <figcaption><span className="draft-badge">{asset?.status === "generated_unreviewed" ? "KI-generierter · ungeprüfter Bildentwurf" : "Bildentwurf · Generierung ausstehend"}</span><h3>{asset?.title}</h3>{config.caption === "expanded" && <p>{asset?.description}</p>}{config.presentation === "detail" && <p className="image-crop-note">Ausschnitt · {config.zoom} % · Teile des Bildes sind ausgeblendet.</p>}</figcaption>
    </figure>
    <details className="image-metadata"><summary>Herkunft und Generierungsauftrag {id.toUpperCase()}</summary>{asset && <><dl><dt>Verwendung</dt><dd>{asset.category === "anatomy" ? "Anatomischer Gestaltungsversuch, keine Lehrreferenz" : "Fiktive Atmosphäre, keine historische Rekonstruktion"}</dd><dt>Asset-ID</dt><dd>{asset.id}</dd><dt>Erzeugt</dt><dd>{asset.generatedAt || "Noch nicht erzeugt"}</dd><dt>Modell</dt><dd>{asset.model || "Vom Werkzeug nicht ausgewiesen"}</dd><dt>Datei</dt><dd>{asset.width} × {asset.height} px</dd><dt>SHA-256</dt><dd>{asset.sha256 || "Noch kein Datei-Hash"}</dd><dt>Status</dt><dd>{asset.status}</dd></dl><p className="image-prompt">{asset.prompt}</p></>}</details>
  </section>;
}

export default function ImageLab() {
  const [state, setState] = useState<ImageState>(imageDefaults);
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [entries, setEntries] = useState<ImageFeedback[]>([]);
  const [note, setNote] = useState("");
  const [favorite, setFavorite] = useState<"a" | "b" | "none">("none");
  const [mobile, setMobile] = useState<"a" | "b">("a");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(imageStorageKey) || "null");
      if (stored) {
        setState(validateImageState(stored.state));
        setFavorites(Array.isArray(stored.favorites) ? stored.favorites.filter((id: unknown) => typeof id === "string" && imageAssets.some(asset => asset.id === id)) : []);
        setEntries(validateImageFeedback(stored.entries));
        if (typeof stored.note === "string") setNote(stored.note);
        if (["a", "b", "none"].includes(stored.favorite)) setFavorite(stored.favorite);
      }
    } catch { setStorageError(true); }
    if (Array.from(new URLSearchParams(window.location.search).keys()).some(key => key.startsWith("img."))) setState(readImageUrl(window.location.search));
    setReady(true);
    const onPop = () => setState(readImageUrl(window.location.search));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(imageStorageKey, JSON.stringify({ state, favorites, entries, note, favorite })); setStorageError(false); } catch { setStorageError(true); }
    window.history.replaceState(null, "", imageStateUrl(state, window.location.search) + window.location.hash);
  }, [state, favorites, entries, note, favorite, ready]);
  function patch(panel: "a" | "b", values: Partial<ImagePanel>) { setState(current => ({ ...current, [panel]: { ...current[panel], ...values } })); }
  function compareRoman(a: string, b: string) {
    setState(current => ({ ...current, filter: "roman", a: { ...current.a, image: a }, b: { ...current.a, image: b } }));
    setMobile("a");
    document.getElementById("image-comparison")?.scrollIntoView({ block: "start" });
  }
  function saveFeedback() {
    setEntries(current => [...current, { id: crypto.randomUUID(), timestamp: new Date().toISOString(), state, note, favorite, assets: [state.a, state.b].map(panel => { const asset = imageAssets.find(item => item.id === panel.image); return { id: panel.image, sha256: asset?.sha256 || "" }; }) }]);
    setMessage("Vergleich als persönliche Designbewertung erfasst.");
  }
  function download(format: "json" | "md") {
    const payload = { exportedAt: new Date().toISOString(), status: "generated_unreviewed", state, assets: [state.a, state.b].map(panel => ({ id: panel.image, sha256: imageAssets.find(asset => asset.id === panel.image)?.sha256 })), favorites: favorites.map(id => ({ id, sha256: imageAssets.find(asset => asset.id === id)?.sha256 })), draft: { note, favorite }, entries };
    const content = format === "json" ? JSON.stringify(payload, null, 2) : imageFeedbackMarkdown(entries) + `\n## Aktuelle Auswahl\n\n\`\`\`json\n${JSON.stringify({ state, assets: payload.assets, favorites: payload.favorites, draft: payload.draft }, null, 2)}\n\`\`\`\n`;
    const url = URL.createObjectURL(new Blob([content], { type: format === "json" ? "application/json" : "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `athena-bildlabor.${format}`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filtered = imageAssets.filter(asset => state.filter === "all" || (state.filter === "favorites" ? favorites.includes(asset.id) : state.filter === "roman" ? asset.collection === "roman" : asset.category === state.filter));
  return <div className="image-lab">
    <header className="intro"><p className="eyebrow">Exploration D · Bildsprache</p><h1>Ein Motiv. Viele Arten, es zu sehen.</h1><p>Vergleiche anatomische Details und imaginierte Lernorte. Bildsprache, Rahmendesign, Ausschnitt und Größe lassen sich getrennt verändern.</p></header>
    <AnatomyStudy />
    <section className="image-roman-collection" aria-label="Römische Atmosphären">
      <div className="image-roman-intro"><p className="eyebrow">Neue Sammlung · sechs römische Bildwelten</p><h2>Mehr Rom. Mehr Spannung.</h2><p>Pompejanische Farbe, monumentale Räume, Körper in Bewegung und leuchtende Mosaike. Sechs fiktive Bildstudien statt einer einzigen Vorstellung von Antike.</p><button onClick={() => { setState(current => ({ ...current, filter: "roman" })); document.getElementById("image-gallery")?.scrollIntoView({ block: "start" }); }}>Römische Sammlung ansehen</button></div>
      <div className="image-roman-pairs"><p>Direkt vergleichen · A und B übernehmen dieselbe Rahmung und Ansicht.</p><button onClick={() => compareRoman("scene-pompeii", "scene-thermae")}><strong>Fresko & Thermen</strong><small>Satte Wandfarbe trifft weiten, lichtdurchfluteten Raum</small></button><button onClick={() => compareRoman("scene-oculus", "scene-forum-night")}><strong>Oculus & nächtliches Forum</strong><small>Gebündeltes Tageslicht trifft dramatische Nacht</small></button><button onClick={() => compareRoman("scene-palaestra", "scene-mosaic")}><strong>Palästra & Mosaik</strong><small>Bewegung im Raum trifft grafischen Rhythmus</small></button></div>
    </section>
    <aside className="image-editorial-note"><strong>Eigenständige Bildstudien · kein neuer Lektionsstoff</strong><p>Alle Bilder sind generierte, fachlich ungeprüfte Entwürfe. Anatomische Proportionen, Lagebeziehungen und Strukturen können fehlerhaft sein. Die Motive dienen der Gestaltungswahl; die Originallektion und ihre Fachgrafiken bleiben davon getrennt.</p></aside>
    <div className="image-rounds"><button onClick={() => setState(current => ({ ...current, a: { ...current.a, image: "shoulder-atlas" }, b: { ...current.a, image: "shoulder-graphite" } }))}><strong>1 · Bildsprache</strong><small>Gleiche Rahmung, zwei Interpretationen</small></button><button onClick={() => setState(current => ({ ...current, b: { ...current.a, presentation: current.a.presentation === "full" ? "detail" : "full" } }))}><strong>2 · Ausschnitt</strong><small>Dasselbe Bild, ganz oder im Detail</small></button><button onClick={() => setState(current => ({ ...current, b: { ...current.a, size: current.a.size === "large" ? "compact" : "large" } }))}><strong>3 · Bildgewicht</strong><small>Dasselbe Bild, groß oder kompakt</small></button></div>
    <section id="image-gallery" aria-label="Bildgalerie"><div className="image-gallery-heading"><h2>Bildsammlung <span>{imageAssets.length} Entwürfe</span></h2><label>Bildsammlung filtern<select value={state.filter} onChange={event => setState(current => ({ ...current, filter: event.target.value as ImageState["filter"] }))}><option value="all">Alle Motive</option><option value="anatomy">Anatomische Details · Stilarchiv</option><option value="atmosphere">Lernatmosphären</option><option value="roman">Römische Atmosphären · neu</option><option value="favorites">Meine Favoriten</option></select></label></div>
      <div className="image-gallery">{filtered.map(asset => <article className="image-card" key={asset.id}><div className="image-thumbnail"><AssetImage key={asset.id} asset={asset} thumbnail /></div><div className="image-card-body"><p className="eyebrow">{asset.collection === "roman" ? "Römische Atmosphäre · fiktiver Entwurf" : asset.category === "anatomy" ? "Stilarchiv · keine Lehrreferenz" : "Fiktive Lernatmosphäre"}</p><h3>{asset.title}</h3><p>{asset.style}</p><div className="image-card-actions"><button onClick={() => { patch("a", { image: asset.id }); setMobile("a"); }} aria-label={`${asset.title} als Bild A`}>Als A</button><button onClick={() => { patch("b", { image: asset.id }); setMobile("b"); }} aria-label={`${asset.title} als Bild B`}>Als B</button><button aria-label={`${asset.title} als Favorit markieren`} aria-pressed={favorites.includes(asset.id)} onClick={() => setFavorites(current => current.includes(asset.id) ? current.filter(id => id !== asset.id) : [...current, asset.id])}>☆ Favorit</button></div></div></article>)}</div>{!filtered.length && <p className="image-empty">Hier sind noch keine Bilder ausgewählt. Markiere einen Entwurf als Favorit.</p>}
    </section>
    <section id="image-comparison" className="image-comparison-section" aria-label="Bildvergleich"><div className="image-comparison-heading"><div><p className="eyebrow">A / B · persönliche Erkundung</p><h2>Was trägt die Darstellung?</h2></div><button onClick={() => setState(current => ({ ...current, b: { ...current.a } }))}>A vollständig nach B kopieren</button></div><div className="image-mobile-switch" aria-label="Sichtbare Bildvariante"><button aria-pressed={mobile === "a"} onClick={() => setMobile("a")}>Bild A anzeigen</button><button aria-pressed={mobile === "b"} onClick={() => setMobile("b")}>Bild B anzeigen</button></div><div className="image-comparison"><Panel id="a" config={state.a} update={values => patch("a", values)} active={mobile === "a"} /><Panel id="b" config={state.b} update={values => patch("b", values)} active={mobile === "b"} /></div></section>
    <section className="image-feedback" aria-label="Bildbewertung"><h2>Was soll bleiben?</h2><p>Persönliche Designbewertung, keine fachliche Freigabe. Einstellungen, Favoriten und Notizen bleiben in diesem Browser.</p><label>Favorit dieses Vergleichs<select value={favorite} onChange={event => setFavorite(event.target.value as typeof favorite)}><option value="none">Noch offen</option><option value="a">Bild A</option><option value="b">Bild B</option></select></label><label>Notiz zum Bildvergleich<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Welche Details helfen? Was wirkt zu dekorativ? Was möchte ich anders testen?" /></label><div className="image-actions"><button className="primary" onClick={saveFeedback}>Bildvergleich speichern</button><button onClick={() => download("json")}>Bilder als JSON exportieren</button><button onClick={() => download("md")}>Bilder als Markdown exportieren</button></div><p role="status">{storageError ? "Lokaler Speicher nicht verfügbar. Die Ansicht bleibt nutzbar; bitte Bewertungen exportieren." : message}</p><p>{entries.length} gespeicherte Bildvergleiche · {favorites.length} Bildfavoriten</p>{entries.map(entry => <article key={entry.id}><strong>{new Date(entry.timestamp).toLocaleString("de-DE")}</strong><p>{entry.state.a.image} / {entry.state.b.image} · Favorit {entry.favorite === "none" ? "offen" : entry.favorite.toUpperCase()}</p><p className="image-saved-note">{entry.note || "Ohne Notiz"}</p><div className="image-actions"><button onClick={() => { setState(entry.state); setNote(entry.note); setFavorite(entry.favorite); }}>Bildvergleich wieder öffnen</button><button onClick={() => setEntries(current => current.filter(item => item.id !== entry.id))}>Diese Bildbewertung löschen</button></div></article>)}<details><summary>Bildlabor zurücksetzen</summary><p>Löscht nur Einstellungen, Favoriten und Bewertungen dieses Bildlabors.</p><button onClick={() => { setState(imageDefaults); setFavorites([]); setEntries([]); setNote(""); setFavorite("none"); setMessage("Bildlabor zurückgesetzt."); }}>Alle lokalen Bildbewertungen und Einstellungen löschen</button></details></section>
  </div>;
}
