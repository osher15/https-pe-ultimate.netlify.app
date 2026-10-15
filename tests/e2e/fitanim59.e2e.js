"use strict";
/* ============================================================
   C17 / Issue #59 - FIT exercise drawings are the cartoon SVGs
   ------------------------------------------------------------
   Library grid: still SVG thumbnails. Exercise detail: animated SVG in
   a <picture> whose prefers-reduced-motion source is the still SVG.
   Nothing may request exercise-gifs.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");

const openLib=async page=>{
  await page.evaluate(()=>window.HM.go("fit")); await page.waitForTimeout(400);
  await page.click('#view-fit [data-ft="lib"]'); await page.waitForTimeout(400);
};
/* lazy images: scroll every thumbnail into view, then wait for loads */
const loadAll=async page=>{
  await page.evaluate(()=>document.querySelectorAll("#fit-exGrid img").forEach(i=>{ i.loading="eager"; i.scrollIntoView(); }));
  await page.waitForFunction(()=>[...document.querySelectorAll("#fit-exGrid img")].every(i=>i.complete),null,{timeout:15000});
};

module.exports={title:"#59: FIT exercise animations (SVG)",tests:[

  check("library grid: every thumbnail is a loaded still SVG, no exercise-gifs requests",null,async page=>{
    const reqs=[]; page.on("request",r=>reqs.push(r.url()));
    await openLib(page); await loadAll(page);
    const imgs=await page.$$eval("#fit-exGrid img",l=>l.map(i=>({src:i.getAttribute("src"),w:i.naturalWidth,id:i.closest(".fit-ex").dataset.id})));
    eq(imgs.length,47,"47 exercises");
    for(const i of imgs){
      eq(i.src,"exercise-anim/still/"+i.id+".svg","still src for "+i.id);
      ok(i.w>0,"still loaded for "+i.id);
    }
    ok(!reqs.some(u=>/exercise-gifs|\.gif(\?|$)/.test(u)),"no GIF request: "+reqs.filter(u=>/gif/.test(u)).join(","));
  }),

  check("exercise detail: animated SVG inside <picture> with a reduced-motion still source",null,async page=>{
    await openLib(page);
    await page.click('#fit-exGrid .fit-ex[data-id="squat"]'); await page.waitForTimeout(500);
    const d=await page.$eval("#fit-exFig",f=>{
      const s=f.querySelector("picture source"), i=f.querySelector("picture img");
      return {media:s&&s.getAttribute("media"),srcset:s&&s.getAttribute("srcset"),src:i&&i.getAttribute("src"),
        w:i&&i.naturalWidth,cur:i&&i.currentSrc,alt:i&&i.alt}; });
    eq(d.media,"(prefers-reduced-motion: reduce)");
    eq(d.srcset,"exercise-anim/still/squat.svg");
    eq(d.src,"exercise-anim/svg/squat.svg");
    ok(d.w>0,"animated svg loaded");
    ok(/exercise-anim\/svg\/squat\.svg$/.test(d.cur),"animation used by default: "+d.cur);
    ok(d.alt&&d.alt.length>0,"alt text kept");
  }),

  check("reduced motion: the browser picks the still frame",null,async page=>{
    await page.emulateMedia({reducedMotion:"reduce"});
    await openLib(page);
    await page.click('#fit-exGrid .fit-ex[data-id="push"]'); await page.waitForTimeout(600);
    const cur=await page.$eval("#fit-exFig img",i=>i.currentSrc);
    ok(/exercise-anim\/still\/push\.svg$/.test(cur),"still under reduced motion: "+cur);
  }),

  check("gym day list thumbnails use the still SVGs",null,async page=>{
    await page.evaluate(()=>window.HM.go("fit")); await page.waitForTimeout(400);
    await page.click('#view-fit [data-ft="gym"]'); await page.waitForTimeout(500);
    const srcs=await page.$$eval("#gym-list img",l=>l.map(i=>i.getAttribute("src")));
    ok(srcs.length>0,"gym list renders exercises");
    ok(srcs.every(s=>/^exercise-anim\/still\/[\w-]+\.svg$/.test(s)),"all still: "+srcs.join(","));
  })
]};
