"use strict";
/* ============================================================
   תזמון הפרסומת לפי הקריינות — משותף ל-tools/marketing-assemble.js
   (ffmpeg) ול-marketing/video (Remotion)
   ------------------------------------------------------------
   planTimeline() מחזיר את זמני הכתוביות, את זמני הקטעים ואת נקודות
   החיתוך בקריינות (הפסקות שנוספו כדי למלא את הזמן הפנוי).
   ============================================================ */
const path=require("path"), fs=require("fs");
const {execFileSync,spawnSync}=require("child_process");
function ffmpegBin(){
  if(process.env.FFMPEG)return process.env.FFMPEG;
  try{ return require("ffmpeg-static"); }catch(e){}
  return "ffmpeg";
}
const FF=ffmpegBin();
const ff=(args)=>execFileSync(FF,["-hide_banner","-loglevel","error","-y",...args],{stdio:["ignore","pipe","pipe"]});
/* ---------- ניתוח הקריינות ---------- */
function probeDur(file){
  const out=String(spawnSync(FF,["-hide_banner","-i",file]).stderr||"");
  const m=out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m? (+m[1])*3600+(+m[2])*60+(+m[3]) : 0;
}
/* קריינות שנקראת ברצף (למשל multilingual_v2) כמעט בלי הפסקות — אם אין מספיק
   שתיקות לכל הגבולות, מחפשים שוב בסף רגיש יותר */
function probeVideo(file){
  const out=String(spawnSync(FF,["-hide_banner","-i",file]).stderr||"");
  const m=out.match(/Video:.*?, (\d{2,5})x(\d{2,5})/);
  return {w:m?+m[1]:W, h:m?+m[2]:H, dur:probeDur(file)};
}
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

/* ---------- תזמון מלא לגרסה ושפה ---------- */
const VO_AT=0.25;                                   /* הקריינות נכנסת רבע שנייה אחרי תחילת הסרטון */
const END_CARD=3.2;
function planTimeline(V,L,vo,tmp,lang){
  const TOTAL=V.total||30;
  /* 1. תזמון */
  let dur=probeDur(vo);
  /* הקריינות צריכה להסתיים 0.8 שנ׳ לפני הסוף; ארוכה מזה — מאיצים מעט (עד 12%) */
  const tempo=Math.min(1.12,Math.max(1,dur/(TOTAL-0.8)));
  let voFile=vo;
  if(tempo>1.001){ voFile=path.join(tmp,"vo.wav"); ff(["-i",vo,"-af",`atempo=${tempo.toFixed(4)}`,voFile]); dur=probeDur(voFile); }
  const chunks=L.vo.split("|").map(s=>s.trim());
  const need=V.segs.reduce((a,s)=>a+s.n,0);
  if(chunks.length!==need)throw new Error(`${lang}: ${chunks.length} subtitle chunks, segments expect ${need}`);
  const cues=cueTimes(chunks,dur,silences(voFile,chunks.length-1)).map(c=>({...c,start:c.start+VO_AT,end:c.end+VO_AT}));
  /* קריינות קצרה מהסרטון: מפזרים את הזמן הפנוי כהפסקות קצרות בין הקטעים
     (עד 0.8 שנ׳ כל אחת), כדי שכרטיס הסיום לא יימתח על שש שניות.
     האודיו נחתך בדיוק בנקודות האלה (בתוך הפסקה) ומוזז קדימה */
  let ci=0; const firsts=V.segs.map(s=>{ const f=ci; ci+=s.n; return f; });
  const slack=(TOTAL-END_CARD)-(VO_AT+dur);
  /* חותכים רק בגבול שיש בו הפסקה אמיתית — לא באמצע משפט */
  const pauseAt=firsts.map((f,i)=>i>0&&cues[f].start-cues[f-1].end>0.15);
  const nCuts=pauseAt.filter(Boolean).length;
  const gap=slack>0.3&&nCuts?Math.min(0.8,slack/nCuts):0;
  const cuts=[0], shift=[0];                                       /* זמני חיתוך בקריינות המקורית, והזזה לכל חתיכה */
  let sh=0;
  V.segs.forEach((s,i)=>{
    if(pauseAt[i]&&gap){ sh+=gap; cuts.push(cues[firsts[i]].start-VO_AT-0.12); shift.push(sh); }
    for(let k=firsts[i];k<firsts[i]+s.n;k++){ cues[k].start+=sh; cues[k].end+=sh; }
  });
  const segs=V.segs.map((s,i)=>({...s, cues:cues.slice(firsts[i],firsts[i]+s.n), t0:i?cues[firsts[i]].start-0.12:0}));
  segs.forEach((s,i)=>{ s.t1=i<segs.length-1?segs[i+1].t0:TOTAL; s.d=s.t1-s.t0; });
  return {TOTAL,tempo,voFile,dur,cues,segs,gap,cuts,shift,VO_AT};
}
module.exports={ffmpegBin,FF,ff,probeDur,probeVideo,silences,cueTimes,srtTime,planTimeline,VO_AT,END_CARD};
