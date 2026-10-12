"use strict";
// Arithmetic review of current draft timing; never writes product files.
const D=require('../hm-data.js'),{ROOT,arrayFrom,cell}=require('./audit-source');
const {spawnSync,execFileSync}=require('node:child_process');
const sum=a=>a.reduce((x,y)=>x+y,0);
function audit(){
 const topics=arrayFrom('hm-lesson.js','TOPICS'),rows=[],equipment=[];
 const variants=topics.flatMap(t=>['mid','high'].flatMap(grade=>(t.main[grade]||[]).map((v,i)=>({t,grade,v,id:t.id+'/'+grade+'/'+(i+1)}))));
 const catalog=D.EQUIP_CHOICES.map(c=>c[0]);
 for(const {t,grade,v,id} of variants){
  const profiles=[{name:'all',available:catalog},{name:'none',available:[]},...catalog.map(k=>({name:'only '+k,available:[k]}))];
  for(const p of profiles){const unavailable=catalog.filter(k=>!p.available.includes(k));equipment.push({id,profile:p.name,topicConflicts:D.equipConflicts((t.eq||[]).join(', '),unavailable),variantConflicts:D.variantEquipConflicts(v,unavailable)});}
  for(const length of [30,45,60])for(const withGame of [false,true])for(const pace of Object.keys(D.TIME_PACE))for(const trans of Object.keys(D.TIME_TRANS))for(const water of [false,true])for(const weather of ['normal','cold','hot']){
   // Generator's outdoor, one explicitly selected subtopic path; optional game assumed available.
   let warm=D.warmMinutes(length,weather),cool=Math.max(5,Math.round(length*.11));
   const game=withGame?Math.max(6,Math.round(length*.16)):0;
   if(length-warm-cool-game<18&&warm>5)warm=5;
   const allocated=Math.max(8,length-warm-cool-game),opts=D.timeOpts({pace,trans,water,weather}),f=D.variantFit(v,allocated,opts);
   if(!f.known){rows.push({id,name:v.n,length,opts,withGame,allocated,status:'unknown'});continue;}
   const work=sum(f.fitted),total=work+f.overhead,delta=total-allocated;
   const status=f.min>allocated?'cannot-fit':delta>0?'exceed':delta<0?'under':'ok';
   const fullOverhead=Math.round(Math.max(0,f.fitted.length-1)*D.TIME_TRANS[trans]*(f.sr.rest?1.5:1)+(water?((allocated>=30?2:allocated>=15?1:0)+(weather==='hot'&&allocated>=15?1:0)):0));
   rows.push({id,name:v.n,length,opts,withGame,allocated,recommended:f.base,work,overhead:f.overhead,fullOverhead,total,delta,status,min:f.min,max:f.max,steps:f.fitted,
    atMin:f.fitted.flatMap((x,i)=>x===f.sr.lo[i]?[i+1]:[]),atMax:f.fitted.flatMap((x,i)=>x===f.sr.hi[i]?[i+1]:[]),
    explained:delta>0?'minimum work exceeds window; overhead already reduced':delta<0?'maximum reached; generator allocates '+(-delta)+' min free play':'work + combined transition/rest/water allowance equals window'});
  }
 }
 const invalid=[['fractional','10.5'],['NaN','NaN'],['Infinity','Infinity'],['zero','0'],['negative','-5']].map(([label,input])=>{
  const script="const D=require('./hm-data.js');const f=D.variantFit({d:['work'],t:[10]},"+input+");console.log(JSON.stringify(f));";
  const p=spawnSync(process.execPath,['-e',script],{cwd:ROOT,timeout:2000,encoding:'utf8'});
  return {label,terminated:p.status===0,result:p.status===0?JSON.parse(p.stdout):{error:p.error?.code||p.stderr}};
 });
 const counts={};for(const r of rows)counts[r.status]=(counts[r.status]||0)+1;
 return {base:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),variantCount:variants.length,scenarioCount:rows.length,equipmentCount:equipment.length,counts,invalid,rows,equipment};
}
function markdown(a){
 const out=['# Timing overrun audit — 2026-10-07','', 'Source: `'+a.base+'`. Read-only arithmetic on draft numbers; actual field duration is unknown. This is not pedagogical validation.','',
  'Current main uses the older broad timing ranges. The separate timing branch ccr-59f9e3d6-wvrg3u at 6662097 changes ranges and long-lesson handling; these findings must be rerun after owner integration. No pending branch was merged.','',
  'Coverage: '+a.variantCount+' actual variants × 3 lesson lengths × 108 combinations (pace 3, transitions 3, water 2, weather 3, optional game 2) = '+a.scenarioCount+' rows. Outdoor, one selected main block; indoor weather equals normal. Multiple selected blocks and random choices are outside this deterministic path. Equipment is a separate eligibility check: it does not change timeOpts or fitted minutes.','',
  'Recommended = unscaled typical step minutes; allocated = main window after warm-up, cool-down and optional game; fitted = step sum plus combined transition/rest/water allowance. Explanation steps remain in the step sum. TIME_TRANS does not separately measure explanations or real rest. Overhead is reduced first. Underfilled windows are filled with free play by the generator; cannot-fit rows need an owner decision.','',
  'Important modelling ambiguity: hm-data.js describes v.t as including transitions, while the fitter adds a separate transition allowance. This audit reproduces the implementation; it cannot establish whether a specific activity double-counts transition time. The owner should clarify the intended meaning before approving numbers.','',
  '| Status | Scenarios |','|---|---:|',...Object.entries(a.counts).map(([k,v])=>'| '+k+' | '+v+' |'),'','Cannot-fit variants by lesson length: '+[30,45,60].map(l=>l+' min: '+new Set(a.rows.filter(r=>r.length===l&&r.status==='cannot-fit').map(r=>r.id)).size+' / '+a.variantCount).join('; ')+'. These counts mean at least one tested configuration cannot fit, not every use of the variant.','',
  'Input termination (child process, 2 s timeout): '+a.invalid.map(p=>p.label+'='+ (p.terminated?'returned':'FAILED')).join('; ')+'.','',
  'The following table has one row per variant and lesson length. Each row aggregates all 108 configurations; the standard example is no game, normal pace/transitions/weather, water enabled. Min–max columns cover every tested configuration. Run `node tools/timing-audit.js --json` to inspect each configuration and equipment result separately.','',
  '| Variant | Lesson | Recommended | Allocated range | Fitted total range | Status counts (108 each) | Standard allocated / steps / overhead | Min / max pinned steps (standard) | Note |','|---|---:|---:|---|---|---|---|---|---|'];
 const grouped=new Map();for(const r of a.rows){const key=r.id+'|'+r.length;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(r);}
 const range=values=>Math.min(...values)+'–'+Math.max(...values);
 for(const rows of grouped.values()){
  const r=rows.find(x=>!x.withGame&&x.opts.pace==='normal'&&x.opts.trans==='normal'&&x.opts.water&&x.opts.weather==='normal');
  const counts={};for(const x of rows)counts[x.status]=(counts[x.status]||0)+1;
  const note=rows.some(x=>x.status==='cannot-fit')?'Minimum step sum exceeds allocation in some configurations; overhead reduced first':rows.some(x=>x.status==='under')?'Maximum reached in some configurations; residual allocated to free play':'Steps + transition/rest/water allowance fit every tested window';
  out.push('| '+[r.id+' '+r.name,r.length,r.recommended,range(rows.map(x=>x.allocated)),range(rows.map(x=>x.total)),Object.entries(counts).map(([k,v])=>k+': '+v).join('; '),r.allocated+' / '+r.steps.join('+')+' / '+r.overhead,(r.atMin||[]).join(',')+' / '+(r.atMax||[]).join(','),note].map(cell).join(' | ')+' |');
 }
 out.push('','## Equipment eligibility exceptions','', 'All 19 profiles checked per variant (all, none, one catalog item at a time). Unknown noncatalog equipment is not proven available. Each row counts blocked profiles and gives the no-equipment conflicts; full per-profile results are available through --json.','', '| Variant | Blocked profiles / 19 | No-equipment topic conflicts | No-equipment variant conflicts |','|---|---:|---|---|');
 const eqgroups=new Map();for(const e of a.equipment){if(!eqgroups.has(e.id))eqgroups.set(e.id,[]);eqgroups.get(e.id).push(e);}
 for(const [id,entries] of eqgroups){const blocked=entries.filter(e=>e.topicConflicts.length||e.variantConflicts.length);if(!blocked.length)continue;const none=entries.find(e=>e.profile==='none');out.push('| '+[id,blocked.length,none.topicConflicts.join(', '),none.variantConflicts.join(', ')].map(cell).join(' | ')+' |');}
 return out.join('\n')+'\n';
}
if(require.main===module){const a=audit();process.stdout.write(process.argv.includes('--json')?JSON.stringify(a,null,2)+'\n':markdown(a));}
module.exports={audit,markdown};
