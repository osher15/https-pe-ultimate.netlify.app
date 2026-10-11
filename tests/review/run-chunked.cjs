'use strict';
// One unchanged suite per fresh process/browser. No retry or assertion rewriting.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'tests/e2e');
const registered=[...fs.readFileSync(path.join(dir,'run.js'),'utf8').matchAll(/require\("\.\/([^"/]+\.e2e\.js)"\)/g)].map(m=>m[1]);
const extra=fs.readdirSync(dir).filter(n=>n.endsWith('.e2e.js')&&!registered.includes(n));
// Also include historical exported review suites; offline is a standalone process below.
extra.push(...fs.readdirSync(__dirname).filter(n=>n.endsWith('.e2e.js')&&n!=='offline-lazy.e2e.js').map(n=>'../review/'+n));
const out=process.env.PE_EVIDENCE_DIR||path.join(root,'test-results/chunked');fs.mkdirSync(out,{recursive:true});
const rows=process.env.PE_RESUME==='1'&&fs.existsSync(path.join(out,'results.json'))?JSON.parse(fs.readFileSync(path.join(out,'results.json'),'utf8')):[];
const shardCount=Number(process.env.PE_SHARDS||1),shard=Number(process.env.PE_SHARD||0);
if(!Number.isInteger(shardCount)||shardCount<1||!Number.isInteger(shard)||shard<0||shard>=shardCount)throw Error('Invalid shard');
for(const [index,name] of [...registered,...extra].entries()){
 if(index%shardCount!==shard)continue;
 if(rows.some(r=>r.suite===name&&r.exit===0&&r.fail===0&&r.notRun===0))continue;
 const count=require(path.join(dir,name)).tests.length;
 const result=spawnSync(process.execPath,[...process.execArgv,path.join(dir,'some.js'),name.replace('.e2e.js','')],{cwd:root,env:process.env,encoding:'utf8',timeout:Math.max(180000,count*75000),maxBuffer:16*1024*1024});
 const text=(result.stdout||'')+(result.stderr||'');fs.writeFileSync(path.join(out,name.replace('../review/','review-')+'.log'),text);
 const pass=(text.match(/^  ok  #/gm)||[]).length,fail=(text.match(/^  FAIL #/gm)||[]).length;
 const row={suite:name,registered:registered.includes(name),expected:count,pass,fail,notRun:Math.max(0,count-pass-fail),exit:result.status,signal:result.signal,error:result.error?.message||null};rows.push(row);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(row));
}
if(shard===0){
const probe=spawnSync(process.execPath,[...process.execArgv,path.join(root,'tests/review/offline-lazy.e2e.js')],{cwd:root,env:process.env,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
fs.writeFileSync(path.join(out,'offline-lazy.log'),(probe.stdout||'')+(probe.stderr||''));
rows.push({suite:'review/offline-lazy.e2e.js',registered:true,expected:1,pass:probe.status===0?1:0,fail:probe.status===0?0:1,notRun:0,exit:probe.status,signal:probe.signal});
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2));
}
process.exitCode=rows.some(r=>r.exit!==0||r.fail||r.notRun)?1:0;
