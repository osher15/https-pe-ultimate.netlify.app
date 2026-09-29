#!/usr/bin/env node
/* נכתב בזמן הפריסה ב-Netlify (netlify.toml → build.command), לא במחשב
   המפתח: רק שם ידוע איזה commit נפרס ומתי. האפליקציה מציגה את זה
   בהגדרות ← אודות. במחשב מקומי (בלי COMMIT_REF) לא נכתב כלום — אין
   version.json מזויף עם commit שלא נפרס. */
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");
const commit=process.env.COMMIT_REF||"";
if(!commit){ console.log("stamp-version: no COMMIT_REF — skipped"); process.exit(0); }
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const m=html.match(/<meta name="hm-build" content="([0-9a-f]*)">/);
const out={build:m?m[1]:"",commit:commit.slice(0,40),context:process.env.CONTEXT||"",
  branch:process.env.BRANCH||"",deployedAt:new Date().toISOString()};
fs.writeFileSync(path.join(root,"version.json"),JSON.stringify(out)+"\n");
console.log("stamp-version:",JSON.stringify(out));
