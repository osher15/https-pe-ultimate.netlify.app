#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../export/lessons');
const languages=['he','en','ar','ru','es'],sports=['BB','FB','HB','VB','AT','FIT'];
const issues=[],seen=new Map();let found=0;
for(const lang of languages)for(const sport of sports)for(let i=1;i<=10;i++){
 const family=sport+'-'+String(i).padStart(2,'0'),name=lang+'/'+family;
 const file=path.join(root,lang,family+'.md');
 if(!fs.existsSync(file)){issues.push(name+': missing');continue;}
 const raw=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 const match=raw.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
 if(!match){issues.push(name+': invalid front matter');continue;}
 found++;
 const meta=Object.fromEntries(match[1].split('\n').map(line=>{const n=line.indexOf(':');return n<0?[line,'']:[line.slice(0,n),line.slice(n+1).trim()]}));
 const body=match[2];
 if(meta.family!==family)issues.push(name+': wrong family');
 if(meta.lang!==lang)issues.push(name+': wrong language');
 if(!/^https:\/\/app\.notion\.com\/p\//.test(meta.source||''))issues.push(name+': invalid source URL');
 if(!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(meta.source_page_id||''))issues.push(name+': invalid page ID');
 if(!meta.source_last_edited_at||!Number.isFinite(Date.parse(meta.source_last_edited_at)))issues.push(name+': invalid timestamp');
 if(body.length<1000)issues.push(name+': suspiciously short');
 const headings=(body.match(/^# /gm)||[]).length;
 if(headings!==20)issues.push(name+': expected 20 headings, got '+headings);
 const code=body.match(/\b(?:BB|FB|HB|VB|AT|FIT)-\d{2}-(?:HE|EN|AR|RU|ES)\b/);
 if(!code||code[0]!==family+'-'+lang.toUpperCase())issues.push(name+': first body code mismatch '+(code?.[0]||'missing'));
 if(/(?:truncated|content omitted|output cut off)/i.test(body))issues.push(name+': truncation marker');
 if(seen.has(meta.source_page_id))issues.push(name+': duplicate source_page_id with '+seen.get(meta.source_page_id));
 else seen.set(meta.source_page_id,name);
}
console.log(JSON.stringify({expected:300,found,issue_count:issues.length,issues},null,2));
if(issues.length)process.exitCode=1;
