import geometry from "../content/shoulder-geometry.json";

export { geometry };
export const anatomyStyles = {
  atlas: { name: "Klarer Atlas", paper: "#faf9f3", bone: "#eee5cf", ridge: "#d8c8a5", joint: "#b9d2d0", ink: "#243c43", line: "#38555a" },
  graphite: { name: "Graphitblatt", paper: "#f0efea", bone: "#f8f7f3", ridge: "#d2d0c6", joint: "#bdbeb8", ink: "#303532", line: "#424940" },
  roman: { name: "Römische Tafel", paper: "#302321", bone: "#e7c998", ridge: "#bc915c", joint: "#f3dfa9", ink: "#f8ead3", line: "#f8ead3" },
};
export type AnatomyStyle = keyof typeof anatomyStyles;
export const anatomyStorageKey = "athena-design-lab:anatomy:v1";
export type AnatomyState = { a: AnatomyStyle; b: AnatomyStyle; labels: boolean };
export const anatomyDefaults: AnatomyState = { a: "atlas", b: "roman", labels: true };
export function validateAnatomy(value: unknown): AnatomyState {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const style = (v: unknown, fallback: AnatomyStyle) => typeof v === "string" && Object.hasOwn(anatomyStyles, v) ? v as AnatomyStyle : fallback;
  return { a: style(raw.a, "atlas"), b: style(raw.b, "roman"), labels: typeof raw.labels === "boolean" ? raw.labels : true };
}
