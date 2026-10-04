"use strict";
// Period reports are snapshots for the teacher. They never write pupil grades.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./hm-data.js"),require("./hm-assessment-data.js"));
  else window.ASSESSMENT_REPORT=factory(window.HMDATA,window.HMAssessment);
})(function(D,A){
  function snapshot(students,measurements,policy,defs,store,sid){
    if(!Array.isArray(students)||!Array.isArray(measurements))return {ok:false,errors:["report-data"]};
    const check=A.validatePolicy(policy,defs,store);if(!check.ok)return check;
    let pupils=students.filter(s=>D.cidOfStudent(s,store)===policy.cid);
    if(sid)pupils=pupils.filter(s=>D.studentKey(s)===sid);
    const seen=new Set(),reports=[];
    for(const s of pupils){
      const id=D.studentKey(s);if(!id||seen.has(id))return {ok:false,errors:["student-identity"]};seen.add(id);
      const report=A.studentAssessment(measurements,s,policy,defs,store);
      if(!report.ok)return report;
      reports.push({...report,name:s.name||""});
    }
    if(sid&&!reports.length)return {ok:false,errors:["student-not-in-class"]};
    return {ok:true,policy,reports};
  }
  const HE={"ar.editRequirements":"ערוך דרישות ופטורים", "ar.title":"דוח הערכה לפי תקופה","ar.close":"סגירה","ar.class":"כיתה","ar.period":"תקופה","ar.intro":"לפי מבחני החובה והתאריכים שנשמרו. הצעות הניקוד אינן ציונים סופיים ואינן משנות ציונים ידניים.","ar.noPolicy":"לא הוגדרו מבחני חובה לכיתה ולתקופה האלה. הגדר דרישות כדי להפיק דוח.","ar.configure":"הגדר דרישות","ar.error":"לא ניתן להפיק דוח תקין. בדוק את הדרישות וזהויות התלמידים.","ar.empty":"אין תלמידים בכיתה.","ar.student":"תלמיד","ar.sid":"מזהה תלמיד","ar.cid":"מזהה כיתה","ar.from":"מתאריך","ar.to":"עד תאריך","ar.test":"מבחן","ar.testId":"מזהה מבחן","ar.unit":"יחידה","ar.status":"מצב","ar.reason":"סיבה","ar.best":"התוצאה הטובה בתקופה","ar.date":"תאריך התוצאה","ar.count":"מדידות תקינות","ar.invalid":"מדידות לא תקינות","ar.reportDetails":"כל פרטי הדוח", "ar.rule":"כלל הניקוד", "ar.score":"הצעת ניקוד בלבד","ar.measured":"נמדד","ar.missing":"חסר","ar.exempt":"פטור","ar.noResult":"אין תוצאה בתקופה","ar.invalidResults":"רק תוצאות לא תקינות","ar.history":"היסטוריית מדידות בתקופה","ar.details":"הצג היסטוריה","ar.value":"תוצאה","ar.missingCount":"מבחנים חסרים","ar.complete":"הושלמו הדרישות","ar.incomplete":"טרם הושלמו הדרישות","ar.warning":"קיימות מדידות שלא נכללו: ללא מזהה תלמיד, עם תאריך לא תקין או עם תוצאה לא תקינה. בדוק את הרשומות המקוריות.","ar.exportFailed":"הייצוא נכשל. הנתונים לא השתנו; נסה שוב.","ar.xlsx":"ייצוא Excel (.xlsx)","ar.csv":"ייצוא CSV","ar.historyCsv":"היסטוריה CSV"};
  function open(cid,sid,period){
    const H=window.HM,t=k=>H.t("ar."+k,HE["ar."+k]),esc=s=>H.esc(String(s??""));
    const pupils=H.LS.get("stu.list",[]),defs=window.FT.tests().filter(d=>d.id!=="beep"),catalog=new Map(defs.map(d=>[d.id,d]));
    if(!Array.isArray(pupils)){H.toast(t("error"));return;}
    if(sid){const s=pupils.find(s=>D.studentKey(s)===sid);cid=s&&D.cidOfStudent(s,H.LS);}
    let classes=Object.values(D.realClasses(H.LS));
    for(const s of pupils){const id=D.cidOfStudent(s,H.LS);if(id&&!D.isGroupId(id)&&!classes.some(c=>c.id===id))classes.push({id,name:s.cls||id});}
    if(sid)classes=classes.filter(c=>c.id===cid);
    if(!classes.length){H.toast(t("error"));return;}
    if(!classes.some(c=>c.id===cid))cid=classes[0].id;
    let periods=H.LS.get("grades.periods",[]);if(!Array.isArray(periods)||!periods.length)periods=["רבעון 1"];
    if(!periods.includes(period))period=periods[0];
    document.getElementById("ar-modal")?.remove();
    const el=document.createElement("div");el.id="ar-modal";el.className="modal";
    el.innerHTML=`<div class="box" style="max-width:1200px"><h3>${esc(t("title"))}<button class="x" id="ar-close" aria-label="${esc(t("close"))}">✕</button></h3><p class="hint">${esc(t("intro"))}</p>
      <div class="row" style="flex-wrap:wrap"><label style="display:flex;gap:6px;align-items:center">${esc(t("class"))}<select id="ar-class">${classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</select></label>
      <label style="display:flex;gap:6px;align-items:center">${esc(t("period"))}<select id="ar-period">${periods.map(p=>`<option value="${esc(p)}">${esc(window.I18N.term(p)||p)}</option>`).join("")}</select></label></div><div id="ar-content"></div></div>`;
    document.body.appendChild(el);const $=s=>el.querySelector(s);$("#ar-class").value=cid;$("#ar-period").value=period;
    const labelName=d=>window.I18N.term(d.name)||d.name;
    const columns=["student","sid","class","cid","period","from","to","test","testId","unit","status","reason","best","date","count","invalid","score","rule"];
    let rows=[],history=[],current=null;
    const prefix=(r,policy)=>[r.name,r.studentId,classes.find(c=>c.id===policy.cid)?.name||policy.cid,policy.cid,window.I18N.term(policy.period)||policy.period,policy.from,policy.to];
    function render(){
      rows=[];history=[];current=null;
      const config=window.ASSESSMENT.read(),c=$("#ar-class").value,p=$("#ar-period").value;
      if(!config.ok){$("#ar-content").innerHTML=`<p role="alert">${esc(t("error"))}</p>`;return;}
      const policy=config.value.policies.find(v=>v.cid===c&&v.period===p);
      if(!policy){$("#ar-content").innerHTML=`<p id="ar-noPolicy">${esc(t("noPolicy"))}</p><button class="btn" id="ar-configure">${esc(t("configure"))}</button>`;$("#ar-configure").onclick=()=>{H.modal("ar-modal",false);window.ASSESSMENT.open(c,p);};return;}
      const result=snapshot(H.LS.get("stu.list",[]),H.LS.get("ft.results",[]),policy,defs,H.LS,sid);
      if(!result.ok){$("#ar-content").innerHTML=`<p role="alert">${esc(t("error"))}</p>`;return;}
      current=result;
      rows=[columns.map(t)];history=[[...columns.slice(0,10),"date","value","status"].map(t)];
      for(const r of result.reports)for(const item of r.tests){
        const d=catalog.get(item.testId),reason=item.reason==="no-result-in-period"?t("noResult"):item.reason==="invalid-results"?t("invalidResults"):item.reason||"";
        rows.push([...prefix(r,policy),labelName(d),item.testId,window.I18N.term(d.unit)||d.unit||"",t(item.status),reason,item.status==="measured"?item.best.val:null,item.status==="measured"?item.best.d:null,item.validCount,item.invalidCount,item.suggestedScore,(()=>{const rule=policy.tests.find(v=>v.id===item.testId).rule;if(!rule)return "";const names={target:"יעד",step:"גודל מדרגה בתוצאה",points:"נקודות לכל מדרגה",min:"ציון מזערי",max:"ציון מרבי",rounding:"עיגול הפער מהיעד",ceil:"כל מדרגה שהתחילה",floor:"מדרגות שלמות בלבד",linear:"חלקי מדרגות"};return ["target","step","points","rounding","min","max"].map(k=>H.t("as."+k,names[k])+": "+(k==="rounding"?H.t("as."+rule[k],names[rule[k]]):rule[k])).join("; ");})()]);
        for(const m of item.history){const valid=D.isValidMeasurement(m,item.dir);history.push([...prefix(r,policy),labelName(d),item.testId,window.I18N.term(d.unit)||d.unit||"",m.d,valid?m.val:null,valid?t("measured"):t("invalid")]);}
      }
      const table=(data,id)=>`<div class="tblwrap" style="max-width:100%;overflow:auto"><table class="tbl" id="${id}" style="white-space:nowrap"><thead><tr>${data[0].map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${data.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      const warnings=result.reports.some(r=>r.unidentifiedRows||r.invalidDateRows||r.tests.some(v=>v.invalidCount));
      $("#ar-content").innerHTML=`<p id="ar-range" dir="ltr">${esc(policy.from)} → ${esc(policy.to)}</p>
        ${warnings?`<p role="status" class="bw-warn">${esc(t("warning"))}</p>`:""}
        ${!result.reports.length?`<p>${esc(t("empty"))}</p>`:`<div id="ar-summary">${result.reports.map(r=>`<p><b>${esc(r.name)}</b> · ${esc(t("missingCount"))}: ${r.missing.length} · ${esc(t(r.complete?"complete":"incomplete"))}</p>`).join("")}</div>`}
        <div class="row" style="flex-wrap:wrap;margin-bottom:12px"><button class="btn ghost" id="ar-grid">${esc(H.t("ag.open","הזן מדידות בטבלה"))}</button><button class="btn ghost" id="ar-editRequirements">${esc(t("editRequirements"))}</button><button class="btn" id="ar-xlsx">${esc(t("xlsx"))}</button><button class="btn ghost" id="ar-csv">${esc(t("csv"))}</button><button class="btn ghost" id="ar-historyCsv">${esc(t("historyCsv"))}</button></div>
        ${table(rows.map(r=>[0,7,10,12,16].map(i=>r[i])),"ar-quick")}<details style="margin-top:12px"><summary>${esc(t("reportDetails"))}</summary>${table(rows,"ar-table")}</details><details style="margin-top:12px"><summary>${esc(t("details"))}</summary>${table(history,"ar-history")}</details><p id="ar-error" role="alert"></p>`;
      $("#ar-grid").onclick=()=>{H.modal("ar-modal",false);window.ASSESSMENT_GRID.open(c,p,sid);};
      $("#ar-editRequirements").onclick=()=>{H.modal("ar-modal",false);window.ASSESSMENT.open(c,p,sid);};
      $("#ar-xlsx").onclick=()=>download("xlsx");$("#ar-csv").onclick=()=>download("csv");$("#ar-historyCsv").onclick=()=>download("history");
    }
    function download(type){
      if(!current)return;
      // Export exactly this visible snapshot, with stable IDs and explicit period dates.
      try{
        const lang=window.I18N.lang(),rtl=lang==="he"||lang==="ar";
        const data=type==="xlsx"?window.HMXlsx.workbook([{name:"Assessment",rows},{name:"History",rows:history}],{rtl}):window.HMXlsx.csv(type==="history"?history:rows);
        const blob=new Blob([data],{type:type==="xlsx"?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"text/csv;charset=utf-8"});
        const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download="PE-Ultimate-assessment"+(sid?"-student":"-class")+(type==="history"?"-history":"")+"."+(type==="xlsx"?"xlsx":"csv");a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);
      }catch(e){$("#ar-error").textContent=t("exportFailed");}
    }
    $("#ar-class").onchange=render;$("#ar-period").onchange=render;
    $("#ar-close").onclick=()=>H.modal("ar-modal",false);render();H.modal("ar-modal");
  }
  if(typeof document!=="undefined")document.addEventListener("click",e=>{
    const b=e.target.closest("[data-assessment-report]");if(!b)return;
    open(b.dataset.cid,b.dataset.sid,document.getElementById("gr-period")?.value);
  });
  return {snapshot,open};
});
