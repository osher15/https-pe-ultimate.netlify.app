"use strict";
/* C18: backup-first "Delete all data on this device": dialog strings and storage scope.
   The interactive flow (backup before delete, cancel, typed word, restore) is covered by browser.cjs. */
const test = require("node:test"), assert = require("node:assert/strict");
const { script } = require("./_load.cjs");

const APP = script("pe-it-app");
const DD_L = (() => {
  const start = APP.indexOf("const DD_L=");
  const end = APP.indexOf(";\n  let ddFrozen");
  assert.ok(start > 0 && end > start, "DD_L block found");
  return new Function(APP.slice(start, end) + "; return DD_L;")();
})();
const ph = s => (String(s).match(/\{\d+\}/g) || []).sort().join(",");

test("dialog strings: five languages, identical keys and placeholders, distinct typed words, no stray Latin in he/ar", () => {
  assert.deepEqual(Object.keys(DD_L), ["en", "he", "ar", "ru", "es"]);
  const keys = Object.keys(DD_L.en).sort();
  assert.ok(keys.length >= 24);
  for (const l of ["he", "ar", "ru", "es"]) {
    assert.deepEqual(Object.keys(DD_L[l]).sort(), keys, l);
    for (const k of keys) { assert.ok(String(DD_L[l][k]).trim(), l + " " + k); assert.equal(ph(DD_L[l][k]), ph(DD_L.en[k]), l + " " + k); }
  }
  assert.equal(new Set(Object.values(DD_L).map(d => d.word)).size, 5);
  for (const l of ["he", "ar"]) assert.ok(!/[A-Za-z]{4,}/.test(DD_L[l].confirmPrompt + DD_L[l].word + DD_L[l].title), l + " has no stray Latin words");
});

test("delete-all scope: only the tool's own key, no blanket clears, no blocking browser dialogs, storage still via one accessor", () => {
  assert.ok(APP.includes("isOwn=k=>k===KEY"));
  assert.ok(!/localStorage\.clear\(|sessionStorage\.clear\(|indexedDB/.test(APP));
  assert.ok(!/\balert\(|\bconfirm\(|\bprompt\(/.test(APP));
  assert.ok(APP.includes("const getLS=()=>window.localStorage"));
});

test("the new strings live outside the generated data block", () => {
  const data = script("pe-it-data");
  assert.ok(!data.includes("Download backup (JSON)"));
});
