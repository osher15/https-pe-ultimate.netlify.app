"use strict";
/* Store screenshots from the real single-file app in demo mode (English).
   Usage: node tools/store-screenshots.js <outDir> [modules...]
   Demo data is invented (ids demoN/dmN); no real pupil data is read or written.
   Phone: 360x640 CSS px at 3x = 1080x1920. Tablet: 800x1280 at 2x = 1600x2560. */
const fs=require("fs"),path=require("path"),http=require("http");
const ROOT=path.resolve(__dirname,"..");
function pw(){ for(const p of ["playwright","playwright-core"]){ try{ return require(p); }catch(e){} }
  const root=require("child_process").execSync("npm root -g",{encoding:"utf8"}).trim(); return require(path.join(root,"playwright")); }
const MIME={".html":"text/html;charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".gif":"image/gif",".svg":"image/svg+xml"};
const out=path.resolve(process.argv[2]||"store-shots");
const mods=process.argv.slice(3).length?process.argv.slice(3):["home","ft","beep","cls","stu","rec","live"];
fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(q.url.split("?")[0]).replace(/^\/+/,""));
  if(f.indexOf(ROOT)!==0)return r.writeHead(403).end();
  fs.readFile(f,(e,b)=>{ if(e)return r.writeHead(404).end(); r.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"}); r.end(b); }); });
srv.listen(0,"127.0.0.1",async()=>{
  const port=srv.address().port, {chromium}=pw();
  const browser=await chromium.launch({args:["--no-sandbox"]});
  for(const [name,vp,dsf] of [["phone",{width:360,height:640},3],["tablet10",{width:800,height:1280},2]]){
    const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:dsf,locale:"en-US"});
    const page=await ctx.newPage();
    await page.route("**/*",r=>/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.request().url())?r.continue():r.abort());
    await page.addInitScript(()=>{ try{ localStorage.setItem("peultimate.hx.leadDone","true"); }catch(e){} });
    /* clock fixed at 07:30 today so the timetable shows upcoming lessons (only reading the time is shifted) */
    await page.addInitScript(()=>{ const R=Date, t=new R(); t.setHours(7,30,0,0); const off=t.getTime()-R.now();
      class FD extends R{ constructor(...a){ if(a.length===0)super(R.now()+off); else super(...a); } static now(){ return R.now()+off; } }
      window.Date=FD; });
    await page.goto("http://127.0.0.1:"+port+"/Hamegrash.html"); await page.waitForTimeout(1200);
    await page.evaluate(()=>window.I18N.set("en")); await page.waitForTimeout(500);
    await page.evaluate(()=>{ const b=document.getElementById("lock-demo"); if(b)b.click(); }); await page.waitForTimeout(1500);
    await page.addStyleTag({content:"#demoBar{display:none!important}"});
    /* a plausible school day for the demo class (id c:ט:3 = 9-3), times fixed relative to today */
    await page.evaluate(()=>{ const D=window.HMDATA, d=D.dayOfISO(new Date().toISOString().slice(0,10));
      window.HM.LS.set("sched.week",[
        {id:"s1",day:d,time:"08:00",cid:"c:ט:3",clsSnapshot:"ט׳3",topic:"Basketball: passing"},
        {id:"s2",day:d,time:"09:45",cid:"c:ט:3",clsSnapshot:"ט׳3",topic:"Fitness stations"},
        {id:"s3",day:(d+1)%7,time:"10:30",cid:"c:ט:3",clsSnapshot:"ט׳3",topic:"Athletics: sprint start"}]); });
    for(const m of mods){
      if(m==="live"){ await page.evaluate(()=>window.HM.go("home")); await page.waitForTimeout(800);
        await page.evaluate(()=>{ const b=document.querySelector("#hx-todayList .hx-focus button, #hx-todayList .hx-focus .btn"); if(b)b.click(); }); await page.waitForTimeout(5500); }
      else { await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(1200);
        if(m==="beep"){ await page.evaluate(()=>{ const b=document.getElementById("bt-startBtn"); if(b)b.click(); }); await page.waitForTimeout(6000); }
        if(m==="stu"){ await page.evaluate(()=>{ const l=document.getElementById("stu-list"); if(l)l.scrollIntoView({block:"start"}); window.scrollBy(0,-80); }); await page.waitForTimeout(500); } }
      await page.screenshot({path:path.join(out,name+"-"+m+".png")});
    }
    await ctx.close();
  }
  await browser.close(); srv.close(); console.log("saved to",out);
});
