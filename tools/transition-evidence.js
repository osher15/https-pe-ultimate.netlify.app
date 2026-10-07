"use strict";
// Text matches are review evidence, never estimates of how long a pupil actually needs.
const {loadModel}=require('./timing-audit-v2'),{cell}=require('./audit-source');
const sum=a=>a.reduce((x,y)=>x+y,0);
const equipmentRX=/ציוד|מזרנ|מכשול|תחנות|קונוס|חישוק|ספסל|רשת|חבל/;
function literalDurations(text){return [...text.matchAll(/(\d+(?:\.\d+)?)(?:[–-](\d+(?:\.\d+)?))?\s*(דקות|דקה|דק[׳']?|שניות|שנייה|שניה|שנ[׳']?)/g)].map(m=>({literal:m[0],minutes:+(m[2]||m[1])*(m[3].startsWith('ש')?1/60:1)}));}
const classes=[['setup',/ארג[ון]|מציב|מציבים|מסדר|סידור|מקימ|ממקמ|מיקום|מחלקים|חלוקה|מסמנים|סימון|קובעים/],['transition',/מעבר|עוברים|עוברות|מחליפ|החלפ|רוטציה|מתחלפ|לסירוגין/],['rest',/מנוח|הפסק|התאושש|נחים|מנוחה|הליכ/],['instruction',/הסבר|מדגימ|הדגמ|תדרוך|היכרות/]];
function evidence(root){
 const m=loadModel(root),rows=[];let variantCount=0;
 for(const t of m.topics)for(const grade of ['mid','high'])for(const [i,v] of (t.main[grade]||[]).entries()){
  variantCount++;const sr=m.D.stepRanges(v),allocation=sum(sr.typ)+20;
  const normal=m.D.variantFit(v,allocation,{pace:'normal',trans:'normal',water:false,weather:'normal'}).overhead;
  const slow=m.D.variantFit(v,allocation,{pace:'normal',trans:'slow',water:false,weather:'normal'}).overhead;
  v.d.forEach((text,j)=>{const tags=classes.filter(([,rx])=>rx.test(text)).map(([name])=>name);
   const explicit=literalDurations(text),rest=tags.some(x=>x==='rest'||x==='transition'),setup=tags.includes('setup')&&equipmentRX.test(text);
   rows.push({recurring:/כל\s*\d+\s*(דק|שנ)/.test(text),explicit,restExceeds:rest?explicit.filter(x=>x.minutes>+v.t[j]):[],setup,setupSmall:setup&&+v.t[j]<=2,id:t.id+'/'+grade+'/'+(i+1),name:v.n,step:j+1,text,t:v.t[j],range:sr.lo[j]+'–'+sr.hi[j],tags:tags.length?tags:['activity (no lexical match)'],normal,slow,
    conditional:tags.some(x=>['setup','transition','rest'].includes(x))?'Explicit related text; potential overlap if the same work is also charged separately':'No explicit lexical evidence; cannot infer absence of transitions'});
  });
 }
 return {head:m.head,sourceBlobs:m.sourceBlobs,transitionModel:m.transitionModel,variantCount,rows};
}
function report(a,b){
 const out=['# Timing transition evidence — 2026-10-07','',
 'Read-only text classification across '+a.variantCount+' variants / '+a.rows.length+' steps. Source '+a.head+'. Tags are Hebrew keyword matches; review false positives and ambiguous instructions with the teacher. An activity row means no matched setup/transition/rest/instruction keyword, not confirmed pure activity.','',
 'Displayed t is typical step duration. Overhead columns are variant-wide additional minutes with water off and allocation above the typical sum so no overhead compression occurs; they must not be attributed to each individual step or summed down a variant.','',
 'Historical model '+a.head+' charges absolute transitions, with a rest multiplier when the variant name/subtopic matches REST_RX. If t already includes those same transitions/rest, adding that allowance would count them again. A text match alone cannot establish how t was authored. Instruction/setup time is not independently itemized by overheadFull.','',
 b?'Owner-declared semantics (latest handoff): t includes normal transitions. Latest '+b.head+' explicitly treats normal transitions as included in t: normal extra transition allowance is zero; slow adds a delta, quick reduces the combined allowance subject to a zero floor. Water is a separate setting. This resolves the default arithmetic ambiguity in code, but fixed-rest protocols and setup instructions still need a content review.':'','',
 'Screening result: '+a.rows.filter(r=>r.setup).length+' explicit equipment/setup keyword matches; '+a.rows.filter(r=>r.restExceeds.length).length+' literal rest/rotation tokens exceed typical t. The basketball high-school tournament explanation mentions rotation every 5 minutes while its explanation step has t=3; this is a recurring future schedule, not evidence that 5 minutes of rotation occur inside that explanation. No confirmed large-setup shortfall or performed-rest overrun is established by this screen. Compound-round/pyramid protocols remain unverified.','',
 'Large equipment reorganization is flagged only when setup words and equipment words occur in the same step. t <=2 min is an owner-review flag, not proof of insufficient time. Literal rest/rotation duration checks compare explicit numeric-unit tokens with typical t; compound round protocols cannot be safely inferred from lexical matches alone.','',
 'Recommendation: label t as including normal setup/transitions/rest where intended, and document any separately budgeted water or major reorganization. The quick setting is clamped to nonnegative combined overhead: it may remove a water allowance without shortening fitted work; ask the owner whether that matches the intended UX.','',
 '| Variant | Step | t / displayed range | Tags | Normal / slow overhead (historical, per variant) | Normal / slow overhead (latest, per variant) | Setup / rest duration review | Instruction evidence | Conditional interpretation |','|---|---:|---|---|---|---|---|---|---|'];
 const latest=new Map((b?.rows||[]).map(r=>[r.id+'|'+r.step,r]));
 for(const r of a.rows){const n=latest.get(r.id+'|'+r.step);out.push('| '+[r.id+' '+r.name,r.step,r.t+' / '+r.range,r.tags.join(', '),r.normal+' / '+r.slow,n?n.normal+' / '+n.slow:'not compared',[r.setup?(r.setupSmall?'equipment setup; <=2 min, review':'equipment setup; estimate in field'):'',r.restExceeds.length?(r.recurring?'recurring schedule, not a step overrun; tokens > t: ':'literal times > t, owner review: ')+r.restExceeds.map(x=>x.literal).join(', '):'',r.explicit.length?'tokens: '+r.explicit.map(x=>x.literal).join(', '):''].filter(Boolean).join('; '),r.text,r.conditional].map(cell).join(' | ')+' |');}
 return out.join('\n').trimEnd()+'\n';
}
if(require.main===module){const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1];if(!args.includes('--root'))throw new Error('Use --root <reviewed worktree>');process.stdout.write(report(evidence(get('--root')),args.includes('--compare')?evidence(get('--compare')):null));}
module.exports={evidence,report,literalDurations};
