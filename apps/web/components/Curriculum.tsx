"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Lesson = {
  id: string;
  order: number;
  title: string;
  availability: "available" | "planned";
};

type Chapter = {
  id: string;
  order: number;
  title: string;
  lessons: Lesson[];
};

type CurriculumResponse = {
  content_version: string;
  chapters: Chapter[];
};

type LessonProgress = {
  lesson_id: string;
  content_version: string;
  read: boolean;
  read_at: string | null;
  updated_at: string | null;
};

type ProgressResponse = {
  content_version: string;
  available_lessons: number;
  planned_lessons: number;
  read_lessons: number;
  lessons: LessonProgress[];
};

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; curriculum: CurriculumResponse; progress: ProgressResponse }
  | { kind: "error"; message: string };

export function Curriculum() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const loadCurriculum = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const [curriculumResponse, progressResponse] = await Promise.all([
        fetch("/api/curriculum", { cache: "no-store" }),
        fetch("/api/progress", { cache: "no-store" }),
      ]);
      if (!curriculumResponse.ok || !progressResponse.ok) {
        throw new Error("Die Kapitel konnten gerade nicht geladen werden.");
      }

      const curriculum = (await curriculumResponse.json()) as CurriculumResponse;
      const progress = (await progressResponse.json()) as ProgressResponse;
      setState({ kind: "ready", curriculum, progress });
    } catch {
      setState({
        kind: "error",
        message: "Die Bibliothek ist gerade nicht erreichbar. Prüfe, ob die lokale App vollständig läuft.",
      });
    }
  }, []);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  if (state.kind === "loading") {
    return (
      <div className="state-card" aria-live="polite">
        <span className="loading-mark" aria-hidden="true" />
        <p>Kapitel werden geladen …</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="state-card error-card" role="alert">
        <p className="state-kicker">Verbindung unterbrochen</p>
        <h3>Die Kapitelübersicht ist nicht verfügbar.</h3>
        <p>{state.message}</p>
        <button type="button" onClick={() => void loadCurriculum()}>Erneut versuchen</button>
      </div>
    );
  }

  return (
    <div className="chapters" aria-live="polite">
      <section className="progress-summary" aria-label="Lesestatus">
        <strong>{state.progress.read_lessons} von {state.progress.available_lessons} verfügbaren Lektionen gelesen</strong>
        <p>{state.progress.planned_lessons} weitere Lektionen sind geplant. „Gelesen“ ist eine persönliche Markierung und bedeutet weder geübt noch erinnert.</p>
      </section>
      {state.curriculum.chapters.map((chapter) => (
        <article className="chapter" key={chapter.id}>
          <div className="chapter-heading">
            <span className="chapter-number">Kapitel {chapter.order}</span>
            <h3>{chapter.title}</h3>
            <span className="version">Fassung {state.curriculum.content_version}</span>
          </div>
          <ol className="lesson-list">
            {chapter.lessons.map((lesson) => {
              const available = lesson.availability === "available";
              const read = available && state.progress.lessons.some(
                (item) => item.lesson_id === lesson.id && item.read,
              );
              return (
                <li className={available ? "lesson available" : "lesson planned"} key={lesson.id}>
                  <span className="lesson-order" aria-hidden="true">{String(lesson.order).padStart(2, "0")}</span>
                  <span className="lesson-copy">
                    {available ? <Link href={`/lessons/${lesson.id}`}><strong>{lesson.title}</strong></Link> : <strong>{lesson.title}</strong>}
                    <small>{read ? "Gelesen · erneut öffnen" : available ? "Jetzt lesen" : "In Vorbereitung"}</small>
                  </span>
                  <span className="status" data-status={read ? "read" : lesson.availability}>
                    {read ? "Gelesen" : available ? "Verfügbar" : "Geplant"}
                  </span>
                </li>
              );
            })}
          </ol>
        </article>
      ))}
    </div>
  );
}
