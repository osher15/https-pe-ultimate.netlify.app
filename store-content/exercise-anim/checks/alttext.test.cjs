"use strict";
/* Alt texts (task C25): store-content/exercise-anim/alt-texts.json has one text per exercise id
   and language, in the five app languages. Structure, length, uniqueness, localized exercise
   names (from the interval trainer's PE_IT_DATA) and script/brand rules. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./_lib.cjs");

const LANGS = ["en", "he", "ar", "ru", "es"];
const MAX = 120;
const alt = JSON.parse(fs.readFileSync(path.join(ROOT, "alt-texts.json"), "utf8"));
const lib = JSON.parse(fs.readFileSync(path.join(ROOT, "library.json"), "utf8")).exercises;
const ids = lib.map(e => e.id);

/* Localized exercise names from the interval trainer data (read-only source). */
const trainerHtml = path.join(ROOT, "..", "tools", "interval-trainer", "interval-trainer.html");
let trainer = null;
if (fs.existsSync(trainerHtml)) {
  const m = /<script id="pe-it-data">([\s\S]*?)<\/script>/.exec(fs.readFileSync(trainerHtml, "utf8"));
  const win = {};
  new Function("window", m[1])(win);
  trainer = win.PE_IT_DATA;
}

/* Exercises whose name is not shown verbatim in the text. In he/ar/ru the trainer keeps the
   English term for these (Dead bug, Bird dog, Hollow hold), which would leave Latin script in
   an RTL/Cyrillic sentence, so the alt text uses a transliteration instead. */
const NAME_EXCEPTIONS = { deadbug: ["he", "ar", "ru"], birddog: ["he", "ar", "ru"], hollow: ["he", "ar", "ru"] };
const BRANDS = /fitnessgram|pacer|cooper|פיטנסגרם|بيسر|купер|пейсер/i;
const LATIN = /[A-Za-z]/;
/* Latin letters allowed inside he/ar/ru strings (none needed). */
const LATIN_ALLOWED = [];

function baseName(n) { return n.replace(/\s*\([^)]*\)/g, "").replace(/[«»]/g, "").trim().toLowerCase(); }

test("alt-texts.json has a note and an exercises map", () => {
  assert.equal(typeof alt.note, "string");
  assert.ok(alt.note.length > 20);
  assert.equal(typeof alt.exercises, "object");
});

test("the 47 ids equal library.json", () => {
  assert.equal(ids.length, 47);
  assert.deepEqual(Object.keys(alt.exercises).sort(), [...ids].sort());
});

for (const id of ids) {
  test(`${id}: 5 languages, non-empty, <= ${MAX} chars, no brand words`, () => {
    const o = alt.exercises[id];
    assert.deepEqual(Object.keys(o).sort(), [...LANGS].sort());
    for (const l of LANGS) {
      const t = o[l];
      assert.equal(typeof t, "string", `${id}.${l}`);
      assert.equal(t, t.trim(), `${id}.${l} has surrounding whitespace`);
      assert.ok(t.length > 0, `${id}.${l} empty`);
      assert.ok([...t].length <= MAX, `${id}.${l} is ${[...t].length} chars`);
      assert.ok(!BRANDS.test(t), `${id}.${l} contains a brand word`);
    }
  });
}

for (const l of LANGS) {
  test(`${l}: no two exercises share an identical text`, () => {
    const seen = new Map();
    for (const id of ids) {
      const t = alt.exercises[id][l];
      assert.ok(!seen.has(t), `${id} and ${seen.get(t)} have the same ${l} text`);
      seen.set(t, id);
    }
  });
}

test("he/ar/ru contain no Latin-script letters (except an explicit allow-list)", () => {
  for (const id of ids) for (const l of ["he", "ar", "ru"]) {
    let t = alt.exercises[id][l];
    for (const a of LATIN_ALLOWED) t = t.split(a).join("");
    assert.ok(!LATIN.test(t), `${id}.${l} has Latin letters: ${alt.exercises[id][l]}`);
  }
});

test("he/ar contain Hebrew/Arabic script, ru contains Cyrillic", () => {
  for (const id of ids) {
    assert.match(alt.exercises[id].he, /[֐-׿]/, id);
    assert.match(alt.exercises[id].ar, /[؀-ۿ]/, id);
    assert.match(alt.exercises[id].ru, /[Ѐ-ӿ]/, id);
  }
});

test("he/ar texts have no Cyrillic and ru no Hebrew/Arabic (no mixed-up languages)", () => {
  for (const id of ids) {
    assert.doesNotMatch(alt.exercises[id].he, /[Ѐ-ӿ؀-ۿ]/, id);
    assert.doesNotMatch(alt.exercises[id].ar, /[Ѐ-ӿ֐-׿]/, id);
    assert.doesNotMatch(alt.exercises[id].ru, /[֐-ۿ]/, id);
  }
});

test("each text uses the localized exercise name of the interval trainer data", t => {
  if (!trainer) return t.skip("interval trainer data not present");
  for (const id of ids) {
    const ex = trainer.exercises.find(e => e.id === id);
    assert.ok(ex, `${id} missing in trainer data`);
    LANGS.forEach((l, i) => {
      if (l === "en") return; /* English names are inflected (plural/gerund); checked in he/ar/ru/es only */
      if ((NAME_EXCEPTIONS[id] || []).includes(l)) return;
      const name = baseName(ex.name[i]);
      assert.ok(alt.exercises[id][l].toLowerCase().includes(name), `${id}.${l} lacks the name "${name}"`);
    });
  }
});

test("exceptions are real: those he/ar/ru names are Latin in the trainer data", t => {
  if (!trainer) return t.skip("interval trainer data not present");
  for (const id of Object.keys(NAME_EXCEPTIONS)) {
    const ex = trainer.exercises.find(e => e.id === id);
    for (const l of NAME_EXCEPTIONS[id]) assert.ok(LATIN.test(ex.name[LANGS.indexOf(l)]), `${id}.${l} is no longer Latin in the trainer data; drop the exception`);
  }
});
