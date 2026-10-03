"use strict";
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");
const C="c:ט:3", OTHER="c:י:1";
const pupil=(id,extra)=>Object.assign({id,name:"Same Name",cls:"ט׳3",cid:C,sex:"boys",age:14,tests:[]},extra);
const result=(id,sid,test,val,cid=C)=>({id,sid,test,val,cid,cls:cid===C?"ט׳3":"י׳1",d:"2026-10-03",ts:1,name:"Same Name",sex:"boys",gradeKey:"ט",unit:"חזרות"});
const base=extra=>Object.assign({
  lang:"en","schema.version":D.SCHEMA_VERSION,
  "ft.classes":{[C]:{id:C,name:"ט׳3",grade:"ט",num:3,key:"ט3"},[OTHER]:{id:OTHER,name:"י׳1",grade:"י",num:1,key:"י1"}},
  "stu.list":[pupil("a"),pupil("b"),pupil("c",{cls:"י׳1",cid:OTHER})],
  "ft.idxTests":["push","situp"],"ft.last":{grade:"י",num:1,sort:"name"},
  "ft.results":[result("r1","a","push",0),result("r2","b","situp",20),result("r3","c","ljump",150,OTHER)]
},extra);
async function open(page,id="a"){
  await page.evaluate(()=>window.HM.go("stu"));
  await page.waitForTimeout(200);
  await page.evaluate(id=>document.querySelector('#stu-list .stu-row[data-id="'+id+'"]').click(),id);
  await page.waitForTimeout(150);
}
const ids=page=>page.evaluate(()=>[...document.querySelectorAll("#stu-missing [data-missing-test]")].map(e=>e.dataset.missingTest));
module.exports={title:"Missing tests in My Students",tests:[
  check("own class and stable pupil ID determine missing tests; zero is a result",base(),async page=>{
    const before=await page.evaluate(()=>["stu.list","ft.results"].map(k=>window.HM.LS.get(k)));
    await open(page);
    eq(await ids(page),["situp"],"other pupil and selected Fitness class cannot fill or add requirements");
    const text=await page.locator("#stu-missing").innerText();
    ok(text.includes("not a final grade"));
    eq(await page.evaluate(()=>["stu.list","ft.results"].map(k=>window.HM.LS.get(k))),before,"read-only profile");
  }),
  check("completed selection is explicit",base({"ft.results":[result("r1","a","push",0),result("r2","a","situp",0)]}),async page=>{
    await open(page);
    eq(await ids(page),[]);
    ok((await page.locator("#stu-missing").innerText()).includes("No missing fitness tests"));
  }),
  check("no class is not presented as complete",base({"stu.list":[pupil("a",{cls:"",cid:null})]}),async page=>{
    await open(page);
    ok((await page.locator("#stu-missing").innerText()).includes("Assign this student"));
  }),
  check("renaming the class preserves the missing list",base(),async page=>{
    await page.evaluate(()=>{
      const classes=window.HM.LS.get("ft.classes",{});classes["c:ט:3"].name="Renamed class";window.HM.LS.set("ft.classes",classes);
    });
    await open(page);
    eq(await ids(page),["situp"]);
  }),
  check("section is translated in every UI language and fits a narrow phone",base(),async page=>{
    await page.setViewportSize({width:390,height:844});
    await open(page);
    const expected={en:"Missing fitness tests",he:"מה חסר לתלמיד",ar:"اختبارات اللياقة",ru:"Недостающие тесты",es:"Pruebas de condición"};
    for(const [lang,title] of Object.entries(expected)){
      await page.evaluate(l=>window.I18N.set(l),lang);
      await page.waitForTimeout(150);
      const text=await page.locator("#stu-missing").innerText();
      ok(text.includes(title),lang+": "+text);
      if(lang!=="he")ok(!/[\u0590-\u05ff]/.test(text),lang+": no Hebrew leftovers");
      if(lang!=="he")ok(!/[\u0590-\u05ff]/.test(await page.locator("#stu-mBody .stu-sec, #stu-fitTbl thead").allTextContents().then(a=>a.join(" "))),lang+": profile section headings translated");
      ok(await page.locator("#stu-missing").evaluate(e=>e.scrollWidth<=e.clientWidth+1),lang+": section fits");
    }
  })
]};
