"use strict";
/* טופס פרטי הקשר — הכללים הטהורים (hm-data.js):
   ארבעה שדות חובה, טלפון בינלאומי, דחייה של 7 ימים, ואישור קליטה
   שמבוסס על דף האישור של השרת — לא על «הבקשה יצאה». */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");

const GOOD={first:"Test",last:"User",email:"test.user@example.com",phone:"+44 20 7946 0958"};
const DAY=86400000;

test("שני פרטי הקשר חובה — טלפון לבד או אימייל לבד אינם מספיקים",()=>{
  assert.deepEqual(D.validateLead(Object.assign({},GOOD,{email:""})).errors,{email:"required"});
  assert.deepEqual(D.validateLead(Object.assign({},GOOD,{phone:""})).errors,{phone:"required"});
  assert.deepEqual(Object.keys(D.validateLead({}).errors).sort(),["email","first","last","phone"]);
  assert.equal(D.validateLead(GOOD).ok,true);
});

test("רווחים בלבד אינם ערך; ערכים נחתכים ומאוחדים",()=>{
  const v=D.validateLead({first:"  ",last:" User ",email:" a@b.co ",phone:" +1 212 555 0199 "});
  assert.equal(v.errors.first,"required");
  assert.deepEqual([v.clean.last,v.clean.email,v.clean.phone],["User","a@b.co","+1 212 555 0199"]);
});

test("טלפון בינלאומי: פורמטים של מדינות שונות מתקבלים; קצר, ארוך או עם אותיות — לא",()=>{
  for(const p of ["+44 20 7946 0958","+1 (212) 555-0199","050-123-4567","+972 50 123 4567",
                  "+86 138 0013 8000","+7 (912) 345-67-89","+34 612 345 678","0612345678"])
    assert.equal(D.validPhone(p),true,p);
  for(const p of ["12345","+1 555 abc 1234","++44 20","1234567890123456","phone"])
    assert.equal(D.validPhone(p),false,p);
});

test("אימייל: צורה בסיסית בלבד — בלי לנחש ספקים",()=>{
  for(const e of ["a@b.co","first.last+pe@school.ac.il","x@sub.example.org"])
    assert.equal(D.validateLead(Object.assign({},GOOD,{email:e})).ok,true,e);
  for(const e of ["a@b","a@.co","@b.co","a b@c.de","a@b..co"])
    assert.equal(D.validateLead(Object.assign({},GOOD,{email:e})).errors.email,"invalid",e);
});

test("מצב: ראשון → דחוי עד המועד → תזכורת אחריו; אחרי קליטה — אף פעם לא",()=>{
  const t0=Date.parse("2026-09-29T10:00:00Z");
  const until=D.leadSnoozeUntil(t0);
  assert.equal(until,t0+7*DAY);
  assert.equal(D.leadStatus({},t0),"first");
  assert.equal(D.leadStatus({snoozeUntil:until},t0+6*DAY),"snoozed");
  assert.equal(D.leadStatus({snoozeUntil:until},until-1),"snoozed");
  assert.equal(D.leadStatus({snoozeUntil:until},until),"reminder");
  assert.equal(D.leadStatus({done:true,snoozeUntil:until},until+99*DAY),"done");
});

test("אישור קליטה: רק 2xx עם דף האישור; 404, 500, או דף אחר — לא",()=>{
  const ack="<html><meta name=\"peu-ack\" content=\""+D.LEAD_ACK+"\"></html>";
  assert.equal(D.leadAckOk(200,ack),true);
  assert.equal(D.leadAckOk(404,ack),false);
  assert.equal(D.leadAckOk(500,""),false);
  assert.equal(D.leadAckOk(200,"<html>PE Ultimate</html>"),false,"דף הבית אינו אישור");
});

test("התוכן שנשלח: שדות הטופס בלבד, בשם הטופס הייעודי",()=>{
  const p=D.leadPayload(D.validateLead(GOOD).clean,{lang:"en",build:"abc12345"});
  assert.deepEqual(Object.keys(p).sort(),["app_version","bot-field","email","first","form-name","kind","lang","last","message","phone"]);
  assert.equal(p.kind,"contact","ברירת המחדל: יצירת קשר");
  assert.equal(p["form-name"],"pe-ultimate-contact");
  assert.equal(p["bot-field"],"");
});

test("הטופס הסטטי ב-index.html תואם בדיוק לשדות שנשלחים (זיהוי Netlify)",()=>{
  const html=require("fs").readFileSync(require("path").join(__dirname,"../../index.html"),"utf8");
  const m=/<form name="([^"]+)"[^>]*data-netlify="true"[^>]*>([\s\S]*?)<\/form>/.exec(html);
  assert.ok(m,"יש טופס Netlify סטטי");
  assert.equal(m[1],D.LEAD_FORM_NAME);
  const names=[...m[2].matchAll(/name="([^"]+)"/g)].map(x=>x[1]).sort();
  const sent=Object.keys(D.leadPayload(D.validateLead(GOOD).clean,{})).sort();
  assert.deepEqual(names,sent);
  /* החובה תלויה בסוג הפנייה ולכן נאכפת באפליקציה (validateLead), לא
     בטופס הסטטי: בקשת מחיקה נשלחת בלי שמות. */
  assert.ok(/<textarea name="message">/.test(m[2]),"שדה ההודעה קיים בטופס המקבל");
  const ack=require("fs").readFileSync(require("path").join(__dirname,"../../contact-received.html"),"utf8");
  assert.ok(ack.indexOf(D.LEAD_ACK)>=0,"דף האישור נושא את הסימן");
  assert.ok(/action="\/contact-received\.html"/.test(m[0]),"ו-action מפנה אליו");
});

test("בקשת מחיקה: מספיק אימייל או טלפון, בלי שמות; שניהם ריקים — שגיאה",()=>{
  assert.equal(D.validateLead({kind:"delete",email:"a@b.co"}).ok,true);
  assert.equal(D.validateLead({kind:"delete",phone:"+972 50 123 4567"}).ok,true);
  assert.deepEqual(D.validateLead({kind:"delete"}).errors,{email:"idRequired",phone:"idRequired"});
  assert.equal(D.validateLead({kind:"delete",email:"not-an-email"}).errors.email,"invalid");
  const p=D.leadPayload(D.validateLead({kind:"delete",email:"a@b.co",first:"X"}).clean,{});
  assert.equal(p.kind,"delete");
  assert.equal(p.first,"X","שם שהוקלד נשמר כפי שהוא — האפליקציה עצמה לא שולחת שמות בבקשת מחיקה");
});

test("יצירת קשר עדיין דורשת את ארבעת השדות, גם עם הודעה",()=>{
  assert.deepEqual(Object.keys(D.validateLead({kind:"contact",message:"שלום"}).errors).sort(),["email","first","last","phone"]);
});

test("הודעה: עד 1000 תווים, שורות נשמרות",()=>{
  const ok=D.validateLead(Object.assign({},GOOD,{message:"א\r\nב"}));
  assert.equal(ok.clean.message,"א\nב");
  assert.equal(D.validateLead(Object.assign({},GOOD,{message:"x".repeat(1001)})).errors.message,"tooLong");
});

test("בקשת מחיקה שנקלטה עוצרת תזכורות",()=>{
  const t0=Date.parse("2026-09-29T10:00:00Z");
  assert.equal(D.leadStatus({optOut:true,snoozeUntil:t0-1},t0),"done");
});

test("גבול 7 הימים לפי השעון, לא לפי תאריך: דקה לפני — דחוי, בדיוק במועד — תזכורת",()=>{
  /* ערב מקומי (23:30) — הדחייה היא 7×24 שעות, ולכן היא לא «קופצת» יום
     בגלל אזור זמן או מעבר חצות */
  const t0=new Date(2026,8,29,23,30).getTime(), until=D.leadSnoozeUntil(t0);
  assert.equal(D.leadStatus({snoozeUntil:until},until-60000),"snoozed");
  assert.equal(D.leadStatus({snoozeUntil:until},until),"reminder");
});
