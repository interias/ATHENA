"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useId, useRef, useState } from "react";

type Source = {
  id: string;
  authors_or_issuer: string;
  title: string;
  publication_year: number | null;
  url: string;
  doi: string | null;
  source_type: string;
  checked_on: string;
  access_scope: string;
  use_and_limits: string;
  ingestion_policy: "metadata_and_original_notes_only" | "external_reference_only";
  additional_url?: string | null;
  checked_abstract_url?: string | null;
};

type FigureData = {
  id: string;
  learning_purpose: string;
  alt_text: string;
  long_description: string | null;
  exact_labels: string[] | null;
  source_ids: string[];
  status: string;
  expert_review: string | null;
};

type InteractionData = {
  id: string;
  figure_id: string;
  question: string;
  options: { id: string; text: string; feedback: string }[];
  runs: { id: string; distance: string; duration: string; route: string; reaction: string }[];
  reveal_action_label: string;
  reset_action_label: string;
  reflection_question: string;
  reflection_text: string;
  source_ids: string[];
};

type Exercise = {
  id: string;
  kind: "single_choice" | "free_text";
  prompt: string;
  options: { id: string; text: string }[] | null;
  objective_ids: string[];
  source_ids: string[];
  content_version: string;
  development_status: "in_development";
};

type LessonBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "figure" | "interaction" | "exercise"; id: string };

type LessonResponse = {
  id: string;
  title: string;
  content_version: string;
  status: "pilot_draft";
  expert_reviewed_by: string | null;
  blocks: LessonBlock[];
  sources: Source[];
  figures: FigureData[];
  interactions: InteractionData[];
  exercises: Exercise[];
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; lesson: LessonResponse };

function RouteDrawing() {
  return (
    <svg className="run-route" viewBox="0 0 240 62" aria-hidden="true" fill="none">
      <path d="M14 43C42 43 38 17 73 17S100 43 130 43s38-26 62-26h34" />
      <circle cx="14" cy="43" r="5" />
      <circle cx="226" cy="17" r="5" />
    </svg>
  );
}

function SourceButtons({
  ids,
  onOpen,
}: {
  ids: string[];
  onOpen: (ids: string[], opener: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className="source-link"
      onClick={(event) => onOpen(ids, event.currentTarget)}
      aria-label={`Quellen ${ids.join(" und ")} öffnen`}
    >
      [{ids.join(", ")}]
    </button>
  );
}

function InlineText({
  text,
  onOpenSources,
}: {
  text: string;
  onOpenSources: (ids: string[], opener: HTMLButtonElement) => void;
}) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[S\d{2,}(?:,\s*S\d{2,})*\])/g);
  return tokens.map((token, index) => {
    if (/^\*\*[^*]+\*\*$/.test(token)) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(token)) return <em key={index}>{token.slice(1, -1)}</em>;
    if (/^\[S\d{2,}/.test(token)) {
      return (
        <SourceButtons
          key={index}
          ids={token.slice(1, -1).split(",").map((id) => id.trim())}
          onOpen={onOpenSources}
        />
      );
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

function StaticLoadFigure({
  figure,
  onOpenSources,
}: {
  figure: FigureData;
  onOpenSources: (ids: string[], opener: HTMLButtonElement) => void;
}) {
  const labels = figure.exact_labels ?? [];
  return (
    <figure className="knowledge-figure" aria-labelledby={`${figure.id}-title`} aria-describedby={`${figure.id}-description`}>
      <figcaption>
        <span className="figure-number">Fachvisualisierung 01</span>
        <h2 id={`${figure.id}-title`}>{figure.learning_purpose}</h2>
      </figcaption>
      <p id={`${figure.id}-description`} className="sr-only">{figure.alt_text}</p>
      <div className="load-model">
        <section className="model-card task-card">
          <span className="model-symbol" aria-hidden="true">↗</span>
          <h3>{labels[0]}</h3>
          <p>{labels[3]}</p>
        </section>
        <div className="model-connector" aria-label="Reaktion auf die Aufgabe">
          <span aria-hidden="true">→</span>
          <small>Reaktion auf die Aufgabe</small>
        </div>
        <section className="model-card response-card">
          <span className="model-symbol" aria-hidden="true">♡</span>
          <h3>{labels[1]}</h3>
          <p>{labels[4]}</p>
        </section>
      </div>
      <div className="context-band">
        <span aria-hidden="true">◇</span>
        <div><strong>{labels[2]}</strong><p>Bedingungen bei der Interpretation mitdenken.</p></div>
      </div>
      {figure.long_description && <details className="figure-description"><summary>Ausführliche Grafikbeschreibung</summary><p>{figure.long_description}</p></details>}
      <p className="figure-meta">
        Eigene schematische Darstellung nach dem kanonischen Briefing. Quellen{" "}
        <SourceButtons ids={figure.source_ids} onOpen={onOpenSources} />
      </p>
    </figure>
  );
}

function TwoRunsInteraction({
  interaction,
  figure,
  onOpenSources,
}: {
  interaction: InteractionData;
  figure: FigureData;
  onOpenSources: (ids: string[], opener: HTMLButtonElement) => void;
}) {
  const groupName = useId();
  const firstInput = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const option = interaction.options.find((item) => item.id === selection);
  const descriptionParts = figure.long_description?.split(/(?=Zustand nach dem Aufdecken:)/) ?? [];
  const visibleDescription = revealed ? descriptionParts.join(" ") : descriptionParts[0];

  function reveal() {
    setRevealed(true);
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function reset() {
    setSelection(null);
    setRevealed(false);
    setReflectionOpen(false);
    requestAnimationFrame(() => firstInput.current?.focus());
  }

  return (
    <figure className="knowledge-figure interactive-figure" aria-labelledby={`${interaction.id}-title`}>
      <figcaption>
        <span className="figure-number">Fachvisualisierung 02 · Fiktives Beispiel</span>
        <h2 id={`${interaction.id}-title`}>{interaction.question}</h2>
      </figcaption>
      <p className="sr-only">{figure.alt_text}</p>
      <div className="runs-grid">
        {interaction.runs.map((run, index) => (
          <section className="run-card" key={run.id}>
            <h3>{figure.exact_labels?.[index + 1] ?? run.id}</h3>
            <RouteDrawing />
            <dl>
              <div><dt>Distanz</dt><dd>{run.distance}</dd></div>
              <div><dt>Dauer</dt><dd>{run.duration}</dd></div>
              <div><dt>Strecke</dt><dd>{run.route}</dd></div>
            </dl>
            <p className={revealed ? "reaction revealed" : "reaction concealed"}>
              <span>{revealed ? "Reaktion" : "Status"}</span>
              {revealed ? run.reaction : "Reaktion noch nicht gezeigt"}
            </p>
          </section>
        ))}
      </div>
      <fieldset className="interaction-options" disabled={revealed}>
        <legend>{interaction.question}</legend>
        {interaction.options.map((item, index) => (
          <label key={item.id}>
            <input
              ref={index === 0 ? firstInput : undefined}
              type="radio"
              name={groupName}
              checked={selection === item.id}
              onChange={() => setSelection(item.id)}
            />
            <span>{item.text}</span>
          </label>
        ))}
      </fieldset>
      <div className="interaction-actions">
        <button type="button" className="primary-action" disabled={!selection || revealed} onClick={reveal}>
          {interaction.reveal_action_label}
        </button>
        <button type="button" className="secondary-action" onClick={reset}>{interaction.reset_action_label}</button>
      </div>
      {revealed && option && (
        <div className="interaction-feedback" role="status" tabIndex={-1} ref={feedbackRef}>
          <strong>Ursache offen</strong>
          <p>{option.feedback}</p>
        </div>
      )}
      {revealed && (
        <div className="reflection-box">
          <button
            type="button"
            aria-expanded={reflectionOpen}
            onClick={() => setReflectionOpen((open) => !open)}
          >
            {interaction.reflection_question}
          </button>
          {reflectionOpen && <p>{interaction.reflection_text}</p>}
        </div>
      )}
      {visibleDescription && <details className="figure-description"><summary>Ausführliche Grafikbeschreibung</summary><p>{visibleDescription}</p></details>}
      <p className="figure-meta">Quellen <SourceButtons ids={interaction.source_ids} onOpen={onOpenSources} /></p>
    </figure>
  );
}

function ExercisePreview({ exercise }: { exercise: Exercise }) {
  return (
    <aside className="exercise-preview" aria-labelledby={`${exercise.id}-title`}>
      <p className="figure-number">Aufgabe · in Entwicklung</p>
      <h2 id={`${exercise.id}-title`}>{exercise.prompt}</h2>
      {exercise.options && <ul>{exercise.options.map((option) => <li key={option.id}>{option.text}</li>)}</ul>}
      <p>Diese Aufgabe wird in einem späteren M0-Schritt beantwortbar. Sie zählt hier nicht als Versuch oder Fortschritt.</p>
    </aside>
  );
}

function SourcePanel({
  sources,
  onClose,
}: {
  sources: Source[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panelRef.current)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="source-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside ref={panelRef} tabIndex={-1} className="source-panel" role="dialog" aria-modal="true" aria-labelledby="source-panel-title">
        <div className="source-panel-header">
          <div><span className="figure-number">Quellennachweise</span><h2 id="source-panel-title">{sources.map((source) => source.id).join(" · ")}</h2></div>
          <button type="button" className="source-close" onClick={onClose}>Schließen</button>
        </div>
        {sources.map((source) => (
          <article className="source-entry" key={source.id}>
            <h3>[{source.id}] {source.title}</h3>
            <p>{source.authors_or_issuer}{source.publication_year ? ` · ${source.publication_year}` : ""}</p>
            <dl>
              <div><dt>Quellentyp</dt><dd>{source.source_type}</dd></div>
              <div><dt>Geprüfter Zugang</dt><dd>{source.access_scope}</dd></div>
              <div><dt>Nutzung und Grenzen</dt><dd>{source.use_and_limits}</dd></div>
              <div><dt>Importgrenze</dt><dd>{source.ingestion_policy === "external_reference_only" ? "Nur externer Nachweis" : "Metadaten und eigene Notizen; kein Volltextimport"}</dd></div>
              {source.doi && <div><dt>DOI</dt><dd>{source.doi}</dd></div>}
            </dl>
            <a href={source.url} target="_blank" rel="noopener noreferrer">Externen Quellennachweis öffnen</a>
          </article>
        ))}
      </aside>
    </div>
  );
}

export function LessonReader({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const sourceOpener = useRef<HTMLButtonElement | null>(null);

  const loadLesson = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      setState({ kind: "ready", lesson: (await response.json()) as LessonResponse });
    } catch {
      setState({ kind: "error", message: "Die Lektion konnte gerade nicht geladen werden." });
    }
  }, [lessonId]);

  useEffect(() => { void loadLesson(); }, [loadLesson]);

  const openSources = useCallback((ids: string[], opener: HTMLButtonElement) => {
    sourceOpener.current = opener;
    setSourceIds(ids);
  }, []);
  const closeSources = useCallback(() => {
    setSourceIds([]);
    requestAnimationFrame(() => sourceOpener.current?.focus());
  }, []);

  if (state.kind === "loading") return <main className="lesson-shell"><div className="state-card" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><p>Lektion wird geladen …</p></div></main>;
  if (state.kind === "error") return <main className="lesson-shell"><div className="state-card error-card" role="alert"><h1>Lektion nicht verfügbar</h1><p>{state.message}</p><button type="button" onClick={() => void loadLesson()}>Erneut versuchen</button></div></main>;

  const { lesson } = state;
  const figures = new Map(lesson.figures.map((figure) => [figure.id, figure]));
  const interactions = new Map(lesson.interactions.map((interaction) => [interaction.id, interaction]));
  const exercises = new Map(lesson.exercises.map((exercise) => [exercise.id, exercise]));
  const visibleSources = sourceIds.map((id) => lesson.sources.find((source) => source.id === id)).filter((source): source is Source => Boolean(source));

  return (
    <main className="lesson-shell">
      <nav className="reader-nav" aria-label="Lektionsnavigation">
        <Link href="/">← Kapitelübersicht</Link>
        <span>ATHENA · Persönliches Lernstudio</span>
      </nav>
      <header className="lesson-hero">
        <Image src="/images/scene-pompeii.png" alt="" fill priority sizes="100vw" unoptimized />
        <div className="hero-shade" aria-hidden="true" />
        <div className="lesson-hero-copy">
          <p className="eyebrow">Kapitel 01 · Wie Training wirkt</p>
          <h1>{lesson.title}</h1>
          <p className="lesson-status">Recherchegestützter Pilotentwurf · keine unabhängige Fachprüfung</p>
          <p>Inhalt {lesson.content_version} · {lesson.status}</p>
        </div>
        <p className="atmosphere-credit">Domus · Pompejanisches Rot · lokale freie Interpretation · generierter, ungeprüfter Atmosphärenentwurf</p>
      </header>
      <article className="lesson-reader">
        {lesson.blocks.map((block, index) => {
          if (block.kind === "heading") {
            if (block.level === 1) return null;
            return block.level === 2 ? <h2 key={index}>{block.text}</h2> : <h3 key={index}>{block.text}</h3>;
          }
          if (block.kind === "paragraph") return <p key={index}><InlineText text={block.text} onOpenSources={openSources} /></p>;
          if (block.kind === "figure") {
            const figure = figures.get(block.id);
            return figure ? <StaticLoadFigure key={index} figure={figure} onOpenSources={openSources} /> : null;
          }
          if (block.kind === "interaction") {
            const interaction = interactions.get(block.id);
            const figure = interaction ? figures.get(interaction.figure_id) : undefined;
            return interaction && figure ? <TwoRunsInteraction key={index} interaction={interaction} figure={figure} onOpenSources={openSources} /> : null;
          }
          const exercise = exercises.get(block.id);
          return exercise ? <ExercisePreview key={index} exercise={exercise} /> : null;
        })}
      </article>
      <footer className="lesson-footer">
        <Link href="/">Zur Kapitelübersicht</Link>
        <p>Lesen und Erkunden wird in diesem Schritt nicht als Fortschritt gespeichert.</p>
      </footer>
      {visibleSources.length > 0 && <SourcePanel sources={visibleSources} onClose={closeSources} />}
    </main>
  );
}
