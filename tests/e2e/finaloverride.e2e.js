'use strict';
const {check,eq,ok}=require('./harness.js'),D=require('../../hm-data.js');
const cid='c:ט:3',other='c:י:1';
const seed={lang:'en','schema.version':D.SCHEMA_VERSION,'grades.periods':['Q1','Q2'],'grades.examCols':{Q1:['manual']},'ft.classes':{[cid]:{id:cid,name:'Grade 9',grade:'ט',num:3},[other]:{id:other,name:'Grade 10',grade:'י',num:1}},'stu.list':[{id:'a',cid,cls:'Grade 9',name:'Same',tests:[],grades:{Q1:{part:80,exams:{manual:75}},Q2:{part:60}}},{id:'b',cid,cls:'Grade 9',name:'Same',tests:[]},{id:'c',cid:other,cls:'Grade 10',name:'Other',tests:[],grades:{Q1:{part:90}}}],'ft.results':[{sid:'a',cid,test:'push',val:35,d:'2026-10-03'}]};
const row=p=>p.locator('#gr-table tr[data-sid="a"]');
const data=p=>p.evaluate(()=>window.HM.LS.get('stu.list'));
async function open(p,id='a'){await p.evaluate(cid=>window.STU.show(cid,'grades'),cid);await p.locator('[data-final-edit="'+id+'"]').click();}
async function fill(p,value,note=''){await p.locator('#gr-overrideValue').fill(value);await p.locator('#gr-overrideNote').fill(note);}
module.exports={title:'Explicit teacher final grades',tests:[
check('save and reload retain components/history, optional note and other pupils/periods; hub agrees',seed,async p=>{
 const before=await data(p);await open(p);await fill(p,'86.5');await p.locator('#gr-overrideSave').click();eq((await data(p))[0].grades.Q1.finalOverride,{value:86.5,note:''});eq((await data(p))[0].grades.Q2,before[0].grades.Q2);eq((await data(p)).slice(1),before.slice(1));
 await p.reload();await p.evaluate(cid=>window.STU.show(cid,'grades'),cid);ok((await row(p).innerText()).includes('86.5'));ok((await row(p).innerText()).includes('Set by teacher'));eq(await p.evaluate(cid=>window.STU.summary(cid).graded,cid),1);eq((await data(p))[0].grades.Q1.exams,{manual:75});eq(await p.evaluate(()=>window.HM.LS.get('ft.results').length),1);
 await row(p).locator('[data-f="part"]').fill('0');await row(p).locator('[data-f="part"]').dispatchEvent('change');eq((await data(p))[0].grades.Q1.finalOverride.value,86.5);await row(p).locator('details').evaluate(e=>e.open=true);ok((await row(p).innerText()).includes('6.0'));
}),
check('explicit removal restores provisional basis and missing components; zero remains valid',seed,async p=>{
 await open(p);await fill(p,'0','Review');await p.locator('#gr-overrideSave').click();eq((await data(p))[0].grades.Q1.finalOverride.value,0);await row(p).locator('[data-final-edit]').click();await p.locator('#gr-overrideReset').click();ok(!(await data(p))[0].grades.Q1.finalOverride);ok((await row(p).innerText()).includes('62.0'));ok((await row(p).innerText()).includes('provisional'));eq(await p.evaluate(cid=>window.STU.summary(cid).graded,cid),0);
}),
check('empty/out-of-range grades cannot save; Back/Escape keeps or discards the draft explicitly',seed,async p=>{
 const before=await data(p);await open(p);await p.locator('#gr-overrideSave').click();ok((await p.locator('#gr-overrideError').innerText()).includes('0 to 100'));await fill(p,'101');await p.locator('#gr-overrideSave').click();eq(await data(p),before);await fill(p,'88','Optional');await p.locator('#gr-overrideValue').press('Escape');await p.locator('#ask-no').click();eq(await p.locator('#gr-overrideValue').inputValue(),'88');await p.evaluate(()=>window.HM.goBack());await p.locator('#ask-no').click();eq(await p.locator('#gr-overrideValue').inputValue(),'88');await p.locator('#gr-overrideCancel').click();await p.locator('#ask-ok').click();ok(!(await p.locator('#gr-overrideModal').count()));eq(await data(p),before);
}),
{...check('actual storage quota failure preserves saved roster and editable draft',seed,async p=>{
 const before=await data(p);await open(p);await fill(p,'88','Note');await p.evaluate(()=>{const orig=localStorage.setItem.bind(localStorage);localStorage.setItem=(k,v)=>{if(k==='peultimate.stu.list')throw new DOMException('Quota','QuotaExceededError');orig(k,v);};});await p.locator('#gr-overrideSave').click();eq(await data(p),before);eq(await p.locator('#gr-overrideValue').inputValue(),'88');ok((await p.locator('#gr-overrideError').innerText()).includes('failed'));
}),allow:/\[אחסון\].*stu\.list/},
check('stale grades, moved/duplicated pupils, changed period and weights cannot receive a draft decision',seed,async p=>{
 for(const change of ['grades','move','duplicate','period','weights']){
  await p.evaluate(seed=>{for(const [k,v] of Object.entries(seed))window.HM.LS.set(k,v);},seed);await open(p);await fill(p,'88');
  await p.evaluate(({change,other})=>{const h=window.HM,v=h.LS.get('stu.list');if(change==='grades'){v[0].grades.Q1.part=90;h.LS.set('stu.list',v);}if(change==='move'){v[0].cid=other;h.LS.set('stu.list',v);}if(change==='duplicate'){v[1].id='a';h.LS.set('stu.list',v);}if(change==='period')h.LS.set('grades.periods',['Q2']);if(change==='weights')h.LS.set('grades.weights',{part:100});},{change,other});
  const before=await data(p);await p.locator('#gr-overrideSave').click();eq(await data(p),before);ok((await p.locator('#gr-overrideError').innerText()).includes('changed'));await p.evaluate(()=>{window.HM.modal('gr-overrideModal',false);document.getElementById('gr-overrideModal').remove();});
 }
}),
check('invalid restored override is visible and can be explicitly removed; damaged containers are preserved', {...seed,'stu.list':seed['stu.list'].map((s,i)=>i? s:{...s,grades:{Q1:{part:80,exams:{manual:75},finalOverride:{value:200,note:''}}}})},async p=>{
 await open(p);ok((await p.locator('#gr-overrideModal').innerText()).includes('invalid'));await p.locator('#gr-overrideReset').click();ok(!(await data(p))[0].grades.Q1.finalOverride);await p.evaluate(()=>{const v=window.HM.LS.get('stu.list');v[0].grades=['legacy'];window.HM.LS.set('stu.list',v);});await open(p);ok(!(await p.locator('#gr-overrideModal').count()));eq((await data(p))[0].grades,['legacy']);
}),
check('Excel/CSV preserve teacher final, computed basis, missing list, optional note, stable identity and period',seed,async p=>{
 await open(p);await fill(p,'86','=Teacher note');await p.locator('#gr-overrideSave').click();const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#gr-csv').click()]);await download.saveAs('/tmp/pe-final-grade.csv');const fs=require('fs'),csv=fs.readFileSync('/tmp/pe-final-grade.csv','utf8');ok(csv.includes('Set by teacher'));ok(csv.includes("'=Teacher note"));ok(csv.includes('62'));ok(csv.includes('a,Q1'));const [xlsx]=await Promise.all([p.waitForEvent('download'),p.locator('#gr-xlsx').click()]);await xlsx.saveAs('/tmp/pe-final-grade.xlsx');
}),
check('backup restore and native mirror retain the teacher decision, including zero', {...seed,__native:"ios"},async p=>{
 await open(p);await fill(p,'0','Teacher');await p.locator('#gr-overrideSave').click();const b=await p.evaluate(async()=>{const h=window.HM,s=h.backupTest.snapshot();h.LS.set('stu.list',[]);return h.backupTest.apply(s);});eq(b.failed,0);eq((await data(p))[0].grades.Q1.finalOverride.value,0);await p.waitForFunction(()=>{const f=JSON.parse(localStorage.getItem('__fakefs')||'{}'),file=f['LIBRARY/pe-ultimate-data.json'];if(!file)return false;const v=JSON.parse(JSON.parse(file).data['peultimate.stu.list']);return v[0]?.grades?.Q1?.finalOverride?.value===0;});const mirror=await p.evaluate(()=>{const f=JSON.parse(localStorage.getItem('__fakefs'));return JSON.parse(JSON.parse(f['LIBRARY/pe-ultimate-data.json']).data['peultimate.stu.list']);});eq(mirror[0].grades.Q1.finalOverride,{value:0,note:'Teacher'});
}),
check('five languages keep explicit controls on a narrow phone and pupil navigation does not merge names',seed,async p=>{
 await p.setViewportSize({width:390,height:844});for(const lang of ['en','he','ar','ru','es']){await p.evaluate(l=>window.I18N.set(l),lang);await open(p,'b');ok((await p.locator('#gr-overrideModal').innerText()).includes('[b]'));ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));ok((await p.locator('#gr-overrideSave').innerText()).length>4);await p.locator('#gr-overrideCancel').click();}
 eq(await data(p),seed['stu.list']);await p.evaluate(()=>{const v=window.HM.LS.get('stu.list');v[0].id='';window.HM.LS.set('stu.list',v);window.STU.show('c:ט:3','grades');});await p.locator('[data-final-edit=""]').click();ok(!(await p.locator('#gr-overrideModal').count()));ok(!(await data(p))[0].grades.Q1.finalOverride);
})
]};
