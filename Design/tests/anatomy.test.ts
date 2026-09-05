import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { geometry, validateAnatomy, anatomyDefaults } from "../lib/anatomy";
import review from "../content/shoulder-review.json";

test("review record is bound to geometry, renderer and style files without claiming expert approval", async () => {
  for (const [path, hash] of Object.entries(review.hashes)) assert.equal(createHash("sha256").update(await readFile(path)).digest("hex"), hash, `Review basis changed: ${path}`);
  assert.equal(review.version, geometry.version);
  assert.equal(review.expertReview, null);
  assert.equal(geometry.expertReview, null);
  assert.equal(geometry.status, "source_based_draft");
  const ids = geometry.paths.map(path => path.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const label of geometry.labels) assert.ok(ids.includes(label.targetId));
  assert.deepEqual(validateAnatomy({ a: "__proto__", b: "invalid", labels: "false" }), anatomyDefaults);
});
