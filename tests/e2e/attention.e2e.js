"use strict";
/* ============================================================
   «מי לא נמדד» — רשימת עבודה לפי גיל הראיה
   ------------------------------------------------------------
   «מה חסר לכיתה» עונה על *האם* יש מדידה. הלשונית הזאת עונה על
   *מתי*, וזה ההבדל שהופך כיתה שנראית מכוסה לכיתה שאיש לא נמדד
   בה חודשיים.

   השעון מקובע ב-‎21‎ בספטמבר ‎2026‎, אחרת «לפני ‎51‎ ימים» משתנה בכל
   יום שהבדיקה רצה בו. המדידות מוזרעות במרחקים ידועים מהתאריך
   הזה, כך שכל מצב נבדק על ערך אמיתי ולא על הדמיה.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const X="c:ח:1";
const NOW="2026-09-21T10:00:00";
const m=(id,sid,name,test,d,val)=>({id,d,ts:1,cls:"ח׳1",cid:X,test,name,sid,
  val,unit:"חזרות",gradeKey:"ח",sex:"boys"});

/* אליס נמדדה אתמול אך חסר לה situp · בוב לפני ‎51‎ יום · גל לפני
   ‎142‎ יום · דנה מעולם. ארבעת המצבים, כל אחד על נתון אמיתי. */
const seed=extra=>Object.assign({
  __now:NOW,
  "ft.classes":{[X]:{id:X,name:"ח׳1",grade:"ח",num:1,key:"ח1"}},
  "ft.roster":{"ח1":[
    {id:"a",name:"אליס כהן",sex:"girls"},{id:"b",name:"בוב לוי",sex:"boys"},
    {id:"c",name:"גל שדה",sex:"boys"},{id:"d",name:"דנה אור",sex:"girls"}]},
  "ft.results":[
    m("r1","a","אליס כהן","push","2026-09-20",20),
    m("r2","a","אליס כהן","r60","2026-09-20",9.1),
    m("r3","b","בוב לוי","push","2026-08-01",18),
    m("r4","b","בוב לוי","situp","2026-08-01",30),
    m("r5","c","גל שדה","push","2026-05-02",15)
  ],
  "ft.last":{grade:"ח",num:1,sort:"name"},
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
},extra||{});

const openAtt=async page=>{
  await page.evaluate(()=>window.HM.go("ft"));
  await page.waitForTimeout(700);
  await page.evaluate(()=>document.querySelector('#ft-tabs [data-ft="att"]').click());
  await page.waitForTimeout(450);
};
const rows=page=>page.evaluate(()=>[...document.querySelectorAll("#ft-att .att-row")]
  .map(r=>({name:(r.querySelector("b")||{}).textContent||"",
    badges:[...r.querySelectorAll(".cu-badge")].map(b=>b.textContent.trim()),
    ev:(r.querySelector(".att-ev")||{}).textContent||"",
    miss:(r.querySelector(".att-miss")||{}).textContent||""})));

module.exports={title:"מי לא נמדד — גיל הראיה",tests:[

  check("הלשונית זמינה ופותחת על הכיתה הנבחרת",seed(),async page=>{
    await page.evaluate(()=>window.HM.go("ft"));
    await page.waitForTimeout(700);
    ok(await page.evaluate(()=>!!document.querySelector('#ft-tabs [data-ft="att"]')),
      "כפתור הלשונית אינו קיים");
    await openAtt(page);
    eq(await page.evaluate(()=>document.getElementById("ft-att").style.display),"");
    eq(await page.evaluate(()=>document.getElementById("ft-pick").style.display),"none");
    ok(/ח׳1/.test(await page.evaluate(()=>
      document.querySelector("#ft-att h2").textContent)),"הכיתה אינה בכותרת");
  }),

  check("כל מצב מקבל את התווית שלו, ובסדר החומרה",seed(),async page=>{
    await openAtt(page);
    const r=await rows(page);
    eq(r.length,4,"לא כל התלמידים ברשימה");
    eq(r.map(x=>x.name).join(","),"דנה אור,גל שדה,בוב לוי,אליס כהן",
      "הסדר אינו לפי חומרה ואז ותק");
    eq(r[0].badges[0],"לא נמדד מעולם");
    eq(r[1].badges[0],"ישן מאוד");
    eq(r[2].badges[0],"ישן");
    eq(r[3].badges[0],"חסרים מבחנים");
  }),

  check("הראיה מוצגת: תאריך וכמה זמן עבר",seed(),async page=>{
    await openAtt(page);
    const r=await rows(page);
    ok(/אין מדידה/.test(r[0].ev),"«לא נמדד מעולם» הציג תאריך: "+r[0].ev);
    ok(/2026-05-02/.test(r[1].ev)&&/142/.test(r[1].ev),"גל: "+r[1].ev);
    ok(/2026-08-01/.test(r[2].ev)&&/51/.test(r[2].ev),"בוב: "+r[2].ev);
    ok(/אתמול/.test(r[3].ev),"אליס נמדדה אתמול: "+r[3].ev);
  }),

  check("המבחנים החסרים נקובים בשמם",seed(),async page=>{
    await openAtt(page);
    const r=await rows(page);
    ok(/^חסר:/.test(r[3].miss.trim()),"אליס חסרה מבחן ולא נאמר איזה: "+r[3].miss);
    ok(r[3].miss.split("·").length===1,"אליס חסרה בדיוק מבחן אחד: "+r[3].miss);
    ok(r[0].miss.split("·").length===3,"לדנה חסרים שלושת המבחנים: "+r[0].miss);
  }),

  check("הסיכום סופר נכון ומציג את תאריך הצילום",seed(),async page=>{
    await openAtt(page);
    const sum=await page.evaluate(()=>
      [...document.querySelectorAll("#ft-att .ft-idxsum div")]
        .map(d=>d.textContent.replace(/\s+/g," ").trim()));
    ok(sum.some(x=>/תלמידים\s*4$/.test(x)),"מניין התלמידים: "+sum.join(" | "));
    ok(sum.some(x=>/תשומת לב\s*4$/.test(x)),"מניין הדורשים תשומת לב: "+sum.join(" | "));
    ok(sum.some(x=>/מעולם\s*1$/.test(x)),"מניין «לא נמדד מעולם»: "+sum.join(" | "));
    const hint=await page.evaluate(()=>
      document.querySelector("#ft-att .hint:last-of-type, #ft-att .card .hint")
        ?[...document.querySelectorAll("#ft-att .hint")].map(h=>h.textContent).join(" "):"");
    ok(/2026-09-21/.test(hint),"תאריך הצילום אינו מוצג — תמונה בלי תאריך אי אפשר לקרוא בדיעבד");
  }),

  check("המסך אומר במפורש שהוא אינו יודע למה לא נמדד",seed(),async page=>{
    await openAtt(page);
    const t=await page.evaluate(()=>document.getElementById("ft-att").textContent);
    ok(/אינו יודע/.test(t)&&/היעדרויות/.test(t),
      "אין הסתייגות — מורה יקרא «לא נמדד» כ«לא השתתף»");
    ok(!/לא השתתף|נעדר/.test(t.replace(/היעדרויות/g,"")),
      "המסך מנחש היעדרות מתוך העדר מדידה");
  }),

  check("כיתה שכולה נמדדה לאחרונה מציגה מצב ריק ולא רשימה",
    seed({"ft.results":[
      m("r1","a","אליס כהן","push","2026-09-20",20),
      m("r2","b","בוב לוי","push","2026-09-20",18),
      m("r3","c","גל שדה","push","2026-09-20",15),
      m("r4","d","דנה אור","push","2026-09-20",14)]}),async page=>{
    await openAtt(page);
    eq((await rows(page)).length,0);
    const t=await page.evaluate(()=>document.getElementById("ft-att").textContent);
    ok(/נמדדו לאחרונה/.test(t),"אין הודעת «הכול בסדר»");
  }),

  check("כיתה בלי רשימת תלמידים אומרת זאת ולא קורסת",
    seed({"ft.roster":{"ח1":[]},"ft.results":[]}),async page=>{
    await openAtt(page);
    const t=await page.evaluate(()=>document.getElementById("ft-att").textContent);
    ok(/אין תלמידים/.test(t),"מצב ריק שגוי: "+t.slice(0,80));
  }),

  check("תאריך עתידי מסומן כשגיאה ולא כמדידה טרייה",
    seed({"ft.results":[m("r1","a","אליס כהן","push","2026-12-01",20)]}),async page=>{
    await openAtt(page);
    const r=await rows(page);
    const alice=r.find(x=>/אליס/.test(x.name));
    ok(alice,"השורה שאמורה להתריע נעלמה — תאריך עתידי נראה «טרי»");
    eq(alice.badges[0],"תאריך עתידי","הסיבה תויגה כמשהו אחר: "+alice.badges.join(","));
    eq(alice.badges.length,1,"תג כפול על אותה עובדה: "+alice.badges.join(","));
    ok(!/לפני -/.test(alice.ev),"«לפני ‎-71‎ ימים» — חישוב ותק על תאריך עתידי חסר משמעות");
    ok(/עוד לא הגיע/.test(alice.ev),"לא הוסבר מה הבעיה: "+alice.ev);
  }),

  check("המסך אינו מדרג ואינו נותן ציון",seed(),async page=>{
    await openAtt(page);
    const t=await page.evaluate(()=>document.getElementById("ft-att").textContent);
    ok(!/ציון|דירוג|חלש|מצטיין/.test(t),
      "הופיעה תווית יכולת במסך שעוסק במדידה ולא בתלמיד");
  }),

  check("«מה חסר» ו«מי לא נמדד» מסכימים על מי נמדד",seed(),async page=>{
    await openAtt(page);
    const att=await rows(page);
    await page.evaluate(()=>document.querySelector('#ft-tabs [data-ft="cov"]').click());
    await page.waitForTimeout(400);
    const cov=await page.evaluate(()=>{
      const t=document.querySelector("#ft-cov table"); if(!t)return null;
      return [...t.querySelectorAll("tbody tr")].map(tr=>({
        name:tr.querySelector("b").textContent,
        done:[...tr.querySelectorAll("td.mono")].map(td=>td.textContent.trim()==="✓")}));
    });
    ok(cov,"טבלת הכיסוי לא נטענה");
    const dana=cov.find(x=>/דנה/.test(x.name));
    ok(dana&&dana.done.every(d=>!d),"«מה חסר» סבור שדנה נמדדה");
    ok(/מעולם/.test(att.find(x=>/דנה/.test(x.name)).badges[0]),
      "שתי הלשוניות חלוקות על אותו תלמיד");
  }),

  check("הלשונית הפעילה נגללת לתצוגה — שש לשוניות אינן נכנסות לרוחב טלפון",
    seed(),async page=>{
    await page.setViewportSize({width:390,height:800});
    await openAtt(page);
    const r=await page.evaluate(()=>{
      const bar=document.getElementById("ft-tabs");
      const on=bar.querySelector("button.on");
      const b=bar.getBoundingClientRect(), o=on.getBoundingClientRect();
      return {label:on.textContent.trim(),
        inside:o.left>=b.left-1&&o.right<=b.right+1,
        scrolls:bar.scrollWidth>bar.clientWidth};
    });
    ok(r.scrolls,"הסרגל אינו נגלל — הבדיקה אינה בודקת את מה שנועדה");
    ok(/לא נמדד/.test(r.label),"הלשונית הפעילה אינה הנכונה: "+r.label);
    ok(r.inside,"הלשונית הפעילה מחוץ לתצוגה — המורה אינו רואה איפה הוא");
  }),

  check("מטרות המגע ברשימה עומדות ברף",seed(),async page=>{
    await openAtt(page);
    const bad=await page.evaluate(()=>{
      const out=[];
      document.querySelectorAll("#ft-att button, #ft-att .att-row").forEach(el=>{
        const r=el.getBoundingClientRect();
        if(r.width>0&&r.height>0&&r.height<40)out.push((el.className||el.tagName)+" "+Math.round(r.height));
      });
      return out;
    });
    eq(bad.length,0,"פריטים קטנים מדי: "+bad.join(", "));
  })
]};
