"use strict";
/* ============================================================
   מעתיק את האתר לתוך www — מה שנארז באפליקציה
   ------------------------------------------------------------
   אין כאן קוד נפרד לאפליקציה: אותם קבצים שמוגשים מ-Netlify, בדיוק
   כפי שהם ב-commit (index.html כבר חתום בגרסאות ?v= על ידי
   build-standalone.js). הגשר hm-native.js מחליף את מה שלא עובד בתוך
   WebView. מה שלא נכנס: sw.js (אין service worker באפליקציה),
   Hamegrash.html (הגרסה כקובץ יחיד), מסמכי הפיתוח והבדיקות.

   version.json נכתב כאן עם ה-commit ומועד הבנייה — אותו קובץ שהאתר
   מקבל מ-Netlify, כדי שההגדרות יציגו גם באפליקציה גרסה אמיתית.
   ============================================================ */
const fs=require("fs"), path=require("path"), cp=require("child_process"), crypto=require("crypto");
const ROOT=path.resolve(__dirname,".."), OUT=path.join(__dirname,"www");

const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const build=(html.match(/<meta name="hm-build" content="([0-9a-f]*)">/)||[])[1]||"";
if(!build)throw new Error("index.html בלי hm-build — הרץ קודם node build-standalone.js בשורש");

/* כל קובץ ש-index.html מפנה אליו חייב להיות כאן — בדיקה בסוף */
const FILES=["index.html","manifest.webmanifest","privacy.html","terms.html","contact-received.html",
  "icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","hm-styles.css"]
  .concat(fs.readdirSync(ROOT).filter(f=>/^hm-[\w-]+\.js$/.test(f)));
const DIRS=["exercise-gifs"];

fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});
for(const f of FILES)fs.copyFileSync(path.join(ROOT,f),path.join(OUT,f));
for(const d of DIRS)if(fs.existsSync(path.join(ROOT,d)))fs.cpSync(path.join(ROOT,d),path.join(OUT,d),{recursive:true});

/* כל src/href מקומי ב-index.html קיים ב-www, ושום קובץ לא שונה בדרך */
const refs=[...html.matchAll(/(?:src|href)="([^":#?]+)(?:\?v=([0-9a-f]+))?"/g)];
const missing=[], stale=[];
for(const [,f,v] of refs){
  const p=path.join(OUT,f);
  if(!fs.existsSync(p)){ missing.push(f); continue; }
  if(v&&crypto.createHash("sha1").update(fs.readFileSync(p,"utf8")).digest("hex").slice(0,8)!==v)stale.push(f);
}
if(missing.length)throw new Error("חסרים ב-www: "+missing.join(", "));
if(stale.length)throw new Error("חותמת ?v= לא תואמת (הרץ node build-standalone.js): "+stale.join(", "));

let commit=process.env.GITHUB_SHA||"";
try{ if(!commit)commit=cp.execSync("git rev-parse HEAD",{cwd:ROOT}).toString().trim(); }catch(e){}
fs.writeFileSync(path.join(OUT,"version.json"),JSON.stringify({build,commit,context:"app",
  branch:process.env.GITHUB_REF_NAME||"",deployedAt:new Date().toISOString()})+"\n");

console.log("www מוכן · build "+build+" · commit "+(commit||"?").slice(0,7)+" · "+FILES.length+" קבצים");
