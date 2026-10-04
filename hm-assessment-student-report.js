"use strict";
// Teacher-reviewed, single-pupil output. No roster, grades or private reasons in the document.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./hm-data.js"),require("./hm-assessment-data.js"));
  else window.STUDENT_REPORT=factory(window.HMDATA,window.HMAssessment);
})(function(D,A){
  function model(snapshot,sid){
    const fail=()=>({ok:false});
    if(!snapshot?.ok||typeof sid!=="string"||!sid||!Array.isArray(snapshot.reports))return fail();
    const matches=snapshot.reports.filter(r=>r.studentId===sid),p=snapshot.policy;
    if(matches.length!==1||!p||D.isGroupId(p.cid)||!A.validDate(p.from)||!A.validDate(p.to)||p.from>p.to)return fail();
    const r=matches[0];if(!Array.isArray(r.tests)||r.cid!==p.cid||r.period!==p.period)return fail();
    const within=m=>m&&m.sid===sid&&A.validDate(m.d)&&m.d>=p.from&&m.d<=p.to&&(!m.cid||m.cid===p.cid);
    const tests=[];
    for(const item of r.tests){
      if(!["measured","missing","exempt"].includes(item.status)||!Array.isArray(item.history))return fail();
      if(item.status==="measured"&&(!within(item.best)||!D.isValidMeasurement(item.best,item.dir)))return fail();
      tests.push({id:item.testId,status:item.status,value:item.status==="measured"?item.best.val:null,date:item.status==="measured"?item.best.d:null,
        history:item.history.filter(within).map(m=>({date:m.d,value:D.isValidMeasurement(m,item.dir)?m.val:null,status:D.isValidMeasurement(m,item.dir)?"measured":"invalid"}))});
    }
    return {ok:true,value:{sid,name:String(r.name??""),cid:p.cid,period:p.period,from:p.from,to:p.to,missing:tests.filter(t=>t.status==="missing").length,
      warning:!!(r.unidentifiedRows||r.invalidDateRows||r.tests.some(t=>t.invalidCount)),tests}};
  }
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  function documentHtml(m,{lang="en",className="",periodName="",labels={},catalog=[],history=false}={}){
    if(!m?.ok)throw new Error("student-report");
    const v=m.value,rtl=lang==="he"||lang==="ar",l=k=>esc(labels[k]||k),defs=new Map(catalog.map(d=>[d.id,d]));
    const testName=id=>esc(defs.get(id)?.name||id),unit=id=>esc(defs.get(id)?.unit||"");
    const table=(head,body)=>`<table><thead><tr>${head.map(k=>`<th>${l(k)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
    const rows=v.tests.map(t=>`<tr><td>${testName(t.id)}</td><td>${l(t.status)}</td><td>${t.value===null?"—":esc(t.value)}</td><td>${unit(t.id)}</td><td><bdi>${esc(t.date||"—")}</bdi></td></tr>`).join("");
    const attempts=v.tests.flatMap(t=>t.history.map(h=>`<tr><td>${testName(t.id)}</td><td><bdi>${esc(h.date)}</bdi></td><td>${h.value===null?"—":esc(h.value)}</td><td>${unit(t.id)}</td><td>${l(h.status)}</td></tr>`)).join("");
    return `<!doctype html><html lang="${["he","en","ar","ru","es"].includes(lang)?lang:"en"}" dir="${rtl?"rtl":"ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; base-uri 'none'; form-action 'none'"><title>PE Ultimate — ${l("title")}</title><style>@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;padding:20px;font:14px Arial,Helvetica,sans-serif;line-height:1.5;color:#18212b;background:white;overflow-wrap:anywhere}h1{font-size:22px;margin:0 0 12px}h2{font-size:17px;margin:24px 0 8px}p{margin:8px 0}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:7px;border:1px solid #aeb5bf;text-align:start}th{background:#eff3f6}th:nth-child(2),td:nth-child(2),th:nth-child(4),td:nth-child(4){white-space:nowrap}thead{display:table-header-group}tr{break-inside:avoid}.note{font-size:12px;color:#455161}@media print{body{padding:0}h2{break-after:avoid}}</style></head><body data-pupil-id="${esc(v.sid)}"><h1>${l("title")}</h1><p><strong>${esc(v.name)}</strong> · ${l("sid")}: <bdi>${esc(v.sid)}</bdi></p><p>${l("class")}: ${esc(className||v.cid)} · ${l("period")}: ${esc(periodName||v.period)}</p><p><bdi>${esc(v.from)} → ${esc(v.to)}</bdi></p><p class="note">${l("basis")}</p><p>${l("summaryMissing")}: ${v.missing}</p>${v.warning?`<p class="note">${l("warning")}</p>`:""}${table(["test","status","best","unit","date"],rows)}${history?`<h2>${l("history")}</h2>${attempts?table(["test","date","value","unit","status"],attempts):`<p>${l("noHistory")}</p>`}`:""}<p class="note">PE Ultimate</p></body></html>`;
  }
  const HE={"sp.open":"דוח אישי להדפסה","sp.title":"דוח התקדמות אישי","sp.choose":"בחר תלמיד לדוח","sp.preview":"תצוגה מקדימה","sp.history":"כלול היסטוריית מדידות","sp.print":"הדפס / שמור כ־PDF","sp.html":"הורד דוח HTML","sp.close":"סגירה","sp.intro":"בחר תלמיד ובדוק את הדוח לפני שמירה או הדפסה. זהו עותק מקומי למסירה אישית; לא נשלח דבר מהאפליקציה.","sp.basis":"לפי מבחני החובה ותאריכי התקופה. הדוח מציג מדידות וחוסרים, ללא ציונים או הערות פרטיות של המורה.","sp.changed":"הנתונים השתנו או שזהות התלמיד אינה חד־משמעית. סגור ופתח מחדש את דוח התקופה.","sp.failed":"ההדפסה או ההורדה נכשלה. הנתונים לא השתנו; אפשר לנסות שוב או להוריד HTML.","sp.noHistory":"אין מדידות בתקופה.","sp.previewLabel":"תצוגה מקדימה של הדוח האישי","sp.invalid":"מדידה לא תקינה"};
  function open(snapshot,sid,className){
    const H=window.HM,ls=H.LS,t=k=>H.t("sp."+k,HE["sp."+k]),read=()=>({students:ls.get("stu.list",[]),results:ls.get("ft.results",[]),config:window.ASSESSMENT.read(),classes:ls.get("ft.classes",{})});
    const initial=read(),defs=window.FT.tests().filter(d=>d.id!=="beep"),policy=initial.config.value?.policies.find(p=>p.cid===snapshot.policy.cid&&p.period===snapshot.policy.period);
    if(!initial.config.ok||JSON.stringify(policy)!==JSON.stringify(snapshot.policy)||!Array.isArray(initial.students)){H.toast(t("changed"));return;}
    const fresh=window.ASSESSMENT_REPORT.snapshot(initial.students,initial.results,policy,defs,ls,sid);
    if(JSON.stringify(fresh)!==JSON.stringify(snapshot)){H.toast(t("changed"));return;}
    const stamp=JSON.stringify(initial),valid=selected=>JSON.stringify(read())===stamp&&initial.students.filter(s=>D.studentKey(s)===selected).length===1;
    document.getElementById("sp-modal")?.remove();const el=window.document.createElement("div");el.id="sp-modal";el.className="modal";
    el.innerHTML=`<div class="box" style="max-width:1000px"><h3>${esc(t("title"))}</h3><p class="hint">${esc(t("intro"))}</p><div class="field"><label for="sp-pupil">${esc(t("choose"))}</label><select id="sp-pupil"><option value="">${esc(t("choose"))}</option>${snapshot.reports.map(r=>`<option value="${esc(r.studentId)}">${esc(r.name)} [${esc(r.studentId)}]</option>`).join("")}</select></div><label style="display:flex;gap:8px;margin:12px 0"><input type="checkbox" id="sp-history">${esc(t("history"))}</label><iframe id="sp-preview" title="${esc(t("previewLabel"))}" sandbox="allow-same-origin allow-modals" style="display:none;width:100%;height:460px;border:1px solid #aaa;background:white"></iframe><p id="sp-error" role="alert"></p><div class="row" style="flex-wrap:wrap"><button class="btn" id="sp-print" disabled>${esc(t("print"))}</button><button class="btn ghost" id="sp-html" disabled>${esc(t("html"))}</button><button class="btn ghost" id="sp-close">${esc(t("close"))}</button></div></div>`;
    window.document.body.appendChild(el);const $=q=>el.querySelector(q);let html="",selected="",ready=false,generation=0;
    const fail=()=>{$("#sp-error").textContent=t("changed");html="";ready=false;$("#sp-print").disabled=true;$("#sp-html").disabled=true;$("#sp-preview").style.display="none";$("#sp-preview").srcdoc="";};
    function render(){
      const ticket=++generation;selected=$("#sp-pupil").value;ready=false;$("#sp-print").disabled=true;$("#sp-html").disabled=true;$("#sp-error").textContent="";
      if(!selected){html="";$("#sp-preview").style.display="none";$("#sp-preview").srcdoc="";return;}
      if(!valid(selected)){fail();return;}const m=model(snapshot,selected);if(!m.ok){fail();return;}
      const fallback={sid:"מזהה תלמיד",class:"כיתה",period:"תקופה",missing:"מבחנים חסרים",test:"מבחן",status:"מצב",best:"התוצאה הטובה בתקופה",unit:"יחידה",date:"תאריך התוצאה",value:"תוצאה",measured:"נמדד",missingStatus:"חסר",exempt:"פטור",warning:"קיימות מדידות שלא נכללו בדוח; יש לבדוק את הרשומות המקוריות."};
      const labels={title:t("title"),basis:t("basis"),history:H.t("ar.history","היסטוריית מדידות בתקופה"),noHistory:t("noHistory"),invalid:t("invalid")};
      for(const k of Object.keys(fallback))labels[k]=H.t("ar."+(k==="missing"?"missingCount":k==="missingStatus"?"missing":k),fallback[k]);
      labels.missingCount=labels.missing;labels.missing=labels.missingStatus;
      // Document summary and cell status use separate labels.
      labels.summaryMissing=labels.missingCount;
      html=documentHtml(m,{lang:window.I18N.lang(),className,periodName:window.I18N.term(policy.period)||policy.period,labels,catalog:defs.map(d=>({...d,name:window.I18N.term(d.name)||d.name,unit:window.I18N.term(d.unit)||d.unit})),history:$("#sp-history").checked});
      const frame=$("#sp-preview");frame.onload=()=>{if(ticket!==generation||!html||frame.contentDocument?.body?.dataset.pupilId!==selected)return;ready=true;$("#sp-print").disabled=false;$("#sp-html").disabled=false;};frame.style.display="block";frame.srcdoc=html;
    }
    $("#sp-pupil").onchange=render;$("#sp-history").onchange=render;
    $("#sp-print").onclick=()=>{if(!html||!ready)return;if(!valid(selected)){fail();return;}try{$("#sp-preview").contentWindow.focus();$("#sp-preview").contentWindow.print();}catch(e){$("#sp-error").textContent=t("failed");}};
    $("#sp-html").onclick=()=>{if(!html||!ready)return;if(!valid(selected)){fail();return;}try{const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),a=window.document.createElement("a");a.href=url;a.download="PE-Ultimate-pupil-progress.html";a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);}catch(e){$("#sp-error").textContent=t("failed");}};
    const close=()=>{generation++;H.modal(el.id,false);el.remove();};el.__onBack=close;el.onclick=e=>{if(e.target===el)close();};$("#sp-close").onclick=close;el.onkeydown=e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();close();}};
    if(sid)$("#sp-pupil").value=sid;render();H.modal(el.id);
  }
  return {model,documentHtml,open};
});
