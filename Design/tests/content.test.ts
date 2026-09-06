import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadContent } from "../lib/content";
import { Lesson } from "../components/Lesson";

test("canonical lesson is complete, traced to original bytes and limited to D0", async () => {
  const content = await loadContent();
  const raw = await readFile("content/baseline-0.1.0/01_LOAD.md", "utf8");
  assert.equal(content.hash, createHash("sha256").update(raw).digest("hex"));
  assert.equal(content.body, raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim());
  assert.deepEqual(content.questions.map((question) => question.id), ["q-ch01-01", "q-ch01-02"]);
  assert.deepEqual(content.sources.map((source) => source.id), ["S05", "S06"]);
  assert.equal(content.metadata.expert_reviewed_by, null);
  assert.equal(content.interaction.options.length, 3);
  assert.equal(content.interaction.feedback.length, 3);
  assert.doesNotMatch(content.passage, /\[\[figure:/);
});

test("initial lesson presentation keeps unrevealed answers out of rendered HTML", async () => {
  const content = await loadContent();
  const html = renderToStaticMarkup(createElement(Lesson, { content }));
  for (const feedback of content.interaction.feedback) assert.ok(!html.includes(feedback));
  assert.ok(!html.includes("Angenehm erlebt."));
  assert.ok(!html.includes("Deutlich anstrengender erlebt."));
  assert.ok(!html.includes(content.questions[1].model_answer!));
  assert.match(html, /Reaktionen aufdecken/);
  assert.match(html, /data-figure="fig-ch01-load"/);
  assert.match(html, /data-figure="fig-ch01-two-runs"/);
  assert.match(html, /disabled=""[^>]*>Reaktionen aufdecken/);
});

test("writing passage is isolated and embedded HTML cannot execute", async () => {
  const content = await loadContent();
  const html = renderToStaticMarkup(createElement(Lesson, { content, passage: 'Eine Passage. [S05]\n\n<script>alert(1)</script>' }));
  assert.match(html, /Eine Passage/);
  assert.doesNotMatch(html, /<script>|data-figure=|q-ch01-01/);
  assert.match(html, /source-link/);
});
