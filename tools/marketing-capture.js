"use strict";
/* ============================================================
   צילום חומרי שיווק מהאפליקציה האמיתית
   ------------------------------------------------------------
   node tools/marketing-capture.js [out-dir] [he,en,ar,ru,es] [scene,...]

   לכל שפה ולכל סצנה: סרטון MP4 אנכי 1080×1920 (מסך טלפון) וצילום
   PNG חד. הכול עם נתוני דמו בדויים — אין כאן אף תלמיד אמיתי.

   הווידאו נלכד ב-CDP screencast (פריים JPEG באיכות גבוהה לכל שינוי
   במסך) ומקודד ב-ffmpeg ל-30fps קבועים. ההקלטה המובנית של Playwright
   מקודדת בקצב סיביות נמוך, והטקסט בממשק יוצא מטושטש.
   ffmpeg: משתנה הסביבה FFMPEG, אחרת ffmpeg-static, אחרת ffmpeg במערכת.
   ============================================================ */
const path=require("path"), fs=require("fs"), http=require("http");
const {execFileSync}=require("child_process");
const ROOT=path.resolve(__dirname,"..");
const D=require(path.join(ROOT,"hm-data.js"));

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

/* ---------- נתוני דמו לכל שפה ---------- */
const NAMES={
  he:[["דנה לוי","girls"],["יואב כהן","boys"],["נועה פרץ","girls"],["איתי מזרחי","boys"],
      ["מאיה אברהם","girls"],["עומר שלום","boys"],["שירה דוד","girls"],["אלון ביטון","boys"]],
  en:[["Emma Carter","girls"],["Liam Brooks","boys"],["Olivia Reed","girls"],["Noah Hayes","boys"],
      ["Ava Turner","girls"],["Ethan Cole","boys"],["Mia Foster","girls"],["Lucas Grant","boys"]],
  ar:[["ليان حداد","girls"],["أحمد خليل","boys"],["سلمى ناصر","girls"],["يوسف عمر","boys"],
      ["نور عادل","girls"],["رامي سعيد","boys"],["هبة ياسين","girls"],["كريم منصور","boys"]],
  ru:[["Анна Смирнова","girls"],["Иван Петров","boys"],["Мария Козлова","girls"],["Дмитрий Орлов","boys"],
      ["София Волкова","girls"],["Максим Лебедев","boys"],["Алиса Морозова","girls"],["Артём Новиков","boys"]],
  es:[["Sofía García","girls"],["Mateo López","boys"],["Lucía Martín","girls"],["Hugo Sánchez","boys"],
      ["Valeria Ruiz","girls"],["Daniel Torres","boys"],["Paula Díaz","girls"],["Martín Romero","boys"]]
};
const GID="g:demo14";
function seed(lang,withGroup){
  const cls={"c:ט:1":{id:"c:ט:1",name:"ט׳1",grade:"ט",num:1,key:"ט1"},
             "c:ט:4":{id:"c:ט:4",name:"ט׳4",grade:"ט",num:4,key:"ט4"}};
  if(withGroup)cls[GID]={id:GID,kind:"group",name:"ט׳1 + ט׳4",key:"ט׳1 + ט׳4",members:["c:ט:1","c:ט:4"],sids:[]};
  const stu=NAMES[lang].map(([name,sex],i)=>{
    const c=i<4?["ט׳1","c:ט:1"]:["ט׳4","c:ט:4"];
    return {id:"s"+i,name,cls:c[0],cid:c[1],sex,age:14,h:null,w:null,tests:[],
      grades:{"רבעון 1":{part:[92,85,78,96,88,81,94,73][i],improve:[90,80,85,95,88,75,92,70][i],team:[95,85,80,90,85,80,95,75][i]}}};
  });
  /* היסטוריה קצרה במבחנים — כדי שמדד הכושר והכרטיסים לא יהיו ריקים */
  const res=[], day=(n)=>new Date(Date.now()-n*86400000).toISOString().slice(0,10);
  /* ארבע מדידות לאורך שלושה חודשים, עם שיפור — כדי שגרף ההתקדמות של
     שחקן יראה משהו אמיתי */
  stu.forEach((s,i)=>{
    [[84,0],[56,1],[28,2],[7,3]].forEach(([ago,k])=>{
      [["r60",9.6+i*0.12-k*0.18,"שנ׳"],["push",14+i*2+k*3,"חזרות"],["ljump",158+i*5+k*6,"ס״מ"],["beep",700+i*60+k*120,"מ׳"]]
        .forEach(([t,v,u],j)=>res.push({id:"f"+i+"_"+k+"_"+j,ts:Date.now()-ago*86400000,d:day(ago),cls:s.cls,cid:s.cid,test:t,
          name:s.name,sid:s.id,gradeKey:"ט",sex:s.sex,normVer:"",val:+v.toFixed(2),unit:u}));
    });
  });
  const beepRes=stu.slice(0,6).map((s,i)=>{ const lv=[7,6,8,5,6,7][i], sh=[4,2,1,6,5,3][i];
    return {id:i+1,name:s.name,level:lv,sh,dist:(lv*8+sh)*20-160,time:lv*60+sh*8,speed:8+lv*0.5}; });
  return {"ft.classes":cls,"stu.list":stu,"ft.results":res,"pf.guideSeen":true,"hx.leadDone":true,
    "schema.version":D.SCHEMA_VERSION,"lang":lang,
    "ft.last":withGroup?{grade:"ט",num:1,gid:GID}:{grade:"ט",num:1},
    "hub.cls":withGroup?GID:"c:ט:1",
    "bt.results":beepRes,"bt.heat":{cls:"ט׳1 + ט׳4",names:stu.map(s=>s.name)}};
}

/* ---------- שרת סטטי ---------- */
const MIME={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".css":"text/css",
  ".png":"image/png",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json"};
function serve(){
  return new Promise(res=>{
    const srv=http.createServer((q,r)=>{
      const f=path.join(ROOT,decodeURIComponent(q.url.split("?")[0]).replace(/^\/+/,""));
      if(f.indexOf(ROOT)!==0){ r.writeHead(403); return r.end(); }
      fs.readFile(f,(e,b)=>{ if(e){ r.writeHead(404); return r.end(); }
        r.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"}); r.end(b); });
    });
    srv.listen(0,"127.0.0.1",()=>res(srv));
  });
}

/* ---------- עזרי «צילום» ---------- */
const W=432,H=768,DPR=2.5;          /* 1080×1920 בפועל */
const wait=ms=>new Promise(r=>setTimeout(r,ms));
/* עיגול הקשה — הצופה רואה איפה «האצבע» נגעה */
const TAP_JS=`(function(){
  const st=document.createElement("style");
  st.textContent=".mk-tap{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;"+
    "background:rgba(255,255,255,.45);border:2px solid rgba(255,255,255,.9);pointer-events:none;z-index:2147483647;"+
    "animation:mkTap .55s ease-out forwards}@keyframes mkTap{from{transform:scale(.4);opacity:1}to{transform:scale(1.5);opacity:0}}"+
    "::-webkit-scrollbar{display:none}";
  document.addEventListener("DOMContentLoaded",()=>document.head.appendChild(st));
  addEventListener("pointerdown",e=>{ const d=document.createElement("div"); d.className="mk-tap";
    d.style.left=e.clientX+"px"; d.style.top=e.clientY+"px"; document.body.appendChild(d); setTimeout(()=>d.remove(),700); },true);
})();`;
async function tap(page,sel,{pause=650}={}){
  const el=page.locator(sel).first();
  await el.scrollIntoViewIfNeeded(); await wait(250);
  const b=await el.boundingBox(); if(!b)throw new Error("no box: "+sel);
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});
  await page.mouse.down(); await wait(90); await page.mouse.up();
  await wait(pause);
}
async function glide(page,dy,ms=900){
  const steps=Math.max(8,Math.round(ms/30));
  for(let i=0;i<steps;i++){ await page.mouse.wheel(0,dy/steps); await wait(ms/steps); }
}

/* ---------- screencast → mp4 ---------- */
async function record(page,outBase,fn){
  const cdp=await page.context().newCDPSession(page);
  const frames=[]; let t0=null;
  cdp.on("Page.screencastFrame",async f=>{
    const ts=f.metadata.timestamp; if(t0==null)t0=ts;
    frames.push({t:ts-t0,buf:Buffer.from(f.data,"base64")});
    try{ await cdp.send("Page.screencastFrameAck",{sessionId:f.sessionId}); }catch(e){}
  });
  await cdp.send("Page.startScreencast",{format:"jpeg",quality:95,maxWidth:W*DPR,maxHeight:H*DPR,everyNthFrame:1});
  const start=Date.now();
  await fn();
  await wait(400);
  await cdp.send("Page.stopScreencast");
  const total=(Date.now()-start)/1000;
  await page.screenshot({path:outBase+".png"});
  /* רשימת concat: כל פריים מוחזק עד הפריים הבא; האחרון עד סוף ההקלטה */
  const dir=outBase+"_frames"; fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  let list="";
  frames.forEach((f,i)=>{
    const p=path.join(dir,String(i).padStart(5,"0")+".jpg"); fs.writeFileSync(p,f.buf);
    const next=i+1<frames.length?frames[i+1].t:Math.max(total,f.t+0.5);
    list+="file '"+p+"'\nduration "+Math.max(0.001,next-f.t).toFixed(3)+"\n";
  });
  if(frames.length)list+="file '"+path.join(dir,String(frames.length-1).padStart(5,"0")+".jpg")+"'\n";
  fs.writeFileSync(dir+".txt",list);
  execFileSync(ffmpegBin(),["-y","-loglevel","error","-f","concat","-safe","0","-i",dir+".txt",
    "-vf","scale=1080:1920:flags=lanczos,format=yuv420p","-r","30","-c:v","libx264","-preset","slow","-crf","16",
    "-movflags","+faststart",outBase+".mp4"]);
  fs.rmSync(dir,{recursive:true,force:true}); fs.rmSync(dir+".txt",{force:true});
  return {frames:frames.length,seconds:+total.toFixed(1)};
}

/* ---------- הסצנות ---------- */
const G=()=>`window.HMDATA`;
const SCENES={
  /* 1. חיבור כיתות — «🔗 חבר כיתות», סימון שתי הכיתות, «חבר» */
  join:{group:false,prep:async p=>{ await p.evaluate(()=>window.HM.go("ft")); await wait(900);
      await p.evaluate(()=>document.getElementById("ft-groups").scrollIntoView({block:"center"})); await wait(500); },
    run:async p=>{
      await wait(500);
      await tap(p,"#ft-groups [data-join]",{pause:900});
      /* הכיתה הנוכחית כבר מסומנת — מסמנים רק את השנייה */
      await tap(p,"#askModal .ask-checks label:nth-child(2)",{pause:800});
      await tap(p,"#ask-ok",{pause:1200});
      await p.evaluate(()=>document.getElementById("ft-clsName").scrollIntoView({block:"center",behavior:"smooth"}));
      await wait(1500);
    }},
  /* 2. מבחן בקבוצה — רשימה אחת עם הכיתה של כל תלמיד, הזנה מהירה */
  test:{group:true,prep:async p=>{ await p.evaluate(()=>window.HM.go("ft")); await wait(900);
      await p.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click()); await wait(900);
      await p.evaluate(()=>document.querySelector("#ft-list").scrollIntoView({block:"start"})); await p.evaluate(()=>scrollBy(0,-120)); await wait(400); },
    run:async p=>{
      await wait(500);
      const keys=await p.evaluate(()=>[...document.querySelectorAll("#ft-list .ft-row")].map(r=>r.dataset.n));
      const vals=[182,171,165,190];
      for(let i=0;i<4&&i<keys.length;i++){
        const sel='#ft-list [data-val="'+keys[i].replace(/"/g,'\\"')+'"]';
        await tap(p,sel,{pause:200});
        await p.keyboard.type(String(vals[i]),{delay:110});
        await p.keyboard.press("Enter"); await wait(450);
      }
      await wait(900);
    }},
  /* 3. ביפ טסט — שעון רץ, רישום נשירה, «שמור לכיתה» */
  beep:{group:true,prep:async p=>{ await p.evaluate(()=>window.HM.go("beep")); await wait(900); },
    run:async p=>{
      await wait(400);
      await tap(p,"#bt-startBtn",{pause:2200});
      await tap(p,"#bt-startBtn",{pause:500});   /* השהיה — הלוח נשמר */
      await p.evaluate(()=>document.getElementById("bt-toFt").scrollIntoView({block:"center",behavior:"smooth"}));
      await wait(1300);
      await tap(p,"#bt-toFt",{pause:1600});
    }},
  /* 4. נוכחות — כל הקבוצה, הקשה אחת */
  att:{group:true,prep:async p=>{ await p.evaluate(g=>window.TOOLS.show(g,"att"),GID); await wait(1000); },
    run:async p=>{
      await wait(700);
      await tap(p,"#tl-attAll",{pause:900});
      await glide(p,420,1400); await wait(700);
    }},
  /* 5. ציונים — טבלה אחת לקבוצה */
  grades:{group:true,prep:async p=>{ await p.evaluate(g=>window.STU.show(g,"grades"),GID); await wait(1100); },
    run:async p=>{ await wait(900); await glide(p,380,1500); await wait(1100); }},
  /* 7. מדד הכושר — ציון לכל תלמיד, לכל הקבוצה */
  idx:{group:true,prep:async p=>{ await p.evaluate(g=>window.FT.show(g,"idx"),GID); await wait(1200); },
    run:async p=>{ await wait(900); await glide(p,420,1600); await wait(1000); }},
  /* 8. כרטיס שחקן — התפתחות לאורך זמן (מאמנים) */
  player:{group:true,prep:async p=>{ await p.evaluate(()=>window.HM.go("ft")); await wait(900);
      await p.evaluate(()=>document.querySelector('#ft-tests [data-t="push"]').click()); await wait(900);
      await p.evaluate(()=>document.querySelector("#ft-list").scrollIntoView({block:"start"})); await p.evaluate(()=>scrollBy(0,-120)); await wait(400); },
    run:async p=>{
      await wait(500);
      await tap(p,"#ft-list [data-card]",{pause:1300});
      await p.mouse.move(W/2,H*0.6);
      await glide(p,520,1800); await wait(1200);
    }},
  /* 9. התקדמות הקבוצה (מאמנים ומנהלים) */
  prog:{group:true,prep:async p=>{ await p.evaluate(g=>window.FT.show(g,"prog"),GID); await wait(1200); },
    run:async p=>{ await wait(900); await glide(p,480,1800); await wait(1000); }},
  /* 6. מרכז הכיתה — תמונת מצב */
  hub:{group:true,prep:async p=>{ await p.evaluate(()=>window.HM.go("cls")); await wait(1100); },
    run:async p=>{ await wait(900); await glide(p,520,1800); await wait(1000); }}
};

async function openApp(browser,base,lang,withGroup){
  const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR,locale:lang,
    hasTouch:false,colorScheme:"dark"});
  const page=await ctx.newPage();
  const errs=[];
  page.on("pageerror",e=>errs.push(e.message));
  await page.route("**/*",r=>r.request().url().startsWith("http://127.0.0.1")?r.continue():r.abort());
  await page.addInitScript(TAP_JS);
  await page.addInitScript(s=>{ try{ Object.keys(s).forEach(k=>localStorage.setItem("peultimate."+k,JSON.stringify(s[k]))); }catch(e){} },seed(lang,withGroup));
  await page.goto(base+"/Hamegrash.html",{waitUntil:"domcontentloaded"});
  await wait(900);
  if(await page.locator("#lockOv.on").count()){
    await page.fill("#lock-pass","1234"); await page.click("#lock-enter"); await wait(500);
  }
  await wait(2600);   /* הודעת «ברוך הבא» נעלמת לפני הצילום */
  return {ctx,page,errs};
}

(async()=>{
  const out=path.resolve(process.argv[2]||path.join(ROOT,"marketing-out"));
  const langs=(process.argv[3]||"he,en,ar,ru,es").split(",");
  const scenes=(process.argv[4]||Object.keys(SCENES).join(",")).split(",");
  fs.mkdirSync(out,{recursive:true});
  const pw=loadPlaywright();
  const browser=await pw.chromium.launch({executablePath:fs.existsSync("/opt/pw-browsers/chromium")?undefined:undefined});
  const srv=await serve(); const base="http://127.0.0.1:"+srv.address().port;
  const report=[];
  for(const lang of langs){
    for(const sc of scenes){
      const S=SCENES[sc]; if(!S){ console.log("?? scene",sc); continue; }
      const {ctx,page,errs}=await openApp(browser,base,lang,S.group);
      try{
        await S.prep(page);
        const r=await record(page,path.join(out,lang+"_"+sc),()=>S.run(page));
        report.push([lang,sc,r.seconds+"s",r.frames+"f",errs.length?"ERR "+errs[0]:"ok"]);
        console.log(lang,sc,r.seconds+"s",r.frames+" frames",errs.length?"ERR "+errs.join(" | "):"");
      }catch(e){ console.log(lang,sc,"FAILED",e.message); report.push([lang,sc,"FAILED",e.message]); }
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(out,"report.json"),JSON.stringify(report,null,1));
  await browser.close(); srv.close();
})();
