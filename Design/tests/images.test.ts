import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { imageAssets, imageDefaults, validateImageState, readImageUrl, imageStateUrl, validateImageFeedback, imageFeedbackMarkdown } from "../lib/image-config";

test("fifteen original image studies have matching local PNG bytes and unreviewed provenance", async () => {
  assert.equal(imageAssets.length, 15);
  assert.equal(new Set(imageAssets.map(asset => asset.id)).size, 15);
  assert.equal(imageAssets.filter(asset => asset.category === "anatomy").length, 6);
  assert.equal(imageAssets.filter(asset => asset.category === "atmosphere").length, 9);
  assert.equal(imageAssets.filter(asset => asset.collection === "roman").length, 6);
  for (const asset of imageAssets) {
    assert.match(asset.src, /^\/images\/[a-z0-9-]+\.png$/);
    const bytes = await readFile(`public${asset.src}`);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(bytes.readUInt32BE(16), asset.width);
    assert.equal(bytes.readUInt32BE(20), asset.height);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    assert.equal(asset.status, "generated_unreviewed");
    assert.ok(asset.generatedAt && !Number.isNaN(Date.parse(asset.generatedAt)));
    assert.ok(asset.prompt.length > 150);
    assert.match(asset.alt, /ungeprüft/);
  }
});

test("image URL validates each dimension while preserving independent lesson settings", () => {
  const state = validateImageState({ a: { image: "scene-oracle", zoom: "200", theme: "bronze-oracle" }, b: { image: "shoulder-3d", backdrop: "dark" }, filter: "anatomy" });
  const search = imageStateUrl(state, "?view=images&a.voice=partner&a.layout=workbook");
  assert.deepEqual(readImageUrl(search), state);
  const params = new URLSearchParams(search);
  assert.equal(params.get("a.voice"), "partner");
  assert.equal(params.get("a.layout"), "workbook");
  assert.equal(params.get("view"), "images");
  assert.deepEqual(readImageUrl("?img.a.image=../../secret&img.b.zoom=999&img.a.theme=evil&img.filter=unknown"), imageDefaults);
  assert.deepEqual(validateImageState(null), imageDefaults);
});

test("feedback validation rejects malformed records and export keeps source hashes", () => {
  const entries = validateImageFeedback([{ id: "1", timestamp: "2026-09-05T12:00:00Z", state: { a: { zoom: "999" } }, note: "Keep the quiet frame", favorite: "a", assets: [{ id: imageAssets[0].id, sha256: imageAssets[0].sha256 }] }, null, { id: "bad", assets: [null] }]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].state.a.zoom, imageDefaults.a.zoom);
  const markdown = imageFeedbackMarkdown(entries);
  assert.ok(markdown.includes(imageAssets[0].sha256!));
  assert.match(markdown, /Keep the quiet frame/);
  assert.match(markdown, /Keine Lernerfolgsnachweise/);
});


test("Roman collection and independent image presentation survive URL roundtrip", () => {
  const state = validateImageState({ a: { image: "scene-pompeii", theme: "amphora", presentation: "detail", zoom: "200" }, b: { image: "scene-thermae", theme: "amphora" }, filter: "roman" });
  assert.equal(state.filter, "roman");
  assert.equal(state.a.image, "scene-pompeii");
  assert.equal(state.b.image, "scene-thermae");
  assert.deepEqual(readImageUrl(imageStateUrl(state, "?view=images&a.voice=partner")), state);
});
