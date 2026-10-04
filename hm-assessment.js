"use strict";
// Teacher configuration only; calculating a suggestion never writes a grade.
window.ASSESSMENT=(()=>{
  const HE={"as.title": "מבחני חובה ויעדים", "as.close": "סגירה", "as.intro": "בחר מבחני חובה לכיתה ולתקופה. הציונים המחושבים הם הצעה בלבד; ציונים ידניים לא משתנים.", "as.class": "כיתה", "as.period": "תקופת הערכה", "as.from": "מתאריך", "as.to": "עד תאריך", "as.dates": "התאריכים נשמרים כאן כעותק. שינוי טווח הנוכחות בהמשך לא ישנה את הדרישות האלה.", "as.useRule": "הגדר כלל ניקוד לפי יעד", "as.higher": "תוצאה גבוהה יותר טובה יותר. תוצאה ביעד או מעליו מקבלת את הציון המרבי.", "as.lower": "זמן נמוך יותר טוב יותר. תוצאה ביעד או מתחתיו מקבלת את הציון המרבי.", "as.target": "יעד", "as.step": "גודל מדרגה בתוצאה", "as.points": "נקודות לכל מדרגה", "as.min": "ציון מזערי", "as.max": "ציון מרבי", "as.rounding": "עיגול הפער מהיעד", "as.choose": "בחר אופן עיגול", "as.ceil": "כל מדרגה שהתחילה", "as.floor": "מדרגות שלמות בלבד", "as.linear": "חלקי מדרגות", "as.preview": "תצוגת ניקוד", "as.ruleHint": "הזן יעד, מדרגה, נקודות, גבולות ועיגול תקינים לתצוגה מקדימה.", "as.save": "שמור דרישות", "as.delete": "הסר דרישות", "as.deleteConfirm": "להסיר את הדרישות? המדידות והציונים יישארו.", "as.discard": "לוותר על שינויים שלא נשמרו?", "as.saved": "הדרישות נשמרו", "as.failed": "השמירה נכשלה. הטיוטה עדיין פתוחה; נסה שוב או צור גיבוי.", "as.invalid": "בחר לפחות מבחן אחד ובדוק תאריכים, כללי ניקוד ופטורים.", "as.corrupt": "לא ניתן לקרוא את הדרישות השמורות או שגרסתן אינה נתמכת. שחזר גיבוי תקין לפני עריכה.", "as.conflict": "הדרישות או התקופות השתנו במקום אחר. פתח מחדש לפני שמירה.", "as.periodBlocked": "הסר תחילה את הדרישות השמורות לתקופה לפני מחיקתה.", "as.noClasses": "הוסף כיתה או תלמיד לפני הגדרת דרישות."};
  Object.assign(HE,{"as.exSave":"שמור דרישות ופטורים", "as.exTitle": "פטורים לתקופה", "as.exScope": "פטור חל על מבחן של תלמיד בכל התקופה והתאריכים שנבחרו. נדרשת סיבה; זה אינו פטור נוכחות ליום מסוים. מדידות וציונים ידניים נשמרים.", "as.exPupil": "תלמיד", "as.exChoose": "בחר תלמיד לפי השם והמזהה", "as.exUnavailable": "תלמיד שאינו בכיתה", "as.exUnavailableHint": "התלמיד אינו ברשימה הנוכחית. פטורים שמורים נשארים; אפשר להסיר אותם במפורש, אך אי אפשר להוסיף חדשים כאן.", "as.exNoPupils": "אין תלמידים בכיתה. הוסף תלמיד לפני הגדרת פטור.", "as.exReason": "סיבת הפטור (חובה)", "as.exNoTests": "בחר קודם מבחן חובה כדי להגדיר פטור.", "as.exReasonRequired": "כתוב סיבה לכל פטור שסומן לפני השמירה.", "as.exRemovedTest": "הסר את הפטור השמור לפני הסרת מבחן החובה. מדידות התלמיד יישארו."});
  const KEY="assessment.policies",D=window.HMDATA,A=window.HMAssessment;
  const H=()=>window.HM, t=key=>H().t("as."+key,HE["as."+key]||key), esc=s=>H().esc(String(s??""));
  const defs=()=>window.FT.tests().filter(d=>d.id!=="beep");
  function read(){
    const before=H().LS.health().fails_n;
    const value=H().LS.get(KEY,null);
    if(H().LS.health().fails_n!==before)return {ok:false};
    const envelope=value===null?{version:1,policies:[]}:value;
    return {...A.validateEnvelope(envelope,defs(),H().LS),value:envelope};
  }
  function canDeletePeriod(period){
    const config=read();
    if(!config.ok){H().toast(t("corrupt"));return false;}
    if(config.value.policies.some(p=>p.period===period)){H().toast(t("periodBlocked"));return false;}
    return true;
  }
  function open(cid,period,selectSid){
    const config=read();
    let classes=Object.values(D.realClasses(H().LS));
    // Imported pupils may have a stable class before the registry is populated.
    for(const s of H().LS.get("stu.list",[])){
      const id=D.cidOfStudent(s,H().LS);
      if(id&&!D.isGroupId(id)&&!classes.some(c=>c.id===id))classes.push({id,name:s.cls||id});
    }
    if(!classes.length){H().toast(t("noClasses"));return;}
    if(!classes.some(c=>c.id===cid))cid=classes[0].id;
    let periods=H().LS.get("grades.periods",null);
    if(!Array.isArray(periods)||!periods.length)periods=["רבעון 1"];
    if(!periods.includes(period))period=periods[0];
    let snapshot=JSON.stringify(config.value),dirty=false,exemptions=[];
    let old=document.getElementById("as-modal");if(old)old.remove();
    const el=document.createElement("div");el.id="as-modal";el.className="modal";
    el.innerHTML=`<div class="box" style="max-width:760px">
      <h3>${esc(t("title"))}<button type="button" class="x" id="as-close" aria-label="${esc(t("close"))}">✕</button></h3>
      <div class="hint">${esc(t("intro"))}</div>
      <div class="row" style="margin-top:12px;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:130px"><label for="as-class">${esc(t("class"))}</label><select id="as-class">${classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></div>
        <div class="field" style="flex:1;min-width:130px"><label for="as-period">${esc(t("period"))}</label><select id="as-period">${periods.map(p=>`<option value="${esc(p)}">${esc((window.I18N&&window.I18N.term(p))||p)}</option>`).join("")}</select></div>
      </div>
      <form id="as-form"><div id="as-fields"></div>
        <div id="as-error" role="alert" style="color:var(--stop);margin:12px 0"></div>
        <div class="row" style="flex-wrap:wrap"><button type="submit" class="btn acc" id="as-save">${esc(t("save"))}</button>
        <button type="button" class="btn ghost" id="as-delete">${esc(t("delete"))}</button></div>
      </form></div>`;
    document.body.appendChild(el);
    const $=s=>el.querySelector(s);
    $("#as-class").value=cid;$("#as-period").value=period;
    const current=()=>({cid:$("#as-class").value,period:$("#as-period").value});
    const error=key=>{$("#as-error").textContent=t(key);};
    function render(){
      const c=current(),latest=read();
      if(!latest.ok){$("#as-fields").innerHTML="";$("#as-save").disabled=true;$("#as-delete").disabled=true;error("corrupt");return;}
      snapshot=JSON.stringify(latest.value);
      const policy=latest.value.policies.find(p=>p.cid===c.cid&&p.period===c.period);
      exemptions=JSON.parse(JSON.stringify(policy?.exemptions||[]));
      const range=policy||(H().LS.get("grades.periodRanges",{})||{})[c.period]||{};
      $("#as-fields").innerHTML=`<div class="row" style="flex-wrap:wrap;margin-top:12px">
        <div class="field" style="flex:1;min-width:130px"><label for="as-from">${esc(t("from"))}</label><input type="date" id="as-from" required value="${esc(range.from||"")}"></div>
        <div class="field" style="flex:1;min-width:130px"><label for="as-to">${esc(t("to"))}</label><input type="date" id="as-to" required value="${esc(range.to||"")}"></div></div>
        <p class="hint">${esc(t("dates"))}</p>
        <details id="as-ex-panel" class="card" style="padding:12px;margin:12px 0"><summary>${esc(t("exTitle"))} <span id="as-ex-count"></span></summary>
          <p class="hint">${esc(t("exScope"))}</p><label for="as-ex-pupil">${esc(t("exPupil"))}</label><select id="as-ex-pupil" style="width:100%"></select><div id="as-ex-list"></div><button type="submit" class="btn acc" id="as-ex-save" style="margin-top:12px">${esc(t("exSave"))}</button>
        </details>
        ${defs().map(d=>{
          const entry=policy?.tests.find(e=>e.id===d.id),r=entry?.rule;
          return `<section class="card as-test" data-test="${esc(d.id)}" style="padding:12px;margin-top:8px">
            <label><input type="checkbox" class="as-required" ${entry?"checked":""}> ${esc((window.I18N&&window.I18N.term(d.name))||d.name)}</label>
            <label style="display:block;margin-top:8px"><input type="checkbox" class="as-rule" ${r?"checked":""}> ${esc(t("useRule"))}</label>
            <div class="as-ruleFields" ${r?"":"hidden"} style="margin-top:10px">
              <div class="hint">${esc(t(d.dir==="low"?"lower":"higher"))}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">${["target","step","points","min","max"].map(k=>`<label style="flex:1;min-width:85px">${esc(t(k))}<input class="as-${k}" type="number" step="any" value="${esc(r?.[k]??(k==="min"?0:k==="max"?100:""))}" style="width:100%;box-sizing:border-box"></label>`).join("")}</div>
              <label style="display:block;margin-top:8px">${esc(t("rounding"))}<select class="as-rounding"><option value="">${esc(t("choose"))}</option>${["ceil","floor","linear"].map(k=>`<option value="${k}" ${r?.rounding===k?"selected":""}>${esc(t(k))}</option>`).join("")}</select></label>
              <div class="hint as-preview" style="margin-top:8px" aria-live="polite"></div>
            </div></section>`;
        }).join("")}`;
      $("#as-save").disabled=false;$("#as-delete").disabled=!policy;$("#as-error").textContent="";
      dirty=false;
      for(const row of el.querySelectorAll(".as-test"))refresh(row);
      function refresh(row){
        const enabled=row.querySelector(".as-rule").checked;
        row.querySelector(".as-ruleFields").hidden=!enabled;
        for(const input of row.querySelectorAll(".as-ruleFields input,.as-rounding"))input.disabled=!enabled;
        if(!enabled)return;
        const rule=getRule(row),d=defs().find(d=>d.id===row.dataset.test);
        const sample=[rule.target,rule.target+(d.dir==="low"?1:-1)*rule.step];
        row.querySelector(".as-preview").textContent=sample.every(Number.isFinite)&&sample.every(v=>A.score(v,d.dir,rule)!==null)
          ?t("preview")+": "+sample.map(v=>v+" → "+A.score(v,d.dir,rule)).join(" · "):t("ruleHint");
      }
      const roster=H().LS.get("stu.list",[]).filter(s=>D.cidOfStudent(s,H().LS)===c.cid);
      const pupilMap=new Map(roster.filter(s=>typeof D.studentKey(s)==="string").map(s=>[D.studentKey(s),s]));
      const pupilIds=[...new Set([...pupilMap.keys(),...exemptions.map(e=>e.sid)])];
      $("#as-ex-pupil").innerHTML=`<option value="">${esc(t("exChoose"))}</option>${pupilIds.map(id=>`<option value="${esc(id)}">${esc(pupilMap.has(id)?pupilMap.get(id).name:t("exUnavailable"))} [${esc(id)}]</option>`).join("")}`;
      function renderExemptions(){
        $("#as-ex-count").textContent="("+exemptions.length+")";
        const sid=$("#as-ex-pupil").value;
        if(!sid){$("#as-ex-list").innerHTML=`<p class="hint">${esc(t(pupilIds.length?"exChoose":"exNoPupils"))}</p>`;return;}
        const required=[...el.querySelectorAll(".as-test")].filter(row=>row.querySelector(".as-required").checked).map(row=>row.dataset.test);
        const testIds=[...new Set([...required,...exemptions.filter(e=>e.sid===sid).map(e=>e.test)])];
        $("#as-ex-list").innerHTML=(!pupilMap.has(sid)?`<p class="hint">${esc(t("exUnavailableHint"))}</p>`:"")+(testIds.length?testIds.map(id=>{
          const entry=exemptions.find(e=>e.sid===sid&&e.test===id),def=defs().find(d=>d.id===id),isRequired=required.includes(id);
          return `<div class="as-ex-row" data-test="${esc(id)}" data-sid="${esc(sid)}" style="margin-top:10px"><label><input type="checkbox" class="as-ex-check" ${entry?"checked":""} ${!entry&&(!pupilMap.has(sid)||!isRequired)?"disabled":""}> ${esc((window.I18N&&window.I18N.term(def.name))||def.name)}</label>
            ${!isRequired?`<p class="hint">${esc(t("exRemovedTest"))}</p>`:""}<label style="display:block;margin-top:6px">${esc(t("exReason"))}<textarea class="as-ex-reason" maxlength="500" rows="2" style="width:100%;box-sizing:border-box" ${entry&&pupilMap.has(sid)?"":"disabled"}>${esc(entry?.reason||"")}</textarea></label></div>`;
        }).join(""):`<p class="hint">${esc(t("exNoTests"))}</p>`);
      }
      function changeExemption(target){
        const row=target.closest(".as-ex-row");if(!row)return;
        const sid=row.dataset.sid,id=row.dataset.test;
        if(target.classList.contains("as-ex-check")){
          exemptions=exemptions.filter(e=>e.sid!==sid||e.test!==id);
          if(target.checked)exemptions.push({sid,test:id,reason:""});
          renderExemptions();
        }else if(target.classList.contains("as-ex-reason")){
          const entry=exemptions.find(e=>e.sid===sid&&e.test===id);if(entry)entry.reason=target.value;
        }
      }
      $("#as-fields").oninput=e=>{if(e.target.id==="as-ex-pupil")return;dirty=true;if(e.target.classList.contains("as-ex-reason"))changeExemption(e.target);const row=e.target.closest(".as-test");if(row)refresh(row);};
      $("#as-fields").onchange=e=>{
        if(e.target.id==="as-ex-pupil"){renderExemptions();return;}
        dirty=true;if(e.target.classList.contains("as-ex-reason")||e.target.classList.contains("as-ex-check"))changeExemption(e.target);
        const row=e.target.closest(".as-test");if(row){refresh(row);if(e.target.classList.contains("as-required"))renderExemptions();}
      };
      renderExemptions();
    }
    function getRule(row){
      const rule={};for(const k of ["target","step","points","min","max"]){const v=row.querySelector(".as-"+k).value;rule[k]=v.trim()===""?NaN:Number(v);}
      rule.rounding=row.querySelector(".as-rounding").value;return rule;
    }
    function unchanged(){
      const latest=read();
      if(!latest.ok){error("corrupt");return null;}
      if(JSON.stringify(latest.value)!==snapshot){error("conflict");return null;}
      return latest.value;
    }
    function persist(value){
      if(H().LS.health().backend!=="localStorage"||!H().LS.set(KEY,value)){error("failed");return false;}
      const saved=read();
      if(!saved.ok||JSON.stringify(saved.value)!==JSON.stringify(value)){error("failed");return false;}
      snapshot=JSON.stringify(value);dirty=false;H().toast(t("saved"));H().modal("as-modal",false);return true;
    }
    $("#as-form").onsubmit=e=>{
      e.preventDefault();const value=unchanged();if(!value)return;
      const c=current();
      const savedPeriods=H().LS.get("grades.periods",null);
      if(!(Array.isArray(savedPeriods)&&savedPeriods.length?savedPeriods:["רבעון 1"]).includes(c.period)){error("conflict");return;}
      const previous=value.policies.find(p=>p.cid===c.cid&&p.period===c.period);
      const policy={...c,from:$("#as-from").value,to:$("#as-to").value,
        tests:[...el.querySelectorAll(".as-test")].filter(row=>row.querySelector(".as-required").checked).map(row=>({id:row.dataset.test,...(row.querySelector(".as-rule").checked?{rule:getRule(row)}:{})})),
        exemptions};
      if(exemptions.some(e=>!e.reason.trim())){error("exReasonRequired");$("#as-ex-panel").open=true;return;}
      if(exemptions.some(e=>!policy.tests.some(t=>t.id===e.test))){error("exRemovedTest");$("#as-ex-panel").open=true;return;}
      // Existing unavailable entries are retained; new exemptions require current membership.
      const fresh=H().LS.get("stu.list",[]),original=previous?.exemptions||[];
      if(!Array.isArray(fresh)||exemptions.some(e=>{
        const count=fresh.filter(s=>D.studentKey(s)===e.sid&&D.cidOfStudent(s,H().LS)===c.cid).length;
        return count>1||(!original.some(old=>old.sid===e.sid&&old.test===e.test)&&count!==1);
      })){error("conflict");return;}
      const next=A.updateEnvelope(value,policy,defs(),H().LS);
      if(!next.ok){error("invalid");return;}
      persist(next.value);
    };
    $("#as-delete").onclick=async()=>{
      const value=unchanged();if(!value||!await H().ask({msg:t("deleteConfirm"),ok:t("delete")}))return;
      if(!unchanged())return;
      const c=current();persist({version:1,policies:value.policies.filter(p=>p.cid!==c.cid||p.period!==c.period)});
    };
    async function close(){if(!dirty||await H().ask({msg:t("discard"),ok:t("close")}))H().modal("as-modal",false);}
    el.__onBack=close;
    el.onclick=e=>{if(e.target===el)close();};
    el.onkeydown=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close();}};
    $("#as-close").onclick=close;
    for(const id of ["as-class","as-period"]){
      let prev=$("#"+id).value;
      $("#"+id).onchange=async()=>{if(dirty&&!await H().ask({msg:t("discard"),ok:t("close")})){$("#"+id).value=prev;return;}prev=$("#"+id).value;render();};
    }
    render();
    if(selectSid&&$("#as-ex-pupil")&&[...$("#as-ex-pupil").options].some(o=>o.value===selectSid)){
      $("#as-ex-panel").open=true;$("#as-ex-pupil").value=selectSid;$("#as-ex-pupil").dispatchEvent(new Event("change",{bubbles:true}));
    }
    H().modal("as-modal");
  }
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-assessment-open]");if(!b)return;
    const raw=b.dataset.cid||document.getElementById("gr-classSel")?.value;
    open(D.resolveClassId(H().LS,raw)||raw,document.getElementById("gr-period")?.value);
  });
  return {open,canDeletePeriod,read,key:KEY};
})();
