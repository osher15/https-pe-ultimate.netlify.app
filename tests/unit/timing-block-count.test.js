'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('path'),D=require('../../hm-data');
const audit=require('../../tools/timing-audit-v2');
const opts={pace:'normal',trans:'normal',water:true,weather:'normal'};
const model=audit.loadModel(path.resolve(__dirname,'../..'));
test('R-T1: 45-minute automatic split removes 70 avoidable overruns across 108 variants',()=>{
 let variants=0,oldOver=0,newOver=0;
 for(const t of model.topics)for(const grade of ['mid','high']){
  const pool=t.main[grade];const old=audit.slots({...model,poolAware:false},45,false,'normal',pool.length);
  const now=audit.slots(model,45,false,'normal',pool.length,pool,opts);
  assert.equal(now.allocations.reduce((a,b)=>a+b,0),now.main);
  for(const v of pool){variants++;if(old.allocations.some(n=>D.variantFit(v,n,opts).status==='over'))oldOver++;
   if(now.allocations.some(n=>D.variantFit(v,n,opts).status==='over'))newOver++;
   for(const n of now.allocations){const f=D.variantFit(v,n,opts);assert.ok(Number.isInteger(n));assert.ok(f.fitted.every(Number.isInteger));}
  }
 }
 assert.equal(variants,108);assert.equal(oldOver,71);assert.equal(newOver,1); // One speed/high variant has a 34-minute minimum in a 32-minute window.
});
test('Automatic count reflects equipment-available pool and retains nonblocking fallback',()=>{
 const small={n:'Small',d:['work'],t:[5],need:['כדור סל']};
 const large={n:'Large',d:['work'],t:[20],need:['כדור רגל']};
 assert.equal(D.automaticBlockCount([],30,opts),1);
 assert.equal(D.automaticBlockCount([small,{...small,n:'Second'},large],20,opts),1);
 assert.equal(D.automaticBlockCount([small,{...small,n:'Second'},large],20,opts,['כדור רגל']),2);
 for(const mins of [0,NaN,Infinity,10.5,45])assert.ok(Number.isInteger(D.automaticBlockCount([small,large],mins,opts)));
 const f=D.variantFit(small,30,opts);assert.equal(f.status,'short');assert.ok(f.gap>0,'free-play residual remains explicit');
});
test('Automatic split never has worse worst overrun than other allowed whole-minute counts',()=>{
 for(const t of model.topics)for(const grade of ['mid','high'])for(const minutes of [8,16,31,32,54,55,74]){
  const pool=t.main[grade],count=D.automaticBlockCount(pool,minutes,opts);
  const worst=n=>{let over=0,per=Math.floor(minutes/n);for(let i=0;i<n;i++)for(const v of pool){let f=D.variantFit(v,i===n-1?minutes-per*(n-1):per,opts);if(f.status==='over')over=Math.max(over,f.gap);}return over;};
  for(let n=1;n<=Math.min(3,pool.length);n++)assert.ok(worst(count)<=worst(n));
 }
});
