"use strict";
// Read-only candidate/slot analysis. Source-root selection never copies product data.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const {cell}=require('./audit-source');
const sum=a=>a.reduce((x,y)=>x+y,0);
function loadModel(root){
 root=path.resolve(root);const lesson=fs.readFileSync(path.join(root,'hm-lesson.js'),'utf8');
 const m=lesson.match(/const TOPICS=\[[\s\S]*?\n\];/);
 const block=lesson.match(/const nBlocks=chosenSubs\.length\|\|\(mainMin<=(\d+)\?1:\(mainMin<=(\d+)\?2:3\)\)/);
 if(!m||!block)throw new Error('Source does not contain the reviewed automatic block-count model');
 const D=require(path.join(root,'hm-data.js'));
 const topics=vm.runInNewContext('('+m[0].replace('const TOPICS=','').replace(/;$/,'')+')',{}, {timeout:2000});
 const fields=['hm-data.js','hm-lesson.js'];
 return {root,D,topics,thresholds:[+block[1],+block[2]],head:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceBlobs:Object.fromEntries(fields.map(f=>[f,cp.execFileSync('git',['hash-object',f],{cwd:root,encoding:'utf8'}).trim()])),
  transitionModel:fs.readFileSync(path.join(root,'hm-data.js'),'utf8').includes('TIME_TRANS[opts.trans]-1')?'relative to normal':'absolute transition overhead'};
}
function slots(model,length,withGame,weather,poolSize){
 const warm=model.D.warmMinutes(length,weather),cool=Math.min(8,Math.max(5,Math.round(length*.11))),game=withGame?Math.min(15,Math.max(6,Math.round(length*.16))):0;
 const shortened=length-warm-cool-game<18&&warm>5;
 const actualWarm=shortened?5:warm,main=Math.max(8,length-actualWarm-cool-game),want=main<=model.thresholds[0]?1:main<=model.thresholds[1]?2:3;
 const count=Math.min(want,poolSize),per=Math.floor(main/count);
 return {warm:actualWarm,cool,game,main,count,allocations:Array.from({length:count},(_,i)=>i===count-1?main-per*(count-1):per)};
}
function audit(root){
 const model=loadModel(root),rows=[],variants=[];
 for(const t of model.topics)for(const grade of ['mid','high'])for(const [i,v] of (t.main[grade]||[]).entries())variants.push({id:t.id+'/'+grade+'/'+(i+1),name:v.n,topic:t.id,grade,v,poolSize:t.main[grade].length});
 for(const item of variants)for(const length of [45,50,60,90])for(const withGame of [false,true])for(const weather of ['normal','cold','hot'])for(const pace of Object.keys(model.D.TIME_PACE))for(const trans of Object.keys(model.D.TIME_TRANS))for(const water of [false,true]){
  const split=slots(model,length,withGame,weather,item.poolSize);
  split.allocations.forEach((allocated,i)=>{
   const f=model.D.variantFit(item.v,allocated,{pace,trans,water,weather});
   if(!f.known)throw new Error('Missing timing for '+item.id);
   const total=sum(f.fitted)+f.overhead;
   rows.push({id:item.id,name:item.name,length,withGame,weather,pace,trans,water,slot:i+1,blocks:split.count,window:split.main,allocated,base:f.base,min:f.min,max:f.max,fitted:f.fitted,overhead:f.overhead,total,status:f.status,free:f.status==='short'?f.gap:0,over:f.status==='over'?f.gap:0,
    atMin:f.fitted.flatMap((x,j)=>x===Math.ceil(f.sr.lo[j])?[j+1]:[]),atMax:f.fitted.flatMap((x,j)=>x===Math.floor(f.sr.hi[j])?[j+1]:[])});
  });
 }
 const summaries=[45,50,60,90].map(length=>{
  const cases=rows.filter(r=>r.length===length),free=cases.map(r=>r.free);
  return {length,cases:cases.length,cannotFitVariants:new Set(cases.filter(r=>r.status==='over').map(r=>r.id)).size,exact:cases.filter(r=>r.status==='exact').length,over:cases.filter(r=>r.status==='over').length,under:cases.filter(r=>r.status==='short').length,
   freeTotal:sum(free),freeMean:sum(free)/free.length,freeMax:Math.max(...free)};
 });
 const scan=Array.from({length:33},(_,i)=>i+8).map(allocated=>{
  const f=variants.map(x=>model.D.variantFit(x.v,allocated,{pace:'normal',trans:'normal',water:true,weather:'normal'}));
  return {allocated,exact:f.filter(x=>x.status==='exact').length,over:f.filter(x=>x.status==='over').length,under:f.filter(x=>x.status==='short').length,pools:new Set(variants.map(x=>x.topic+'|'+x.grade)).size,fittingPools:new Set(variants.filter((x,i)=>f[i].status==='exact').map(x=>x.topic+'|'+x.grade)).size};
 });
 return {head:model.head,sourceBlobs:model.sourceBlobs,thresholds:model.thresholds,transitionModel:model.transitionModel,variantCount:variants.length,rows,summaries,scan};
}
function reportModel(a,title){
 const out=['## '+title,'','Head: `'+a.head+'`; source blobs: '+Object.entries(a.sourceBlobs).map(([f,h])=>'`'+f+':'+h+'`').join(', ')+'.','',
  'Automatic thresholds: '+a.thresholds.join(' / ')+' min. Transition semantics: '+a.transitionModel+'. Actual variants: '+a.variantCount+'.','',
  '| Lesson | Candidate-slot cases | Cannot-fit variants (any case) | Exact share | Cannot fit / under | Free-play mean / max per candidate slot |','|---|---:|---:|---:|---|---|'];
 for(const s of a.summaries)out.push('| '+[s.length,s.cases,s.cannotFitVariants+'/'+a.variantCount,(100*s.exact/s.cases).toFixed(2)+'%',s.over+' / '+s.under,s.freeMean.toFixed(2)+' / '+s.freeMax].join(' | ')+' |');
 out.push('','Free-play totals below are sums across hypothetical candidate cases, not minutes in a single school timetable. Exact percentages are coverage of enumerated options, not production probabilities.','',
  '| Block allocation | Exact variants (normal pace/transitions, water on, normal weather) | Fitting topic/grade pools | Cannot fit | Under |','|---:|---:|---:|---:|---:|');
 for(const s of a.scan)out.push('| '+[s.allocated,s.exact+'/'+a.variantCount,s.fittingPools+'/'+s.pools,s.over,s.under].join(' | ')+' |');
 out.push('','### All variants by lesson length','',
  'Each row aggregates optional game on/off × 3 weather choices × 3 paces × 3 transition choices × water on/off and every actual block slot. Equipment constraints/random feedback choice are not selection probabilities; each variant is a candidate, not repeated identical blocks in a real plan. A selected optional game is assumed available; unavailable-game minutes returned to the last block are outside this model.','',
  '| Variant | Lesson | Cases | Blocks / allocation range | Recommended | Fitted total range | Exact / cannot-fit / under | Free-play total / mean / max | Standard slot 1: allocated / steps / overhead |','|---|---:|---:|---|---:|---|---|---|---|');
 const groups=new Map();for(const r of a.rows){const k=r.id+'|'+r.length;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
 const range=x=>Math.min(...x)+'–'+Math.max(...x);
 for(const list of groups.values()){
  const r=list.find(x=>!x.withGame&&x.weather==='normal'&&x.pace==='normal'&&x.trans==='normal'&&x.water&&x.slot===1),frees=list.map(x=>x.free);
  out.push('| '+[r.id+' '+r.name,r.length,list.length,[...new Set(list.map(x=>x.blocks))].sort().join(',')+' / '+range(list.map(x=>x.allocated)),r.base,range(list.map(x=>x.total)),['exact','over','short'].map(st=>list.filter(x=>x.status===st).length).join(' / '),sum(frees)+' / '+(sum(frees)/frees.length).toFixed(2)+' / '+Math.max(...frees),r.allocated+' / '+r.fitted.join('+')+' / '+r.overhead].map(cell).join(' | ')+' |');
 }
 return out.join('\n');
}
function markdown(a,b){return ['# Timing overrun audit v2 — 2026-10-07','',
 'Read-only arithmetic on draft timings. Actual field duration is unknown. Requested historical model and newer model are reported separately; neither is merged by this audit.','',
 'Lengths: 45/50/60/90. Outdoor weather uses warmMinutes; warm-up is capped by the source helper, cool-down at 8, optional game at 15. Automatic main-window thresholds are read from the source. The main window is split evenly, with the remainder in the final slot; all variants are checked in every possible slot. Manual subtopic selection and random plan selection are not simulated. Steps fit in whole minutes inside displayed half-minute ranges. Cannot-fit means the minimum rounded step sum exceeds a slot allocation; under means free-play fills the residual.','',
 reportModel(a,'Requested handoff snapshot'),b?'\n'+reportModel(b,'Latest timing snapshot at audit start'):'','',
 '## Quick-check comparison','',
 'Historical 18–31 minute scan: '+a.scan.filter(s=>s.allocated>=18&&s.allocated<=31).map(s=>s.allocated+'='+s.exact+'/'+a.variantCount).join('; ')+'. The general best-window claim is reproduced approximately, not a constant 90 variants.',
 b?'Latest 19–27 minute scan, pools with at least one exact fit: '+b.scan.filter(s=>s.allocated>=19&&s.allocated<=27).map(s=>s.allocated+'='+s.fittingPools+'/'+s.pools).join('; ')+'. At 16 and 29 minutes: '+b.scan.filter(s=>[16,29].includes(s.allocated)).map(s=>s.allocated+'='+s.fittingPools+'/'+s.pools+' pools ('+s.exact+'/'+b.variantCount+' variants)').join('; ')+'.':'','',
 '## Recommendations for Claude','',
 'Review candidate fit by topic/grade before treating automatic thresholds as universally suitable. Retain source version on every finding. Free play is an explicit generator fallback; a nonzero residual is not itself a defect. Fixed-protocol wording still needs teacher approval. No data or product file was edited.',''].join('\n');}
if(require.main===module){const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1];if(!args.includes('--root'))throw new Error('Use --root <reviewed worktree>');const a=audit(get('--root')),b=args.includes('--compare')?audit(get('--compare')):null;process.stdout.write(args.includes('--json')?JSON.stringify({requested:a,latest:b},null,2)+'\n':markdown(a,b));}
module.exports={loadModel,slots,audit,markdown};
