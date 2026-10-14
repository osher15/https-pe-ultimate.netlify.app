"use strict";
/* Media allow-list (project-owned rig GIFs only, by hash) and forbidden coupling / network strings. */
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { load, ROOT, TOOL, HTML } = require("./_load.cjs");
const { D } = load();
const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const MEDIA = path.join(TOOL, "media");
const RIG = path.join(ROOT, "exercise-gifs", "rig"), PHOTO = path.join(ROOT, "exercise-gifs", "photo");
const CREDITS = fs.readFileSync(path.join(ROOT, "exercise-gifs", "CREDITS.md"), "utf8");

/* The 5 Wikimedia/CDC photos named in the CREDITS.md table (excluded by owner decision). */
const EXCLUDED = [...CREDITS.matchAll(/^\|\s*`([^`]+\.gif)`\s*\|/gm)].map(m => m[1]);

test("CREDITS.md lists 5 excluded photos and they exist", () => {
  assert.deepEqual(EXCLUDED.sort(), ["burpee.gif", "jack.gif", "knees.gif", "lunge.gif", "pike.gif"]);
  for (const f of EXCLUDED) assert.ok(fs.existsSync(path.join(PHOTO, f)));
});

test("every shipped media file is byte-identical to a rig GIF and to none of the excluded photos", () => {
  const photoHashes = new Set(EXCLUDED.map(f => sha(path.join(PHOTO, f))));
  const files = fs.readdirSync(MEDIA);
  assert.ok(files.length > 0);
  for (const f of files) {
    assert.match(f, /^[a-z0-9]+\.gif$/, f);
    const h = sha(path.join(MEDIA, f));
    assert.ok(!photoHashes.has(h), f + " is an excluded photo");
    assert.ok(fs.existsSync(path.join(RIG, f)), f + " has a rig source");
    assert.equal(h, sha(path.join(RIG, f)), f + " differs from exercise-gifs/rig/" + f);
  }
});

test("every referenced figure exists; nothing extra is shipped; no photo path in the page", () => {
  const figs = new Set(D.exercises.map(e => e.fig).filter(Boolean));
  for (const f of figs) assert.ok(fs.existsSync(path.join(MEDIA, f + ".gif")), f);
  assert.deepEqual(fs.readdirSync(MEDIA).sort(), [...figs].map(f => f + ".gif").sort(), "media/ holds exactly the referenced figures");
  assert.ok(!/exercise-gifs|photo\//.test(HTML));
  const noMedia = D.exercises.filter(e => !e.fig).map(e => e.id);
  const readme = fs.readFileSync(path.join(TOOL, "README.md"), "utf8");
  for (const id of noMedia) assert.ok(readme.includes("`" + id + "`"), "README lists media-to-be-drawn " + id);
});

test("no app/student coupling, no app storage keys, no network", () => {
  const forbidden = [/peultimate/i, /PE Ultimate/, /stu\.list/, /\broster\b/i, /\bSESSION\b/, /window\.FT\b/, /\bSTU\./, /\bHMDATA\b/, /grades?\./,
    /\bcid\b/, /\bsid\b/, /https?:\/\//, /\bfetch\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /EventSource/, /\bimport\(/, /<link\b/, /@import/, /url\(/, /<iframe/i, /ytUrl|youtube/i];
  for (const re of forbidden) assert.ok(!re.test(HTML), "forbidden: " + re);
  const keys = [...HTML.matchAll(/["']([a-z][\w.-]*\.v\d)["']/g)].map(m => m[1]);
  assert.deepEqual([...new Set(keys)], ["pe-tools.interval-trainer.v1"], "one own storage key");
  assert.equal((HTML.match(/localStorage/g) || []).length, 1, "storage is accessed only through the store adapter");
});
