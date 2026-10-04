'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),P=require('../../hm-assessment-paste.js');
const reports=[{studentId:'001',name:'Same',tests:[{testId:'push',status:'measured'},{testId:'r60',status:'missing'}]},{studentId:'002',name:'Same',tests:[{testId:'push',status:'missing'},{testId:'r60',status:'missing'}]}],tests=['push','r60'];
const parse=text=>P.parse(text,reports,tests);
test('Excel template preserves exact text IDs and names with blank new measurements',()=>{
 const before=JSON.stringify(reports);assert.deepEqual(P.template(reports,tests),[['sid','name','push','r60'],['001','Same','',''],['002','Same','','']]);assert.equal(JSON.stringify(reports),before);
});
test('paste matches IDs rather than names and preserves numeric zero/decimal comma',()=>{
 const r=parse('sid\tname\tpush\tr60\r\n002\tRenamed\t0\t9,25\r\n001\tSame\t30\t\r\n');assert.equal(r.ok,true);assert.equal(r.pupils,2);assert.deepEqual(r.entries,[{sid:'002',test:'push',value:0},{sid:'002',test:'r60',value:9.25},{sid:'001',test:'push',value:30}]);
});
test('headers can reorder columns but cannot omit, duplicate or invent one',()=>{
 assert.deepEqual(parse('r60\tpush\tname\tsid\n9.25\t20\tSame\t001').entries,[{sid:'001',test:'push',value:20},{sid:'001',test:'r60',value:9.25}]);
 for(const h of ['sid\tname\tpush','sid\tname\tpush\tpush','sid\tname\tpush\tunknown','sid,name,push,r60'])assert.equal(parse(h+'\n001\tSame\t30\t').error,'header');
});
test('quoted spreadsheet cells support tabs, multiline names, escaped quotes and BOM',()=>{
 const r=parse('\uFEFFsid\tname\tpush\tr60\n001\t"Same\tname\n""quoted"""\t"40"\t');assert.equal(r.ok,true);assert.equal(r.entries[0].value,40);
});
test('unknown, whitespace-altered, leading-zero-lost and duplicate identities fail atomically',()=>{
 for(const id of ['missing','1',' 001','001 '])assert.equal(parse('sid\tname\tpush\tr60\n'+id+'\tSame\t30\t').error,'identity');
 const duplicate=parse('sid\tname\tpush\tr60\n001\tSame\t30\t\n001\tSame\t\t9');assert.equal(duplicate.error,'duplicate');assert.equal(duplicate.entries,undefined);assert.equal(duplicate.row,3);
});
test('formulae, thousands grouping, exponents and excess decimal places are rejected',()=>{
 for(const value of ['=20','+20','@20','1 000','1,000','1.000','1,234.5','1e2','NaN','Infinity','9.123','-']){const r=parse('sid\tname\tpush\tr60\n001\tSame\t30\t'+value);assert.equal(r.error,'number',value);assert.equal(r.entries,undefined);assert.equal(r.column,'r60');}
});
test('ragged rows, open quotes and quote suffixes never produce partial entries',()=>{
 for(const tail of ['001\tSame\t30','001\t"Same\t30\t','001\t"Same"oops\t30\t','001\tSa"me\t30\t'])assert.equal(parse('sid\tname\tpush\tr60\n'+tail).error,'format');
});
test('blank cells and trailing blank rows add nothing and explicit exemption is respected',()=>{
 assert.equal(parse('sid\tname\tpush\tr60\n001\tSame\t\t\n\n').error,'empty');assert.equal(parse('').error,'empty');
 const r=JSON.parse(JSON.stringify(reports));r[0].tests[0].status='exempt';assert.equal(P.parse('sid\tname\tpush\tr60\n001\tSame\t0\t',r,tests).error,'exempt');
 assert.equal(P.parse('sid\tname\tpush\tr60\n001\tSame\t\t9.25',r,tests).ok,true);
});
test('oversized text, columns, rows and measurement batches are bounded',()=>{
 assert.equal(parse('x'.repeat(1048577)).error,'size');assert.equal(parse(Array(102).fill('x').join('\t')).error,'size');assert.equal(parse('x\n'.repeat(10001)).error,'size');
 const pupils=Array.from({length:2001},(_,i)=>({studentId:String(i),name:'N',tests:[{testId:'push',status:'missing'}]}));const text='sid\tname\tpush\n'+pupils.map(p=>p.studentId+'\tN\t0').join('\n');assert.equal(P.parse(text,pupils,['push']).error,'size');
});
test('ambiguous pupil identities cannot supply a paste mapping',()=>{
 assert.equal(P.parse('sid\tname\tpush\tr60\n001\tSame\t30\t',reports.concat(reports[0]),tests).error,'identity');
});
