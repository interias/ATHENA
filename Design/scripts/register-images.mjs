import { readFile, writeFile, copyFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";

const assets = JSON.parse(await readFile("content/images.json", "utf8"));
const sources = JSON.parse(await readFile("content/image-sources.local.json", "utf8"));
for (const source of sources) {
  const asset = assets.find(item => item.id === source.id);
  if (!asset || !/^[a-z0-9-]+$/.test(source.id)) throw new Error("Unknown asset ID");
  const target = resolve("public/images", `${source.id}.png`);
  try { await copyFile(source.path, target, constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== "EEXIST") throw error; }
  const bytes = await readFile(target);
  const original = await readFile(source.path);
  if (!bytes.equals(original)) throw new Error(`Existing asset differs: ${source.id}`);
  const fileStat = await stat(source.path);
  Object.assign(asset, { src: `/images/${source.id}.png`, status: "generated_unreviewed", generatedAt: fileStat.birthtime.toISOString(), model: null, generator: "built-in image_gen", originalFilename: basename(source.path), sha256: createHash("sha256").update(bytes).digest("hex"), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
}
await writeFile("content/images.json", `${JSON.stringify(assets, null, 2)}\n`);
console.log(`Registered ${sources.length} locally saved images.`);
