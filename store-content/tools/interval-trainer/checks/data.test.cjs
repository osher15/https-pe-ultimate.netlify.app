"use strict";
/* Translation coverage (5 languages) and provenance of every string against the app's dictionaries. */
const test = require("node:test"), assert = require("node:assert/strict");
const { load, ROOT, HTML, script } = require("./_load.cjs");
const X = require("../tools/extract-app-data.cjs");
const { D } = load();
const HEB = /[֐-׿]/;
const ph = s => (String(s).match(/\{\d+\}/g) || []).sort().join(",");

function rowOk(row, label) {
  assert.ok(Array.isArray(row) && row.length === 5, label + ": 5 columns");
  row.forEach((v, i) => assert.ok(typeof v === "string" && v.trim() !== "", label + ": empty " + D.langs[i]));
  [0, 2, 3, 4].forEach(i => assert.ok(!HEB.test(row[i]), label + ": Hebrew left in " + D.langs[i] + ": " + row[i]));
  row.forEach((v, i) => assert.equal(ph(v), ph(row[0]), label + ": placeholders differ in " + D.langs[i]));
}

test("languages are en (default), he, ar, ru, es", () => {
  assert.deepEqual(D.langs, ["en", "he", "ar", "ru", "es"]);
});

test("every UI string has 5 non-empty languages, same placeholders, no Hebrew outside he", () => {
  for (const [k, row] of Object.entries(D.i18n)) rowOk(row, k);
  for (const [k, row] of Object.entries(D.eq)) rowOk(row, "eq." + k);
  for (const [k, row] of Object.entries(D.units)) rowOk(row, "unit." + k);
});

test("every exercise string (47 exercises) has 5 languages", () => {
  assert.equal(D.exercises.length, 47);
  for (const e of D.exercises) {
    rowOk(e.name, e.id + ".name"); rowOk(e.mus, e.id + ".mus");
    e.cues.forEach((c, i) => rowOk(c, e.id + ".cue" + i)); e.mis.forEach((c, i) => rowOk(c, e.id + ".mis" + i));
    for (const k of ["easy", "medium", "advanced"]) assert.ok(Array.isArray(e.reps[k]) && Number.isInteger(e.reps[k][0]), e.id + " reps " + k);
    assert.ok(D.eq[e.eq], e.id + " equipment"); assert.ok(D.i18n["grp." + e.grp], e.id + " group");
  }
});

test("every key used by the page exists in the dictionary", () => {
  const used = new Set();
  for (const m of HTML.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) used.add(m[1]);
  const app = script("pe-it-app");
  for (const m of app.matchAll(/\bt\("([a-zA-Z.]+[a-zA-Z])"/g)) used.add(m[1]);
  for (const g of ["mix", "strength", "cardio", "core", "mobility"]) used.add("grp." + g);
  for (const p of D.presets) used.add("pre." + p.id);
  for (const l of ["easy", "medium", "advanced"]) used.add("lvl." + l);
  used.add("ui.exitFull"); used.add("t.resume"); /* set through data-i18n at run time */
  const missing = [...used].filter(k => !D.i18n[k]);
  assert.deepEqual(missing, []);
  const unused = Object.keys(D.i18n).filter(k => !used.has(k));
  assert.deepEqual(unused, [], "no dead strings to translate");
});

test("provenance: embedded data equals a fresh extraction from hm-app.js + app dictionaries", () => {
  const fresh = X.build(ROOT);
  assert.deepEqual(JSON.parse(JSON.stringify(fresh)), JSON.parse(JSON.stringify(D)));
});

test("provenance: 'app' strings are the app's translations; new/changed strings are listed for review", () => {
  const T = X.loadTerms(ROOT);
  const counts = { app: 0, new: 0, changed: 0 };
  for (const [k, src] of Object.entries(D.source)) {
    counts[src]++;
    if (src === "app") {
      const he = D.i18n[k][1];
      if (!HEB.test(he)) continue;
      const r = JSON.parse(JSON.stringify(X.lookup(T, he)));
      assert.ok(r, k + " has an app translation");
      assert.deepEqual([D.i18n[k][0], D.i18n[k][2], D.i18n[k][3], D.i18n[k][4]], r, k);
    }
  }
  assert.deepEqual(Object.keys(D.source).sort(), Object.keys(D.i18n).sort());
  assert.equal(counts.new, Object.keys(X.NEW).length);
  assert.equal(counts.changed, Object.keys(X.CHANGED).length);
  console.log("# strings: app=" + counts.app + " new=" + counts.new + " changed=" + counts.changed);
});

test("About: owner-approved AI translation notice in all five languages; no draft/review wording in UI or README", () => {
  const want = "Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors are possible.";
  const row = D.i18n["about.i18n"];
  rowOk(row, "about.i18n"); rowOk(D.i18n["about.i18nH"], "about.i18nH");
  assert.equal(row[0], want);
  const ai = ["AI", "בינה מלאכותית", "الذكاء الاصطناعي", "ИИ", "IA"];
  const ministry = ["Ministry of Education", "משרד החינוך", "وزارة التربية والتعليم", "Министерства образования", "Ministerio de Educación"];
  row.forEach((v, i) => { assert.ok(v.includes(ai[i]), D.langs[i] + " mentions AI"); assert.ok(v.includes(ministry[i]), D.langs[i] + " mentions the Ministry"); });
  assert.match(HTML, /data-i18n="about\.i18n"/);
  const README = require("fs").readFileSync(require("path").join(__dirname, "..", "README.md"), "utf8");
  assert.ok(README.includes(want), "README carries the notice");
  for (const text of [README, ...Object.values(D.i18n).flat()]) {
    assert.doesNotMatch(text, /native[- ](speaker |PE-teacher )?review|review needed|unreviewed|awaiting|draft translation|are drafts|AI drafts/i);
  }
});
