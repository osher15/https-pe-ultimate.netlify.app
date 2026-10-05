"use strict";
/* Guard: fields must stay at 16px on iOS, or Safari zooms the page on focus. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"), path=require("path");
test("iOS input zoom guard exists in hm-styles.css",()=>{
  const css=fs.readFileSync(path.join(__dirname,"../../hm-styles.css"),"utf8");
  const m=/@supports\s*\(-webkit-touch-callout:none\)\s*\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(m,"@supports (-webkit-touch-callout:none) block");
  assert.match(m[1],/input,select,textarea\{font-size:16px !important\}/);
});
