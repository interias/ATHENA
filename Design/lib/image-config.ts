import manifest from "../content/images.json";
import { presets } from "./presets";

export type ImageAsset = {
  id: string; title: string; category: "anatomy" | "atmosphere"; collection?: "roman"; style: string;
  description: string; src: string; alt: string; prompt: string;
  status: string; generatedAt: string | null; model: string | null;
  sha256: string | null; width: number | null; height: number | null;
};
export const imageAssets = manifest as ImageAsset[];
export type ImagePanel = {
  image: string; theme: string; presentation: "full" | "detail";
  backdrop: "light" | "dark" | "paper"; size: "compact" | "large";
  caption: "short" | "expanded"; zoom: "100" | "150" | "200";
  position: "center" | "top" | "bottom";
};
export type ImageState = { a: ImagePanel; b: ImagePanel; filter: "all" | "anatomy" | "atmosphere" | "roman" | "favorites" };
export const imageStorageKey = "athena-design-lab:images:v1";
const panelDefault: ImagePanel = { image: "shoulder-atlas", theme: "marble-library", presentation: "full", backdrop: "paper", size: "large", caption: "expanded", zoom: "150", position: "center" };
export const imageDefaults: ImageState = { a: panelDefault, b: { ...panelDefault, image: "shoulder-graphite" }, filter: "all" };
const options = {
  image: imageAssets.map(image => image.id), theme: presets.map(preset => preset.id),
  presentation: ["full", "detail"], backdrop: ["light", "dark", "paper"], size: ["compact", "large"],
  caption: ["short", "expanded"], zoom: ["100", "150", "200"], position: ["center", "top", "bottom"],
};
export function validateImageState(value: unknown): ImageState {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  function panel(name: "a" | "b"): ImagePanel {
    const result = { ...imageDefaults[name] };
    const input = raw[name] && typeof raw[name] === "object" ? raw[name] as Record<string, unknown> : {};
    for (const key of Object.keys(options) as (keyof ImagePanel)[]) {
      if (typeof input[key] === "string" && options[key].includes(input[key] as never)) Object.assign(result, { [key]: input[key] });
    }
    return result;
  }
  return { a: panel("a"), b: panel("b"), filter: ["all", "anatomy", "atmosphere", "roman", "favorites"].includes(String(raw.filter)) ? raw.filter as ImageState["filter"] : "all" };
}
export function readImageUrl(search: string): ImageState {
  const params = new URLSearchParams(search);
  const panel = (id: string) => Object.fromEntries(Object.keys(options).map(key => [key, params.get(`img.${id}.${key}`)]));
  return validateImageState({ a: panel("a"), b: panel("b"), filter: params.get("img.filter") });
}
export function imageStateUrl(state: ImageState, search: string): string {
  const params = new URLSearchParams(search);
  params.set("img.filter", state.filter);
  for (const panel of ["a", "b"] as const) for (const [key, value] of Object.entries(state[panel])) params.set(`img.${panel}.${key}`, value);
  return `?${params.toString()}`;
}
export type ImageFeedback = { id: string; timestamp: string; state: ImageState; note: string; favorite: "a" | "b" | "none"; assets: { id: string; sha256: string }[] };
export function validateImageFeedback(value: unknown): ImageFeedback[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ImageFeedback => item && typeof item.id === "string" && typeof item.timestamp === "string" && typeof item.note === "string" && ["a", "b", "none"].includes(item.favorite) && Array.isArray(item.assets) && item.assets.every((asset: { id?: unknown; sha256?: unknown }) => asset && typeof asset.id === "string" && typeof asset.sha256 === "string")).map(item => ({ ...item, state: validateImageState(item.state) }));
}
export function imageFeedbackMarkdown(entries: ImageFeedback[]): string {
  return "# ATHENA – persönliche Bildbewertungen\n\nGenerierte, fachlich ungeprüfte Bildentwürfe. Keine Lernerfolgsnachweise.\n\n" + entries.map(entry => `## ${entry.timestamp}\n\nFavorit: ${entry.favorite}\n\n${entry.note}\n\n${entry.assets.map(asset => `- ${asset.id}: SHA-256 ${asset.sha256}`).join("\n")}\n\nKonfiguration:\n\n\`\`\`json\n${JSON.stringify(entry.state, null, 2)}\n\`\`\`\n`).join("\n");
}
