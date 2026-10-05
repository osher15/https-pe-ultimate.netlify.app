"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),X=require("../../hm-xlsx.js");
function files(bytes){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),out={};let at=0;
 while(v.getUint32(at,true)===0x04034B50){const n=v.getUint16(at+26,true),extra=v.getUint16(at+28,true),size=v.getUint32(at+18,true);const path=new TextDecoder().decode(bytes.slice(at+30,at+30+n));out[path]=new TextDecoder().decode(bytes.slice(at+30+n+extra,at+30+n+extra+size));at+=30+n+extra+size;}
 assert.equal(v.getUint32(at,true),0x02014B50);assert.equal(v.getUint32(bytes.length-22,true),0x06054B50);return out;
}
test("real ZIP workbook has linked sheets, literal text, numeric zero and blank missing cells",()=>{
 const out=files(X.workbook([{name:"Assessment",rows:[["Name","Score","Missing"],["=SUM(1,2)",0,null],["עברית العربية русский <&>",95,"Pending"]]},{name:"History",rows:[["Date"],["2026-10-03"]]}],{rtl:true}));
 assert.ok(out["[Content_Types].xml"].includes("sheet2.xml"));assert.ok(out["xl/_rels/workbook.xml.rels"].includes("worksheets/sheet2.xml"));const xml=out["xl/worksheets/sheet1.xml"];
 assert.ok(xml.includes('rightToLeft="1"'));assert.ok(xml.includes('t="inlineStr"'));assert.ok(xml.includes("=SUM(1,2)"));assert.ok(!xml.includes("<f>"));assert.ok(xml.includes('<c r="B2"><v>0</v></c>'));assert.ok(xml.includes('<c r="C2"/>'));assert.ok(xml.includes("&lt;&amp;&gt;"));
});
test("workbook validates names, duplicate sheets and nonfinite numbers",()=>{
 for(const sheets of [[{name:"Bad/Name",rows:[]}],[{name:"A",rows:[]},{name:"a",rows:[]}],[{name:"A",rows:[[NaN]]}]])assert.throws(()=>X.workbook(sheets));
});
test("CSV quotes multiline names and neutralizes formula strings without changing numeric zero",()=>{
 const csv=X.csv([["Name","Score"],["=1+2",0],['Name, "Quoted"\nNext',95],[" +cmd",null]]);
 assert.ok(csv.startsWith("\uFEFF"));assert.ok(csv.includes("'=1+2,0"));assert.ok(csv.includes('"Name, ""Quoted""\nNext",95'));assert.ok(csv.includes("' +cmd,"));
});
