"use client";

import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { LabContent, Question } from "../lib/content";

function RouteDrawing() {
  return <svg className="run-route" viewBox="0 0 240 62" aria-hidden="true" fill="none"><path d="M14 43C42 43 38 17 73 17S100 43 130 43s38-26 62-26h34" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5"/><circle cx="14" cy="43" r="5" stroke="currentColor" strokeWidth="2"/><circle cx="226" cy="17" r="5" fill="currentColor"/></svg>;
}

function QuestionCard({ question }: { question: Question }) {
  const id = useId();
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  return <section className="exercise" aria-label={`Aufgabe ${question.id}`}>
    <p className="eyebrow">Erkläre es selbst · {question.id === "q-ch01-01" ? "01" : "02"}</p>
    <h3>{question.prompt}</h3>
    {question.kind === "single_choice" ? <fieldset className="options" disabled={revealed}><legend>Dein Antwortversuch</legend>{question.options?.map((option) => <label key={option.id}><input type="radio" name={id} value={option.id} checked={answer === option.id} onChange={() => setAnswer(option.id)}/><span>{option.text}</span></label>)}</fieldset> : <label>Dein Antwortversuch<textarea rows={4} value={answer} disabled={revealed} onChange={(event) => setAnswer(event.target.value)} placeholder="Was weißt du – und was bleibt offen?"/></label>}
    <label className="confidence">Wie sicher bist du? (optional)<select value={confidence} onChange={(event) => setConfidence(event.target.value)}><option value="">Noch nicht angegeben</option><option>Unsicher</option><option>Teilweise sicher</option><option>Sicher</option></select></label>
    <div className="question-actions"><button disabled={!answer.trim() || revealed} onClick={() => setRevealed(true)}>{question.kind === "free_text" ? "Mit Musterlösung vergleichen" : "Antwort prüfen"}</button><button onClick={() => { setAnswer(""); setRevealed(false); setConfidence(""); setChecked([]); }}>Aufgabe zurücksetzen</button></div>
    {revealed && <div className="answer-feedback" role="status">{question.kind === "single_choice" ? <p>{question.feedback_by_option?.[answer]}</p> : <><h4>Musterlösung · Selbstbewertung</h4><p>{question.model_answer}</p><p>{question.feedback}</p><fieldset><legend>Welche Kriterien erfüllt deine Antwort?</legend>{question.rubric?.map((criterion) => <label key={criterion.id}><input type="checkbox" checked={checked.includes(criterion.id)} onChange={(event) => setChecked(event.target.checked ? [...checked, criterion.id] : checked.filter((value) => value !== criterion.id))}/>{criterion.criterion}</label>)}</fieldset><p>Alternative korrekte Formulierungen sind zulässig. Keine automatische Benotung.</p></>}</div>}
  </section>;
}

function TwoRuns({ content }: { content: LabContent }) {
  const id = useId();
  const firstInput = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reflection, setReflection] = useState(false);
  return <figure className="figure" data-figure="fig-ch01-two-runs"><figcaption className="eyebrow">02 · Zwei Läufe · Fiktives Beispiel</figcaption>
    <div className="diagram-grid">{["A", "B"].map((run, index) => <div className="diagram-card" key={run}><h3>Lauf {run}</h3><RouteDrawing/><p><strong>10 km</strong> · <strong>60 min</strong></p><p>Gleich beschriebene flache Strecke</p><p>{revealed ? (index === 0 ? "Angenehm erlebt." : "Deutlich anstrengender erlebt.") : "Reaktion noch nicht gezeigt"}</p></div>)}</div>
    <fieldset className="options" disabled={revealed}><legend>Was kannst du allein aus diesen Angaben sagen?</legend>{content.interaction.options.map((option, index) => <label key={option}><input ref={index === 0 ? firstInput : undefined} type="radio" name={id} checked={selection === index} onChange={() => setSelection(index)}/><span>{option}</span></label>)}</fieldset>
    <div className="question-actions"><button disabled={selection === null || revealed} onClick={() => setRevealed(true)}>Reaktionen aufdecken</button><button onClick={() => { setSelection(null); setRevealed(false); setReflection(false); requestAnimationFrame(() => firstInput.current?.focus()); }}>Neu ansehen</button></div>
    <div aria-live="polite">{revealed && <div className="answer-feedback"><strong>Ursache offen</strong><p>{content.interaction.feedback[selection!]}</p></div>}</div>
    {revealed && <div className="reflection"><button aria-expanded={reflection} onClick={() => setReflection(!reflection)}>Welche zusätzliche Information könnte bei der Einordnung helfen?</button>{reflection && <p>Weitere Aufgabenmerkmale, Kontext und Erfassung des Erlebens. Keine dieser Fragen beweist eine Ursache.</p>}</div>}
    <p className="figure-caption">Gleiche dokumentierte Merkmale, keine Aussage über sämtliche Bedingungen. Quellen: [S05], [S06].</p>
  </figure>;
}

export function Lesson({ content, passage, passageStatus = "draft" }: { content: LabContent; passage?: string; passageStatus?: "canonical" | "draft" }) {
  const [sourceId, setSourceId] = useState<string | null>(null);
  const sourcePanel = useRef<HTMLElement>(null);
  useEffect(() => { if (sourceId) { sourcePanel.current?.focus({ preventScroll: true }); sourcePanel.current?.scrollIntoView({ block: "nearest" }); } }, [sourceId]);
  const source = content.sources.find((item) => item.id === sourceId);
  const text = passage ?? content.body.replace(/^# .+\r?\n/, "");
  const parts = text.split(/(\[\[(?:figure:fig-ch01-load|interaction:int-ch01-load|exercise:q-ch01-01|exercise:q-ch01-02)\]\])/g);
  const sourceLinks = (value: string) => value.replace(/\[(S0[56])\]/g, "[$1](#source-$1)");
  return <article className="lesson-content">
    <header className="lesson-header"><svg className="ornament" viewBox="0 0 110 70" aria-hidden="true" fill="none"><path d="M24 56V25L55 10L86 25V56M32 28V51M43 28V51M55 28V51M67 28V51M78 28V51M20 59H90M20 23H90" stroke="currentColor" strokeWidth="2"/></svg><p className="eyebrow">ATHENA / Kapitel 01 · Wie Training wirkt</p>{!passage && <h1>{content.metadata.title}</h1>}<span className="draft-badge">{passage && passageStatus === "draft" ? "Redaktioneller Designentwurf · Vergleichspassage" : "Recherchegestützter Pilotentwurf · nicht fachlich begutachtet"}</span><p className="content-version">Inhalt {content.metadata.content_version} · {passage ? "Aufgabe und Reaktion" : "Lektion 1"}</p></header>
    <div className="prose">{parts.map((part, index) => {
      if (part === "[[figure:fig-ch01-load]]") return <figure className="figure" data-figure="fig-ch01-load" key={index}><figcaption className="eyebrow">01 · Aufgabe und Reaktion · Schema</figcaption><div className="diagram-grid"><div className="diagram-card"><span className="eyebrow">Dokumentieren</span><h3>Äußere Aufgabe</h3><RouteDrawing/><p>Strecke · Dauer · Last · Wiederholungen</p></div><div className="diagram-arrow">Reaktion auf die Aufgabe →</div><div className="diagram-card"><span className="eyebrow">Beobachten</span><h3>Innere Reaktion</h3><svg viewBox="0 0 100 50" width="100" height="50" aria-hidden="true"><path d="M50 42C9 19 28 0 50 17C72 0 91 19 50 42Z" fill="none" stroke="currentColor" strokeWidth="2"/></svg><p>Anstrengungserleben · Herzfrequenz</p></div></div><p className="context-note"><strong>Kontext mitdenken</strong> · Bedingungen bei der Interpretation mitdenken. Keine eindeutige Ursache, kein berechneter Trainingseffekt.</p><p className="figure-caption">Eigene schematische Darstellung nach dem kanonischen Briefing. <button className="source-link" onClick={() => setSourceId("S05")}>[S05]</button> <button className="source-link" onClick={() => setSourceId("S06")}>[S06]</button></p></figure>;
      if (part === "[[interaction:int-ch01-load]]") return <div key={index}><TwoRuns content={content}/><p className="figure-caption">Quellen öffnen: <button className="source-link" onClick={() => setSourceId("S05")}>[S05]</button> <button className="source-link" onClick={() => setSourceId("S06")}>[S06]</button></p></div>;
      const questionId = part.match(/^\[\[exercise:(q-ch01-0[12])\]\]$/)?.[1];
      if (questionId) return <QuestionCard key={index} question={content.questions.find((question) => question.id === questionId)!}/>;
      return <ReactMarkdown key={index} skipHtml components={{ a: ({ href, children }) => href?.startsWith("#source-") ? <button className="source-link" onClick={() => setSourceId(href.slice(8))}>[{children}]</button> : <a href={href}>{children}</a>, h2: ({ children }) => <h2 className={children === "Merksatz" ? "takeaway-heading" : undefined}>{children}</h2> }}>{sourceLinks(part)}</ReactMarkdown>;
    })}</div>
    {!passage && <aside className="reflection workbook-only"><h3>Deine Randnotiz</h3><label>Was möchte ich in eigenen Worten festhalten?<textarea rows={3} placeholder="Eine Beobachtung, eine offene Frage …"/></label><small>Unbenotete Labornotiz; nicht dauerhaft gespeichert.</small></aside>}
    {source && <aside ref={sourcePanel} tabIndex={-1} className="source-panel" aria-label={`Quelle ${source.id}`}><button onClick={() => setSourceId(null)}>Quelle schließen</button><h3>[{source.id}] {source.title}</h3><p>{source.authors_or_issuer} · {source.publication_year}</p><p>{source.access_scope}</p><p>{source.use_and_limits}</p><a href={source.url} target="_blank" rel="noreferrer">Quellennachweis extern öffnen</a><p>DOI: {source.doi}</p><small>Metadaten und Originalnotizen aus research/SOURCES.md; kein Volltextimport.</small></aside>}
  </article>;
}
