'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const builder=path.resolve(__dirname,'../build-manifest.cjs');
test('strict manifest: 300+600 deterministic; missing and wrong source rejected',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pe-g1-manifest-'));
 try{
  const out=path.join(root,'manifest');fs.mkdirSync(out);
  fs.copyFileSync(builder,path.join(out,'build-manifest.cjs'));
  const index=['lang,id,notion_page_id,title'];
  const write=(kind,lang,id,type)=>{
   const dir=path.join(root,'export',kind,lang);fs.mkdirSync(dir,{recursive:true});
   const meta=kind==='lessons'?'family: '+id:'id: '+id+'\nkind: '+type;
   fs.writeFileSync(path.join(dir,id+'.md'),'---\n'+meta+'\nlang: '+lang+'\nsource: https://app.notion.com/p/1234\nsource_page_id: 1234\nsource_last_edited_at: 2026-10-15T00:00:00Z\nstatus: test\n---\n\n# '+id+'\nTest body.\n');
  };
  for(const lang of ['he','en','ar','ru','es']){
   for(const sport of ['BB','FB','HB','VB','AT','FIT'])for(let n=1;n<=10;n++)write('lessons',lang,sport+'-'+String(n).padStart(2,'0'));
   for(const [prefix,count,type] of [['DR',80,'drill'],['GM',24,'game'],['AC',16,'activity']])for(let n=1;n<=count;n++){
    const id=prefix+'-'+String(n).padStart(3,'0');write('activities',lang,id,type);index.push(lang+','+id+',1234,"Test"');
   }
  }
  fs.writeFileSync(path.join(out,'activity-source-index.csv'),index.join('\n')+'\n');
  const run=()=>spawnSync(process.execPath,['build-manifest.cjs'],{cwd:out,encoding:'utf8'});
  let p=run();assert.equal(p.status,0,p.stderr);assert.deepEqual(JSON.parse(p.stdout),{lessons:300,activities:600,total:900});
  const outputs=['lessons.json','activities.json','manifest.csv'];
  const first=outputs.map(x=>fs.readFileSync(path.join(out,x),'utf8'));
  p=run();assert.equal(p.status,0,p.stderr);
  assert.deepEqual(outputs.map(x=>fs.readFileSync(path.join(out,x),'utf8')),first);
  const target=path.join(root,'export/activities/en/DR-024.md'),original=fs.readFileSync(target,'utf8');
  fs.writeFileSync(target,original.replace('source_page_id: 1234','source_page_id: wrong'));
  p=run();assert.notEqual(p.status,0);assert.match(p.stderr,/Notion page ID mismatch/);
  fs.writeFileSync(target,original.replace('kind: drill','kind: game'));
  p=run();assert.notEqual(p.status,0);assert.match(p.stderr,/Wrong activity kind/);
  fs.unlinkSync(target);p=run();assert.notEqual(p.status,0);assert.match(p.stderr,/Missing export/);
  assert.deepEqual(outputs.map(x=>fs.readFileSync(path.join(out,x),'utf8')),first);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
