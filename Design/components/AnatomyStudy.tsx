"use client";

import { useEffect, useId, useState } from "react";
import { anatomyDefaults, anatomyStorageKey, anatomyStyles, geometry, validateAnatomy, type AnatomyState, type AnatomyStyle } from "../lib/anatomy";
import review from "../content/shoulder-review.json";
import "../styles/anatomy.css";

export function ShoulderDiagram({ style, labels }: { style: AnatomyStyle; labels: boolean }) {
  const titleId = useId();
  const palette = anatomyStyles[style];
  return <svg xmlns="http://www.w3.org/2000/svg" className="shoulder-diagram" viewBox={geometry.viewBox} role="img" aria-labelledby={titleId} style={{ background: palette.paper, color: palette.ink, fontFamily: "Arial, sans-serif" }}>
    <title id={titleId}>{geometry.title}. {geometry.view}. Quellenbasierter Entwurf, Fachprüfung offen.</title>
    <g data-geometry={geometry.id} data-version={geometry.version} strokeLinejoin="round" strokeLinecap="round">
      {geometry.paths.map(path => <path key={path.id} data-structure={path.id} d={path.d} fill={path.kind === "landmark" ? "none" : path.kind === "ridge" ? palette.ridge : path.kind === "joint" ? palette.joint : palette.bone} stroke={palette.line} strokeWidth={path.kind === "landmark" ? 2 : 3} />)}
    </g>
    {labels && <g data-labels="true" fontSize="16" fontWeight="bold">{geometry.labels.map((label, index) => {
      const [x, y] = label.marker;
      return <g key={label.id} data-target={label.targetId}><line x1={x} y1={y} x2={label.target[0]} y2={label.target[1]} stroke={palette.ink} strokeWidth="1.5" /><circle cx={x} cy={y} r="12" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" /><text x={x} y={y + 5} textAnchor="middle" fill={palette.ink}>{index + 1}</text></g>;
    })}</g>}
  </svg>;
}

export default function AnatomyStudy() {
  const [state, setState] = useState<AnatomyState>(anatomyDefaults);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [mobile, setMobile] = useState<"a" | "b">("a");
  async function exportReview() {
    const variants = await Promise.all(Array.from(document.querySelectorAll(".anatomy-panel")).map(async (panel, index) => {
      const svg = panel.querySelector("svg")!.outerHTML;
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(svg));
      return { style: state[index === 0 ? "a" : "b"], svg, sha256: Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("") };
    }));
    const blob = new Blob([JSON.stringify({ ...review, geometry, state, variants }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `athena-anatomie-pruefpaket-${geometry.version}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  useEffect(() => {
    const fromUrl = () => {
      const params = new URLSearchParams(location.search);
      return validateAnatomy({ a: params.get("anat.a"), b: params.get("anat.b"), labels: params.get("anat.labels") !== "false" });
    };
    try { setState(validateAnatomy(JSON.parse(localStorage.getItem(anatomyStorageKey) || "null"))); } catch { setStorageError(true); }
    if (new URLSearchParams(location.search).has("anat.a")) setState(fromUrl());
    setReady(true);
    const onPop = () => setState(fromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(anatomyStorageKey, JSON.stringify(state)); } catch { setStorageError(true); }
    const params = new URLSearchParams(location.search);
    params.set("anat.a", state.a); params.set("anat.b", state.b); params.set("anat.labels", String(state.labels));
    history.replaceState(null, "", `?${params}${location.hash}`);
  }, [ready, state]);
  return <section className="anatomy-study" aria-label="Anatomiegrundlage" id="anatomy-study">
    <header><p className="eyebrow">Anatomie · gemeinsame Grundlage</p><h2>Eine Zeichnung. Drei Gestaltungen.</h2><p>{geometry.title}. {geometry.view}.</p><p>Konturen und Beschriftungsziele bleiben beim Stilwechsel gleich. Die fachliche Abnahme dieser Zeichnung steht noch aus.</p></header>
    <div className="anatomy-controls"><label><input type="checkbox" checked={state.labels} onChange={event => setState(current => ({ ...current, labels: event.target.checked }))} /> Beschriftungen anzeigen</label><span>Geometrieversion {geometry.version} · Fachprüfung offen</span></div>
    <div className="anatomy-mobile"><button aria-pressed={mobile === "a"} onClick={() => setMobile("a")}>Anatomie A anzeigen</button><button aria-pressed={mobile === "b"} onClick={() => setMobile("b")}>Anatomie B anzeigen</button></div>
    <div className="anatomy-comparison">{(["a", "b"] as const).map(panel => <section key={panel} className="anatomy-panel" data-active={mobile === panel} aria-label={`Anatomievariante ${panel.toUpperCase()}`}><label>Darstellung {panel.toUpperCase()}<select aria-label={`Darstellung ${panel.toUpperCase()}`} value={state[panel]} onChange={event => setState(current => ({ ...current, [panel]: event.target.value as AnatomyStyle }))}>{Object.entries(anatomyStyles).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select></label><ShoulderDiagram style={state[panel]} labels={state.labels} /><p className="anatomy-caption">{geometry.view} · nicht maßstäblich</p>{state.labels && <ol className="anatomy-legend">{geometry.labels.map(label => <li key={label.id}>{label.text}</li>)}</ol>}</section>)}</div>
    <details><summary>Was ist belegt, was muss geprüft werden?</summary><p>{geometry.scope}</p><p>{geometry.omissions}</p><p>Textreferenzen für Lagebeziehungen; keine fremde Abbildung übernommen:</p><ul>{geometry.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul><p>Offen: Prüfung der Konturen, Proportionen, Projektion, Gelenkstellung und jedes Beschriftungsziels durch eine anatomisch qualifizierte Person. Softwaretests prüfen die Gleichheit der Varianten, nicht die anatomische Richtigkeit.</p></details>
    <button onClick={exportReview}>Anatomie-Prüfpaket exportieren</button>
    <p>Das Prüfpaket enthält Quellen, Zeichnungsdaten und beide dargestellten SVG-Fassungen mit Datei-Hashes. Eine Fachfreigabe ist nicht eingetragen.</p>
    {storageError && <p role="status">Speichern im Browser nicht verfügbar. Der Vergleich bleibt nutzbar; die URL enthält die Darstellungseinstellungen.</p>}
  </section>;
}
