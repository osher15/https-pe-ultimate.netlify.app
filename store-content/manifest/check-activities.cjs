#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),langs=['en','he','ar','ru','es'];
const issues=[],seen=new Map();let found=0;
const index=fs.readFileSync(path.join(root,'manifest/activity-source-index.csv'),'utf8').replace(/\r\n/g,'\n').trim().split('\n');
function csv(line){const out=[];let s='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'&&quoted){s+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){out.push(s);s='';}else s+=c;}out.push(s);return out;}
const headers=csv(index.shift()).map(s=>s.trim().toLowerCase());
const rows=index.map(csv);
const idCol=headers.findIndex(s=>['id','activity_id','code'].includes(s));
const langCol=headers.findIndex(s=>['lang','language'].includes(s));
const pageCol=headers.findIndex(s=>['source_page_id','notion_page_id','page_id'].includes(s));
if(idCol<0||langCol<0||pageCol<0){console.error('Unrecognized index headers: '+headers.join(','));process.exit(2);}
for(const row of rows){
 const id=row[idCol],lang=row[langCol],expectedPage=row[pageCol],name=lang+'/'+id;
 if(!langs.includes(lang)||! /^(DR|GM|AC)-\d{3}$/.test(id)){issues.push('invalid index row '+name);continue;}
 const file=path.join(root,'export/activities',lang,id+'.md');
 if(!fs.existsSync(file)){issues.push(name+': missing');continue;}
 const raw=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),match=raw.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
 if(!match){issues.push(name+': invalid front matter');continue;}
 found++;
 const meta=Object.fromEntries(match[1].split('\n').map(line=>{const n=line.indexOf(':');return n<0?[line,'']:[line.slice(0,n),line.slice(n+1).trim()]}));
 const body=match[2];
 if(meta.lang!==lang)issues.push(name+': language mismatch');
 if((meta.source_page_id||'').replace(/-/g,'')!==expectedPage.replace(/-/g,''))issues.push(name+': source ID differs from index');
 if(seen.has(meta.source_page_id))issues.push(name+': duplicate page ID with '+seen.get(meta.source_page_id));
 else seen.set(meta.source_page_id,name);
 if(meta.kind!==({DR:'drill',GM:'game',AC:'activity'})[id.slice(0,2)])issues.push(name+': kind mismatch');
 const code=body.match(/\b(?:DR|GM|AC)-\d{3}\b/);
 if(!code||code[0]!==id)issues.push(name+': first body ID mismatch');
 if(/(?:truncated|content omitted|output cut off)/i.test(body))issues.push(name+': truncation marker');
}
if(rows.length!==600)issues.push('index expected 600 rows, got '+rows.length);
console.log(JSON.stringify({expected:600,index_rows:rows.length,found,issue_count:issues.length,issues},null,2));
if(issues.length)process.exitCode=1;
