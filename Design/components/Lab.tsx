"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { Lesson } from "./Lesson";
import ImageLab from "./ImageLab";
import { imageStateUrl, readImageUrl } from "../lib/image-config";
import type { LabContent } from "../lib/content";
import { presets } from "../lib/presets";
import voices from "../content/voices.json";
import { defaults, initialState, validateState, readUrl, stateUrl, storageKey, ratingLabels, validFeedback, feedbackMarkdown, type Config, type LabState, type View, type Feedback } from "../lib/config";

const voiceOptions = [{ id: "canonical", name: "Kanonische Passage" }, ...voices];
const views: { id: View; name: string }[] = [{ id: "gallery", name: "Galerie" }, { id: "lesson", name: "Lektionslabor" }, { id: "voices", name: "Schreibstile" }, { id: "compare", name: "Vergleich & Feedback" }, { id: "images", name: "Bildlabor" }];

function Select({ label, value, options, onChange }: { label: string; value: string; options: readonly { id: string; name: string }[]; onChange: (value: string) => void }) {
  const id = useId();
  return <div className="control"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></div>;
}

function Controls({ config, change, voice = false }: { config: Config; change: (patch: Partial<Config>) => void; voice?: boolean }) {
  return <div className="lab-controls">
    <Select label="Visueller Stil" value={config.style} options={presets} onChange={style => change({ style })}/>
    {voice && <Select label="Schreibstimme · nur Passage" value={config.voice} options={voiceOptions} onChange={value => change({ voice: value as Config["voice"] })}/>}
    <Select label="Leseform" value={config.layout} options={[{ id: "reader", name: "Reader" }, { id: "workbook", name: "Workbook" }]} onChange={value => change({ layout: value as Config["layout"] })}/>
    <Select label="Bildpräsentation" value={config.images} options={[{ id: "reduced", name: "Reduziert" }, { id: "integrated", name: "Integriert" }, { id: "guided", name: "Visuell geführt" }]} onChange={value => change({ images: value as Config["images"] })}/>
    <Select label="Mythologie" value={config.myth} options={[{ id: "none", name: "Keiner" }, { id: "subtle", name: "Dezent" }, { id: "bold", name: "Markant" }]} onChange={value => change({ myth: value as Config["myth"] })}/>
    <Select label="Leseschrift" value={config.size} options={["18", "20", "22"].map(id => ({ id, name: `${id} px` }))} onChange={value => change({ size: value as Config["size"] })}/>
    <Select label="Lesebreite" value={config.width} options={["65", "72"].map(id => ({ id, name: `${id} Zeichen` }))} onChange={value => change({ width: value as Config["width"] })}/>
  </div>;
}

function Theme({ config, children, className = "" }: { config: Config; children: React.ReactNode; className?: string }) {
  return <div className={`theme ${className}`} data-style={config.style} data-layout={config.layout} data-images={config.images} data-myth={config.myth} style={{ "--reading-size": `${config.size}px`, "--reading-width": `${config.width}ch` } as CSSProperties}>{children}</div>;
}

function Preview({ config, content, passage = false }: { config: Config; content: LabContent; passage?: boolean }) {
  const sample = voices.find(voice => voice.id === config.voice);
  return <Theme config={config} className="preview">
    {passage && <div className="passage-caption"><span className="eyebrow">Schreibprobe / {sample?.name ?? "Kanonische Passage"}</span><h2>Aufgabe und Reaktion</h2>{sample && <p className="draft-badge">Redaktioneller Designentwurf · kein Ersatz für den Lehrtext</p>}</div>}
    <Lesson content={content} passage={passage ? sample?.text ?? content.passage : undefined} passageStatus={sample ? "draft" : "canonical"}/>
  </Theme>;
}

export default function Lab({ content }: { content: LabContent }) {
  const [state, setState] = useState<LabState>(initialState);
  const [entries, setEntries] = useState<Feedback[]>([]);
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"a" | "b">("a");
  const [storageError, setStorageError] = useState("");
  const [notice, setNotice] = useState("");
  const [favorite, setFavorite] = useState<Feedback["favorite"]>("none");
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [keep, setKeep] = useState("");
  const [disturb, setDisturb] = useState("");
  const [next, setNext] = useState("");

  useEffect(() => {
    let savedState = initialState;
    let savedEntries: Feedback[] = [];
    let error = "";
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { const saved = JSON.parse(raw); savedState = validateState(saved.state); savedEntries = validFeedback(saved.entries); }
    } catch { error = "Lokaler Speicher nicht lesbar. Das Labor bleibt nutzbar; exportiere neue Bewertungen vor dem Schließen."; }
    // Initialization is scheduled after hydration, before persistence is enabled.
    queueMicrotask(() => {
      setState(location.search ? readUrl(location.search) : savedState);
      setEntries(savedEntries); setStorageError(error); setReady(true);
    });
    const restore = () => setState(readUrl(location.search));
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const hasImageParams = [...new URLSearchParams(location.search).keys()].some(key => key.startsWith("img."));
    const nextParams = new URLSearchParams(hasImageParams ? imageStateUrl(readImageUrl(location.search), stateUrl(state)) : stateUrl(state));
    for (const key of ["anat.a", "anat.b", "anat.labels"]) {
      const value = new URLSearchParams(location.search).get(key);
      if (value !== null) nextParams.set(key, value);
    }
    history.replaceState(null, "", `?${nextParams}`);
    try { localStorage.setItem(storageKey, JSON.stringify({ state, entries })); }
    catch { queueMicrotask(() => setStorageError("Speichern im Browser fehlgeschlagen. Einstellungen und Bewertungen gelten nur für diese Sitzung; Export bleibt möglich.")); }
  }, [state, entries, ready]);

  const change = (panel: "a" | "b", patch: Partial<Config>) => setState(previous => ({ ...previous, [panel]: { ...previous[panel], ...patch } }));
  const show = (view: View) => setState(previous => ({ ...previous, view }));
  const round = (id: "a" | "b" | "c") => {
    if (id === "a") setState(previous => ({ ...previous, view: "lesson", a: { ...defaults, style: "marble-library" } }));
    if (id === "b") setState(previous => ({ ...previous, view: "voices", a: { ...previous.a, voice: previous.a.voice === "canonical" ? "factual" : previous.a.voice } }));
    if (id === "c") setState(previous => ({ ...previous, view: "lesson" }));
  };
  const compare = (dimension: "style" | "voice" | "images" | "layout") => setState(previous => ({
    ...previous, view: "compare", compareContent: dimension === "voice" ? "passage" : "lesson",
    b: { ...previous.a, ...(dimension === "style" ? { style: previous.a.style === "gymnasion-notebook" ? "bronze-oracle" : "gymnasion-notebook" } : dimension === "voice" ? { voice: previous.a.voice === "partner" ? "socratic" : "partner" } : dimension === "images" ? { images: previous.a.images === "guided" ? "reduced" : "guided" } : { layout: previous.a.layout === "reader" ? "workbook" : "reader" }) },
  }));
  const save = () => {
    const entry: Feedback = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), state, contentVersion: content.metadata.content_version, contentHash: content.hash, subject: state.view === "voices" || state.view === "compare" && state.compareContent === "passage" ? "Aufgabe und Reaktion · Vergleichspassage" : "ch01-l01 · vollständige Lektion", favorite, ratings, keep, disturb, next };
    setEntries(previous => [...previous, entry]); setNotice("Persönliche Designbewertung gespeichert.");
  };
  const download = (format: "json" | "md") => {
    const data = format === "json" ? JSON.stringify({ schemaVersion: 1, kind: "personal_design_feedback", entries }, null, 2) : feedbackMarkdown(entries);
    const url = URL.createObjectURL(new Blob([data], { type: format === "json" ? "application/json" : "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `athena-design-feedback.${format}`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${format === "json" ? "JSON" : "Markdown"}-Export erstellt.`);
  };

  if (!ready) return <div className="lab-shell"><p role="status">ATHENA Design Lab wird geöffnet …</p></div>;
  return <div className="lab-shell">
    <a className="skip-link" href="#preview">Zum Inhalt</a>
    {focus ? <button className="focus-toggle" onClick={() => setFocus(false)}>Labor einblenden</button> : <header className="lab-bar">
      <div className="brand"><strong>ATHENA <span>DESIGN LAB</span></strong><small>D0 · Lokale Exploration</small></div>
      <nav className="lab-nav" aria-label="Laborbereiche">{views.map(view => <button key={view.id} aria-current={state.view === view.id ? "page" : undefined} onClick={() => show(view.id)}>{view.name}</button>)}</nav>
      <div className="toolbar-actions"><button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Einstellungen einklappen" : "Einstellungen öffnen"}</button><button onClick={() => setFocus(true)}>Fokusmodus</button></div>
      {expanded && state.view !== "gallery" && state.view !== "compare" && state.view !== "images" && <Controls config={state.a} change={patch => change("a", patch)} voice={state.view === "voices"}/>}
    </header>}
    <main className="workspace" id="preview">
      {!focus && <>
        {storageError && <p className="status" role="status">{storageError}</p>}
        <div className="round-links" aria-label="Explorationsrunden"><button onClick={() => round("a")}>A · Atmosphäre</button><button onClick={() => round("b")}>B · Schreibstimme</button><button onClick={() => round("c")}>C · Bilder & Lesen</button><small>Eine Dimension nach der anderen.</small></div>
      </>}
      {state.view === "gallery" && <>
        <section className="intro"><p className="eyebrow">ATHLETIC TRAINING, HEALTH, EXERCISE & NUTRITION ACADEMY</p><h1>Ein Thema.<br/>Zehn mögliche Lernorte.</h1><p>Finde heraus, wo du wirklich weiterlesen möchtest. Dieselbe Lektion, unterschiedliche Atmosphären. Die Entscheidung bleibt offen.</p><button className="primary" onClick={() => round("a")}>Runde A beginnen →</button><span className="intro-note">Kapitel 01 / Wie Training wirkt</span></section>
        <div className="gallery">{presets.map((preset, index) => <section className="gallery-card" key={preset.id}><Theme config={{ ...defaults, style: preset.id }} className="mini-preview"><div className="lesson-header"><p className="eyebrow">ATHENA / 01</p><h2>Gleiche Aufgabe,<br/>andere Reaktion</h2></div><p>„Zehn Kilometer in einer Stunde“ beschreibt einen Ausschnitt der äußeren Aufgabe.</p><div className="mini-diagram"><span>Äußere Aufgabe</span><span aria-hidden="true">→</span><span>Innere Reaktion</span></div><p className="takeaway">Beschreibe erst die Aufgabe und die Reaktion.</p><button onClick={() => setState(previous => ({ ...previous, view: "lesson", a: { ...previous.a, style: preset.id } }))}>Lektion erkunden ↗</button></Theme><div className="card-caption"><span className="eyebrow">{String(index + 1).padStart(2, "0")} / {preset.deep ? "Vertiefter Prototyp" : "Erster Stilentwurf"}</span><h2>{preset.name}</h2><p>{preset.description}</p></div></section>)}</div>
      </>}
      {state.view === "lesson" && <>
        {!focus && <section className="session-intro"><p className="eyebrow">A / Wo möchte ich wirklich weiterlesen?</p><div className="preset-shortcuts">{presets.filter(p => p.deep).map(p => <button key={p.id} aria-pressed={state.a.style === p.id} onClick={() => change("a", { style: p.id })}>{p.name}</button>)}</div><p>Vollständige Lektion · kanonischer Schreibstil. Andere Stimmen gelten nur für die Vergleichspassage.</p><div className="round-links"><button onClick={() => compare("style")}>Atmosphären direkt vergleichen</button><button onClick={() => compare("images")}>C1 · Bilder vergleichen</button><button onClick={() => compare("layout")}>C2 · Reader / Workbook</button></div></section>}
        <Preview content={content} config={state.a}/>
      </>}
      {state.view === "voices" && <>
        {!focus && <section className="session-intro"><p className="eyebrow">B / Eine Passage. Vier Stimmen.</p><h1>Wie soll ATHENA mit dir sprechen?</h1><p>Das Design bleibt beim Stimmenwechsel erhalten. Nur diese Passage ist redaktionell variiert.</p><div className="preset-shortcuts">{voices.map(voice => <button key={voice.id} aria-pressed={state.a.voice === voice.id} onClick={() => change("a", { voice: voice.id as Config["voice"] })}>{voice.name}</button>)}</div><button onClick={() => compare("voice")}>Zwei Stimmen nebeneinander</button></section>}
        <Preview content={content} config={state.a} passage/>
      </>}
      {state.view === "compare" && <>
        {!focus && <section className="session-intro"><p className="eyebrow">Vergleich / A und B</p><h1>Was hilft dir beim Lernen?</h1><p>Persönliche Designerkundung, keine Wirksamkeitsstudie. Wiederholung und Reihenfolge können den Eindruck verändern.</p><Select label="Vergleichsinhalt" value={state.compareContent} options={[{ id: "passage", name: "Kurze Passage" }, { id: "lesson", name: "Vollständige Lektion · kanonisch" }]} onChange={value => setState(previous => ({ ...previous, compareContent: value as LabState["compareContent"] }))}/><button onClick={() => setState(previous => ({ ...previous, b: { ...previous.a } }))}>A nach B übernehmen</button></section>}
        <div className="mobile-switch" aria-label="Sichtbare Vergleichsvariante"><button aria-pressed={mobilePanel === "a"} onClick={() => setMobilePanel("a")}>Variante A</button><button aria-pressed={mobilePanel === "b"} onClick={() => setMobilePanel("b")}>Variante B</button></div>
        <div className="comparison">{(["a", "b"] as const).map(panel => <section className="compare-panel" data-active={mobilePanel === panel} key={panel} aria-label={`Variante ${panel.toUpperCase()}`}><div className="panel-label"><h2>Variante {panel.toUpperCase()}</h2><p>{presets.find(p => p.id === state[panel].style)?.name}</p></div>{!focus && expanded && <Controls config={state[panel]} change={patch => change(panel, patch)} voice={state.compareContent === "passage"}/>}<Preview content={content} config={state[panel]} passage={state.compareContent === "passage"}/></section>)}</div>
      </>}
      {state.view === "images" && <ImageLab/>}
      {state.view !== "gallery" && state.view !== "images" && !focus && <section className="feedback-section"><div className="feedback-heading"><p className="eyebrow">Dein Eindruck zählt</p><h2>Persönliche Designbewertung</h2><p>Nur lokal in diesem Browser. Kein Lernerfolgsnachweis.</p></div><form className="feedback-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <div className="rating-grid">{ratingLabels.map(label => <Select key={label} label={label} value={ratings[label] ?? ""} options={[{ id: "", name: "Nicht bewertet" }, ...[1, 2, 3, 4, 5].map(n => ({ id: String(n), name: `${n}${n === 1 ? " · niedrig" : n === 5 ? " · hoch" : ""}` }))]} onChange={value => setRatings(previous => ({ ...previous, [label]: value }))}/>)}</div>
        <Select label="Persönlicher Favorit" value={favorite} options={[{ id: "none", name: "Noch offen" }, { id: "a", name: state.view === "compare" ? "Variante A" : "Aktuelle Variante" }, ...(state.view === "compare" ? [{ id: "b", name: "Variante B" }] : [])]} onChange={value => setFavorite(value as Feedback["favorite"])}/>
        <label>Behalten<textarea value={keep} onChange={event => setKeep(event.target.value)} rows={2}/></label><label>Stört<textarea value={disturb} onChange={event => setDisturb(event.target.value)} rows={2}/></label><label>Als Nächstes testen<textarea value={next} onChange={event => setNext(event.target.value)} rows={2}/></label>
        <button type="submit" className="primary">Bewertung speichern</button>
      </form><p className="status" role="status">{notice}</p><div className="round-links"><button onClick={() => download("json")}>JSON exportieren</button><button onClick={() => download("md")}>Markdown exportieren</button><button onClick={() => { setEntries([]); setNotice("Gespeicherte Designbewertungen zurückgesetzt."); }}>Alle Designbewertungen zurücksetzen</button><button onClick={() => { setState(initialState); setNotice("Laboreinstellungen zurückgesetzt; Bewertungen erhalten."); }}>Nur Einstellungen zurücksetzen</button></div>
      <div className="feedback-list">{entries.length === 0 ? <p>Noch keine gespeicherten Bewertungen.</p> : entries.map(entry => <details key={entry.id}><summary>{new Date(entry.timestamp).toLocaleString("de-DE")} · {entry.subject} · Favorit {entry.favorite === "none" ? "offen" : entry.favorite.toUpperCase()}</summary><p>Behalten: {entry.keep || "—"}</p><p>Stört: {entry.disturb || "—"}</p><p>Als Nächstes testen: {entry.next || "—"}</p><p>{Object.entries(entry.ratings).map(([key, value]) => `${key}: ${value || "offen"}`).join(" · ")}</p><button onClick={() => setState(entry.state)}>Konfiguration wieder öffnen</button><button onClick={() => setEntries(previous => previous.filter(item => item.id !== entry.id))}>Diese Bewertung löschen</button></details>)}</div></section>}
      {!focus && <footer className="lab-footer">ATHENA Design Lab · D0 · Alle Gestaltungsentscheidungen offen. <span>Inhalt {content.metadata.content_version} · Recherchegestützter Pilotentwurf</span></footer>}
    </main>
  </div>;
}
