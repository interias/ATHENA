import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { defaults, readUrl, stateUrl, validateState, validFeedback, feedbackMarkdown } from "../lib/config";
import voices from "../content/voices.json";

test("URL roundtrip isolates both panels and rejects unrecognized presentation values", () => {
  const state = validateState({ view: "compare", compareContent: "lesson", a: { ...defaults, style: "bronze-oracle", images: "guided" }, b: { ...defaults, style: "gymnasion-notebook", layout: "workbook" } });
  assert.deepEqual(readUrl(stateUrl(state)), state);
  assert.equal(readUrl("?view=bad&a.style=unknown&a.size=400&answer=private").a.size, "18");
  assert.equal(readUrl("?view=bad").view, "gallery");
  assert.ok(!stateUrl(state).includes("answer"));
  assert.deepEqual(validFeedback([{ keep: "malformed" }]), []);
  assert.match(feedbackMarkdown([]), /Keine Lernerfolgsnachweise/);
});

test("editorial samples retain original provenance, bounded length and source markers", async () => {
  const bytes = await readFile("../content/ch01/01_LOAD.md");
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(voices.length, 4);
  assert.equal(new Set(voices.map(v => v.id)).size, 4);
  for (const voice of voices) {
    assert.equal(voice.sourceHash, hash);
    assert.equal(voice.status, "editorial_design_draft");
    assert.equal(voice.sourcePath, "content/ch01/01_LOAD.md");
    assert.ok(voice.text.split(/\s+/).length >= 150 && voice.text.split(/\s+/).length <= 220);
    assert.match(voice.text, /\[S05\]/);
    assert.match(voice.text, /\[S06\]/);
  }
});
