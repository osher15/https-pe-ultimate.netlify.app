"use strict";
/* Output checks: deterministic SVG, committed files are fresh, GIF structure and size.
   Pure Node (no browser). Run after `node src/build.cjs --gif --sheet`. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spec, ROOT } = require("./_lib.cjs");
const { render } = require("../src/svg.cjs");

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "out", "manifest.json"), "utf8"));
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const GIF_LIMIT = 150000;

/* Minimal GIF89a reader: size, loop extension, frame count and delays. */
function readGif(buf) {
  assert.equal(buf.toString("latin1", 0, 6), "GIF89a");
  const w = buf.readUInt16LE(6), h = buf.readUInt16LE(8), flags = buf[10];
  let p = 13 + ((flags & 0x80) ? 3 * (1 << ((flags & 7) + 1)) : 0);
  let frames = 0, loop = false; const delays = [];
  const skipSub = () => { while (buf[p] !== 0) p += buf[p] + 1; p++; };
  while (p < buf.length) {
    const b = buf[p++];
    if (b === 0x3b) break;
    if (b === 0x21) {
      const label = buf[p++];
      if (label === 0xf9) { delays.push(buf.readUInt16LE(p + 2)); p += buf[p] + 1; skipSub(); }
      else if (label === 0xff) { if (buf.toString("latin1", p + 1, p + 12) === "NETSCAPE2.0") loop = true; p += buf[p] + 1; skipSub(); }
      else { p += buf[p] + 1; skipSub(); }
    } else if (b === 0x2c) {
      frames++;
      const f = buf[p + 8]; p += 9;
      if (f & 0x80) p += 3 * (1 << ((f & 7) + 1));
      p++; skipSub();
    } else throw new Error("bad GIF block 0x" + b.toString(16) + " at " + (p - 1));
  }
  return { w, h, frames, delays, loop };
}

for (const ex of spec.exercises) {
  const svgFile = path.join(ROOT, "out", "svg", ex.id + ".svg");
  const gifFile = path.join(ROOT, "out", "gif", ex.id + ".gif");

  test(`${ex.id}: SVG output is deterministic and the committed file is fresh`, () => {
    const a = render(ex, spec.fps).svg, b = render(ex, spec.fps).svg;
    assert.equal(a, b, "two renders differ");
    assert.ok(fs.existsSync(svgFile), "out/svg missing — run src/build.cjs");
    assert.equal(fs.readFileSync(svgFile, "utf8"), a, "out/svg is stale — run src/build.cjs");
    assert.equal(manifest.items[ex.id].svgSha256, sha(Buffer.from(a)), "manifest hash is stale");
    const still = render(ex, spec.fps).stillSvg;
    assert.equal(fs.readFileSync(path.join(ROOT, "out", "still", ex.id + ".svg"), "utf8"), still, "out/still is stale");
    assert.ok(!still.includes("<animate"), "still file has no animation");
  });

  test(`${ex.id}: SVG is self-contained, loops, has no text, honours reduced motion`, () => {
    const s = fs.readFileSync(svgFile, "utf8");
    assert.ok(!/<text|<image|<script|<foreignObject/i.test(s), "no text, images or scripts");
    assert.ok(!/(href|src)="(?!#)/.test(s), "only internal references");
    assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(s), "no external URLs");
    assert.ok(s.includes('repeatCount="indefinite"'), "animation loops");
    assert.ok(s.includes(`dur="${ex.duration}s"`), "animation duration matches the spec");
    assert.ok(/@media \(prefers-reduced-motion:reduce\)\{\.a\{display:none\}\.s\{display:inline\}\}/.test(s), "reduced-motion fallback");
    assert.ok(s.includes('<g class="s">'), "static key pose present");
    // every animate has n+1 values (closing value = first value: seamless SMIL loop)
    const n = Math.round(ex.duration * spec.fps);
    for (const m of s.matchAll(/<animate attributeName="(points|cx|cy|stroke-width|rx)" dur="[^"]+" repeatCount="indefinite" values="([^"]+)"/g)) {
      const vals = m[2].split(";");
      assert.equal(vals.length, n + 1, `${m[1]} has ${vals.length} values`);
      assert.equal(vals[0], vals[n], `${m[1]} does not close the loop`);
    }
  });

  test(`${ex.id}: GIF is 260x260, loops forever, matches manifest, under 150 KB`, () => {
    assert.ok(fs.existsSync(gifFile), "out/gif missing — run src/build.cjs --gif");
    const buf = fs.readFileSync(gifFile);
    const g = readGif(buf);
    const m = manifest.items[ex.id];
    assert.equal(g.w, 260); assert.equal(g.h, 260);
    assert.ok(g.loop, "NETSCAPE loop extension");
    const cycle = ex.duration / (ex.cycles || 1);
    assert.equal(g.frames, Math.round(cycle * spec.gifFps));
    assert.equal(g.frames, m.gifFrames);
    assert.ok(g.delays.every(d => d === 100 / spec.gifFps), "constant frame delay " + [...new Set(g.delays)]);
    assert.equal(g.delays.reduce((a, b) => a + b, 0), Math.round(cycle * 100), "GIF loop length = one cycle");
    assert.equal(m.gifSha256, sha(buf), "manifest GIF hash is stale");
    assert.ok(buf.length < GIF_LIMIT, `${buf.length} B`);
  });
}

test("README checklist block is in sync with the specs; every spec has a form checklist", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const { formMarkdown } = require("../src/form.cjs");
  assert.ok(readme.includes(formMarkdown(spec)), "README form block is stale — run src/build.cjs");
  for (const ex of spec.exercises) assert.ok((ex.form || []).length >= 3, `${ex.id}: needs at least 3 form cues`);
});

test("contact sheet exists", () => {
  assert.ok(fs.existsSync(path.join(ROOT, "contact-sheet.png")));
});
