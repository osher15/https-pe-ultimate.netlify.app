"use strict";
const {check,eq,ok}=require('./harness.js');
const seed={lang:'en','pf.guideSeen':true,'ft.results':[{id:'old',sid:'a',cls:'ט3',test:'push',val:0,d:'2026-10-01'}],'stu.list':[{id:'a',name:'Pupil',grades:{Q1:{finalOverride:{value:87,note:'private'}}}}],'assessment.policies':{version:1,policies:[]}};
async function failure(p,mode){return p.evaluate(async mode=>{
 const h=window.HM,snap=h.backupTest.snapshot();snap.data['ft.results']='[]';snap.data['z.new']='"incoming"';
 const old=h.backupTest.snapshot().data,set=localStorage.setItem.bind(localStorage),get=localStorage.getItem.bind(localStorage),remove=localStorage.removeItem.bind(localStorage);
 const imports=window.REC&&window.REC.importAll;let media=0;if(imports)window.REC.importAll=async()=>{media++;return {added:1,failed:0};};snap.idb={items:[]};
 localStorage.setItem=(k,v)=>{if(k==='peultimate.z.new'||(mode==='permanent'&&k==='peultimate.ft.results'&&v===old['ft.results']))throw new DOMException('blocked','QuotaExceededError');return set(k,v);};
 if(mode==='read')localStorage.getItem=k=>{if(k==='peultimate.ft.results')throw Error('read blocked');return get(k);};
 let r;try{r=await h.backupTest.apply(snap);}catch(e){r={rejected:true};}
 localStorage.setItem=set;localStorage.getItem=get;localStorage.removeItem=remove;if(imports)window.REC.importAll=imports;
 return {r:{failed:r.failed,rolledBack:r.rolledBack,rejected:r.rejected,recovery:r.recovery},old,now:h.backupTest.snapshot().data,media};
},mode);}
module.exports={title:'Backup rollback review',allow:/\[אחסון\]/,tests:[
 check('partial restore restores exact measurements, decisions and configuration',seed,async p=>{const v=await failure(p,'partial');eq(v.r.rolledBack,true);eq(v.now,v.old);eq(v.media,0);}),
 check('simulated iOS mirror returns to previous measurements after rollback',{...seed,__native:'ios'},async p=>{const v=await failure(p,'partial');eq(v.r.rolledBack,true);await p.waitForFunction(old=>{const f=JSON.parse(localStorage.getItem('__fakefs')||'{}'),file=f['LIBRARY/pe-ultimate-data.json'];return file&&JSON.parse(file).data['peultimate.ft.results']===old;},v.old['ft.results']);}),
 check('unreadable current storage aborts before writes',seed,async p=>{const v=await failure(p,'read');eq(v.r.rejected,true);eq(v.now,v.old);eq(v.media,0);}),
 check('permanent backend failure reports incomplete rollback with recovery data',seed,async p=>{const v=await failure(p,'permanent');eq(v.r.rolledBack,false);require('node:assert/strict').deepEqual(v.r.recovery,v.old);ok(v.now['ft.results']!==v.old['ft.results']);eq(v.media,0);}),
 check('malformed incoming backup never erases current data',seed,async p=>{const v=await p.evaluate(async()=>{const b=window.HM.backupTest,before=b.snapshot().data;let rejected=false;try{await b.apply({data:{a:'1'}});}catch(e){rejected=true;}return {before,after:b.snapshot().data,rejected};});eq(v.rejected,true);eq(v.after,v.before);}),
 check('failed UI restore keeps preview, allows retry and downloads exact recovery copy',seed,async p=>{
 const snap=await p.evaluate(()=>{const b=window.HM.backupTest.snapshot();window.__previous=b.data;b.data={...b.data,'z.new':'"incoming"'};return b;});
 await p.evaluate(()=>window.HM.openSettings('backup'));await p.setInputFiles('#set-bkFile',{name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snap))});
 await p.locator('#bk-go').waitFor({state:'visible'});
 await p.evaluate(()=>{const set=localStorage.setItem.bind(localStorage);window.__restoreSet=set;localStorage.setItem=(k,v)=>{if(k==='peultimate.z.new')throw new DOMException('blocked','QuotaExceededError');return set(k,v);};window.__marker='same-page';});
 await p.locator('#bk-go').click();await p.locator('#ask-ok').click();await p.locator('#bk-recovery').waitFor({state:'visible'});
 ok(await p.locator('#bk-modal').isVisible());eq(await p.locator('#bk-go').isEnabled(),true);ok((await p.locator('#bk-warn').innerText()).includes('verified'));
 const download=p.waitForEvent('download');await p.locator('#bk-recovery').click();const file=await (await download).path();const copy=JSON.parse(require('fs').readFileSync(file,'utf8'));require('node:assert/strict').deepEqual(copy.data,await p.evaluate(()=>window.__previous));ok(!copy.idb);
 await p.waitForTimeout(2700);eq(await p.evaluate(()=>window.__marker),'same-page');
 await p.evaluate(()=>{localStorage.setItem=window.__restoreSet;});await p.locator('#bk-go').click();await p.locator('#ask-ok').click();await p.waitForFunction(()=>localStorage.getItem('peultimate.z.new')==='"incoming"');
 }),
 check('failure/recovery controls are translated in five languages',seed,async p=>{const values=await p.evaluate(()=>['en','he','ar','ru','es'].map(lang=>{window.I18N.set(lang);return window.I18N.t('br.recovery','שמור עותק הצלה של הנתונים הקודמים (ללא סרטונים)');}));eq(new Set(values).size,5);ok(values.every(v=>v&&!v.includes('br.recovery')));})
]};
