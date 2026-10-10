"use strict";
/*
  Review probe for real index.html + Service Worker + lazy lesson-bank loading.
  Registered after three repeatable passes following the owner-approved
  navigation selector correction. Product files are not modified by this probe.
*/
const {chromium}=require("playwright");
const path=require("path"),fs=require("fs"),http=require("http");
const ROOT=path.resolve(__dirname,"../..");
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/manifest+json",".png":"image/png",".woff2":"font/woff2"};
function serve(){return new Promise(resolve=>{const srv=http.createServer((req,res)=>{const rel=decodeURIComponent(req.url.split("?")[0]).replace(/^\/+$/,"index.html").replace(/^\/+/, "");const f=path.join(ROOT,rel);if(!f.startsWith(ROOT)){res.writeHead(403);return res.end();}fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream"});res.end(b);});});srv.listen(0,"127.0.0.1",()=>resolve({srv,port:srv.address().port}));});}
function ok(v,m){if(!v)throw new Error(m);}
(async()=>{const {srv,port}=await serve();const browser=await chromium.launch({args:["--no-sandbox"]});try{
 const ctx=await browser.newContext({viewport:{width:820,height:1180}}),page=await ctx.newPage(),base="http://127.0.0.1:"+port+"/index.html";
 await page.goto(base);await page.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,{timeout:15000}).catch(async()=>{await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:15000});});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 // establish cache, then prove two sports can lazy-load while offline
 await ctx.setOffline(true);await page.reload({waitUntil:"domcontentloaded"});
 await page.evaluate(()=>window.HM.go("lesson"));await page.waitForTimeout(600);
 const sports=await page.evaluate(()=>window.LESSONBANK.meta.available.slice(0,2));ok(sports.length===2,"need two sports");
 for(const s of sports){await page.evaluate(x=>window.LESSONBANK.load(x),s);ok(await page.evaluate(x=>!!window.LESSONBANK.sports[x],s),"offline sport failed: "+s);}
 // concurrent calls must append one script for a fresh sport
 await ctx.setOffline(false);const fresh=await page.evaluate(()=>window.LESSONBANK.meta.available.find(x=>!window.LESSONBANK.sports[x]));
 if(fresh){await page.evaluate(x=>Promise.all(Array.from({length:8},()=>window.LESSONBANK.load(x))),fresh);const n=await page.locator('script[src*="hm-lessonbank-'+fresh+'.js"]').count();ok(n===1,"concurrent loader appended "+n+" scripts");}
 // viewport/language smoke: core controls must exist at tablet portrait/landscape sizes
 for(const vp of [{width:820,height:1180},{width:1180,height:820}]){await page.setViewportSize(vp);for(const l of ["he","en","ar","ru","es"]){await page.evaluate(x=>window.I18N.set(x),l);await page.waitForTimeout(100);ok(await page.locator(".nav").count()===1,"nav missing "+l+" "+vp.width+"x"+vp.height);}}
 console.log("offline/lazy review probe PASS");
 await ctx.close();
}finally{await browser.close();srv.close();}})().catch(e=>{console.error(e);process.exit(1);});
