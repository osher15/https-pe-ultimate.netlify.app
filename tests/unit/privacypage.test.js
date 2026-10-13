"use strict";
/* The privacy page is a public legal text: keep its markup sane and the store-app section present in all five languages. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../../privacy.html"),"utf8");

test("privacy.html has no doubled tag openers",()=>{ assert.ok(!html.includes("<<"),"found '<<'"); });
test("privacy.html: five language sections, each with the store-app section and the 18+ audience",()=>{
  for(const l of ["he","en","ar","ru","es"]){
    const m=html.match(new RegExp('<section id="'+l+'"[\\s\\S]*?</section>'));
    assert.ok(m,"section "+l);
    assert.match(m[0],/Google Play/,"store section "+l);
    assert.match(m[0],/18/,"audience "+l);
  }
});

test("privacy.html: every language says the Android automatic backup setting is off by default",()=>{
  const hints={he:"כבויה כברירת מחדל",en:"off by default",ar:"مُعطّل افتراضيًا",ru:"по умолчанию выключена",es:"desactivado por defecto"};
  for(const l of Object.keys(hints)){
    const m=html.match(new RegExp('<section id="'+l+'"[\\s\\S]*?</section>'));
    assert.ok(m&&m[0].includes(hints[l]),"auto-backup default text in "+l);
  }
});
