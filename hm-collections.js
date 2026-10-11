"use strict";
/* ============================================================
   אוספים אישיים (#21 סעיף 3)
   ------------------------------------------------------------
   אוסף = שם שהמורה בחר + הפניות למשחקים, למערכים שלו או למערכים מהבנק. האוסף לא
   מעתיק ולא משנה את הפריט; הוא נשמר במפתח col.list (נכלל בגיבוי) והלוגיקה הטהורה
   שלו ב-hm-data.js (colAdd/colToggle/…). שום דבר כאן לא נוצר או משתנה אוטומטית.
   המודול נותן שלושה דברים: בוחר («הוסף לאוסף») לכל פריט, מנהל האוספים במסך המערכים,
   ואירוע col:change כדי שדף המשחקים ירענן את הסינון לפי אוסף.
   ============================================================ */
(function(){
  const H=()=>window.HM, D=()=>window.HMDATA, KEY="col.list";
  const resolvers={};
  let ctx=null, open={}, armed=null, renaming=null;

  const get=()=>D().normCollections(H().LS.get(KEY,[]));
  const labels={
    "col.kindG":"משחק", "col.kindP":"מערך שלי", "col.kindB":"מערך מהבנק",
    "col.countWord":"אוספים", "col.managerEmpty":"עוד אין אוספים. הוסיפו משחק או מערך לאוסף מכפתור 🗂, וכאן תראו ותנהלו אותם.",
    "col.rename":"שנה שם", "col.save":"שמור", "col.cancel":"ביטול", "col.sure":"בטוח?",
    "col.empty":"האוסף ריק", "col.unavail":"לא זמין (נמחק)", "col.open":"פתח", "col.remove":"הסר מהאוסף",
    "col.pickTitle":"הוספה לאוסף", "col.newPh":"שם לאוסף חדש", "col.create":"צור והוסף",
    "col.none":"עוד אין אוספים — צרו אחד למטה.",
    "col.hint":"אוסף הוא קיבוץ משלך של משחקים ומערכים (למשל «שבוע הכדורשת»). הוא שומר רק הפניות — לא משנה ולא מעתיק את הפריטים, ונכלל בגיבוי."
  };
  const T=(k,d)=>H().t(k,d===undefined?labels[k]:d);
  function changed(){ document.dispatchEvent(new CustomEvent("col:change")); paintManager(); if(ctx)paintPicker(); }
  function failMsg(res){
    const r=res&&res.reason;
    H().toast(r==="dup"?T("col.dup","כבר יש אוסף בשם הזה")
      :r==="limit"?(res.kind==="cols"?T("col.limitCols","אפשר עד 20 אוספים"):T("col.limitItems","אוסף יכול להכיל עד 100 פריטים"))
      :r==="empty"?T("col.needName","כתבו שם לאוסף")
      :r==="missing"?T("col.gone","האוסף כבר לא קיים")
      :T("col.saveFail","⚠ השמירה נכשלה"));
  }
  function commit(res){
    if(!res.ok){ failMsg(res); return false; }
    if(!H().LS.set(KEY,res.list)){ failMsg({reason:"write"}); return false; }
    return true;
  }

  /* ---------- בוחר: «הוסף לאוסף» ---------- */
  function paintPicker(){
    const {$, esc}=H(), box=$("#col-pickBody"); if(!box||!ctx)return;
    const list=get(), inIds=D().colsOf(list,ctx.item);
    box.innerHTML=(list.length?`<div class="col-pick">${list.map(c=>
        `<label class="col-row"><input type="checkbox" data-pc="${esc(c.id)}"${inIds.indexOf(c.id)>=0?" checked":""}> <span>${esc(c.name)}</span> <span class="hint">${c.items.length}</span></label>`).join("")}</div>`
      :`<div class="hint">${esc(T("col.none","עוד אין אוספים — צרו אחד למטה."))}</div>`)
      +`<div class="row col-new"><input id="col-newIn" type="text" maxlength="${D().COL_NAME}" autocomplete="off" placeholder="${esc(T("col.newPh","שם לאוסף חדש"))}" aria-label="${esc(T("col.newPh","שם לאוסף חדש"))}">
        <button type="button" class="btn sm acc" id="col-newBtn">${esc(T("col.create","צור והוסף"))}</button></div>
        <div class="hint">${esc(T("col.hint","אוסף הוא קיבוץ משלך של משחקים ומערכים (למשל «שבוע הכדורשת»). הוא שומר רק הפניות — לא משנה ולא מעתיק את הפריטים, ונכלל בגיבוי."))}</div>`;
    box.querySelectorAll("[data-pc]").forEach(cb=>cb.addEventListener("change",()=>{
      const res=D().colToggle(get(),cb.dataset.pc,ctx.item);
      if(!commit(res)){ cb.checked=!cb.checked; return; }
      H().toast(res.has?T("col.added","נוסף לאוסף"):T("col.removed","הוסר מהאוסף")); changed();
    }));
    const add=()=>{
      const inp=$("#col-newIn"), made=D().colAdd(get(),inp.value,{today:new Date().toISOString().slice(0,10)});
      if(!made.ok){ failMsg(made.reason==="limit"?Object.assign({kind:"cols"},made):made); return; }
      const res=D().colToggle(made.list,made.id,ctx.item);
      if(!commit(res))return;
      inp.value=""; H().toast(T("col.created","האוסף נוצר והפריט נוסף")); changed();
    };
    $("#col-newBtn").addEventListener("click",add);
    $("#col-newIn").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } });
  }
  function pick(item,label){
    if(!item||!item.k||!item.id)return;
    ctx={item:{k:item.k,id:String(item.id)},label:label||""};
    const t=H().$("#col-pickTitle"); if(t)t.textContent=T("col.pickTitle","הוספה לאוסף")+(label?" · "+label:"");
    paintPicker(); H().modal("col-modal");
  }

  /* ---------- מנהל האוספים (מסך המערכים) ---------- */
  function register(kind,r){ resolvers[kind]=r; }
  const kindName=k=>k==="g"?T("col.kindG","משחק"):k==="p"?T("col.kindP","מערך שלי"):T("col.kindB","מערך מהבנק");
  function titleOf(it){
    const r=resolvers[it.k]; let t=null;
    try{ t=r&&r.title?r.title(it.id):null; }catch(e){ t=null; }
    return t;
  }
  function paintManager(){
    const {$, esc}=H(), box=$("#ls-colList"); if(!box)return;
    const list=get();
    const cnt=$("#ls-colCount"); if(cnt)cnt.textContent=list.length?list.length+" "+T("col.countWord","אוספים"):"";
    box.innerHTML=list.length?list.map(c=>{
      const isOpen=!!open[c.id], ren=renaming===c.id;
      const items=isOpen?`<ul class="col-items">${c.items.map(it=>{ const t=titleOf(it);
          return `<li><span class="pill">${esc(kindName(it.k))}</span> <span class="col-t">${t?esc(t):`<span class="hint">${esc(T("col.unavail","לא זמין (נמחק)"))}</span>`}</span>
            ${t?`<button type="button" class="btn sm ghost" data-copen="${esc(it.k)}|${esc(it.id)}">${esc(T("col.open","פתח"))}</button>`:""}
            <button type="button" class="btn sm ghost" data-crm="${esc(it.k)}|${esc(it.id)}" aria-label="${esc(T("col.remove","הסר מהאוסף"))}">✕</button></li>`; }).join("")||`<li class="hint">${esc(T("col.empty","האוסף ריק"))}</li>`}</ul>`:"";
      const acts=ren?`<button type="button" class="btn sm acc" data-cok>${esc(T("col.save","שמור"))}</button><button type="button" class="btn sm ghost" data-ccancel>${esc(T("col.cancel","ביטול"))}</button>`
        :`<button type="button" class="btn sm" data-ctoggle aria-expanded="${isOpen}">${isOpen?"▴":"▾"}</button>
           <button type="button" class="btn sm ghost" data-cren title="${esc(T("col.rename","שנה שם"))}" aria-label="${esc(T("col.rename","שנה שם"))}">✎</button>
           <button type="button" class="btn sm stop" data-cdel>${armed===c.id?esc(T("col.sure","בטוח?")):"✕"}</button>`;
      return `<div class="arc-item col-item" data-col="${esc(c.id)}"><div class="col-hd"><div class="ttl">${ren?`<input type="text" data-cn maxlength="${D().COL_NAME}" value="${esc(c.name)}" aria-label="${esc(T("col.rename","שנה שם"))}">`:`🗂 ${esc(c.name)}`} <span class="pill">${c.items.length}</span></div>${acts}</div>${items}</div>`; }).join(""):`<div class="hint">${esc(T("col.managerEmpty","עוד אין אוספים. הוסיפו משחק או מערך לאוסף מכפתור 🗂, וכאן תראו ותנהלו אותם."))}</div>`;
  }
  function onManagerClick(e){
    const row=e.target.closest("[data-col]"); if(!row)return;
    const id=row.dataset.col;
    if(e.target.closest("[data-ctoggle]")){ open[id]=!open[id]; paintManager(); return; }
    if(e.target.closest("[data-cren]")){ renaming=id; paintManager(); const i=row.querySelector("[data-cn]"); const n=H().$("#ls-colList [data-cn]"); if(n)n.focus(); return; }
    if(e.target.closest("[data-ccancel]")){ renaming=null; paintManager(); return; }
    if(e.target.closest("[data-cok]")){
      const v=H().$("#ls-colList [data-cn]").value, res=D().colRename(get(),id,v);
      if(commit(res)){ renaming=null; changed(); } return;
    }
    if(e.target.closest("[data-cdel]")){
      /* שתי לחיצות: הראשונה מבקשת אישור, השנייה מוחקת את האוסף בלבד — הפריטים נשארים */
      if(armed!==id){ armed=id; paintManager(); setTimeout(()=>{ if(armed===id){ armed=null; paintManager(); } },4000); return; }
      armed=null; const res=D().colDelete(get(),id); if(commit(res))changed(); return;
    }
    const rm=e.target.closest("[data-crm]");
    if(rm){ const [k,...r]=rm.dataset.crm.split("|"); const res=D().colToggle(get(),id,{k,id:r.join("|")}); if(commit(res))changed(); return; }
    const op=e.target.closest("[data-copen]");
    if(op){ const [k,...r]=op.dataset.copen.split("|"), rs=resolvers[k]; if(rs&&rs.open)rs.open(r.join("|")); }
  }
  function init(){
    const box=document.getElementById("ls-colList");
    if(box&&!box.dataset.wired){ box.dataset.wired="1"; box.addEventListener("click",onManagerClick);
      box.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.matches("[data-cn]")){ e.preventDefault(); const b=box.querySelector("[data-cok]"); if(b)b.click(); } }); }
    paintManager();
  }
  // Update existing nodes: language changes must not discard input drafts,
  // selection/focus, expanded rows or the picker's current item reference.
  function repaintLanguage(){
    const {$}=H(), list=get(), box=$("#ls-colList");
    const text=(root,selector,key)=>{ const el=root&&root.querySelector(selector); if(el)el.textContent=T(key); };
    const renameLabel=el=>{ if(el)el.setAttribute("aria-label",T("col.rename")); };
    if(box){
      const cnt=$("#ls-colCount"); if(cnt)cnt.textContent=list.length?list.length+" "+T("col.countWord"):"";
      if(!list.length)text(box,".hint","col.managerEmpty");
      box.querySelectorAll("[data-col]").forEach(row=>{
        const c=list.find(c=>c.id===row.dataset.col); if(!c)return;
        renameLabel(row.querySelector("[data-cn]"));
        const ren=row.querySelector("[data-cren]"); renameLabel(ren); if(ren)ren.title=T("col.rename");
        text(row,"[data-cok]","col.save"); text(row,"[data-ccancel]","col.cancel");
        if(armed===c.id)text(row,"[data-cdel]","col.sure");
        if(!c.items.length)text(row,".col-items .hint","col.empty");
        row.querySelectorAll(".col-items li").forEach((li,i)=>{
          const it=c.items[i]; if(!it)return;
          const pill=li.querySelector(".pill"); if(pill)pill.textContent=kindName(it.k);
          const title=li.querySelector(".col-t"), value=titleOf(it);
          if(title){ if(value)title.textContent=value; else text(title,".hint","col.unavail"); }
          text(li,"[data-copen]","col.open");
          const rm=li.querySelector("[data-crm]"); if(rm)rm.setAttribute("aria-label",T("col.remove"));
        });
      });
    }
    if(ctx){
      const title=$("#col-pickTitle"); if(title)title.textContent=T("col.pickTitle")+(ctx.label?" · "+ctx.label:"");
      const body=$("#col-pickBody"), input=$("#col-newIn");
      if(input){ input.placeholder=T("col.newPh"); input.setAttribute("aria-label",T("col.newPh")); }
      text(body,"#col-newBtn","col.create");
      if(body){
        const hints=body.querySelectorAll(":scope > .hint");
        if(!list.length&&hints.length)hints[0].textContent=T("col.none");
        if(hints.length)hints[hints.length-1].textContent=T("col.hint");
      }
    }
  }
  document.addEventListener("i18n:change",repaintLanguage);
  window.COLLECTIONS={pick,register,init,paint:paintManager,list:get};
})();
