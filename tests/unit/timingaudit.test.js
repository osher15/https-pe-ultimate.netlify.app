"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict');
const timing=require('../../tools/timing-audit'),games=require('../../tools/games-audit');
test('timing audit covers every actual variant and option combination deterministically',()=>{
 const a=timing.audit(),b=timing.audit();
 assert.equal(a.scenarioCount,a.variantCount*3*108);
 assert.equal(a.equipmentCount,a.variantCount*19);
 assert.equal(JSON.stringify(a),JSON.stringify(b));
 assert.ok(a.invalid.every(x=>x.terminated));
 for(const r of a.rows){if(r.status==='unknown')continue;assert.equal(r.total,r.work+r.overhead);assert.equal(r.delta,r.total-r.allocated);}
});
test('games audit counts main data and exception rows reproducibly',()=>{
 const a=games.audit(),b=games.audit();assert.equal(JSON.stringify(a),JSON.stringify(b));
 assert.equal(a.exceptionCount,a.exceptions.length);assert.equal(a.difference,a.count-a.expected);
 assert.ok(a.exceptions.every(e=>['approve','fix'].includes(e.action)&&e.id&&e.kind));
});
