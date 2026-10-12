"use strict";
/* שפת ההדגמה — שינוי שפה מחליף את שמות ההדגמה אוטומטית.
   הרקע: מורה שהפעיל הדגמה בעברית והחליף לאנגלית ראה תלמידים עבריים
   בממשק אנגלי עד שלחץ על כפתור «טען מחדש». ההדגמה היא נתונים מומצאים
   בלבד (demoN / dmN), ולכן ההחלפה אוטומטית; נתונים אחרים לא נוגעים. */
const {check,eq,ok}=require("./harness.js");
const HEB=/[֐-׿]/;
const names=page=>page.evaluate(()=>(window.HM.LS.get("stu.list",[])||[]).map(s=>s.name));

module.exports={title:"שפת ההדגמה — החלפה אוטומטית",tests:[
  check("הדגמה בעברית ← החלפה לאנגלית: שמות התלמידים באנגלית והנתונים האחרים נשארים",{},async page=>{
    await page.evaluate(()=>window.I18N.set("he"));
    await page.waitForTimeout(300);
    await page.evaluate(()=>document.getElementById("lock-demo").click());
    await page.waitForTimeout(900);
    ok((await names(page)).every(n=>HEB.test(n)),"ההדגמה נזרעת בעברית");
    /* רשומה שאינה הדגמה — חייבת לשרוד את ההחלפה */
    await page.evaluate(()=>{ const l=window.HM.LS.get("stu.list",[]); l.push({id:"real1",name:"Real Kid",cls:"ט׳3",cid:l[0].cid,sex:"boys",age:14,tests:[]}); window.HM.LS.set("stu.list",l); });
    await page.evaluate(()=>window.I18N.set("en"));
    await page.waitForTimeout(900);
    const after=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    const demo=after.filter(s=>/^demo\d+$/.test(s.id));
    eq(demo.length,8,"שמונה תלמידי הדגמה");
    ok(demo.every(s=>!HEB.test(s.name)),"שמות ההדגמה באנגלית: "+demo.map(s=>s.name).join(","));
    ok(after.some(s=>s.id==="real1"&&s.name==="Real Kid"),"רשומה אחרת לא נגעה");
    eq(await page.evaluate(()=>window.HM.LS.get("hx.demoLang","he")),"en","שפת ההדגמה נרשמה");
    /* ובלי טעינת דף: מסך «התלמידים שלי» מצויר מחדש מהשמות החדשים */
    await page.evaluate(()=>window.HM.go("stu")); await page.waitForTimeout(400);
    const shown=await page.evaluate(()=>document.querySelector("#mod-stu, [data-mod=stu], body").innerText);
    ok(/Liam Carter/.test(shown)&&!/דן אבירם/.test(shown),"המסך מציג את השמות האנגליים");
  }),
  check("ללא הדגמה — החלפת שפה לא זורעת ולא מרעננת כלום",{},async page=>{
    const before=await page.evaluate(()=>performance.timeOrigin);
    await page.evaluate(()=>window.I18N.set("en"));
    await page.waitForTimeout(800);
    eq(await page.evaluate(()=>performance.timeOrigin),before,"הדף לא נטען מחדש");
    eq((await names(page)).length,0,"לא נזרעו תלמידים");
  })
]};
