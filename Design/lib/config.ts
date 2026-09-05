import { presets } from "./presets";

export type Config = {
  style: string;
  layout: "reader" | "workbook";
  images: "reduced" | "integrated" | "guided";
  myth: "none" | "subtle" | "bold";
  size: "18" | "20" | "22";
  width: "65" | "72";
  voice: "canonical" | "factual" | "partner" | "socratic" | "dry";
};
export type View = "gallery" | "lesson" | "voices" | "compare" | "images";
export type LabState = { view: View; a: Config; b: Config; compareContent: "lesson" | "passage" };
export const defaults: Config = { style: "marble-library", layout: "reader", images: "integrated", myth: "subtle", size: "18", width: "65", voice: "canonical" };
export const initialState: LabState = { view: "gallery", a: defaults, b: { ...defaults, style: "gymnasion-notebook" }, compareContent: "passage" };
const choices = {
  style: presets.map(p => p.id), layout: ["reader", "workbook"],
  images: ["reduced", "integrated", "guided"], myth: ["none", "subtle", "bold"],
  size: ["18", "20", "22"], width: ["65", "72"],
  voice: ["canonical", "factual", "partner", "socratic", "dry"],
};
export function validateConfig(input: unknown): Config {
  const result = { ...defaults };
  if (!input || typeof input !== "object") return result;
  for (const key of Object.keys(choices) as (keyof Config)[]) {
    const value = (input as Record<string, unknown>)[key];
    if (typeof value === "string" && (choices[key] as readonly string[]).includes(value)) Object.assign(result, { [key]: value });
  }
  return result;
}
export function validateState(input: unknown): LabState {
  const raw = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    view: ["gallery", "lesson", "voices", "compare", "images"].includes(String(raw.view)) ? raw.view as View : "gallery",
    a: validateConfig(raw.a), b: raw.b ? validateConfig(raw.b) : initialState.b,
    compareContent: raw.compareContent === "lesson" ? "lesson" : "passage",
  };
}
export function readUrl(search: string): LabState {
  const params = new URLSearchParams(search);
  const config = (prefix: string) => Object.fromEntries(Object.keys(choices).map(key => [key, params.get(`${prefix}.${key}`)]));
  return validateState({ view: params.get("view"), a: config("a"), b: config("b"), compareContent: params.get("content") });
}
export function stateUrl(state: LabState): string {
  const params = new URLSearchParams({ view: state.view, content: state.compareContent });
  for (const panel of ["a", "b"] as const) for (const [key, value] of Object.entries(state[panel])) params.set(`${panel}.${key}`, value);
  return `?${params.toString()}`;
}
export const storageKey = "athena-design-lab:v1";
export const ratingLabels = ["Lesekomfort", "Visuelle Klarheit", "Fachliche Wirkung", "Bildnutzen", "Lust weiterzulernen"];
export type Feedback = {
  id: string; timestamp: string; state: LabState; contentVersion: string;
  contentHash: string; subject: string; favorite: "a" | "b" | "none";
  ratings: Record<string, string>; keep: string; disturb: string; next: string;
};
export function validFeedback(input: unknown): Feedback[] {
  if (!Array.isArray(input)) return [];
  return input.filter((x): x is Feedback => x && typeof x.id === "string" && typeof x.timestamp === "string" && typeof x.keep === "string" && typeof x.disturb === "string" && typeof x.next === "string" && typeof x.subject === "string" && typeof x.contentHash === "string" && typeof x.contentVersion === "string" && ["a", "b", "none"].includes(x.favorite) && x.ratings && typeof x.ratings === "object").map(x => ({ ...x, state: validateState(x.state), ratings: Object.fromEntries(ratingLabels.map(label => [label, ["1", "2", "3", "4", "5"].includes(x.ratings[label]) ? x.ratings[label] : ""])) }));
}
export function feedbackMarkdown(entries: Feedback[]): string {
  return "# ATHENA – persönliche Designbewertungen\n\nKeine Lernerfolgsnachweise.\n\n" + entries.map(e => `## ${e.timestamp}\n\n${e.subject} · Inhalt ${e.contentVersion}\n\nHash: ${e.contentHash}\n\nFavorit: ${e.favorite}\n\nKonfiguration: ${stateUrl(e.state)}\n\n${Object.entries(e.ratings).map(([key, value]) => `- ${key}: ${value || "nicht bewertet"}`).join("\n")}\n\nBehalten: ${e.keep}\n\nStört: ${e.disturb}\n\nAls Nächstes testen: ${e.next}\n`).join("\n");
}
