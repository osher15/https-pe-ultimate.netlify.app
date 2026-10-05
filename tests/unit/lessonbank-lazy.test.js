"use strict";
/* The international bank loads one sport file on demand; the service worker must precache the
   same versioned URL, and every available sport needs a file and a data-lb tag. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"), path=require("path");
const R=f=>fs.readFileSync(path.join(__dirname,"../..",f),"utf8");

test("every sport in LESSONBANK.meta.available has a file, a data-lb tag and a matching SW entry",()=>{
  const meta=R("hm-lessonbank.js");
  const avail=JSON.parse(/available:\s*(\[[^\]]*\])/.exec(meta)[1]);
  assert.ok(avail.length>=2);
  const html=R("index.html"), sw=R("sw.js"), build=R("build-standalone.js");
  avail.forEach(sp=>{
    const file="hm-lessonbank-"+sp+".js";
    assert.ok(fs.existsSync(path.join(__dirname,"../..",file)),file+" exists");
    const tag=new RegExp('<script type="text/plain" data-lb="'+sp+'" data-src="'+file+'\\?v=([0-9a-f]{8})"></script>').exec(html);
    assert.ok(tag,sp+": data-lb placeholder in index.html");
    assert.ok(sw.includes('"./'+file+'?v='+tag[1]+'"'),sp+": SW precaches the same versioned URL");
    assert.ok(build.includes('"'+file+'"'),sp+": included in the standalone build");
    assert.ok(!new RegExp('<script src="'+file).test(html),sp+": not loaded eagerly in index.html");
  });
});
