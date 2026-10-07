"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const T=require('../../tools/timing-audit-v2'),E=require('../../tools/transition-evidence');
const root=process.env.PE_TIMING_AUDIT_ROOT;
test('v2 rejects an unsupported source instead of silently auditing a different model',()=>{
 if(!root)assert.throws(()=>T.loadModel(path.resolve(__dirname,'../..')),/reviewed automatic block-count model/);
 else assert.equal(T.loadModel(root).topics.length,21);
});
test('v2 conserves block windows and exposes every candidate and lesson length',()=>{
 if(!root){assert.throws(()=>T.audit('/tmp/pe-no-such-source'),/ENOENT/);return;}
 const a=T.audit(root),model=T.loadModel(root);assert.equal(a.variantCount,108);
 assert.equal(a.summaries.length,4);
 assert.equal(new Set(a.rows.map(r=>r.id+'|'+r.length)).size,a.variantCount*4);
 for(const length of [45,50,60,90])for(const game of [false,true])for(const weather of ['normal','cold','hot']){
  const s=T.slots(model,length,game,weather,3);
  assert.equal(s.allocations.reduce((x,y)=>x+y,0),s.main);
  assert.equal(s.main+s.warm+s.cool+s.game,length);
  assert.ok(s.allocations.every(x=>Number.isInteger(x)&&x>0));
 }
 for(const r of a.rows){assert.equal(r.total,r.fitted.reduce((x,y)=>x+y,0)+r.overhead);assert.equal(r.total+r.free-r.over,r.allocated);}
 assert.equal(JSON.stringify(a),JSON.stringify(T.audit(root)));
});
test('transition evidence distinguishes units and covers every source step',()=>{
 assert.deepEqual(E.literalDurations('מנוחה 30 שניות, מעבר 1–2 דק׳'),[{literal:'30 שניות',minutes:.5},{literal:'1–2 דק׳',minutes:2}]);
 if(!root)return;
 const a=E.evidence(root),m=T.loadModel(root);
 const total=m.topics.flatMap(t=>['mid','high'].flatMap(g=>t.main[g]||[])).reduce((n,v)=>n+v.d.length,0);
 assert.equal(a.rows.length,total);assert.equal(a.variantCount,108);
 const rotation=a.rows.find(r=>r.id==='basket/high/2'&&r.step===1);
 assert.equal(rotation.recurring,true);assert.equal(rotation.restExceeds[0].minutes,5);
});
