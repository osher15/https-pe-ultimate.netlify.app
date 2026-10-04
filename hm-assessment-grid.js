"use strict";
// Append dated measurements to the existing history; never edit an old attempt or grade.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./hm-data.js"),require("./hm-assessment-data.js"));
  else window.ASSESSMENT_GRID=factory(window.HMDATA,window.HMAssessment);
})(function(D,A){
  function append(students,measurements,policy,defs,store,batch){
    const fail=error=>({ok:false,error});
    if(!Array.isArray(students)||!Array.isArray(measurements))return fail("invalid");
    if(!A.validatePolicy(policy,defs,store).ok)return fail("invalid");
    if(!batch||!A.validDate(batch.date)||batch.date<policy.from||batch.date>policy.to)return fail("date");
    if(!Array.isArray(batch.entries)||!batch.entries.length)return fail("empty");
    const ids=batch.ids;
    if(!Array.isArray(ids)||ids.length!==batch.entries.length||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=="string"||!id||measurements.some(r=>r&&r.id===id))||!Number.isFinite(batch.ts))return fail("invalid");
    const catalog=new Map(defs.map(d=>[d.id,d])),seen=new Set(),added=[];
    for(const [i,e] of batch.entries.entries()){
      if(!e||typeof e.sid!=="string"||!e.sid.trim())return fail("identity");
      const same=students.filter(s=>D.studentKey(s)===e.sid),key=JSON.stringify([e.sid,e.test]);
      if(same.length!==1||D.cidOfStudent(same[0],store)!==policy.cid)return fail("identity");
      if(seen.has(key))return fail("invalid");seen.add(key);
      const def=catalog.get(e.test);
      if(!def||!policy.tests.some(t=>t.id===e.test))return fail("invalid");
      if((policy.exemptions||[]).some(x=>x.sid===e.sid&&x.test===e.test))return fail("exempt");
      if(typeof e.value!=="number"||!D.isValidMeasurement({val:e.value},def.dir)||
        (def.kind==="count"&&!Number.isInteger(e.value))||Math.abs(e.value*100-Math.round(e.value*100))>1e-7)return fail("value");
      const s=same[0];
      added.push({id:ids[i],ts:batch.ts,d:batch.date,cls:D.classLabel(store,policy.cid)||s.cls||policy.cid,cid:policy.cid,
        test:e.test,name:String(s.name??""),sid:e.sid,gradeKey:D.cidParts(policy.cid)?.grade||"",sex:s.sex||null,
        normVer:String(batch.normVer||""),sessionId:null,val:e.value,unit:def.unit||"",src:"assessment-grid"});
    }
    return {ok:true,rows:measurements.concat(added),added:added.length};
  }
  const HE={"ag.title":"הזנת מדידות בטבלה","ag.open":"הזן מדידות בטבלה","ag.intro":"כל ערך שתזין יתווסף כניסיון חדש בתאריך שבחרת. תאים ריקים לא נשמרים; המדידות הקודמות והציונים אינם משתנים.","ag.date":"תאריך המדידה","ag.new":"מדידה חדשה","ag.best":"הטוב בתקופה","ag.student":"תלמיד","ag.save":"שמור מדידות חדשות","ag.close":"סגירה","ag.discard":"לסגור בלי לשמור את המדידות?","ag.conflict":"הנתונים השתנו. סגור ופתח מחדש לפני שמירה.","ag.invalid":"לא ניתן לשמור. בדוק את הנתונים והדרישות.","ag.identity":"זהות התלמיד אינה חד־משמעית או שהתלמיד עבר כיתה.","ag.dateError":"בחר תאריך תקין בתוך התקופה.","ag.value":"הזן תוצאה לא שלילית עם עד שתי ספרות אחרי הנקודה. חזרות במספר שלם; זמן חייב להיות גדול מאפס.","ag.exempt":"פטור — לא ניתן להזין כאן","ag.empty":"לא הוזנו מדידות חדשות.","ag.failed":"השמירה נכשלה. המדידות שהזנת נשארו בטיוטה; נסה שוב.","ag.saved":"נשמרו מדידות חדשות: {0}"};
  function open(cid,period,sid){
    const H=window.HM,ls=H.LS,t=k=>H.t("ag."+k,HE["ag."+k]),esc=v=>H.esc(String(v??""));
    const read=()=>({students:ls.get("stu.list",[]),measurements:ls.get("ft.results",[]),config:window.ASSESSMENT.read(),classes:ls.get("ft.classes",{}),norms:ls.get("ft.norms",{})});
    const initial=read(),defs=window.FT.tests().filter(d=>d.id!=="beep");
    if(!initial.config.ok){H.toast(t("invalid"));return;}
    const policy=initial.config.value.policies.find(p=>p.cid===cid&&p.period===period);
    if(!policy){H.toast(t("invalid"));return;}
    const result=window.ASSESSMENT_REPORT.snapshot(initial.students,initial.measurements,policy,defs,ls,sid);
    if(!result.ok){H.toast(t("identity"));return;}
    // Reject globally ambiguous IDs before allowing a draft, including another real class.
    if(result.reports.some(r=>initial.students.filter(s=>D.studentKey(s)===r.studentId).length!==1)){H.toast(t("identity"));return;}
    const stamp=JSON.stringify(initial),catalog=new Map(defs.map(d=>[d.id,d])),today=new Date().toISOString().slice(0,10);
    document.getElementById("ag-modal")?.remove();const el=document.createElement("div");el.id="ag-modal";el.className="modal";
    el.innerHTML=`<div class="box" style="max-width:1200px"><h3>${esc(t("title"))}</h3><p>${esc(D.classLabel(ls,cid)||cid)} · ${esc(window.I18N.term(period)||period)}</p><p class="hint">${esc(t("intro"))}</p><form id="ag-form" novalidate><div class="field" style="max-width:260px;margin-bottom:12px"><label for="ag-date">${esc(t("date"))} (${esc(policy.from)} → ${esc(policy.to)})</label><input id="ag-date" type="date" min="${policy.from}" max="${policy.to}" value="${today>=policy.from&&today<=policy.to?today:""}" required></div><div class="tblwrap" style="max-width:100%;overflow:auto"><table class="tbl" id="ag-table"><thead><tr><th>${esc(t("student"))}</th>${policy.tests.map(p=>{const d=catalog.get(p.id);return `<th>${esc(window.I18N.term(d.name)||d.name)} (${esc(window.I18N.term(d.unit)||d.unit)})<br><small>${esc(t("new"))}</small></th>`;}).join("")}</tr></thead><tbody>${result.reports.map(r=>`<tr data-sid="${esc(r.studentId)}"><td><b>${esc(r.name)}</b><br><small>[${esc(r.studentId)}]</small></td>${r.tests.map(item=>{const d=catalog.get(item.testId);return `<td><input class="gr-in" data-test="${esc(item.testId)}" type="number" min="${d.dir==="low"?"0.01":"0"}" step="${d.kind==="count"?"1":"0.01"}" inputmode="decimal" style="width:100px;min-height:44px;font-size:16px" aria-label="${esc(r.name)} [${esc(r.studentId)}] ${esc(window.I18N.term(d.name)||d.name)}" ${item.status==="exempt"?`disabled title="${esc(item.reason)}"`:""}><br><small>${esc(item.status==="exempt"?t("exempt"):t("best")+": "+(item.best?.val??"—"))}</small></td>`;}).join("")}</tr>`).join("")}</tbody></table></div><p id="ag-error" role="alert"></p><div class="row" style="flex-wrap:wrap;margin-top:12px"><button class="btn" id="ag-save" type="submit">${esc(t("save"))}</button><button class="btn ghost" id="ag-close" type="button">${esc(t("close"))}</button></div></form></div>`;
    document.body.appendChild(el);const $=q=>el.querySelector(q),inputs=[...el.querySelectorAll("[data-test]")];
    const draft=()=>JSON.stringify([$("#ag-date").value,inputs.map(i=>i.value)]),start=draft();
    function finish(){H.modal(el.id,false);el.remove();window.ASSESSMENT_REPORT.open(cid,sid,period);}
    async function close(){if(draft()===start||await H.ask({msg:t("discard"),ok:t("close")}))finish();}
    el.__onBack=close;el.onclick=e=>{if(e.target===el)close();};el.onkeydown=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close();}};$("#ag-close").onclick=close;
    $("#ag-form").onsubmit=e=>{
      e.preventDefault();const error=k=>$("#ag-error").textContent=t(k),fresh=read();
      if(JSON.stringify(fresh)!==stamp){error("conflict");return;}
      if(inputs.some(i=>!i.disabled&&i.validity.badInput)){error("value");return;}
      const entries=inputs.filter(i=>!i.disabled&&i.value.trim()!=="").map(i=>({sid:i.closest("tr").dataset.sid,test:i.dataset.test,value:Number(i.value)}));
      const next=append(fresh.students,fresh.measurements,policy,defs,ls,{date:$("#ag-date").value,entries,ids:entries.map(()=>D.uid("f")),ts:Date.now(),normVer:fresh.norms?.version});
      if(!next.ok){error(next.error==="date"?"dateError":next.error);return;}
      if(!ls.set("ft.results",next.rows)||JSON.stringify(ls.get("ft.results",null))!==JSON.stringify(next.rows)){error("failed");return;}
      finish();H.toast(t("saved").replace("{0}",next.added));
    };
    H.modal(el.id);
  }
  return {append,open};
});
