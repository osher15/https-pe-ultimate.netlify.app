"use strict";
/* ============================================================
   PE Ultimate — מצב שיעור
   ------------------------------------------------------------
   המסך שהמורה מחזיק ביד אחת במגרש. שני מצבים:

   • אין שיעור פתוח — «לאיזו כיתה?». הקשה אחת על כיתה פותחת שיעור.
     הכיתה שבמערכת השעות עכשיו (או הבאה) מוצעת ראשונה, ואחריה
     הכיתות שלימדו לאחרונה.

   • יש שיעור — הכיתה והזמן שעבר, השלב במערך (אם יש מערך), ואריחים
     גדולים לכל כלי שטח. אף כלי לא שואל שוב על הכיתה: הנוכחות,
     המבחנים, הביפ והפיניש כבר קוראים את השיעור הפעיל.

   כאן כפתור גלוי חוסך חיפוש, ולכן כל הכלים פרושים ולא מקופלים
   לתפריט. בהכנה ובהגדרות — שם יש זמן — מותר לקבץ.

   המערך נשמר עם השיעור (live.plan), כדי שרענון באמצע השיעור לא
   ימחק את השלבים. שום מבנה נתונים קיים לא השתנה.
   ============================================================ */
(function(){
const H=()=>window.HM, D=()=>window.HMDATA;
const K_PLAN="live.plan";
const GRADES=["ז","ח","ט","י","יא","יב"];
const NUMS=[1,2,3,4,5,6,7,8,9,10];
let inited=false, tick=null, other={g:null,n:null};

const t=(k,d)=>H().t(k,d);
const esc=s=>H().esc(s);
const iso=()=>new Date().toISOString().slice(0,10);
const store=()=>H().regStore;
const active=()=>{ try{ return H().session.active(); }catch(e){ return null; } };
const mmss=sec=>{ sec=Math.max(0,Math.floor(sec)); const m=Math.floor(sec/60);
  return String(m).padStart(2,"0")+":"+String(sec%60).padStart(2,"0"); };

/* ---------- המערך של השיעור ---------- */
function planState(){ const v=H().LS.get(K_PLAN,null); return v&&typeof v==="object"?v:null; }
/* שלבים בלבד — שם, דקות ותיאור. זה מה שמצב שיעור צריך, ולא כל המערך */
function slim(p){
  if(!p||!Array.isArray(p.phases)||!p.phases.length)return null;
  /* הנושא והגרסאות נשמרים כדי שהדירוג בסיום ילמד את מחולל המערכים */
  return {id:p.id||null,title:p.title||"",topic:p.topic||null,grade:p.grade||null,
    variants:p.mainVariants||[],subs:p.mainSubs||[],
    phases:p.phases.map(x=>({n:String(x.n||""),min:+x.min||0,d:Array.isArray(x.d)?x.d.join(" · "):String(x.d||"")}))};
}
function attachPlan(p){
  const a=active(), sp=slim(p); if(!a||!sp)return false;
  H().LS.set(K_PLAN,{sid:a.id,plan:sp,i:0,t0:Date.now()});
  return true;
}
/* המערך של השיעור הפעיל. מערך שעל המסך במערכי שיעור מצטרף לבד,
   פעם אחת, לשיעור שנפתח בלי מערך. */
function curPlan(){
  const a=active(); if(!a)return null;
  let st=planState();
  if(st&&st.sid===a.id&&st.plan)return st;
  const p=window.LESSON&&window.LESSON.current&&window.LESSON.current();
  if(p&&attachPlan(p))return planState();
  return null;
}

/* ---------- הכיתות לבורר ---------- */
function studentsCount(cid){
  try{ return D().studentsIn(store(),cid,H().LS.get("stu.list",[])).length; }catch(e){ return 0; }
}
function classChoices(){
  const reg=D().classes(store());
  const sug={}, order=[];
  /* מה שבמערכת השעות — קודם «עכשיו», אחריו «הבא» */
  try{
    const d=D().splitDay(H().sched.today(),(()=>{ const x=new Date(); return x.getHours()*60+x.getMinutes(); })());
    [["now",d.now],["next",d.next]].forEach(([k,r])=>{
      if(r&&r.startable&&r.slot&&r.slot.cid&&!sug[r.slot.cid]){ sug[r.slot.cid]=k; order.push(r.slot.cid); }
    });
  }catch(e){}
  /* אחר כך הכיתות שלימדו לאחרונה */
  try{ (H().session.list()||[]).forEach(s=>{ if(s.cid&&reg[s.cid]&&order.indexOf(s.cid)<0)order.push(s.cid); }); }catch(e){}
  Object.keys(reg).sort((a,b)=>String(reg[a].name||a).localeCompare(String(reg[b].name||b),"he"))
    .forEach(cid=>{ if(order.indexOf(cid)<0)order.push(cid); });
  return order.filter(cid=>reg[cid]||sug[cid]).map(cid=>({cid,name:(reg[cid]&&reg[cid].name)||cid,
    group:!!(reg[cid]&&D().isGroupRec(reg[cid])),sug:sug[cid]||"",n:studentsCount(cid),
    asg:((H().assign&&H().assign.get(cid,iso()))||{}).title||""}));
}

function start(cid,label){
  const S=H().session;
  const name=label||((D().classOf(store(),cid)||{}).name)||cid;
  /* המערך ששויך לשיעור הזה קודם; אחרת המערך שעל המסך במערכים */
  const as=H().assign&&H().assign.get(cid,iso());
  const p=(as&&as.plan&&as.plan.phases)?as.plan:(window.LESSON&&window.LESSON.current&&window.LESSON.current());
  const r=S.start({cid,clsSnapshot:name,date:iso(),planId:(p&&p.id)||null,planTitle:(p&&p.title)||""});
  if(r.outcome==="blocked"){ H().toast(t("live.blocked","כבר פתוח שיעור בכיתה")+" "+H().sesName(r.active)); return; }
  if(!r.ok){ H().toast(t("live.cantStart","לא ניתן לפתוח שיעור")); return; }
  if(p)attachPlan(p);
  H().paintSessionBar(); H().paintNavLive(); H().paintHome();
  H().toast("▶ "+t("live.started","השיעור התחיל")+" · "+name);
  paint();
}

/* ---------- ציור ---------- */
function tile(k,ic,label,sub,badge,extra){
  return '<button class="lv-tile" data-tool="'+k+'"'+(extra||"")+'><span class="ic">'+ic+'</span>'+
    (badge?'<span class="bd">'+badge+'</span>':"")+
    '<b>'+esc(label)+'</b><small>'+esc(sub||"")+'</small></button>';
}
function paintPick(root){
  const list=classChoices();
  const p=window.LESSON&&window.LESSON.current&&window.LESSON.current();
  const sugLbl={now:t("live.sugNow","עכשיו במערכת"),next:t("live.sugNext","הבא במערכת")};
  root.innerHTML=
    '<div class="lv-head pick"><div class="kick">▶ '+esc(t("nav.live","שיעור"))+'</div>'+
      '<h2>'+esc(t("live.which","לאיזו כיתה?"))+'</h2>'+
      '<p class="hint">'+esc(t("live.whichHint","הקשה על כיתה פותחת שיעור. נוכחות, מדידות וקבוצות יישמרו לכיתה הזאת."))+'</p>'+
      (p?'<p class="hint lv-plannote">📋 '+esc(t("live.planWill","המערך שעל המסך ייפתח איתו:"))+' <b>'+esc(p.title||"")+'</b></p>':"")+
    '</div>'+
    (list.length
      ? '<div class="lv-chips">'+list.map(c=>'<button class="lv-chip'+(c.sug?" sug":"")+'" data-cls="'+esc(c.cid)+'">'+
          '<b>'+(c.group?"👥 ":"")+esc(c.name)+'</b>'+
          '<small>'+(c.sug?'<span class="now">'+esc(sugLbl[c.sug])+'</span> · ':"")+c.n+" "+esc(t("live.students","תלמידים"))+'</small>'+
          (c.asg?'<small class="asg">📋 '+esc(c.asg)+'</small>':"")+'</button>').join("")+'</div>'
      : '<div class="empty-state"><div class="big">👥</div>'+esc(t("live.noClasses","עוד אין כיתות. בחרו שכבה ומספר כאן למטה — הכיתה תירשם ותישמר."))+'</div>')+
    '<details class="lv-other"'+(list.length?"":" open")+'><summary>'+esc(t("live.other","כיתה אחרת — שכבה ומספר"))+'</summary><div class="in">'+
      '<div class="seg wrap" id="lv-og">'+GRADES.map(g=>'<button data-g="'+g+'"'+(other.g===g?' class="on"':"")+'>'+esc(D().clsName(g,"").replace(/\s+$/,""))+'</button>').join("")+'</div>'+
      '<div class="seg wrap" id="lv-on" style="margin-top:8px">'+NUMS.map(n=>'<button data-n="'+n+'"'+(other.n===n?' class="on"':"")+'>'+n+'</button>').join("")+'</div>'+
      '<button class="btn acc big" id="lv-oGo" style="margin-top:10px"'+(other.g&&other.n?"":" disabled")+'>▶ '+
        esc(t("live.startCls","התחל שיעור"))+(other.g&&other.n?" · "+esc(D().clsName(other.g,other.n)):"")+'</button>'+
    '</div></details>'+
    '<div class="hx-sec">'+esc(t("live.noClassTools","כלים בלי כיתה"))+'</div>'+
    '<div class="lv-tiles">'+
      tile("meas","🏅",t("live.tMeas","מדידה"),t("live.tMeasSub","31 מבחני כושר"))+
      tile("beep","🎵",t("live.tBeep","ביפ טסט"),t("live.tBeepSub","זינוק ורישום נשירה"))+
      tile("photo","📷",t("live.tPhoto","פיניש"),t("live.tPhotoSub","מצלמה ומסלולים"))+
      tile("timer","⏲",t("live.tTimer","טיימר"),t("live.tTimerSub","אינטרוולים · תחנות"))+
    '</div>';
}
function phaseNow(st){
  const ph=st.plan.phases, i=Math.min(st.i||0,ph.length-1);
  const left=ph[i].min*60-(Date.now()-(st.t0||Date.now()))/1000;
  return {i,ph:ph[i],next:ph[i+1]||null,left};
}
function paintLive(root,a){
  const st=curPlan();
  const name=H().sesName(a);
  const n=studentsCount(a.cid);
  const att=window.TOOLS&&window.TOOLS.attStatus?window.TOOLS.attStatus():null;
  const meas=(()=>{ try{ return H().session.measurements(a.id).length; }catch(e){ return 0; } })();
  let phase="";
  if(st){
    const x=phaseNow(st);
    phase='<div class="lv-phase" id="lv-phase">'+
      '<div class="row"><span class="pill">'+esc(t("live.step","שלב"))+' '+(x.i+1)+'/'+st.plan.phases.length+'</span>'+
        '<span class="grow"></span><span class="nx" id="lv-next">'+(x.next?esc(t("live.next","הבא:"))+" "+esc(x.next.n)+" · "+x.next.min+" "+esc(t("ui.min","דק׳")):esc(t("live.last","שלב אחרון")))+'</span></div>'+
      '<div class="row"><b class="nm" id="lv-phName">'+esc(x.ph.n)+'</b><span class="grow"></span><span class="left mono" id="lv-left">'+mmss(x.left)+'</span></div>'+
      '<div class="lv-bar"><i id="lv-bar" style="width:'+Math.min(100,Math.max(0,100-x.left/(x.ph.min*60||1)*100))+'%"></i></div>'+
      (x.ph.d?'<div class="lv-desc">'+esc(x.ph.d)+'</div>':"")+
      '<div class="row lv-phbtns"><button class="btn" id="lv-plan">📋 '+esc(t("live.planBtn","המערך המלא"))+'</button>'+
        (x.next?'<button class="btn acc" id="lv-nextBtn">'+esc(t("live.nextBtn","לשלב הבא"))+' ◀</button>':"")+'</div>'+
    '</div>';
  }else{
    phase='<div class="lv-phase empty"><span>'+esc(t("live.noPlan","אין מערך לשיעור הזה."))+'</span>'+
      '<button class="btn ghost" id="lv-pickPlan">📋 '+esc(t("live.choosePlan","בחר או בנה מערך"))+'</button></div>';
  }
  const attSub=att&&att.total?(att.marked?att.cnt.p+" "+t("live.present","נוכחים")+(att.cnt.a?" · "+att.cnt.a+" "+t("live.absent","חסרים"):""):t("live.notMarked","עוד לא סומנה")):t("live.noRoster","אין רשימה לכיתה");
  const attBadge=att&&att.total?(att.marked>=att.total?'<span class="pill ok">✓</span>':'<span class="pill warn">!</span>'):"";
  root.innerHTML=
    '<div class="lv-head"><div class="grow"><div class="cls">'+(D().isGroupId&&D().isGroupId(a.cid)?"👥 ":"")+esc(name)+'</div>'+
      '<div class="sub">'+n+" "+esc(t("live.students","תלמידים"))+(a.planTitle?" · "+esc(a.planTitle):"")+'</div></div>'+
      '<div class="clk mono" id="lv-clk">'+mmss((Date.now()-(a.startedAt||Date.now()))/1000)+'</div></div>'+
    phase+
    (att&&att.total&&!att.marked?'<button class="btn acc big lv-allin" id="lv-allIn">✓ '+esc(t("live.allIn","כולם נוכחים"))+' ('+att.total+')</button>':"")+
    '<div class="lv-tiles">'+
      tile("att","✅",t("live.tAtt","נוכחות"),attSub,attBadge)+
      tile("meas","🏅",t("live.tMeas","מדידה"),meas?meas+" "+t("live.measDone","מדידות בשיעור"):t("live.tMeasSub","31 מבחני כושר"))+
      tile("beep","🎵",t("live.tBeep","ביפ טסט"),t("live.tBeepSub","זינוק ורישום נשירה"))+
      tile("photo","📷",t("live.tPhoto","פיניש"),t("live.tPhotoSub","מצלמה ומסלולים"))+
      tile("timer","⏲",t("live.tTimer","טיימר"),t("live.tTimerSub","אינטרוולים · תחנות"))+
      tile("teams","👥",t("live.tTeams","קבוצות"),t("live.tTeamsSub","מאוזנות, מהנוכחים"))+
      tile("pick","🎯",t("live.tPick","הגרלה"),t("live.tPickSub","בלי חזרות בסבב"))+
      tile("games","🎮",t("live.tGames","משחקים"),t("live.tGamesSub","חוקים והסבר"))+
    '</div>'+
    '<div class="lv-foot"><button class="btn ghost" id="lv-leave">'+esc(t("live.leave","יציאה — השיעור ממשיך"))+'</button>'+
      '<button class="btn stop big" id="lv-end">⏹ '+esc(t("live.end","סיים שיעור"))+'</button></div>';
}
function paint(){
  const root=document.getElementById("lv-root"); if(!root)return;
  const a=active();
  document.getElementById("view-live").classList.toggle("has-lesson",!!a);
  if(a)paintLive(root,a); else paintPick(root);
  if(window.I18N&&window.I18N.applyDom)try{ window.I18N.applyDom(root); }catch(e){}
}

/* ---------- כלים ---------- */
/* כל אריח פותח את המודול הקיים, על הלשונית הנכונה. «חזרה» — של
   הכותרת או של הטלפון — מחזירה לכאן, כי המעבר נרשם בהיסטוריה. */
function openTool(k){
  const go=H().go;
  if(k==="att"){ go("tools"); window.TOOLS&&window.TOOLS.openTab("att"); return; }
  if(k==="teams"){ go("tools"); window.TOOLS&&window.TOOLS.openTab("teams"); return; }
  if(k==="pick"){ go("tools"); window.TOOLS&&window.TOOLS.openTab("pick"); return; }
  if(k==="meas"){ go("ft"); return; }
  if(k==="beep"){ go("beep"); return; }
  if(k==="photo"){ go("photo"); return; }
  if(k==="games"){ go("games"); return; }
  if(k==="timer"){ go("fit"); const b=document.querySelector('#view-fit [data-ft="timer"]'); if(b)b.click(); return; }
}
function nextPhase(){
  const st=planState(); if(!st)return;
  const nx=(st.i||0)+1; if(nx>=st.plan.phases.length)return;
  st.i=nx; st.t0=Date.now(); H().LS.set(K_PLAN,st);
  try{ H().horn(); H().say(st.plan.phases[nx].n); }catch(e){}
  paint();
}
function onClick(e){
  const el=e.target.closest("button"); if(!el||!document.getElementById("lv-root").contains(el))return;
  H().ac();
  if(el.dataset.cls){ start(el.dataset.cls); return; }
  if(el.dataset.tool){ openTool(el.dataset.tool); return; }
  if(el.dataset.g){ other.g=el.dataset.g; paint(); const d=document.querySelector(".lv-other"); if(d)d.open=true; return; }
  if(el.dataset.n){ other.n=+el.dataset.n; paint(); const d=document.querySelector(".lv-other"); if(d)d.open=true; return; }
  switch(el.id){
    case "lv-oGo":{
      if(!other.g||!other.n)return;
      const lbl=D().clsName(other.g,other.n);
      const c=D().registerClass(store(),lbl);
      if(c)start(c.id,c.name);
      return;
    }
    case "lv-allIn":{
      const n=window.TOOLS&&window.TOOLS.markAllPresent?window.TOOLS.markAllPresent():0;
      H().toast("✓ "+n+" "+t("live.markedIn","סומנו נוכחים. את החריגים מסמנים בנוכחות"));
      paint(); return;
    }
    case "lv-nextBtn": nextPhase(); return;
    case "lv-plan": case "lv-pickPlan": H().go("lesson"); return;
    case "lv-leave": H().go("home"); H().toast(t("live.continues","השיעור ממשיך. ▶ בסרגל מחזיר אליו")); return;
    case "lv-end": H().openEndLesson(); return;
  }
}
/* שעון השיעור והשלב — עדכון טקסט בלבד, בלי לצייר מחדש את המסך */
function onTick(){
  if(document.body.dataset.mod!=="live")return;
  const a=active(); if(!a)return;
  const c=document.getElementById("lv-clk"); if(c)c.textContent=mmss((Date.now()-(a.startedAt||Date.now()))/1000);
  const st=planState();
  if(st&&st.sid===a.id&&document.getElementById("lv-left")){
    const x=phaseNow(st);
    document.getElementById("lv-left").textContent=mmss(x.left);
    const b=document.getElementById("lv-bar"); if(b)b.style.width=Math.min(100,Math.max(0,100-x.left/(x.ph.min*60||1)*100))+"%";
    const ph=document.getElementById("lv-phase"); if(ph)ph.classList.toggle("over",x.left<=0);
  }
}
function init(){
  if(inited)return; inited=true;
  const root=document.getElementById("lv-root");
  if(root)root.addEventListener("click",onClick);
  tick=setInterval(onTick,1000);
  document.addEventListener("i18n:change",()=>{ if(document.body.dataset.mod==="live")paint(); });
}
window.LIVE={init,paint,attachPlan,plan:curPlan,_test:{classChoices}};
})();
