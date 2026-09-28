"use strict";
/* ============================================================
   הכנת נתונים לסרטון ב-Remotion
   ------------------------------------------------------------
   node prepare.js <work-dir> [versions] [langs]

   <work-dir> — כמו ב-tools/marketing-assemble.js:
     out/<lang>_<scene>.mp4 + .json   הקלטות המסך + יומן המיקוד (tools/marketing-capture.js)
     vo/<lang>_<version>.mp3          הקריינות
     gemini/gemini_A.mp4, gemini_B.mp4
     fonts/fonts.css
   משתנה הסביבה SHOTCRAFT — שכפול של github.com/Vincentwei1021/video-shotcraft
   (אפקטים קוליים ומוזיקה של Mixkit, רישיון חינמי לשימוש מסחרי).

   לכל גרסה ושפה נכתב public/props/<version>_<lang>.json: תזמון הכתוביות
   (עד רמת המילה), הקטעים, חלון ההקלטה, תנועות המצלמה אל האלמנט שעליו
   מדברים באותו רגע, והאפקטים הקוליים.
   ============================================================ */
const path=require("path"), fs=require("fs");
const ROOT=path.resolve(__dirname,"../..");
const T=require(path.join(ROOT,"tools/marketing-timing.js"));
const {SHOTS,HOOK,CALM,SFX,BGM}=require("./shots.js");

const PUB=path.join(__dirname,"public");
const RTL={he:1,ar:1};

function link(src,dst){
  fs.mkdirSync(path.dirname(dst),{recursive:true});
  try{ fs.rmSync(dst,{force:true}); }catch(e){}
  fs.copyFileSync(src,dst);
}

/* מילים בתוך כתובית: חלוקה יחסית לאורך המילה (+ משקל קבוע להפסקה קטנה) */
function words(c){
  const ws=c.text.split(/\s+/).filter(Boolean);
  const wt=ws.map(w=>w.length+1.5), sum=wt.reduce((a,b)=>a+b,0);
  let acc=0;
  return ws.map((w,i)=>{ const s=c.start+(c.end-c.start)*acc/sum; acc+=wt[i];
    return {w, s:+s.toFixed(3), e:+(c.start+(c.end-c.start)*acc/sum).toFixed(3)}; });
}

/* מיקוד: מרכז המסגרת, כך שהחלק העליון של אלמנט גבוה יישאר בתמונה,
   והמצלמה לא «תצא» מגבולות המסך */
function focusOf(box,z,vw,vh){
  const [x,y,w,h]=box;
  const viewH=vh/z, viewW=vw/z;
  let fx=x+w/2, fy=h>viewH*0.8? y+viewH*0.42 : y+h/2;
  fx=Math.min(vw-viewW/2,Math.max(viewW/2,fx));
  fy=Math.min(vh-viewH/2,Math.max(viewH/2,fy));
  return [fx,fy];
}
function trackAt(arr,t){
  if(!arr||!arr.length)return null;
  let best=arr[0];
  for(const r of arr){ if(r[0]<=t)best=r; else break; }
  return best.slice(1);
}

/* track יכול להיות כמה סלקטורים: מסגרים את כולם יחד (מסלול + שעון) */
function boxAt(log,track,t){
  const bs=[].concat(track).map(q=>trackAt(log.track[q],t)).filter(Boolean);
  if(!bs.length)return null;
  const x0=Math.min(...bs.map(b=>b[0])), y0=Math.min(...bs.map(b=>b[1]));
  const x1=Math.max(...bs.map(b=>b[0]+b[2])), y1=Math.max(...bs.map(b=>b[1]+b[3]));
  return [x0,y0,x1-x0,y1-y0];
}

/* חלון ההקלטה ותנועות המצלמה לקטע אחד מהאפליקציה */
function planClip(scene,lang,work,d,segKey){
  const cfg=SHOTS[scene]||{shots:[]};
  const log=JSON.parse(fs.readFileSync(path.join(work,"out",`${lang}_${scene}.json`),"utf8"));
  const recDur=T.probeDur(path.join(work,"out",`${lang}_${scene}.mp4`))||log.dur;
  link(path.join(work,"out",`${lang}_${scene}.mp4`),path.join(PUB,"out",`${lang}_${scene}.mp4`));
  const {vw,vh}=log;
  /* 1. אירועים בזמני ההקלטה */
  const ev=[]; let prev=0;
  for(const s of cfg.shots){
    let t=null, box=null;
    if(s.tap){ const tp=log.taps.find(x=>x.sel.includes(s.tap)&&x.t>=prev-0.01); if(tp){ t=tp.t; box=[tp.x,tp.y,tp.w,tp.h]; } }
    else if(s.track){ const a=log.track[[].concat(s.track)[0]]; if(a&&a.length){ const want=prev+(s.after||0);
        const r=a.find(r=>r[0]>=want)||a[a.length-1]; t=Math.max(want,r[0]); box=boxAt(log,s.track,t); } }
    if(t==null)continue;
    ev.push({...s,t,box}); prev=t;
  }
  /* 2. חלון ההקלטה. הכלל: קצב טבעי, כדי שכל מסך יהיה קריא.
     אם הקטע קצר מכדי להראות גם את הפעולה וגם את התוצאה (until), מראים את
     התוצאה: החלון מסתיים בה. הרצה קדימה — רק עד ×1.15, כשזה חוסך את החיתוך */
  const MAX_RATE=1.15, HOLD=1.2;
  const anchor=ev.length?ev[0].t:0;
  const lead=Math.min(1.0,Math.max(0.6,0.22*d));
  let start=cfg.start!=null?cfg.start:Math.max(0.35,anchor-lead);
  let rate=1;
  let pt=null;
  if(cfg.until){
    if(cfg.until.at!=null)pt=cfg.until.at;
    else if(cfg.until.tap==="last"&&log.taps.length)pt=log.taps[log.taps.length-1].t;
    else if(cfg.until.tap){ const tp=log.taps.filter(x=>x.sel.includes(cfg.until.tap)).pop(); if(tp)pt=tp.t; }
    else if(cfg.until.track){ const a=log.track[cfg.until.track]; if(a&&a.length)pt=a[0][0]; }
  }
  if(pt!=null){
    const end=Math.min(recDur-0.1,pt+(cfg.until.post||0.8));
    if(end-start>d){
      if(end-start<=d*MAX_RATE)rate=(end-start)/d;
      else start=Math.max(0.35,end-d);
    }
  }
  if(recDur-start<d*rate){
    rate=Math.max(0.72,(recDur-start)/d);
    if((recDur-start)/rate<d)start=Math.max(0.2,recDur-d*rate);
  }
  /* 3. מצלמה: מפתחות בזמן הקטע (שניות). לכל היותר תנועה אחת ל-HOLD שניות,
     כדי שהעין תספיק לקרוא; אירוע שקרה לפני תחילת החלון קובע את נקודת הפתיחה */
  const toSeg=(t)=>(t-start)/rate;
  const before=ev.filter(e=>e.t<=start+0.3).pop();
  /* אלמנט במעקב — המיקום שלו ברגע שהחלון נפתח (אולי כבר נגלל) */
  const box0=before?(before.track?boxAt(log,before.track,start)||before.box:before.box):null;
  const f0=box0?focusOf(box0,before.z,vw,vh):[vw/2,vh/2];
  const keys=[{t:0,fx:f0[0],fy:f0[1],z:before?before.z:1}];
  const rings=[];
  const push=(t,f,z)=>{ const last=keys[keys.length-1]; if(t<=last.t+0.05){ keys.push({t:last.t+0.05,fx:f[0],fy:f[1],z}); } else keys.push({t,fx:f[0],fy:f[1],z}); };
  let lastArrive=-HOLD;
  ev.forEach((e,i)=>{
    const tt=toSeg(e.t), move=e.move||0.8;
    const isBefore=e===before;
    if(!isBefore){
      if(e.t<=start+0.3)return;
      const lastK0=keys[keys.length-1];
      /* תנועה אורכת לפחות move שניות — גם כשהאירוע קרוב לתחילת הקטע */
      const arrive=Math.max(0.3,lastK0.t+move,tt-(e.lead!=null?e.lead:0.35));
      if(arrive>d-0.5||arrive-lastArrive<HOLD)return;
      const lastK=keys[keys.length-1];
      push(Math.max(lastK.t,arrive-move),[lastK.fx,lastK.fy],lastK.z);       /* מחזיקים עד שמתחילים לזוז */
      push(arrive,focusOf(e.box,e.z,vw,vh),e.z);
      lastArrive=arrive;
      if(e.tap)rings.push({t0:+arrive.toFixed(3),t1:+(Math.min(d,tt+1.1)).toFixed(3),box:e.box});
    }
    /* עוקבים אחרי אלמנט שזז (גלילה) עד האירוע הבא */
    if(e.follow&&e.track){
      const until=i+1<ev.length?ev[i+1].t:start+d*rate;
      for(let st=Math.max(e.t,start)+0.25; st<until; st+=0.25){ const b=boxAt(log,e.track,st); if(!b)break;
        const ff=focusOf(b,e.z,vw,vh), ts=toSeg(st); if(ts>d)break; push(ts,ff,e.z); }
    }
  });
  if(cfg.push){ const lastK=keys[keys.length-1]; push(Math.max(lastK.t+0.1,d),[lastK.fx,lastK.fy+(cfg.push.dy||0)],lastK.z*cfg.push.z); }
  const taps=log.taps.map(x=>toSeg(x.t)).filter(t=>t>0.05&&t<d-0.05).map(t=>+t.toFixed(3));
  return {src:`out/${lang}_${scene}.mp4`, start:+start.toFixed(3), rate:+rate.toFixed(3), recDur:+recDur.toFixed(3),
    vw, vh, ff:rate>1.08, keys:keys.map(k=>({t:+k.t.toFixed(3),fx:+k.fx.toFixed(1),fy:+k.fy.toFixed(1),z:+k.z.toFixed(3)})), rings, taps};
}

function main(){
  const [work,vArg,lArg]=process.argv.slice(2);
  if(!work){ console.error("usage: node prepare.js <work-dir> [versions] [langs]"); process.exit(2); }
  const ad=JSON.parse(fs.readFileSync(path.join(ROOT,"docs/marketing/ad.json"),"utf8"));
  const versions=(vArg||Object.keys(ad.versions).join(",")).split(",");
  const langs=(lArg||"he,en,ar,ru,es").split(",");
  const sc=process.env.SHOTCRAFT||path.join(work,"video-shotcraft");
  const audioDir=path.join(sc,"assets/audio");
  if(!fs.existsSync(audioDir))throw new Error("SHOTCRAFT not found: "+audioDir);
  /* אפקטים ומוזיקה */
  Object.values(SFX).forEach(f=>link(path.join(audioDir,"sfx",f),path.join(PUB,"sfx",f)));
  link(path.join(audioDir,"bgm",BGM.file),path.join(PUB,"bgm",BGM.file));
  /* גופנים, לוגו, קטעי AI */
  const fontsDir=path.join(work,"fonts");
  fs.readdirSync(fontsDir).forEach(f=>link(path.join(fontsDir,f),path.join(PUB,"fonts",f)));
  link(path.join(ROOT,"icon-512.png"),path.join(PUB,"logo.png"));
  /* קטעי ה-AI מגיעים קטנים (464×832 אחרי וואטסאפ): מגדילים פעם אחת
     ב-lanczos + חידוד עדין, במקום ההגדלה הרכה של הדפדפן */
  fs.mkdirSync(path.join(PUB,"gemini"),{recursive:true});
  ["gemini_A","gemini_B"].forEach(g=>{ const f=path.join(work,"gemini",g+".mp4"); if(!fs.existsSync(f))return;
    /* חידוד רק לקטע קטן (464×832 וכדומה); קטע 1080p מקורי נשאר כמו שהוא */
    const sharp=T.probeVideo(f).w<900?",unsharp=5:5:0.7:3:3:0.3":"";
    T.ff(["-i",f,"-an","-vf","scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920"+sharp+",fps=30",
      "-c:v","libx264","-preset","slow","-crf","14","-pix_fmt","yuv420p",path.join(PUB,"gemini",g+".mp4")]); });
  fs.mkdirSync(path.join(PUB,"props"),{recursive:true});

  for(const version of versions)for(const lang of langs){
    const V=ad.versions[version], L=V&&V[lang];
    if(!L){ console.log("skip",version,lang); continue; }
    const vo=path.join(work,"vo",`${lang}_${version}.mp3`);
    const tmp=path.join(work,"tmp",`${version}_${lang}`); fs.mkdirSync(tmp,{recursive:true});
    const P=T.planTimeline(V,L,vo,tmp,lang);
    const voName=`vo/${version}_${lang}${path.extname(P.voFile)}`;
    link(P.voFile,path.join(PUB,voName));
    /* חתיכות הקריינות: [מאיפה בקובץ, עד איפה, מתי בסרטון] */
    const pieces=P.cuts.map((c,i)=>({from:+c.toFixed(3), to:i<P.cuts.length-1?+P.cuts[i+1].toFixed(3):null,
      at:+(P.VO_AT+c+P.shift[i]).toFixed(3)}));
    const gemDur=(g)=>{ const f=path.join(work,"gemini",g+".mp4"); return fs.existsSync(f)?T.probeDur(f):0; };
    const segs=P.segs.map((s,i)=>{
      const o={k:s.k, t0:+s.t0.toFixed(3), t1:+s.t1.toFixed(3), d:+s.d.toFixed(3),
        line:s.line!=null?L.lines[s.line]:null,
        cues:s.cues.map(c=>({text:c.text,start:+c.start.toFixed(3),end:+c.end.toFixed(3),words:words(c)}))};
      if(s.clip)o.clip=planClip(s.clip[0],lang,work,s.d,s.k);
      if(s.src){ const dur=gemDur(s.src);
        let from=0, rate=dur&&dur<s.d?Math.max(1/1.3,dur/s.d):1;
        if(s.k==="hook"&&HOOK.look!=null){
          /* ההקפאה עם הכתובית השנייה — שם המורה צריכה להסתכל למצלמה */
          const tf=s.cues.length>1?s.cues[1].start-s.t0:s.d*0.55;
          if(HOOK.look>=tf){ from=HOOK.look-tf; rate=1; } else rate=Math.max(0.7,HOOK.look/tf);
        } else if(s.k!=="hook"&&CALM.from){ from=Math.min(CALM.from,Math.max(0,dur-1)); rate=Math.max(0.75,Math.min(1,(dur-from)/s.d)); }
        o.gem={src:`gemini/${s.src}.mp4`, dur:+dur.toFixed(3), from:+from.toFixed(3), rate:+rate.toFixed(3)}; }
      return o;
    });
    const props={version,lang,rtl:!!RTL[lang],total:P.TOTAL,fps:30,
      vo:{src:voName,pieces}, segs, end:ad.end[lang], gags:ad.gags[lang], hook:HOOK, sfx:SFX, bgm:BGM};
    fs.writeFileSync(path.join(PUB,"props",`${version}_${lang}.json`),JSON.stringify(props));
    console.log(version,lang,"tempo",P.tempo.toFixed(3),"gap",P.gap.toFixed(2),
      segs.map(s=>s.k+"@"+s.t0+(s.clip?`[${s.clip.start}×${s.clip.rate}]`:"")).join(" "));
  }
}
main();
