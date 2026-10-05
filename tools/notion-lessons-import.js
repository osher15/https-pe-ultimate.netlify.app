#!/usr/bin/env node
"use strict";
/* Converts a Notion Markdown export of the school lesson series ("סדרת מערכים לבית הספר")
   into the data format of hm-lessonbank-<sport>.js, without retyping any text.
   Usage:
     node tools/notion-lessons-import.js <export-dir> --verify            compare with the committed bank
     node tools/notion-lessons-import.js <export-dir> --write <sport>...  write hm-lessonbank-<sport>.js
   The parse is deterministic: the 20 numbered sections and the six sub-sections of section 9 are
   found by position, not by language-specific words. */
const fs=require("fs"), path=require("path"), vm=require("vm");

const LANGS={"עברית":"he","English":"en","العربية":"ar","Русский":"ru","Español":"es"};
const SPORT_WORDS={
  basketball:["כדורסל","Basketball","Баскетбол","كرة السلة","Baloncesto"],
  football:["כדורגל","Football","Футбол","كرة القدم","Fútbol"],
  handball:["כדוריד","Handball","Гандбол","كرة اليد","Balonmano"],
  volleyball:["כדורעף","Volleyball","Волейбол","الكرة الطائرة","Voleibol"],
  athletics:["אתלטיקה","Athletics","Лёгкая атлетика","ألعاب القوى","Atletismo"],
  fitness:["כושר","Fitness","Фитнес","اللياقة","Condición física"]};
const SECTION_KEYS=[null,"identity","purpose","objectives","priorKnowledge","pathwayPosition","unitContribution","equipment",
  "safety","sections","commonErrors","teachingPoints","adaptations","assessment","reflection","continuity","bankLink",
  "systemData","teacherSummary","pedagogicalValue","selfQualityCheck"];
const LIST_FIELDS=new Set(["objectives","safety","commonErrors","teachingPoints"]);
const FLOW_KEYS=["opening","warmup","mainA","mainB","appliedGame","closing"];

function walk(dir,out){ fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{ const p=path.join(dir,e.name);
  if(e.isDirectory())walk(p,out); else if(/\.md$/.test(e.name))out.push(p); }); return out; }

/* inline markdown to plain text: bold markers removed, escapes undone */
function plain(s){
  return s.replace(/\*\*/g,"").replace(/\\([\\`*_{}\[\]()#+\-.!|<>~"'])/g,"$1");
}
/* a block of markdown lines -> text: hard breaks (two trailing spaces) and single newlines become \n,
   blank lines are dropped (the committed data has no blank lines inside a field) */
const BULLET=/^\s*(?:[-*•]|\d{1,2}[.)])\s+/;
function textOf(lines){
  return lines.map(l=>plain(l.replace(/\s+$/,"").replace(/^\s*[-*•]\s+/,""))).filter(l=>l.trim()!=="").join("\n");
}
/* list sections: one item per non-empty line; "- ", "* " and "1." markers are removed
   (some pages use bullets, some plain lines) */
function listOf(lines){
  const items=lines.map(l=>l.replace(/\s+$/,"")).filter(l=>l.trim()!=="").map(l=>plain(l.replace(BULLET,"")));
  /* some pages write a whole list as one line separated by "; ": split it so it reads as a list.
     Words are untouched (the items re-joined with "; " give the original line). */
  if(items.length===1&&/;\s/.test(items[0]))
    return items[0].split(/;\s+/).map(x=>x.trim()).filter(Boolean).map((x,i,a)=>{
      /* items cut from one line: capitalise cased scripts and close with a full stop, like the rest of the list */
      const c=x.charAt(0); x=(c.toUpperCase()!==c.toLowerCase()?c.toUpperCase():c)+x.slice(1);
      return /[.!?:]$/.test(x)?x:x+".";
    });
  return items;
}
const AGE_LABELS=["גיל","Age","العمر","Возраст","Edad"];
const DURATION_LABELS=["משך","Duration","المدة","Продолжительность","Время","Duración"];
/* the identity block labels vary by page and language ("Age", "Age/experience", ...); the value of a
   combined label ("9–11 / beginner") is split on " / " and its first part is the age or duration */
function fromIdentity(identity,labels){
  const lines=String(identity||"").split("\n");
  for(const ln of lines){
    const m=/^([^:：]+)[:：]\s*(.*)$/.exec(ln); if(!m)continue;
    const label=m[1].trim();
    if(labels.some(x=>label===x||label.indexOf(x+"/")===0))return m[2].split(/\s+\/\s+/)[0].trim();
  }
  return "";
}

function parsePage(md){
  const lines=md.replace(/\r/g,"").split("\n");
  const h1=lines.findIndex(l=>/^# /.test(l));
  const title=(lines[h1]||"").replace(/^# /,"").trim();
  const m=/^(.*?)\s*\|\s*(עברית|English|Русский|العربية|Español)\s*$/.exec(plain(title));
  if(!m)return null;
  const lang=LANGS[m[2]], head=m[1];
  const nm=/^(.+?)\s+(\d{2})\s+[—-]\s+(.+)$/.exec(head);
  if(!nm)return null;
  let sport=null; Object.keys(SPORT_WORDS).forEach(k=>{ if(SPORT_WORDS[k].indexOf(nm[1].trim())>=0)sport=k; });
  if(!sport)return null;
  /* numbered sections: "# N. heading" */
  const idx=[]; lines.forEach((l,i)=>{ const x=/^# (\d{1,2})\.\s/.exec(l); if(x)idx.push([+x[1],i]); });
  const blocks={};
  idx.forEach(([n,i],k)=>{ blocks[n]=lines.slice(i+1,k+1<idx.length?idx[k+1][1]:lines.length); });
  const out={n:+nm[2], title:plain(head)};
  for(let n=1;n<=20;n++){
    const key=SECTION_KEYS[n], b=blocks[n]||[];
    if(key==="sections"){
      const subs=[]; b.forEach((l,i)=>{ if(/^## /.test(l))subs.push(i); });
      const secs={};
      FLOW_KEYS.forEach((fk,j)=>{ const a=subs[j]; if(a==null)return;
        secs[fk]=textOf(b.slice(a+1,j+1<subs.length?subs[j+1]:b.length)); });
      out.sections=secs;
    }else if(LIST_FIELDS.has(key)) out[key]=listOf(b);
    else out[key]=textOf(b);
  }
  /* age range and duration from the labelled identity lines (label sets per language) */
  const am=/\d+\s*[–-]\s*\d+|\d+\+?/.exec(fromIdentity(out.identity,AGE_LABELS));
  out.ageRange=am?am[0].replace(/\s+/g,""):"";
  const dm=/\d+/.exec(fromIdentity(out.identity,DURATION_LABELS));
  out.duration=dm?dm[0]:"";
  return {sport,lang,lesson:out};
}

function loadExisting(root){
  const ctx={window:{}}; vm.createContext(ctx);
  ["hm-lessonbank.js"].concat(fs.readdirSync(root).filter(f=>/^hm-lessonbank-[a-z]+\.js$/.test(f))).forEach(f=>
    vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx,{filename:f}));
  return ctx.window.LESSONBANK;
}
module.exports={parsePage,walk,plain,textOf,listOf,SPORT_WORDS,SECTION_KEYS,FLOW_KEYS,LANGS,loadExisting};

if(require.main===module){
  const args=process.argv.slice(2), dir=args[0];
  if(!dir){ console.error("usage: node tools/notion-lessons-import.js <export-dir> --verify|--write <sport>..."); process.exit(2); }
  const root=path.join(__dirname,"..");
  const pages={}, skipped=[];
  walk(dir,[]).forEach(f=>{ const r=parsePage(fs.readFileSync(f,"utf8")); if(!r){ skipped.push(path.basename(f)); return; }
    ((pages[r.sport]=pages[r.sport]||{})[r.lang]=pages[r.sport][r.lang]||[]).push(r.lesson); });
  Object.keys(pages).forEach(s=>Object.keys(pages[s]).forEach(l=>pages[s][l].sort((a,b)=>a.n-b.n)));
  if(args.includes("--verify")){
    const LB=loadExisting(root); let diffs=0, checked=0;
    Object.keys(LB.sports).forEach(sp=>Object.keys(LB.sports[sp]).forEach(l=>LB.sports[sp][l].forEach(old=>{
      const got=((pages[sp]||{})[l]||[]).find(x=>x.n===old.n); checked++;
      if(!got){ console.log("MISSING",sp,l,old.n); diffs++; return; }
      Object.keys(old).forEach(k=>{ const a=JSON.stringify(old[k]), b=JSON.stringify(got[k]);
        if(a!==b){ diffs++; if(diffs<=40)console.log("DIFF",sp,l,old.n,k,"\n  old:",a.slice(0,160),"\n  new:",(b||"").slice(0,160)); } });
    })));
    console.log("checked",checked,"lessons; differences",diffs,"; pages parsed",Object.keys(pages).map(s=>s+":"+Object.keys(pages[s]).map(l=>pages[s][l].length).join("/")).join(" "),"; skipped",skipped.length);
  }

  if(args.includes("--write")){
    const sports=args.slice(args.indexOf("--write")+1).filter(a=>!/^--/.test(a));
    sports.forEach(sp=>{
      const byLang=pages[sp]; if(!byLang){ console.error("no pages for",sp); process.exit(1); }
      let out='"use strict";\n/* ============================================================\n   PE Ultimate — מאגר מערכים בינלאומי: '+sp+'\n   10 מערכים מלאים בחמש שפות עצמאיות, מקור: Notion (ראו hm-lessonbank.js\n   לתיעוד מבנה השדות ולמדיניות התוכן — נטען כמות שהוא, ללא עריכה).\n   נוצר על ידי tools/notion-lessons-import.js — אין לערוך ידנית.\n   ============================================================ */\n(function(){\n  const LB=window.LESSONBANK=window.LESSONBANK||{sports:{}};\n  LB.sports.'+sp+'=LB.sports.'+sp+'||{};\n';
      ["he","en","ar","ru","es"].forEach(l=>{
        const arr=byLang[l]||[]; if(arr.length!==10){ console.error("expected 10 lessons",sp,l,"got",arr.length); process.exit(1); }
        out+='  LB.sports.'+sp+'.'+l+'='+JSON.stringify(arr,null,2).replace(/^/gm,"  ").trimStart()+';\n';
      });
      out+='})();\n';
      fs.writeFileSync(path.join(root,"hm-lessonbank-"+sp+".js"),out); console.log("wrote hm-lessonbank-"+sp+".js");
    });
  }
}
