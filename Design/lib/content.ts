import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { parse } from "yaml";

export type Question = {
  id: string; kind: "single_choice" | "free_text"; prompt: string;
  options?: { id: string; text: string }[];
  feedback_by_option?: Record<string, string>; correct_option?: string;
  rubric?: { id: string; criterion: string; required: boolean }[];
  model_answer?: string; feedback?: string; source_ids: string[];
};
export type Source = { id: string; title: string; authors_or_issuer: string; publication_year: number; url: string; doi: string; access_scope: string; use_and_limits: string; ingestion_policy: string };
export type Figure = { id: string; alt_text: string; long_description: string; exact_labels: string[]; source_ids: string[] };
export type LabContent = {
  body: string; metadata: { title: string; lesson_id: string; content_version: string; status: string; editorial_approved_by: null; expert_reviewed_by: null };
  questions: Question[]; sources: Source[]; hash: string; passage: string;
  figures: Figure[]; interaction: { options: string[]; feedback: string[] };
};

function yamlBlock(text: string) {
  const block = text.match(/```yaml\r?\n([\s\S]*?)```/);
  if (!block) throw new Error("Expected canonical YAML block.");
  return parse(block[1]);
}

export async function loadContent(): Promise<LabContent> {
  // Only these fixed, reviewed repository paths are ever read.
  const [raw, questionsText, sourcesText, figuresText, interactionText] = await Promise.all([
    readFile(resolve(process.cwd(), "../content/ch01/01_LOAD.md"), "utf8"),
    readFile(resolve(process.cwd(), "../content/ch01/05_QUESTIONS.md"), "utf8"),
    readFile(resolve(process.cwd(), "../research/SOURCES.md"), "utf8"),
    readFile(resolve(process.cwd(), "../content/ch01/06_VISUAL_BRIEFS.md"), "utf8"),
    readFile(resolve(process.cwd(), "../content/ch01/07_INTERACTIONS.md"), "utf8"),
  ]);
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!frontmatter) throw new Error("Lesson frontmatter missing.");
  const body = raw.slice(frontmatter[0].length).trim();
  const metadata = parse(frontmatter[1]);
  if (metadata.lesson_id !== "ch01-l01" || metadata.status !== "pilot_draft" || typeof metadata.content_version !== "string" || metadata.expert_reviewed_by !== null) throw new Error("Unexpected canonical lesson metadata.");
  const allowedMarkers = new Set(["figure:fig-ch01-load", "interaction:int-ch01-load", "exercise:q-ch01-01", "exercise:q-ch01-02"]);
  const markers = [...body.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => match[1]);
  if (markers.length !== allowedMarkers.size || markers.some((marker) => !allowedMarkers.has(marker)) || new Set(markers).size !== allowedMarkers.size) throw new Error("Unexpected or missing canonical component marker.");
  const sourceMarkers = [...body.matchAll(/\[(S\d+)\]/g)].map((match) => match[1]);
  if (sourceMarkers.some((id) => !["S05", "S06"].includes(id))) throw new Error("Unexpected canonical source marker.");
  const sources = sourcesText.split(/(?=^## S\d+)/m).filter((section) => /^## S0[56] —/.test(section)).map(yamlBlock) as Source[];
  const questions = (yamlBlock(questionsText).questions as Question[]).filter((question) => ["q-ch01-01", "q-ch01-02"].includes(question.id));
  const figures = (yamlBlock(figuresText).figures as Figure[]).filter((figure) => ["fig-ch01-load", "fig-ch01-two-runs"].includes(figure.id));
  const firstInteraction = interactionText.split("## I02")[0];
  const options = [...firstInteraction.matchAll(/^\d\. „(.+?)“ —/gm)].map((match) => match[1]);
  const feedback = [...firstInteraction.matchAll(/Rückmeldung für Auswahl \d: „(.+?)“/g)].map((match) => match[1]);
  if (sources.length !== 2 || questions.length !== 2 || figures.length !== 2 || options.length !== 3 || feedback.length !== 3) throw new Error("D0 canonical references incomplete.");
  const passage = body.split("## Aufgabe und Reaktion")[1]?.split("## Eine kleine Denkpause")[0]?.replace(/\[\[figure:fig-ch01-load\]\]/, "").trim();
  if (!passage) throw new Error("Canonical comparison passage missing.");
  return { body, metadata, questions, sources, figures, interaction: { options, feedback }, passage, hash: createHash("sha256").update(raw).digest("hex") };
}
