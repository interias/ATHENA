"use client";

import { useRef, useState } from "react";

const ratingFields = [
  ["readability", "Verständlichkeit"],
  ["text_amount", "Passende Textmenge"],
  ["visual_usefulness", "Nutzen der Grafiken"],
  ["practical_relevance", "Praktische Relevanz"],
  ["usability", "Bedienbarkeit"],
] as const;

type RatingName = (typeof ratingFields)[number][0];
type Ratings = Record<RatingName, number | null>;

type FeedbackSnapshot = {
  lesson_id: string;
  content_version: string;
  readability: number;
  text_amount: number;
  visual_usefulness: number;
  practical_relevance: number;
  usability: number;
  reread_location: string;
  clarifying_visual: string;
};

type FeedbackResponse = FeedbackSnapshot & {
  feedback_id: string;
  created_at: string;
};

type PendingSubmission = {
  id: string;
  serializedSnapshot: string;
};

const emptyRatings: Ratings = {
  readability: null,
  text_amount: null,
  visual_usefulness: null,
  practical_relevance: null,
  usability: null,
};

export function PilotFeedback({
  lessonId,
  contentVersion,
}: {
  lessonId: string;
  contentVersion: string;
}) {
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [rereadLocation, setRereadLocation] = useState("");
  const [clarifyingVisual, setClarifyingVisual] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const pendingSubmission = useRef<PendingSubmission | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const firstRatingRef = useRef<HTMLInputElement | null>(null);
  const allRated = Object.values(ratings).every((rating) => rating !== null);
  const rereadCharacterCount = Array.from(rereadLocation).length;
  const visualCharacterCount = Array.from(clarifyingVisual).length;
  const textWithinLimits = rereadCharacterCount <= 2_000 && visualCharacterCount <= 2_000;

  function changeRating(name: RatingName, rating: number) {
    setRatings((current) => ({ ...current, [name]: rating }));
    setError(null);
  }

  function buildSnapshot(): FeedbackSnapshot | null {
    if (!allRated) return null;
    return {
      lesson_id: lessonId,
      content_version: contentVersion,
      readability: ratings.readability as number,
      text_amount: ratings.text_amount as number,
      visual_usefulness: ratings.visual_usefulness as number,
      practical_relevance: ratings.practical_relevance as number,
      usability: ratings.usability as number,
      reread_location: rereadLocation,
      clarifying_visual: clarifyingVisual,
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const snapshot = buildSnapshot();
    if (!snapshot || !textWithinLimits || submitting || result) return;
    const serializedSnapshot = JSON.stringify(snapshot);
    const feedbackId = pendingSubmission.current?.serializedSnapshot === serializedSnapshot
      ? pendingSubmission.current.id
      : crypto.randomUUID();
    pendingSubmission.current = { id: feedbackId, serializedSnapshot };
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/pilot-feedback", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_id: feedbackId, ...snapshot }),
      });
      if (!response.ok) throw new Error();
      setResult((await response.json()) as FeedbackResponse);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setError(
        "Der Speicherstatus konnte nicht bestätigt werden. Sende die unveränderten Eingaben erneut. Änderungen werden als neues Feedback gespeichert.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startNewFeedback() {
    setRatings(emptyRatings);
    setRereadLocation("");
    setClarifyingVisual("");
    setError(null);
    setResult(null);
    pendingSubmission.current = null;
    requestAnimationFrame(() => firstRatingRef.current?.focus());
  }

  return (
    <section className="pilot-feedback" aria-labelledby="pilot-feedback-title">
      <p className="figure-number">Abschluss · persönliche Pilotbewertung</p>
      <h2 id="pilot-feedback-title">Wie war diese Lektion für dich?</h2>
      <p>
        Bewerte fünf Aspekte von 1 bis 5. Es gibt keine erwartete positive Antwort.
        Die beiden Textfelder sind freiwillig. Diese Rückmeldung ist keine Wissens-
        oder Wirksamkeitsmessung.
      </p>
      <p id="pilot-rating-scale" className="rating-explanation">
        1 bedeutet eine geringe, 5 eine hohe Ausprägung. Bei „Passende Textmenge“
        bedeutet 5: Die Textmenge war genau passend.
      </p>
      <form onSubmit={submit}>
        <div className="pilot-rating-list">
          {ratingFields.map(([name, label], fieldIndex) => (
            <fieldset key={name} disabled={submitting || Boolean(result)} aria-describedby="pilot-rating-scale">
              <legend>{label}</legend>
              <div className="pilot-rating-options">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating}>
                    <input
                      ref={fieldIndex === 0 && rating === 1 ? firstRatingRef : undefined}
                      type="radio"
                      name={name}
                      value={rating}
                      required
                      checked={ratings[name] === rating}
                      onChange={() => changeRating(name, rating)}
                    />
                    <span>{rating}</span>
                  </label>
                ))}
              </div>
              <div className="rating-scale" aria-hidden="true"><span>niedrig</span><span>hoch</span></div>
            </fieldset>
          ))}
        </div>
        <label className="pilot-text-control">
          <span>An welcher Stelle musste ich zurücklesen?</span>
          <textarea
            rows={4}
            value={rereadLocation}
            disabled={submitting || Boolean(result)}
            aria-describedby="reread-character-count"
            onChange={(event) => {
              setRereadLocation(event.target.value);
              setError(null);
            }}
          />
        </label>
        <p id="reread-character-count" className={`character-count${rereadCharacterCount > 2_000 ? " character-count-error" : ""}`} aria-live="polite">
          {rereadCharacterCount.toLocaleString("de-DE")} von 2.000 Zeichen{rereadCharacterCount > 2_000 ? " – bitte kürzen" : ""}
        </p>
        <label className="pilot-text-control">
          <span>Welche Darstellung hat eine konkrete Unklarheit beseitigt?</span>
          <textarea
            rows={4}
            value={clarifyingVisual}
            disabled={submitting || Boolean(result)}
            aria-describedby="visual-character-count"
            onChange={(event) => {
              setClarifyingVisual(event.target.value);
              setError(null);
            }}
          />
        </label>
        <p id="visual-character-count" className={`character-count${visualCharacterCount > 2_000 ? " character-count-error" : ""}`} aria-live="polite">
          {visualCharacterCount.toLocaleString("de-DE")} von 2.000 Zeichen{visualCharacterCount > 2_000 ? " – bitte kürzen" : ""}
        </p>
        <div className="exercise-actions">
          <button type="submit" className="primary-action" disabled={!allRated || !textWithinLimits || submitting || Boolean(result)}>
            {submitting ? "Wird gespeichert …" : error ? "Unverändert erneut senden" : "Pilotfeedback speichern"}
          </button>
        </div>
      </form>
      {error && <p className="feedback-error" role="alert">{error}</p>}
      {result && (
        <div className="feedback-success" role="status" tabIndex={-1} ref={resultRef}>
          <strong>Pilotfeedback dauerhaft gespeichert</strong>
          <p>Danke. Die Bewertung bleibt an Lektion {result.lesson_id} und Inhaltsversion {result.content_version} gebunden.</p>
          <button type="button" className="secondary-action" onClick={startNewFeedback}>Weitere Bewertung abgeben</button>
        </div>
      )}
    </section>
  );
}
