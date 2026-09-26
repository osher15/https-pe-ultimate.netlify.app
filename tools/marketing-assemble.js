"use strict";
/* ============================================================
   הרכבת סרטון הפרסומת
   ------------------------------------------------------------
   node tools/marketing-assemble.js <work-dir> <version> <lang> [9x16]

   <work-dir> מכיל:
     out/<lang>_<scene>.mp4   הקלטות המסך (tools/marketing-capture.js)
     vo/<lang>_<version>.mp3  הקריינות
     gemini/gemini_A.mp4 …    קטעי Gemini (לא חובה — בלעדיהם יוצא כרטיס ממלא מקום)
     fonts/fonts.css          גופנים מקומיים (לא חובה)
   פלט: final/<version>_<lang>_9x16.mp4 + subs/<version>_<lang>.srt

   התזמון נגזר מהקריינות: מזהים בה שתיקות, מחלקים את קטעי הכתובית
   (המופרדים ב-'|' ב-docs/marketing/ad.json) לפי אורך הטקסט ומיישרים
   כל גבול לשתיקה הקרובה. כל קטע תמונה מתחיל עם הכתובית הראשונה שלו.
   את הטקסט מציירים ב-Chromium (עברית וערבית נכונות) ומדביקים ב-ffmpeg.
   ============================================================ */
const path=require("path"), fs=require("fs");
const {execFileSync,spawnSync}=require("child_process");
const ROOT=path.resolve(__dirname,"..");

function loadPlaywright(){
  for(const p of ["playwright","playwright-core"]){ try{ return require(p); }catch(e){} }
  const g=execFileSync("npm",["root","-g"],{encoding:"utf8"}).trim();
  return require(path.join(g,"playwright"));
}
function ffmpegBin(){
  if(process.env.FFMPEG)return process.env.FFMPEG;
  try{ return require("ffmpeg-static"); }catch(e){}
  return "ffmpeg";
}
const FF=ffmpegBin();
const ff=(args)=>execFileSync(FF,["-hide_banner","-loglevel","error","-y",...args],{stdio:["ignore","pipe","pipe"]});

const W=1080, H=1920, FPS=30, TOTAL=30;
/* מיקום הטלפון בתוך הפריים האנכי */
const PH={w:800, h:1422, x:140, y:300, r:56};
const RTL={he:1, ar:1};

/* ---------- ניתוח הקריינות ---------- */
function probeDur(file){
  const out=String(spawnSync(FF,["-hide_banner","-i",file]).stderr||"");
  const m=out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m? (+m[1])*3600+(+m[2])*60+(+m[3]) : 0;
}
/* קריינות שנקראת ברצף (למשל multilingual_v2) כמעט בלי הפסקות — אם אין מספיק
   שתיקות לכל הגבולות, מחפשים שוב בסף רגיש יותר */
function silences(file,need){
  const found=silences1(file,"-35dB",0.22);
  return found.length-2>=need? found : silences1(file,"-30dB",0.12);
}
function silences1(file,n,d){
  const out=String(spawnSync(FF,["-hide_banner","-i",file,"-af",`silencedetect=n=${n}:d=${d}`,"-f","null","-"]).stderr||"");
  const st=[...out.matchAll(/silence_start: ([\d.]+)/g)].map(m=>+m[1]);
  const en=[...out.matchAll(/silence_end: ([\d.]+)/g)].map(m=>+m[1]);
  return st.map((s,i)=>({s, e:en[i]!=null?en[i]:s}));
}
/* מחזיר [{text,start,end}] לכל קטע כתובית, בזמני הקריינות */
function cueTimes(chunks, dur, sil){
  const lead=sil.length&&sil[0].s<0.05?sil[0].e:0.05;
  const tail=sil.length&&sil[sil.length-1].e>dur-0.1?sil[sil.length-1].s:dur;
  const inner=sil.filter(x=>x.s>lead+0.1&&x.e<tail-0.1);
  const len=chunks.map(c=>c.length), sum=len.reduce((a,b)=>a+b,0);
  /* זמן «דיבור» נטו, כדי שהחלוקה היחסית לא תיפול באמצע שתיקה */
  const speech=(t)=>{ let v=t-lead; inner.forEach(x=>{ if(t>x.e)v-=x.e-x.s; else if(t>x.s)v-=t-x.s; }); return v; };
  const fromSpeech=(v)=>{ let t=lead+v; for(const x of inner){ if(t>x.s)t+=x.e-x.s; else break; } return t; };
  const net=speech(tail);
  /* יישור: כל גבול בין קטעים נצמד לשתיקה, או נשאר «באמצע דיבור».
     גבול אחרי סוף משפט (. ? ! : —) כמעט תמיד נופל על הפסקה ארוכה;
     גבול אחרי פסיק — לא בהכרח. שתיקה ארוכה שלא שימשה גבול עולה ביוקר.
     תכנות דינמי על הגבולות והשתיקות לפי הסדר. */
  const B=chunks.length-1, M=inner.length;
  const guess=[]; { let acc=0; for(let i=0;i<B;i++){ acc+=len[i]; guess.push(fromSpeech(net*acc/sum)); } }
  const hard=chunks.slice(0,B).map(c=>/[.?!:—…؟]$/.test(c));
  const mid=(x)=>(x.s+x.e)/2, sd=(x)=>x.e-x.s;
  const unused=(x)=>sd(x)>=0.4?2*sd(x):0.3*sd(x);
  const free=(b)=>hard[b]?3:0.6;
  /* עונש על קטע שאורכו לא מתאים לכמות הטקסט שבו (קריינות רציפה מלאה
     בהפסקות זעירות, וקל ליפול על אחת מהן) */
  const rate=net/sum, chars=(a,z)=>len.slice(a,z).reduce((x,y)=>x+y,0);
  const durPen=(t0,t1,a,z)=>{ const act=Math.max(0.05,speech(t1)-speech(t0)), exp=rate*chars(a,z); return 2*Math.abs(Math.log(act/exp)); };
  /* S[i][p]: נקבעו i גבולות, והאחרון נצמד לשתיקה p (p=-1 → תחילת הקריינות) */
  const key=(i,p)=>i+":"+p, S=new Map(), from=new Map();
  S.set(key(0,-1),0);
  const endT=(p)=>p<0?lead:inner[p].e;
  let best=Infinity, bestKey=null;
  for(let i=0;i<=B;i++)for(let p=-1;p<M;p++){
    const v=S.get(key(i,p)); if(v===undefined)continue;
    /* סיום: כל הגבולות שנותרו חופשיים */
    let fin=v+durPen(endT(p),tail,i,B+1);
    for(let b=i;b<B;b++)fin+=free(b);
    for(let q=p+1;q<M;q++)fin+=unused(inner[q]);
    if(fin<best){ best=fin; bestKey=[i,p,"end"]; }
    let freeAcc=0;
    for(let k=i+1;k<=B;k++){
      let skip=0;
      for(let j=p+1;j<M;j++){
        if(j>p+1)skip+=unused(inner[j-1]);
        if(inner[j].s<=endT(p))continue;
        const c=v+freeAcc+skip+0.3*Math.abs(mid(inner[j])-guess[k-1])+durPen(endT(p),inner[j].s,i,k);
        const kk=key(k,j);
        if(c<(S.get(kk)??Infinity)){ S.set(kk,c); from.set(kk,[i,p]); }
      }
      freeAcc+=free(k-1);
    }
  }
  const bounds=Array(B).fill(null);
  for(let [i,p]=bestKey; p>=0; ){ bounds[i-1]=inner[p]; [i,p]=from.get(key(i,p)); }
  /* גבולות חופשיים: חלוקה יחסית בתוך הטווח שבין העוגנים שמשני הצדדים */
  for(let i=0;i<B;i++){
    if(bounds[i])continue;
    let a=i; while(a>0&&!bounds[a-1])a--;
    let z=i; while(z<B&&!bounds[z])z++;
    const t0=a?bounds[a-1].e:lead, t1=z<B?bounds[z].s:tail;
    const tot=len.slice(a,z+1).reduce((x,y)=>x+y,0);
    let acc=0; for(let k=a;k<z;k++){ acc+=len[k]; const t=fromSpeech(speech(t0)+(speech(t1)-speech(t0))*acc/tot); bounds[k]={s:t,e:t}; }
  }
  return chunks.map((text,i)=>({text,
    start:i?bounds[i-1].e:lead, end:i<chunks.length-1?bounds[i].s:tail}));
}
const srtTime=(t)=>{ const ms=Math.round(t*1000), h=Math.floor(ms/3600000), m=Math.floor(ms/60000)%60, s=Math.floor(ms/1000)%60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")},${String(ms%1000).padStart(3,"0")}`; };

/* ---------- ציור הטקסט ב-Chromium ---------- */
function css(lang,fontsCss){
  const fam=lang==="ar"?"'Cairo','Rubik',sans-serif":"'Rubik','Cairo',sans-serif";
  return `${fontsCss}
  *{margin:0;box-sizing:border-box} html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden}
  body{font-family:${fam};color:#fff;direction:${RTL[lang]?"rtl":"ltr"}}
  .bg{position:absolute;inset:0;background:
     radial-gradient(900px 700px at 85% 8%,rgba(163,230,53,.22),transparent 60%),
     radial-gradient(900px 800px at 10% 95%,rgba(251,146,60,.20),transparent 60%),
     linear-gradient(160deg,#111531,#0c0e1a 45%,#090a14)}
  .lanes{position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 120px,rgba(255,255,255,.035) 120px 124px)}
  .hl{position:absolute;left:60px;right:60px;top:0;height:${PH.y}px;display:flex;align-items:center;justify-content:center;text-align:center}
  .hl b{font-size:70px;font-weight:800;line-height:1.12;letter-spacing:-.5px;text-shadow:0 4px 24px rgba(0,0,0,.55)}
  .hl b i{font-style:normal;color:#a3e635}
  .sub{position:absolute;left:50px;right:50px;bottom:34px;display:flex;justify-content:center}
  .sub.full{bottom:150px}
  .sub span{background:rgba(6,8,18,.78);border:1px solid rgba(255,255,255,.10);border-radius:22px;padding:14px 28px;
     font-size:44px;font-weight:500;line-height:1.3;text-align:center;max-width:980px}
  .frame{position:absolute;left:${PH.x-10}px;top:${PH.y-10}px;width:${PH.w+20}px;height:${PH.h+20}px;border-radius:${PH.r+10}px;
     border:10px solid #1c2035;box-shadow:0 0 0 2px rgba(255,255,255,.12),0 40px 90px rgba(0,0,0,.6),0 0 120px rgba(163,230,53,.12)}
  .mask{position:absolute;inset:0;background:#000}
  .mask div{position:absolute;left:0;top:0;width:${PH.w}px;height:${PH.h}px;border-radius:${PH.r}px;background:#fff}
  .card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px;gap:36px}
  .card .big{font-size:96px;font-weight:800;line-height:1.1}
  .card .big i{font-style:normal;color:#a3e635}
  .card .ph{font-size:34px;color:rgba(255,255,255,.55);border:2px dashed rgba(255,255,255,.3);border-radius:18px;padding:12px 26px;direction:rtl}
  .logo{width:260px;height:260px;border-radius:64px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 80px rgba(0,0,0,.5)}
  .logo img{width:220px}
  .name{font-size:104px;font-weight:800;direction:ltr} .name i{font-style:normal;color:#a3e635}
  .url{font-size:52px;font-weight:800;color:#0c0e1a;background:#a3e635;border-radius:999px;padding:18px 46px;direction:ltr}
  .tag{font-size:44px;color:rgba(255,255,255,.8)}`;
}
const esc=(s)=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
/* מדגיש בירוק את מה שאחרי הנקודה או המקף האחרונים («פחות ניירת. <יותר שיעור.>»);
   br=true שובר שורה לפני החלק המודגש (בכרטיסים הגדולים) */
const hlText=(s,br)=>{ const m=String(s).match(/^(.*[^.\s]\s?[.—:]\s+)(\S.*)$/); return m? esc(m[1].trim())+(br?"<br>":" ")+"<i>"+esc(m[2])+"</i>" : esc(s); };

async function renderPng(page,html,file,opaque){
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${page._css}</style></head><body>${html}</body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:file, omitBackground:!opaque});
}

/* ---------- main ---------- */
(async()=>{
  const [work,version,lang]=process.argv.slice(2);
  if(!work||!version||!lang){ console.error("usage: marketing-assemble.js <work-dir> <version> <lang>"); process.exit(2); }
  const ad=JSON.parse(fs.readFileSync(path.join(ROOT,"docs/marketing/ad.json"),"utf8"));
  const V=ad.versions[version], L=V&&V[lang];
  if(!L)throw new Error("no data for "+version+"/"+lang);
  const vo=path.join(work,"vo",`${lang}_${version}.mp3`);
  if(!fs.existsSync(vo))throw new Error("missing "+vo);
  const tmp=path.join(work,"tmp",`${version}_${lang}`); fs.mkdirSync(tmp,{recursive:true});
  fs.mkdirSync(path.join(work,"final"),{recursive:true}); fs.mkdirSync(path.join(work,"subs"),{recursive:true});

  /* 1. תזמון */
  let dur=probeDur(vo);
  /* הקריינות צריכה להסתיים עד 29.2 שנ׳; ארוכה מזה — מאיצים מעט (עד 12%) */
  const tempo=Math.min(1.12,Math.max(1,dur/29.2));
  let voFile=vo;
  if(tempo>1.001){ voFile=path.join(tmp,"vo.wav"); ff(["-i",vo,"-af",`atempo=${tempo.toFixed(4)}`,voFile]); dur=probeDur(voFile); }
  const VO_AT=0.25;                                   /* הקריינות נכנסת רבע שנייה אחרי תחילת הסרטון */
  const chunks=L.vo.split("|").map(s=>s.trim());
  const need=V.segs.reduce((a,s)=>a+s.n,0);
  if(chunks.length!==need)throw new Error(`${lang}: ${chunks.length} subtitle chunks, segments expect ${need}`);
  const cues=cueTimes(chunks,dur,silences(voFile,chunks.length-1)).map(c=>({...c,start:c.start+VO_AT,end:c.end+VO_AT}));
  let ci=0;
  const segs=V.segs.map((s,i)=>{ const first=ci; ci+=s.n; return {...s, cues:cues.slice(first,ci), t0:i?cues[first].start-0.12:0}; });
  segs.forEach((s,i)=>{ s.t1=i<segs.length-1?segs[i+1].t0:TOTAL; s.d=s.t1-s.t0; });
  fs.writeFileSync(path.join(work,"subs",`${version}_${lang}.srt`),
    cues.map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n"));

  /* 2. ציור שכבות הטקסט */
  const pw=loadPlaywright();
  const browser=await pw.chromium.launch();
  const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
  const fontsDir=path.join(work,"fonts");
  let fontsCss="";
  if(fs.existsSync(path.join(fontsDir,"fonts.css")))
    fontsCss=fs.readFileSync(path.join(fontsDir,"fonts.css"),"utf8").replace(/url\((f\d+\.woff2)\)/g,(m,f)=>`url(file://${path.join(fontsDir,f)})`);
  page._css=css(lang,fontsCss);
  const logo="data:image/png;base64,"+fs.readFileSync(path.join(ROOT,"icon-512.png")).toString("base64");
  const P=(n)=>path.join(tmp,n);
  await renderPng(page,`<div class="bg"></div><div class="lanes"></div>`,P("bg.png"),true);
  await renderPng(page,`<div class="frame"></div>`,P("frame.png"));
  await page.setViewportSize({width:PH.w,height:PH.h});
  await renderPng(page,`<div class="mask"><div></div></div>`,P("mask.png"),true);
  await page.setViewportSize({width:W,height:H});
  for(const [i,s] of segs.entries()){
    if(s.line!=null && s.clip) await renderPng(page,`<div class="hl"><b>${hlText(L.lines[s.line])}</b></div>`,P(`hl${i}.png`));
    for(const [j,c] of s.cues.entries())
      await renderPng(page,`<div class="sub${s.clip?"":" full"}"><span>${esc(c.text)}</span></div>`,P(`sub${i}_${j}.png`));
    if(s.src && !fs.existsSync(path.join(work,"gemini",s.src+".mp4"))){
      const big=s.line!=null?hlText(L.lines[s.line],true):"";
      await renderPng(page,`<div class="bg"></div><div class="lanes"></div><div class="card">${big?`<div class="big">${big}</div>`:""}
        <div class="ph">כאן ייכנס קטע ${s.src}.mp4</div></div>`,P(`card${i}.png`),true);
    } else if(s.src && s.line!=null){
      await renderPng(page,`<div class="card"><div class="big" style="text-shadow:0 6px 30px rgba(0,0,0,.7)">${hlText(L.lines[s.line],true)}</div></div>`,P(`hl${i}.png`));
    }
    if(s.k==="end")
      await renderPng(page,`<div class="bg"></div><div class="lanes"></div><div class="card">
        <div class="logo"><img src="${logo}"></div><div class="name">PE <i>Ultimate</i></div>
        <div class="url">pe-ultimate.netlify.app</div><div class="tag">${esc(ad.end[lang])}</div></div>`,P(`card${i}.png`),true);
  }
  await browser.close();

  /* 3. קטע וידאו לכל חלק */
  const parts=[];
  for(const [i,s] of segs.entries()){
    const out=P(`seg${i}.mp4`), d=s.d.toFixed(3);
    const inputs=[], chain=[];
    let base;
    if(s.clip){
      const src=path.join(work,"out",`${lang}_${s.clip[0]}.mp4`);
      inputs.push("-loop","1","-i",P("bg.png"), "-ss",String(s.clip[1]),"-i",src, "-loop","1","-i",P("mask.png"), "-loop","1","-i",P("frame.png"));
      chain.push(`[1:v]fps=${FPS},scale=${PH.w}:${PH.h},tpad=stop_mode=clone:stop_duration=${TOTAL},format=rgba[ph]`,
                 `[2:v]format=gray,scale=${PH.w}:${PH.h}[mk]`,`[ph][mk]alphamerge[phm]`,
                 `[0:v][phm]overlay=${PH.x}:${PH.y}[a0]`,`[a0][3:v]overlay=0:0[a1]`);
      base="a1"; let k=4;
      if(fs.existsSync(P(`hl${i}.png`))){ inputs.push("-loop","1","-i",P(`hl${i}.png`)); chain.push(`[${base}][${k}:v]overlay=0:0[b${k}]`); base=`b${k}`; k++; }
      s.cues.forEach((c,j)=>{ inputs.push("-loop","1","-i",P(`sub${i}_${j}.png`));
        const a=Math.max(0,c.start-s.t0).toFixed(3), b=(c.end-s.t0+0.15).toFixed(3);
        chain.push(`[${base}][${k}:v]overlay=0:0:enable='between(t,${a},${b})'[b${k}]`); base=`b${k}`; k++; });
    } else {
      const gem=s.src&&path.join(work,"gemini",s.src+".mp4");
      if(gem&&fs.existsSync(gem)){
        inputs.push("-i",gem);
        chain.push(`[0:v]fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},tpad=stop_mode=clone:stop_duration=${TOTAL}[a1]`);
      } else {
        inputs.push("-loop","1","-i",P(`card${i}.png`));
        /* זום איטי, כדי שכרטיס סטטי לא ייראה קפוא */
        chain.push(`[0:v]scale=${W*2}:${H*2},zoompan=z='1+0.0009*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=${FPS}[a1]`);
      }
      base="a1"; let k=1;
      if(s.src&&gem&&fs.existsSync(gem)&&fs.existsSync(P(`hl${i}.png`))){ inputs.push("-loop","1","-i",P(`hl${i}.png`)); chain.push(`[${base}][${k}:v]overlay=0:0[b${k}]`); base=`b${k}`; k++; }
      if(s.k!=="end") s.cues.forEach((c,j)=>{ inputs.push("-loop","1","-i",P(`sub${i}_${j}.png`));
        const a=Math.max(0,c.start-s.t0).toFixed(3), b=(c.end-s.t0+0.15).toFixed(3);
        chain.push(`[${base}][${k}:v]overlay=0:0:enable='between(t,${a},${b})'[b${k}]`); base=`b${k}`; k++; });
    }
    chain.push(`[${base}]format=yuv420p[v]`);
    ff([...inputs,"-filter_complex",chain.join(";"),"-map","[v]","-t",d,"-r",String(FPS),
        "-c:v","libx264","-preset","medium","-crf","17","-an",out]);
    parts.push(out);
  }

  /* 4. חיבור + קריינות */
  const list=P("parts.txt");
  fs.writeFileSync(list,parts.map(p=>`file '${p}'`).join("\n"));
  const final=path.join(work,"final",`${version}_${lang}_9x16.mp4`);
  ff(["-f","concat","-safe","0","-i",list,"-i",voFile,
      "-filter_complex",`[1:a]adelay=${Math.round(VO_AT*1000)}:all=1,apad,afade=t=out:st=${TOTAL-0.6}:d=0.6,loudnorm=I=-16:TP=-1.5[a]`,
      "-map","0:v","-map","[a]","-t",String(TOTAL),"-c:v","copy","-c:a","aac","-b:a","192k","-ar","48000","-movflags","+faststart",final]);
  console.log(JSON.stringify({final, tempo:+tempo.toFixed(3), vo:+dur.toFixed(2),
    segs:segs.map(s=>({k:s.k, t0:+s.t0.toFixed(2), d:+s.d.toFixed(2)})),
    cues:cues.map(c=>[+c.start.toFixed(2),+c.end.toFixed(2),c.text])},null,1));
})().catch(e=>{ console.error(e&&e.stderr?String(e.stderr):e); process.exit(1); });
