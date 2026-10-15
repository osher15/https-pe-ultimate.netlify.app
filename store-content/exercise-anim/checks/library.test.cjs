"use strict";
/* Library coverage: library.json lists the 47 FIT exercises of hm-app.js (read-only), and every
   one of them must get an animation spec. The pilot covers 8; the other 39 are reported as
   TODO (not failures) until the full batch lands — then this file needs no change. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spec, ROOT, REPO } = require("./_lib.cjs");

const lib = JSON.parse(fs.readFileSync(path.join(ROOT, "library.json"), "utf8")).exercises;
const specIds = new Set(spec.exercises.map(e => e.id));

test("library.json lists 47 unique exercises", () => {
  assert.equal(lib.length, 47);
  assert.equal(new Set(lib.map(e => e.id)).size, 47);
  assert.equal(new Set(lib.map(e => e.anim)).size, 47, "one animation file per exercise id");
});

test("library.json matches the app's FIT exercise list (ids, figures, order)", t => {
  const appFile = path.join(REPO, "hm-app.js");
  if (!fs.existsSync(appFile)) return t.skip("hm-app.js not present");
  const s = fs.readFileSync(appFile, "utf8");
  const a = s.indexOf("const EX=[", s.indexOf("FIT=(function"));
  const body = s.slice(a, s.indexOf("];", a));
  const app = [...body.matchAll(/\{id:"([^"]+)",name:"[^"]+",grp:"([^"]+)",mus:"[^"]*",fig:"([^"]+)"/g)].map(m => ({ id: m[1], grp: m[2], fig: m[3] }));
  assert.deepEqual(lib.map(e => ({ id: e.id, grp: e.grp, fig: e.appFig })), app);
});

test("every spec belongs to the library and is marked pilot or done", () => {
  for (const ex of spec.exercises) {
    const e = lib.find(x => x.anim === ex.id);
    assert.ok(e, `${ex.id} not in library.json`);
    assert.ok(["pilot", "done"].includes(e.status), `${ex.id} status ${e.status}`);
  }
});

for (const e of lib) {
  const has = specIds.has(e.anim);
  test(`${e.id}: has an animation spec`, { todo: has ? false : "pending full batch" }, () => {
    assert.ok(has, `no spec for ${e.anim}`);
  });
}
