"use strict";
/* ============================================================
   רינדור כל הסרטונים
   ------------------------------------------------------------
   node render.js <work-dir> [versions] [langs]
   (אחרי node prepare.js עם אותם פרמטרים)

   פלט: <work-dir>/final/<version>_<lang>_9x16.mp4
   עוצמה מנורמלת ל--14 LUFS (תקן הרשתות), שיא -1.5 dBTP.
   דפדפן: REMOTION_BROWSER, אחרת Chromium של Playwright אם קיים.
   ============================================================ */
const path=require("path"), fs=require("fs");
const {spawnSync}=require("child_process");
const T=require(path.resolve(__dirname,"../../tools/marketing-timing.js"));

const [work,vArg,lArg]=process.argv.slice(2);
if(!work){ console.error("usage: node render.js <work-dir> [versions] [langs]"); process.exit(2); }
const versions=(vArg||"teachers,teachers60").split(",");
const langs=(lArg||"he,en,ar,ru,es").split(",");
const pwShell="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browser=process.env.REMOTION_BROWSER||(fs.existsSync(pwShell)?pwShell:null);
const outDir=path.join(work,"final"), tmpDir=path.join(work,"tmp","render");
fs.mkdirSync(outDir,{recursive:true}); fs.mkdirSync(tmpDir,{recursive:true});

for(const version of versions)for(const lang of langs){
  const id=`${version}_${lang}`;
  if(!fs.existsSync(path.join(__dirname,"public/props",id+".json"))){ console.log("skip (no props)",id); continue; }
  const raw=path.join(tmpDir,id+".mp4");
  const t0=Date.now();
  const args=["remotion","render","src/index.ts","Ad",raw,`--props=${JSON.stringify({id,data:null})}`,
    "--crf=18","--log=error",`--concurrency=${process.env.CONCURRENCY||4}`];
  if(browser)args.push(`--browser-executable=${browser}`);
  const r=spawnSync("npx",args,{cwd:__dirname,stdio:"inherit"});
  if(r.status!==0){ console.error("render failed",id); process.exitCode=1; continue; }
  const final=path.join(outDir,`${id}_9x16.mp4`);
  T.ff(["-i",raw,"-c:v","copy","-af","loudnorm=I=-14:TP=-1.5:LRA=11","-c:a","aac","-b:a","192k","-ar","48000",
    "-movflags","+faststart",final]);
  console.log(id,"→",final,((Date.now()-t0)/1000).toFixed(0)+"s");
}
