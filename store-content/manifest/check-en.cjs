#!/usr/bin/env node
'use strict';
// Read-only G1 English export structure check. Run: node store-content/manifest/check-en.cjs
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../export/lessons/en');
const sports=['BB','FB','HB','VB','AT','FIT'];
const issues=[],reports=[],seen=new Set();
for(const sport of sports)for(let i=1;i<=10;i++){
 const id=sport+'-'+String(i).padStart(2,'0');
 const file=path.join(root,id+'.md');
 if(!fs.existsSync(file)){issues.push(id+': missing');continue}
 const raw=fs.readFileSync(file,'utf8');
 const parts=raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n\r?\n([\s\S]*)$/);
 if(!parts){issues.push(id+': invalid front matter');continue}
 const [,meta,body]=parts;
 const get=k=>(meta.match(new RegExp('^'+k+': (.*)$','m'))||[])[1];
 if(get('family')!==id)issues.push(id+': wrong family');
 if(get('lang')!=='en')issues.push(id+': wrong language');
 if(!/^https:\/\/app\.notion\.com\/p\//.test(get('source')||''))issues.push(id+': missing source');
 if(!/^[a-f0-9-]{36}$/.test(get('source_page_id')||''))issues.push(id+': invalid Notion ID');
 if(!get('source_last_edited_at'))issues.push(id+': missing timestamp');
 if(body.trim().length<1000)issues.push(id+': suspiciously short body');
 const headings=(body.match(/^# /gm)||[]).length;
 if(headings!==20)issues.push(id+': expected 20 top-level headings, got '+headings);
 if(seen.has(get('source_page_id')))issues.push(id+': duplicate source ID');
 seen.add(get('source_page_id'));
 reports.push({id,characters:body.length,headings,source:get('source')});
}
console.log(JSON.stringify({expected:60,found:reports.length,issues,reports},null,2));
if(issues.length)process.exitCode=1;
