"use strict";
// Pure assessment calculations and configuration validation. Load after hm-data.js.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory(require("./hm-data.js"));
  else if(typeof window!=="undefined")window.HMAssessment=factory(window.HMDATA);
})(function(D){
  const finite=n=>typeof n==="number"&&Number.isFinite(n);
  const text=s=>typeof s==="string"&&s.trim().length>0;
  function date(s){
    if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
    const d=new Date(s+"T00:00:00Z");
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;
  }
  function ruleErrors(rule){
    if(!rule||typeof rule!=="object"||Array.isArray(rule))return ["rule-object"];
    const errors=[];
    if(!finite(rule.target)||rule.target<0)errors.push("rule-target");
    if(!finite(rule.step)||rule.step<=0)errors.push("rule-step");
    if(!finite(rule.points)||rule.points<=0)errors.push("rule-points");
    if(!["floor","ceil","linear"].includes(rule.rounding))errors.push("rule-rounding");
    if(!finite(rule.min)||!finite(rule.max)||rule.min<0||rule.max>100||rule.min>rule.max)errors.push("rule-bounds");
    return errors;
  }
  function validatePolicy(policy,defs,store){
    const errors=[];
    if(!policy||typeof policy!=="object"||Array.isArray(policy))return {ok:false,errors:["policy-object"]};
    // Requirements belong to a real class; combined views resolve each member's policy.
    const registered=store&&D.classOf(store,policy.cid);
    const canonical=D.cidParts(policy.cid)||
      (typeof policy.cid==="string"&&policy.cid.startsWith("cn:")&&D.classId(policy.cid.slice(3))===policy.cid);
    if(!D.isCid(policy.cid)||D.isGroupId(policy.cid)||D.isGroupRec(registered)||!(registered||canonical))errors.push("class-id");
    if(!text(policy.period)||policy.period.length>80)errors.push("period");
    if(!date(policy.from))errors.push("from-date");
    if(!date(policy.to))errors.push("to-date");
    if(date(policy.from)&&date(policy.to)&&policy.from>policy.to)errors.push("date-order");
    const catalog=new Map((defs||[]).filter(t=>t&&text(t.id)).map(t=>[t.id,t]));
    const seen=new Set();
    if(!Array.isArray(policy.tests)||!policy.tests.length)errors.push("required-tests");
    else policy.tests.forEach((entry,i)=>{
      const prefix="tests["+i+"].", def=entry&&catalog.get(entry.id);
      if(!def)errors.push(prefix+"unknown-test");
      else if(!["high","low"].includes(def.dir))errors.push(prefix+"direction");
      if(entry&&seen.has(entry.id))errors.push(prefix+"duplicate-test");
      if(entry)seen.add(entry.id);
      if(entry&&entry.rule!=null){
        ruleErrors(entry.rule).forEach(e=>errors.push(prefix+e));
        if(def&&def.dir==="low"&&entry.rule.target===0)errors.push(prefix+"rule-target");
      }
    });
    if(policy.exemptions!=null&&!Array.isArray(policy.exemptions))errors.push("exemptions");
    else {
      const exemptions=new Set();
      (policy.exemptions||[]).forEach((e,i)=>{
        const prefix="exemptions["+i+"].";
        if(!e||!text(e.sid))errors.push(prefix+"student-id");
        if(!e||!seen.has(e.test))errors.push(prefix+"required-test");
        if(!e||!text(e.reason)||e.reason.length>500)errors.push(prefix+"reason");
        if(e){
          const key=JSON.stringify([e.sid,e.test]);
          if(exemptions.has(key))errors.push(prefix+"duplicate");
          exemptions.add(key);
        }
      });
    }
    return {ok:!errors.length,errors};
  }
  // A target earns max; only a shortfall incurs points. Rounding is explicit.
  function score(value,dir,rule){
    if(!["high","low"].includes(dir)||!D.isValidMeasurement({val:value},dir)||ruleErrors(rule).length||
      (dir==="low"&&rule.target===0))return null;
    const deficit=Math.max(0,dir==="low"?value-rule.target:rule.target-value);
    let blocks=deficit/rule.step;
    // Decimal inputs such as 10.3 - 10 must not turn exactly 3 blocks into 4.
    const near=Math.round(blocks);
    if(Math.abs(blocks-near)<=Number.EPSILON*32*Math.max(1,Math.abs(blocks)))blocks=near;
    if(rule.rounding==="floor")blocks=Math.floor(blocks);
    if(rule.rounding==="ceil")blocks=Math.ceil(blocks);
    const rounded=Math.round(Math.max(rule.min,Math.min(rule.max,rule.max-blocks*rule.points))*100)/100;
    return Math.max(rule.min,Math.min(rule.max,rounded));
  }
  function studentAssessment(rows,student,policy,defs,store){
    const check=validatePolicy(policy,defs,store), sid=D.studentKey(student);
    if(!text(sid))check.errors.push("student-id");
    if(check.ok&&D.cidOfStudent(student,store)!==policy.cid)check.errors.push("student-class");
    if(check.errors.length)return {ok:false,errors:check.errors};
    const catalog=new Map(defs.filter(t=>t&&text(t.id)).map(t=>[t.id,t]));
    const scope=(rows||[]).filter(r=>r&&D.rowInClass(r,policy.cid)&&date(r.d)&&r.d>=policy.from&&r.d<=policy.to);
    // No name-only attribution in a new assessment. Legacy records remain untouched.
    const identifiable=scope.filter(r=>text(r.sid));
    const tests=policy.tests.map(entry=>{
      const def=catalog.get(entry.id);
      const exempt=(policy.exemptions||[]).find(e=>e.sid===sid&&e.test===entry.id);
      const p=D.progress(identifiable,student,entry.id,def.dir,{cid:policy.cid});
      return {
        testId:entry.id,dir:def.dir,status:exempt?"exempt":p.best?"measured":"missing",
        reason:exempt?exempt.reason:p.best?null:p.invalid?"invalid-results":"no-result-in-period",
        history:D.measurementsOf(identifiable,student,entry.id,{cid:policy.cid}),
        validCount:p.count,invalidCount:p.invalid,best:p.best,latest:p.latest,
        suggestedScore:!exempt&&p.best&&entry.rule?score(p.best.val,def.dir,entry.rule):null
      };
    });
    const missing=tests.filter(t=>t.status==="missing").map(t=>t.testId);
    return {ok:true,errors:[],studentId:sid,cid:policy.cid,period:policy.period,
      from:policy.from,to:policy.to,tests,missing,
      exempt:tests.filter(t=>t.status==="exempt").map(t=>t.testId),
      complete:missing.length===0,
      // Configuration/measurement issues must be visible, never counted as zero.
      unidentifiedRows:scope.filter(r=>!text(r.sid)&&policy.tests.some(t=>t.id===r.test)).length,
      invalidDateRows:(rows||[]).filter(r=>r&&r.sid===sid&&D.rowInClass(r,policy.cid)&&!date(r.d)&&policy.tests.some(t=>t.id===r.test)).length};
  }
  function validateEnvelope(value,defs,store){
    if(!value||value.version!==1||!Array.isArray(value.policies))return {ok:false,errors:["configuration-version"]};
    const errors=[],seen=new Set();
    value.policies.forEach((p,i)=>{
      validatePolicy(p,defs,store).errors.forEach(e=>errors.push(i+":"+e));
      if(p){const key=JSON.stringify([p.cid,p.period]);if(seen.has(key))errors.push(i+":duplicate-policy");seen.add(key);}
    });
    return {ok:!errors.length,errors};
  }
  function updateEnvelope(value,policy,defs,store){
    const check=validateEnvelope(value,defs,store);
    if(!check.ok)return check;
    const valid=validatePolicy(policy,defs,store);if(!valid.ok)return valid;
    const next={version:1,policies:value.policies.filter(p=>p.cid!==policy.cid||p.period!==policy.period).concat([policy])};
    return {ok:true,errors:[],value:next};
  }
  return {validDate:date,validatePolicy,score,studentAssessment,validateEnvelope,updateEnvelope};
});
