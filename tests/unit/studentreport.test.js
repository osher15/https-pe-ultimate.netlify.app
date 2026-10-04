'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../../hm-assessment-student-report.js');
const policy={cid:'c:ט:3',period:'Q1',from:'2026-09-01',to:'2026-12-31'},measurement={sid:'001',cid:policy.cid,val:0,d:'2026-10-04'};
const pupil={studentId:'001',name:'Same',cid:policy.cid,period:'Q1',grades:{Q1:99},note:'PRIVATE',tests:[{testId:'push',dir:'high',status:'measured',history:[measurement,{...measurement,val:10,d:'2026-09-02'},{...measurement,sid:'OTHER',val:9876},{...measurement,d:'2026-08-31',val:4321}],best:measurement},{testId:'r60',dir:'low',status:'missing',history:[],reason:'PRIVATE_REASON'},{testId:'sit',dir:'high',status:'exempt',history:[],reason:'MEDICAL_SECRET'}]};
const snapshot={ok:true,policy,reports:[pupil,{...pupil,studentId:'OTHER',name:'OTHER_NAME',tests:[]}]};
test('personal report allowlist retains zero/date/history and excludes other pupils/private data',()=>{
 const before=JSON.stringify(snapshot),m=R.model(snapshot,'001');assert.equal(m.ok,true);assert.equal(m.value.missing,1);assert.equal(m.value.tests[0].value,0);assert.equal(m.value.tests[0].history.length,2);for(const token of ['OTHER','PRIVATE','MEDICAL','9876','4321','grades'])assert.ok(!JSON.stringify(m).includes(token));assert.equal(JSON.stringify(snapshot),before);
});
test('missing/exempt values stay blank and invalid history is visible without manufactured zero',()=>{
 const s=JSON.parse(JSON.stringify(snapshot));s.reports[0].tests[1].history=[{...measurement,val:0}];const m=R.model(s,'001');assert.equal(m.value.tests[1].value,null);assert.equal(m.value.tests[2].value,null);assert.deepEqual(m.value.tests[1].history,[{date:measurement.d,value:null,status:'invalid'}]);
});
test('unknown/duplicate IDs, wrong class/period, invalid range and invalid best refuse a document model',()=>{
 assert.equal(R.model(snapshot,'unknown').ok,false);assert.equal(R.model({...snapshot,reports:[pupil,pupil]},'001').ok,false);
 for(const p of [{...policy,cid:'g:fake'},{...policy,to:'bad'},{...policy,to:'2026-01-01'}])assert.equal(R.model({...snapshot,policy:p},'001').ok,false);
 for(const r of [{...pupil,cid:'c:other'},{...pupil,period:'Q2'},{...pupil,tests:[{...pupil.tests[0],best:{...measurement,sid:'OTHER'}}]}])assert.equal(R.model({...snapshot,reports:[r]},'001').ok,false);
});
test('offline script-free HTML escapes all text and includes history only on request',()=>{
 const s=JSON.parse(JSON.stringify(snapshot));s.reports[0].name='<img src=x onerror=bad()>';const m=R.model(s,'001');const options={lang:'ar',className:'<script>secret()</script>',catalog:[{id:'push',name:'<Test>',unit:'Reps'}],labels:{title:'Progress',summaryMissing:'Missing'}};const html=R.documentHtml(m,options);assert.ok(html.includes('dir="rtl"'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<script'));assert.ok(!/https?:\/\//.test(html));assert.ok(html.includes("script-src 'none'"));assert.ok(!html.includes('2026-09-02'));assert.ok(R.documentHtml(m,{...options,history:true}).includes('2026-09-02'));assert.throws(()=>R.documentHtml({ok:false}));
});
