'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),G=require('../../hm-assessment-grid.js');
const cid='c:ט:3',other='c:י:1',defs=[{id:'push',dir:'high',kind:'count',unit:'reps'},{id:'r60',dir:'low',kind:'clock',unit:'seconds'}],p={cid,period:'Q1',from:'2026-09-01',to:'2026-12-31',tests:[{id:'push'},{id:'r60'}],exemptions:[]},students=[{id:'a',cid,name:'Same',grades:{Q1:{finalOverride:{value:87,note:''}}}},{id:'b',cid,name:'Same'},{id:'c',cid:other,name:'Other'}],rows=[{id:'old',sid:'a',cid,test:'push',val:35,d:'2026-09-02'}];
const batch={date:'2026-10-04',entries:[{sid:'a',test:'push',value:0},{sid:'b',test:'r60',value:9.25}],ids:['new1','new2'],ts:123,normVer:'v1'};
const run=(b=batch,s=students,m=rows,policy=p)=>G.append(s,m,policy,defs,null,b);
test('batch append keeps all history and grades, stable duplicate-name identities and actual zero',()=>{
 const before=JSON.stringify({students,rows,p,batch}),r=run();assert.equal(r.ok,true);assert.equal(r.added,2);assert.deepEqual(r.rows[0],rows[0]);assert.equal(r.rows[1].sid,'a');assert.equal(r.rows[1].val,0);assert.equal(r.rows[2].sid,'b');assert.equal(r.rows[2].unit,'seconds');assert.equal(r.rows[1].normVer,'v1');assert.equal(r.rows[1].sessionId,null);assert.equal(JSON.stringify({students,rows,p,batch}),before);
});
test('valid inclusive boundaries and real dates are enforced',()=>{
 for(const date of [p.from,p.to])assert.equal(run({...batch,date}).ok,true);
 for(const date of ['2026-08-31','2027-01-01','2026-02-30',''])assert.equal(run({...batch,date}).error,'date');
});
test('invalid values reject the whole batch: zero time, fractional repetitions and overprecision',()=>{
 for(const [testId,value] of [['r60',0],['push',-1],['push',1.5],['r60',1.234],['r60',NaN],['r60',Infinity],['push','0']]){const r=run({...batch,entries:[batch.entries[0],{sid:'b',test:testId,value}]});assert.equal(r.ok,false);assert.equal(r.error,'value');}
});
test('moved, unknown, empty and globally duplicated identities cannot be written',()=>{
 for(const sid of ['c','gone',''])assert.equal(run({...batch,entries:[{sid,test:'push',value:10}],ids:['new1']}).error,'identity');
 assert.equal(run(batch,students.concat({id:'a',cid:other,name:'Different'})).error,'identity');
});
test('exemptions, unrequired tests and duplicate cells block the whole write',()=>{
 assert.equal(run(batch,students,rows,{...p,exemptions:[{sid:'a',test:'push',reason:'Injury'}]}).error,'exempt');
 assert.equal(run({...batch,entries:[{sid:'a',test:'other',value:1}],ids:['new1']}).error,'invalid');
 assert.equal(run({...batch,entries:[batch.entries[0],batch.entries[0]]}).error,'invalid');
});
test('empty batches and invalid/colliding measurement IDs do not append',()=>{
 assert.equal(run({...batch,entries:[],ids:[]}).error,'empty');
 for(const ids of [['old','new2'],['same','same'],['new1'],[null,'new2']])assert.equal(run({...batch,ids}).error,'invalid');
});
test('legacy damaged rows are preserved but invalid outer storage and policies are blocked',()=>{
 const malformed=rows.concat(null,'legacy');assert.deepEqual(run(batch,students,malformed).rows.slice(0,3),malformed);
 assert.equal(run(batch,null).error,'invalid');assert.equal(run(batch,students,{}).error,'invalid');assert.equal(run(batch,students,rows,{...p,cid:'g:fake'}).error,'invalid');
});
