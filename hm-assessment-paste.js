"use strict";
// Spreadsheet paste is validated before it reaches the measurement draft.
(function(factory){
  if(typeof module==="object"&&module.exports)module.exports=factory();
  else window.ASSESSMENT_PASTE=factory();
})(function(){
  function template(reports,tests){
    return [["sid","name",...tests],...reports.map(r=>[r.studentId,r.name,...tests.map(()=>"")])];
  }
  function cells(text){
    if(typeof text!=="string"||text.length>1048576)return {ok:false,error:"size"};
    text=text.replace(/^\uFEFF/,"").replace(/\r\n?/g,"\n");
    const rows=[],row=[];let value="",quoted=false,closed=false;
    for(let i=0;i<=text.length;i++){
      const c=i===text.length?null:text[i];
      if(quoted){
        if(c===null)return {ok:false,error:"format"};
        if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else {quoted=false;closed=true;}}
        else value+=c;
        continue;
      }
      if(c==='"'&&!value&&!closed){quoted=true;continue;}
      if(c===null||c==='\t'||c==='\n'){
        row.push(value);value="";closed=false;
        if(row.length>100)return {ok:false,error:"size"};
        if(c!=='\t'){rows.push(row.splice(0));if(rows.length>10000)return {ok:false,error:"size"};}
      }else {if(closed||c==='"')return {ok:false,error:"format"};value+=c;}
    }
    while(rows.length&&rows[rows.length-1].every(v=>!v.trim()))rows.pop();
    return {ok:true,rows};
  }
  function parse(text,reports,tests){
    const decoded=cells(text);if(!decoded.ok)return decoded;
    const rows=decoded.rows,fail=(error,row,column)=>({ok:false,error,row,column});
    if(!rows.length)return fail("empty");
    const header=rows[0].map(v=>v.trim()),expected=["sid","name",...tests];
    if(header.length!==expected.length||new Set(header).size!==header.length||expected.some(k=>!header.includes(k)))return fail("header",1);
    const pupils=new Map();
    for(const r of reports){if(typeof r.studentId!=="string"||!r.studentId||pupils.has(r.studentId))return fail("identity");pupils.set(r.studentId,r);}
    const seen=new Set(),entries=[];const idAt=header.indexOf("sid");
    for(let i=1;i<rows.length;i++){
      const row=rows[i];if(row.every(v=>!v.trim()))continue;
      if(row.length!==header.length)return fail("format",i+1);
      // IDs are exact text. Leading zeroes/spaces must not be silently reassigned.
      const sid=row[idAt],pupil=pupils.get(sid);
      if(!pupil)return fail("identity",i+1,"sid");
      if(seen.has(sid))return fail("duplicate",i+1,"sid");seen.add(sid);
      for(const test of tests){
        const raw=row[header.indexOf(test)].trim();if(!raw)continue;
        if(pupil.tests.find(v=>v.testId===test)?.status==="exempt")return fail("exempt",i+1,test);
        // Decimal comma is supported; formulae, thousands separators and exponents are not guessed.
        if(!/^-?\d+(?:[.,]\d{1,2})?$/.test(raw))return fail("number",i+1,test);
        const value=Number(raw.replace(",","."));if(!Number.isFinite(value))return fail("number",i+1,test);
        entries.push({sid,test,value});if(entries.length>2000)return fail("size",i+1,test);
      }
    }
    if(!entries.length)return fail("empty");
    return {ok:true,entries,pupils:new Set(entries.map(e=>e.sid)).size};
  }
  return {template,parse};
});
