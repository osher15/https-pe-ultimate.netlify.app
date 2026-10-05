"use strict";
/* The bank data must not mention another product by name (the Notion pages carry such a heading in one
   section only; it is not imported). Kept apart from tests/unit/lessonbank.test.js, which is Codex's validator. */
const test=require("node:test"), assert=require("node:assert/strict");
const fs=require("fs"), path=require("path");
const root=path.join(__dirname,"../..");
test("lesson bank files do not mention another product by name",()=>{
  const files=fs.readdirSync(root).filter(f=>/^hm-lessonbank(-[a-z]+)?\.js$/.test(f));
  assert.ok(files.length>=7);
  files.forEach(f=>assert.ok(!/HaMigrash\s*PRO|המגרש\s*PRO/i.test(fs.readFileSync(path.join(root,f),"utf8")),f));
});
