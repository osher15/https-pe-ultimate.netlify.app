"use strict";
/* ============================================================
   PE Ultimate — ספריית הקוריקולום
   ------------------------------------------------------------
   המסך של window.CURRIC: מערכים בתקן בן ‎20‎ סעיפים, מסוננים לפי
   ענף, גיל וחיפוש, עם מסלול הלמידה של כל ענף.

   כל ההכרעות יושבות ב-hm-data.js ונבדקות ב-Node. כאן יש ציור
   בלבד — סינון, מיון, מצב הסטטוס והודעת השפה מגיעים משם.
   הסיבה מעשית: מסך אי אפשר לבדוק בשנייה ב-CI, ופונקציה טהורה
   כן, ותג שמפסיק להופיע הוא בדיוק סוג הבאג שאיש לא מבחין בו.

   ההחלטה המרכזית במסך הזה: **תג הסטטוס אינו ניתן לכיבוי.**
   הוא מופיע בכרטיס, שוב בראש המערך הפתוח, ושוב ליד כפתור
   ההדפסה. כל ‎300‎ העמודים במקור נושאים "נדרשת בדיקת איש מקצוע
   לפני פרסום", ומורה שלוקח מערך לכיתה צריך לדעת את זה בלי
   לחפש. אין כאן "אל תציג שוב".
   ============================================================ */
(function(){
const H=()=>window.HM;
const D=()=>window.HMDATA;
const lib=()=>window.CURRIC||[];

/* מצב המסך. lang נגזר מהממשק ולא נשמר בנפרד: מורה שמחליף שפה
   מצפה שגם הספרייה תתחלף. */
const st={sport:"",age:"",q:"",open:null};
/* I18N.lang היא פונקציה ולא תכונה. קריאה בלעדיה מחזירה את
   האובייקט עצמו, והסינון לפי שפה מסנן הכול החוצה בשקט — ספרייה
   מלאה שנראית ריקה. */
const uiLang=()=>{
  try{ const l=window.I18N&&window.I18N.lang&&window.I18N.lang();
       return (typeof l==="string"&&l)||"he"; }catch(e){ return "he"; }
};

const SPORT_NAME={basketball:"כדורסל",football:"כדורגל",handball:"כדוריד",
  volleyball:"כדורעף",athletics:"אתלטיקה",fitness:"כושר"};
const SPORT_EM={basketball:"🏀",football:"⚽",handball:"🤾",
  volleyball:"🏐",athletics:"🏃",fitness:"💪"};

function badgeHtml(L,extra){
  const b=D().curricBadge(L);
  if(!b.show)return "";
  return `<span class="cu-badge ${b.tone}" title="${H().esc(b.why||b.label)}">${
    H().esc(b.label)}${extra&&b.why?' — '+H().esc(b.why):""}</span>`;
}

function filtered(){
  const age=st.age===""?null:+st.age;
  return D().curricList(lib(),{lang:uiLang(),sport:st.sport||undefined,
    age:age==null?undefined:age, q:st.q});
}

function renderSports(){
  const {$, esc}=H();
  const all=D().curricSports(lib(),uiLang());
  const total=all.reduce((a,s)=>a+s.count,0);
  $("#cu-sports").innerHTML=
    `<button class="cu-chip${st.sport?"":" on"}" data-sport="">הכול · ${total}</button>`+
    all.map(s=>`<button class="cu-chip${st.sport===s.sport?" on":""}" data-sport="${s.sport}">${
      SPORT_EM[s.sport]||"•"} ${esc(SPORT_NAME[s.sport]||s.sport)} · ${s.count}</button>`).join("");
}

function renderGrid(){
  const {$, esc}=H();
  const list=filtered();
  $("#cu-count").textContent=list.length
    ? list.length+" מערכים"+(st.sport?" ב"+(SPORT_NAME[st.sport]||st.sport):"")
    : "";
  $("#cu-empty").style.display=list.length?"none":"block";
  $("#cu-grid").innerHTML=list.map(L=>`
    <div class="gm-card cu-card" data-code="${esc(L.code)}">
      <div class="hd">
        <span class="em">${SPORT_EM[L.sport]||"📘"}</span>
        <div class="grow">
          <b>${esc(L.title)}</b>
          <span class="tag">${esc(L.code)} · ${esc(SPORT_NAME[L.sport]||L.sport)}</span>
        </div>
      </div>
      <div class="gl">${esc(L.subtopic||"")}</div>
      <div class="meta">
        <span>גיל ${L.ageFrom}–${L.ageTo}</span>
        <span>${L.minutes} דק׳</span>
        <span>${esc(L.level||"")}</span>
      </div>
      <div class="cu-badges">${badgeHtml(L)}</div>
    </div>`).join("");
}

/* מסלול הלמידה של הענף. מוצג רק כשענף אחד נבחר — "הכול" היה
   מערבב שישה מסלולים לרשימה אחת חסרת משמעות. */
function renderPath(){
  const {$, esc}=H();
  const wrap=$("#cu-pathWrap");
  if(!st.sport){ wrap.style.display="none"; return; }
  wrap.style.display="";
  const p=D().curricPathway(lib(),st.sport,uiLang());
  $("#cu-pathTitle").textContent=(SPORT_EM[st.sport]||"")+" מסלול הלמידה — "+
    (SPORT_NAME[st.sport]||st.sport);
  $("#cu-path").innerHTML=p.map((x,i)=>`
    <button class="cu-step" data-code="${esc(x.code)}">
      <span class="n">${x.n}</span>
      <span class="t">${esc(x.title)}</span>
      <span class="a">גיל ${x.ageFrom}–${x.ageTo}</span>
    </button>${i<p.length-1?'<span class="cu-arrow">←</span>':""}`).join("");
  /* חור ברצף הוא ממצא למי שמתחזק, לא למורה — אבל הוא לא מוסתר:
     רשימה שמדלגת מ-‎03‎ ל-‎05‎ בלי לומר כלום נקראת כמו ספרייה מלאה. */
  const v=D().curricValidate(D().curricList(lib(),{lang:uiLang(),sport:st.sport}));
  const gaps=v.issues.filter(i=>i.kind==="gap"||/^dangling/.test(i.kind));
  $("#cu-pathNote").innerHTML=gaps.length
    ? `<span class="cu-badge warn">חלקי</span> ${p.length} מערכים יובאו עד כה; המסלול במקור ארוך יותר.`
    : "";
}

function render(){ renderSports(); renderPath(); renderGrid(); }

/* ---------- המערך הפתוח ---------- */

function open(code){
  const {$, esc}=H();
  const res=D().curricOf(lib(),code,uiLang());
  if(!res)return;
  const L=res.lesson;
  st.open=code;

  const notice=D().curricLangNotice(res);
  const b=D().curricBadge(L);

  $("#cu-mTitle").textContent=L.title;
  $("#cu-mBody").innerHTML=
    (b.show?`<div class="cu-strip ${b.tone}">
        <b>${esc(b.label)}</b>${b.why?" — "+esc(b.why):""}
        ${b.note?`<div class="cu-strip-note">${esc(b.note)}</div>`:""}
      </div>`:"")+
    (notice?`<div class="cu-strip info">${esc(notice.text)}</div>`:"")+
    `<div class="cu-facts">
       <span><b>קוד</b> ${esc(L.code)}</span>
       <span><b>ענף</b> ${esc(SPORT_NAME[L.sport]||L.sport)}</span>
       <span><b>גיל</b> ${L.ageFrom}–${L.ageTo}</span>
       <span><b>משך</b> ${L.minutes} דק׳</span>
       <span><b>רמה</b> ${esc(L.level||"")}</span>
       <span><b>מורכבות</b> ${esc(L.complexity||"")}</span>
     </div>`+
    (L.summary&&L.summary.length?`<div class="cu-sum"><b>תקציר למורה</b><ul>${
      L.summary.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:"")+
    (L.sections||[]).map(s=>`<details class="cu-sec"${s.n<=3?" open":""}>
        <summary>${s.n}. ${esc(s.title)}</summary>
        <div class="cu-md">${md(s.md)}</div>
      </details>`).join("")+
    planBar(L)+
    `<div class="cu-src">${esc(L.src&&L.src.page?"מקור: Notion · "+L.src.page:"")}</div>`;
  wirePlan(L);
  H().modal("cu-modal");
}

/* ============================================================
   סימון המערך כתוכנית השיעור הפתוח
   ------------------------------------------------------------
   זה מה שסוגר את הלולאה. כל עוד שיעור נפתח בלי לדעת איזה מערך
   נלמד בו, ההמלצה לשיעור הבא נאלצת לנחש מתוך טקסט הנושא. ברגע
   שהמערך מסומן, השיעור הבא נגזר מהרצף עצמו: 👍 למערך הבא,
   👎 לקודם.

   הכפתור מופיע **רק כששיעור פתוח.** בלי שיעור פתוח אין למה
   לשייך, וכפתור שמייצר שיעור כתופעת לוואי של צפייה במערך הוא
   בדיוק סוג ההפתעה שאין לה מקום באמצע יום הוראה.
   ============================================================ */
function planBar(L){
  const {esc}=H();
  const S=window.HM.session;
  const act=S&&S.active&&S.active();
  if(!act)return `<div class="cu-plan off">כדי לשייך את המערך לשיעור — פתחו שיעור בכיתה.</div>`;
  const cur=window.HMDATA.curricCodeOfPlan(act.planId);
  if(cur===L.code)
    return `<div class="cu-plan on">✓ זהו המערך המסומן לשיעור הפתוח ב${esc(act.clsSnapshot||"כיתה")}.</div>`;
  return `<div class="cu-plan">
      <button class="btn sm acc" id="cu-setPlan">📌 סמן כמערך השיעור הפתוח</button>
      <div class="cu-plan-note">${esc(act.clsSnapshot||"כיתה")}${
        cur?" · כרגע מסומן "+esc(cur):""}</div>
    </div>`;
}

function wirePlan(L){
  const b=H().$("#cu-setPlan");
  if(!b)return;
  b.addEventListener("click",()=>{
    H().ac();
    const S=window.HM.session;
    const act=S.active();
    if(!act){ H().toast("אין שיעור פתוח"); return; }
    const r=S.setPlan(act.id,{planId:window.HMDATA.curricPlanId(L.code),
      planTitle:L.title});
    if(!r.ok){ H().toast("לא נשמר — נסו שוב"); return; }
    H().toast("📌 "+L.code+" סומן לשיעור הפתוח");
    open(L.code);            /* מצייר מחדש כדי שהפס יעבור למצב «מסומן» */
  });
}

/* עיבוד Markdown מצומצם בכוונה: כותרות משנה, הדגשה ורשימות —
   בדיוק מה שהתקן מייצר, ולא יותר. כל השאר נמלט. מפענח מלא היה
   פותח דלת ל-HTML מתוך תוכן, ואין שום סיבה לפתוח אותה. */
function md(text){
  const esc=H().esc;
  const lines=String(text||"").split(/\r?\n/);
  let out="", inList=false;
  const inline=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
  lines.forEach(l=>{
    const li=/^[-*]\s+(.*)$/.exec(l);
    if(li){ if(!inList){ out+="<ul>"; inList=true; } out+="<li>"+inline(li[1])+"</li>"; return; }
    if(inList){ out+="</ul>"; inList=false; }
    const h=/^##\s+(.*)$/.exec(l);
    if(h){ out+="<h5>"+inline(h[1])+"</h5>"; return; }
    if(l.trim())out+="<p>"+inline(l)+"</p>";
  });
  if(inList)out+="</ul>";
  return out;
}

/* ---------- init ---------- */

function init(){
  const {$, $$}=H();
  $("#cu-sports").addEventListener("click",e=>{
    const b=e.target.closest("[data-sport]"); if(!b)return;
    st.sport=b.dataset.sport; H().ac(); render();
  });
  $("#cu-search").addEventListener("input",e=>{ st.q=e.target.value; renderGrid(); });
  $("#cu-age").addEventListener("change",e=>{ st.age=e.target.value; render(); });
  $("#cu-grid").addEventListener("click",e=>{
    const c=e.target.closest("[data-code]"); if(c){ H().ac(); open(c.dataset.code); }
  });
  $("#cu-path").addEventListener("click",e=>{
    const c=e.target.closest("[data-code]"); if(c){ H().ac(); open(c.dataset.code); }
  });
  render();
}

window.CURRICUI={init:init,render:render,open:open,_md:md};
})();
