#!/usr/bin/env node
'use strict';
// Deterministic G1 manifest builder; never edits source exports.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'..'),out=__dirname;
const langs=['he','en','ar','ru','es'],sports=['BB','FB','HB','VB','AT','FIT'];
function read(file){
 if(!fs.existsSync(file))return null;
 const raw=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 const m=raw.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
 if(!m)throw Error('Invalid front matter: '+file);
 const meta=Object.fromEntries(m[1].split('\n').map(s=>{const n=s.indexOf(':');return [s.slice(0,n),s.slice(n+1).trim()]}));
 return {meta,body:m[2]};
}
const rows=[];
function add(kind,lang,id){
 const file=path.join(base,'export',kind,lang,id+'.md'),entry=read(file);
 if(!entry)return;
 const {meta,body}=entry;
 rows.push({type:kind==='lessons'?'lesson':'activity',id,lang,kind:kind==='lessons'?'lesson':(meta.kind||({DR:'drill',GM:'game',AC:'activity'})[id.slice(0,2)]),notion_url:meta.source||null,notion_page_id:meta.source_page_id||null,notion_last_edited:meta.source_last_edited_at||null,status:meta.status||null,body_sha256:crypto.createHash('sha256').update(body,'utf8').digest('hex'),repo_compare:null,source_file:path.relative(base,file).split(path.sep).join('/')});
}
for(const lang of langs)for(const sport of sports)for(let n=1;n<=10;n++)add('lessons',lang,sport+'-'+String(n).padStart(2,'0'));
const index=fs.readFileSync(path.join(out,'activity-source-index.csv'),'utf8').replace(/\r\n/g,'\n').split('\n').slice(1);
for(const line of index){if(!line.trim())continue;const m=line.match(/^([^,]+),([^,]+),/);if(m)add('activities',m[1],m[2]);}
const lesson=rows.filter(r=>r.type==='lesson'),activities=rows.filter(r=>r.type==='activity');
fs.writeFileSync(path.join(out,'lessons.json'),JSON.stringify(lesson,null,2)+'\n');
fs.writeFileSync(path.join(out,'activities.json'),JSON.stringify(activities,null,2)+'\n');
const columns=['type','id','lang','kind','notion_url','notion_page_id','notion_last_edited','status','body_sha256','repo_compare','source_file'];
const quote=v=>{const s=v===null||v===undefined?'':String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
fs.writeFileSync(path.join(out,'manifest.csv'),columns.join(',')+'\n'+rows.map(r=>columns.map(k=>quote(r[k])).join(',')).join('\n')+'\n');
console.log(JSON.stringify({lessons:lesson.length,activities:activities.length,total:rows.length}));
