import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const files = ["content/shoulder-geometry.json", "lib/anatomy.ts", "components/AnatomyStudy.tsx", "styles/anatomy.css"];
const hashes = Object.fromEntries(await Promise.all(files.map(async path => [path, createHash("sha256").update(await readFile(path)).digest("hex")])));
const geometry = JSON.parse(await readFile(files[0], "utf8"));
await writeFile("content/shoulder-review.json", JSON.stringify({ id: geometry.id, version: geometry.version, status: "source_based_draft", expertReview: null, hashes }, null, 2) + "\n");
