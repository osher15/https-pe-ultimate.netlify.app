"use strict";
/* ============================================================
   PE Ultimate — מרכז הכיתה
   ------------------------------------------------------------
   «מה המצב של ט׳3?» — שאלה שעד עכשיו התשובה עליה הייתה מפוזרת
   בשלושה מסכים, עם שלושה בוררי כיתה שונים: תלמידים וציונים, מבחני
   כושר, וכלי כיתה (ובסך הכול כשמונה דרכים לבחור כיתה).

   כאן בוחרים כיתה פעם אחת, ורואים:
   • סקירה — מספרים, המשך מומלץ ושיעורים אחרונים (מה שהיה «מסך
     הכיתה» בחלון)
   • כרטיס לכל נושא — תלמידים, נוכחות, כושר, ציונים, הערכות — עם
     סיכום קצר וכפתור שפותח את המסך המלא כבר על הכיתה הזאת

   זה מסך של ניהול ומעקב, אחרי שיעור או בסוף תקופה — ולכן מותר בו
   יותר מידע מאשר במצב שיעור. שום מבנה נתונים לא השתנה: הכרטיסים
   קוראים מהמודולים הקיימים דרך הממשק שלהם.
   ============================================================ */
(function(){
const H=()=>window.HM, D=()=>window.HMDATA;
const K="hub.cls";
const GRADES=["ז","ח","ט","י","יא","יב"];
const NUMS=[1,2,3,4,5,6,7,8,9,10];
let inited=false, add={g:null,n:null};

const t=(k,d)=>H().t(k,d);
const esc=s=>H().esc(s);
const store=()=>H().regStore;

function reg(){ try{ return D().classes(store()); }catch(e){ return {}; } }
function list(){
  const r=reg();
  return Object.keys(r).map(cid=>({cid,name:r[cid].name||cid,group:D().isGroupRec(r[cid])}))
    .sort((a,b)=>(a.group-b.group)||a.name.localeCompare(b.name,"he"));
}
/* הכיתה הנבחרת: מה שנבחר כאן, אחרת כיתת השיעור הפתוח, אחרת כיתת
   השיעור האחרון, אחרת הראשונה ברשימה */
function current(){
  const r=reg(), saved=H().LS.get(K,null);
  if(saved&&r[saved])return saved;
  try{ const a=H().session.active(); if(a&&r[a.cid])return a.cid; }catch(e){}
  try{ const l=H().session.list()||[]; const x=l.find(s=>r[s.cid]); if(x)return x.cid; }catch(e){}
  const l=list(); return l.length?l[0].cid:null;
}

function card(ic,title,lines,btns){
  return '<div class="hub-card"><div class="hd"><span class="ic">'+ic+'</span><b>'+esc(title)+'</b></div>'+
    '<div class="bd">'+lines.map(x=>'<div>'+x+'</div>').join("")+'</div>'+
    '<div class="ft">'+btns.map(([id,lbl,pri])=>'<button class="btn sm'+(pri?" acc":" ghost")+'" data-hub="'+id+'">'+esc(lbl)+'</button>').join("")+'</div></div>';
}
function cards(cid,isGroup){
  const stuS=window.STU&&window.STU.summary?window.STU.summary(cid):{total:0,graded:0,peer:0,period:""};
  const att=window.TOOLS&&window.TOOLS.attSummaryFor?window.TOOLS.attSummaryFor(cid):{days:0,pct:null};
  const fit=window.FT&&window.FT.summary?window.FT.summary(cid):{n:0,tests:0,last:""};
  let n=0; try{ n=D().studentsIn(store(),cid,H().LS.get("stu.list",[])).length; }catch(e){}
  const num=(v,l)=>'<span class="n">'+esc(String(v))+'</span> '+esc(l);
  if(isGroup){
    /* הכלים המלאים עובדים לפי כיתה. בקבוצה — הסקירה והנוכחות של
       השיעורים; את השאר פותחים דרך הכיתות שבקבוצה. */
    return '<div class="hub-cards">'+
      card("🏅",t("hub.fit","כושר"),[num(fit.n,t("hub.meas","מדידות")),num(fit.tests,t("hub.testsN","מבחנים שונים"))],[])+
      '</div><div class="hint">'+esc(t("hub.groupNote","המסכים המלאים (תלמידים, ציונים, מבחני כושר) עובדים לפי כיתה — פתחו אותם דרך הכיתות שבקבוצה."))+'</div>';
  }
  return '<div class="hub-cards">'+
    card("👥",t("hub.students","תלמידים"),[num(n,t("hub.inList","ברשימה"))],
      [["stu",t("hub.openList","רשימת התלמידים"),true]])+
    card("✅",t("hub.att","נוכחות"),[
        att.days?num(att.days,t("hub.lessonsMarked","שיעורים עם נוכחות")):esc(t("hub.noAtt","עוד לא סומנה נוכחות")),
        att.pct!=null?num(att.pct+"%",t("hub.partPct","השתתפות")):""].filter(Boolean),
      [["att",t("hub.openAtt","נוכחות ודוח"),false]])+
    card("🏅",t("hub.fit","כושר"),[num(fit.n,t("hub.meas","מדידות")),num(fit.tests,t("hub.testsN","מבחנים שונים"))+
        (fit.last?' · <span class="dim">'+esc(t("hub.lastMeas","אחרונה"))+' '+esc(fit.last)+'</span>':"")],
      [["idx",t("hub.openIdx","מדד הכושר"),true],["cov",t("hub.openCov","מה חסר"),false],["prog",t("hub.openProg","התקדמות"),false]])+
    card("📊",t("hub.grades","ציונים"),[num(stuS.graded+"/"+stuS.total,t("hub.graded","עם ציון סופי")),
        '<span class="dim">'+esc(stuS.period||"")+'</span>'],
      [["grades",t("hub.openGrades","טבלת הציונים"),true]])+
    card("🤝",t("hub.assess","הערכות"),[num(stuS.peer,t("hub.peerN","הערכות עמיתים"))],
      [["peer",t("hub.openPeer","הערכת עמיתים"),false],["rub",t("hub.openRub","מחוונים"),false]])+
  '</div>';
}
function paintEmpty(root){
  root.innerHTML='<div class="hub-top"><div><div class="kick">'+esc(t("nav.classes","כיתות"))+'</div>'+
    '<h2>'+esc(t("hub.title","מרכז הכיתה"))+'</h2></div></div>'+
    '<div class="empty-state"><div class="big">🏫</div>'+esc(t("hub.empty","עוד אין כיתות. הוסיפו כיתה כאן — שכבה ומספר — ואחר כך את רשימת התלמידים."))+'</div>'+
    addBox(true);
}
function addBox(open){
  return '<details class="lv-other" id="hub-add"'+(open?" open":"")+'><summary>+ '+esc(t("hub.addCls","כיתה חדשה"))+'</summary><div class="in">'+
    '<div class="seg wrap" id="hub-ag">'+GRADES.map(g=>'<button data-ag="'+g+'"'+(add.g===g?' class="on"':"")+'>'+esc(D().clsName(g,""))+'</button>').join("")+'</div>'+
    '<div class="seg wrap" id="hub-an" style="margin-top:8px">'+NUMS.map(n=>'<button data-an="'+n+'"'+(add.n===n?' class="on"':"")+'>'+n+'</button>').join("")+'</div>'+
    '<button class="btn acc big" id="hub-addGo" style="margin-top:10px"'+(add.g&&add.n?"":" disabled")+'>+ '+
      esc(t("hub.addBtn","הוסף כיתה"))+(add.g&&add.n?" · "+esc(D().clsName(add.g,add.n)):"")+'</button>'+
  '</div></details>';
}
function paint(){
  const root=document.getElementById("hub-root"); if(!root)return;
  const cid=current();
  if(!cid){ paintEmpty(root); applyI18n(root); return; }
  H().LS.set(K,cid);
  const r=reg(), isGroup=D().isGroupRec(r[cid]);
  let act=null; try{ act=H().session.active(); }catch(e){}
  root.innerHTML=
    '<div class="hub-top"><div><div class="kick">'+esc(t("hub.title","מרכז הכיתה"))+'</div>'+
      '<h2 id="cls-title">'+esc(H().classTitle(cid))+'</h2></div></div>'+
    '<div class="hub-chips">'+list().map(c=>'<button class="chip'+(c.cid===cid?" on":"")+'" data-cls="'+esc(c.cid)+'">'+
      (c.group?"👥 ":"")+esc(c.name)+(act&&act.cid===c.cid?' <span class="livedot" title="'+esc(t("hub.inLesson","בשיעור עכשיו"))+'">●</span>':"")+'</button>').join("")+'</div>'+
    '<div class="card hub-ov" id="cls-body">'+H().classOverviewHtml(cid)+'</div>'+
    cards(cid,isGroup)+
    addBox(false);
  H().wireClassOverview(cid);
  applyI18n(root);
}
function applyI18n(root){ if(window.I18N&&window.I18N.applyDom)try{ window.I18N.applyDom(root); }catch(e){} }

function onClick(e){
  const b=e.target.closest("button"); const root=document.getElementById("hub-root");
  if(!b||!root||!root.contains(b))return;
  if(b.dataset.cls){ H().ac(); H().LS.set(K,b.dataset.cls); paint(); return; }
  if(b.dataset.ag){ add.g=b.dataset.ag; paint(); const d=document.getElementById("hub-add"); if(d)d.open=true; return; }
  if(b.dataset.an){ add.n=+b.dataset.an; paint(); const d=document.getElementById("hub-add"); if(d)d.open=true; return; }
  if(b.id==="hub-addGo"){
    if(!add.g||!add.n)return;
    const c=D().registerClass(store(),D().clsName(add.g,add.n));
    if(c){ H().LS.set(K,c.id); H().toast("✓ "+c.name); add={g:null,n:null}; }
    paint(); return;
  }
  const k=b.dataset.hub; if(!k)return;
  H().ac();
  const cid=current();
  switch(k){
    case "stu": window.STU.show(cid,"list"); break;
    case "grades": window.STU.show(cid,"grades"); break;
    case "peer": window.STU.show(cid,"peer"); break;
    case "att": window.TOOLS.show(cid,"att"); break;
    case "rub": window.TOOLS.show(cid,"rub"); break;
    case "idx": case "cov": case "prog": window.FT.show(cid,k); break;
  }
}
function init(){
  if(inited)return; inited=true;
  const root=document.getElementById("hub-root");
  if(root)root.addEventListener("click",onClick);
  document.addEventListener("i18n:change",()=>{ if(document.body.dataset.mod==="cls")paint(); });
}
window.HUB={init,paint,current};
})();
