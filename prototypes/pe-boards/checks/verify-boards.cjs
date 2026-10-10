const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const DIR=path.resolve(__dirname,'..');
const boardHTML=fs.readFileSync(path.join(DIR,'PE_Ultimate_Scoreboard.html'),'utf8');
const scripts=[...boardHTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length,2);
for(const source of scripts)new vm.Script(source);
const engineContext={module:{exports:{}}};vm.createContext(engineContext);vm.runInContext(scripts[0],engineContext);
const E=engineContext.module.exports;
const plain=x=>JSON.parse(JSON.stringify(x));
function parseNodes(html){
 const clean=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
 return [...clean.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)].map(m=>{
  const a=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
  return {tag:m[1],id:a.id,className:a.class||'',dataset:Object.fromEntries(Object.entries(a).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v])),value:a.value||''};
 });
}
const seed=parseNodes(boardHTML);
function app(shared=new Map(),now=1000000){
 const nodes=seed.map(n=>({...n,children:[],dataset:{...n.dataset},listeners:{},style:{},value:n.value||'',disabled:false,hidden:false,textContent:''}));
 function enrich(n){n.classList={add(k){n.className+=' '+k},remove(k){n.className=n.className.split(' ').filter(x=>x!==k).join(' ')},toggle(k,on){if(on)this.add(k);else this.remove(k)}};n.setAttribute=(k,v)=>n[k]=v;n.append=(...els)=>n.children.push(...els);n.replaceChildren=(...els)=>n.children=els;n.addEventListener=(k,fn)=>n.listeners[k]=fn;n.closest=q=>q==='[data-action]'&&n.dataset.action?n:null;n.showModal=()=>n.open=true;n.close=()=>n.open=false;n.remove=()=>{};n.click=()=>{if(!n.disabled&&n.onclick)n.onclick();};return n;}
 nodes.forEach(enrich);const root=enrich({className:'',children:[],listeners:{}}),body=enrich({className:'',children:[],listeners:{}});const events={};let revisionFails=false,answers=[];
 const doc={documentElement:root,body,getElementById:id=>nodes.find(x=>x.id===id),createElement:tag=>enrich({tag,className:'',dataset:{},children:[],listeners:{}}),querySelector:q=>q==='.footer-actions'?nodes.find(x=>x.className==='footer-actions'):null,querySelectorAll:q=>q==='[data-t]'?nodes.filter(x=>x.dataset.t):q==='[data-action]'?nodes.filter(x=>x.dataset.action):q==='[data-close]'?nodes.filter(x=>x.dataset.close):q==='.basket'?nodes.filter(x=>x.className.split(' ').includes('basket')):[],addEventListener:(k,fn)=>events[k]=fn,dispatchEvent:()=>{}};
 const intervals=[],winEvents={};class FakeDate extends Date{static now(){return now}}
 const store={getItem:k=>shared.get(k)??null,setItem:(k,v)=>{if(revisionFails)throw Error('quota');shared.set(k,v)},removeItem:k=>shared.delete(k)};
 const ctx={document:doc,Date:FakeDate,Math,JSON,Number,String,Boolean,Object,Array,Error,console,localStorage:store,confirm:()=>answers.length?answers.shift():true,setTimeout:()=>0,clearTimeout:()=>{},setInterval:f=>{intervals.push(f);return 1},CustomEvent:class{constructor(k,v){this.type=k;this.detail=v?.detail}},Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL:()=>{}}};ctx.window=ctx;ctx.globalThis=ctx;ctx.addEventListener=(k,fn)=>winEvents[k]=fn;
 vm.createContext(ctx);vm.runInContext(scripts[0],ctx);vm.runInContext(scripts[1].replace('const L={','const L=globalThis.__L={'),ctx);
 const el=id=>doc.getElementById(id),state=()=>JSON.parse(JSON.stringify(ctx.PEScoreboard.getState()));
 return {el,state,ctx,shared,nodes,events,winEvents,failSave:()=>revisionFails=true,answer:a=>answers=a,advance:ms=>{now+=ms;intervals.forEach(f=>f())},clickScore:(team,delta)=>el('pe-scoreboard').listeners.click({target:nodes.find(x=>x.dataset.action==='score'&&x.dataset.team===String(team)&&x.dataset.delta===String(delta))})};
}
test('deadline follows elapsed time, pause freezes, reload pauses actual remaining time',()=>{let s=E.create({minutes:1},0);E.action(s,'toggle',{},1000);E.tick(s,16500);assert.equal(s.remaining,44500);E.action(s,'toggle',{},16500);E.tick(s,30000);assert.equal(s.remaining,44500);E.action(s,'toggle',{},30000);E.reload(s,32000);assert.equal(s.remaining,42500);assert.equal(s.deadline,null);assert.equal(s.status,'paused');});
test('clock expires exactly once and never goes negative',()=>{const s=E.create({minutes:1});E.action(s,'toggle',{},0);E.tick(s,90000);assert.equal(s.remaining,0);assert.equal(s.status,'periodEnd');assert.equal(E.action(s,'toggle',{},90000),false);});
test('halves preserve totals, reset period fouls and record score deltas',()=>{const s=E.create({mode:'halves',count:2});E.action(s,'score',{team:0,delta:3});E.action(s,'foul',{team:0,delta:1});E.action(s,'next');assert.equal(s.period,2);assert.deepEqual(plain(s.fouls),[0,0]);assert.deepEqual(plain(s.periods[0].score),[3,0]);E.action(s,'score',{team:1,delta:2});E.action(s,'finish');assert.deepEqual(plain(s.periods.map(p=>p.score)),[[3,0],[0,2]]);assert(E.valid(s));});
test('finish is idempotent, undo reopens for correction and finalizes once',()=>{const s=E.create();E.action(s,'score',{team:0,delta:1});assert(E.action(s,'finish'));assert.equal(E.action(s,'finish'),false);assert.equal(s.periods.length,1);assert(E.action(s,'undo'));E.action(s,'score',{team:0,delta:1});E.action(s,'finish');assert.equal(s.periods.length,1);assert.equal(s.scores[0],2);});
test('timeouts pause the main clock, expire without restarting and can be undone',()=>{const s=E.create({timeout:10});E.action(s,'toggle',{},0);E.action(s,'timeout',{team:1},5000);assert.equal(s.remaining,595000);assert.equal(s.deadline,null);assert.equal(s.timeouts[1],1);assert.equal(E.action(s,'timeout',{team:0},6000),false);E.tick(s,15000);assert.equal(s.timeout,null);assert.equal(s.deadline,null);E.action(s,'undo',{},17000);assert.equal(s.timeouts[1],0);assert.equal(s.remaining,595000);});
test('overtime works after regular periods; history and periods are bounded',()=>{const s=E.create({count:1,overtime:3});for(let i=0;i<100;i++)E.action(s,'score',{team:0,delta:1});assert.equal(s.history.length,40);for(let i=1;i<50;i++)assert(E.action(s,'overtime'));assert.equal(s.period,50);assert.equal(s.remaining,180000);assert.equal(E.action(s,'overtime'),false);assert(E.valid(s));});
test('scores/fouls never negative; previous completed period cannot silently be changed',()=>{const s=E.create();assert.equal(E.action(s,'score',{team:0,delta:-1}),false);E.action(s,'score',{team:0,delta:2});E.action(s,'next');assert.equal(E.action(s,'score',{team:0,delta:-1}),false);E.action(s,'edit',{a:0,b:0,minutes:0,seconds:30});assert.equal(s.scores[0],2);assert.equal(s.remaining,30000);assert(E.valid(s));});
test('data validation rejects invalid scores and broken period totals',()=>{const s=E.create();assert(E.valid(s));s.scores[0]=-1;assert(!E.valid(s));const n=E.create();E.action(n,'score',{team:0,delta:3});E.action(n,'next');n.periods[0].total[0]=99;assert(!E.valid(n));});
test('full application script starts English, saves independently and scores via handlers',()=>{const a=app();assert.equal(a.ctx.document.documentElement.lang,'en');assert(a.shared.has('pe-scoreboard.v1'));a.clickScore(0,3);assert.equal(a.el('score0').textContent,3);assert.equal(a.state().scores[0],3);assert.equal(a.shared.size,1);assert(a.el('save').textContent.startsWith('Saved'));});
test('all five dictionaries cover every English key; Hebrew changes direction',()=>{const a=app();for(const l of Object.values(a.ctx.__L))assert.deepEqual(Object.keys(l).sort(),Object.keys(a.ctx.__L.en).sort());a.el('language').value='he';a.el('language').onchange();assert.equal(a.ctx.document.documentElement.dir,'rtl');assert.equal(a.el('title'),undefined);assert.equal(a.el('toggle').textContent,'הפעלה');});
test('finish handler saves once; undo removes final archive then corrected result replaces it',()=>{const a=app();a.clickScore(0,1);a.el('finish').click();a.el('finish').click();let p=JSON.parse(a.shared.get('pe-scoreboard.v1'));assert.equal(p.records.length,1);a.el('undo').click();assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).records.length,0);a.clickScore(0,2);a.el('finish').click();p=JSON.parse(a.shared.get('pe-scoreboard.v1'));assert.equal(p.records.length,1);assert.equal(p.records[0].scores[0],3);});
test('reload preserves scores, expires elapsed time, and pauses clock',()=>{const a=app();a.clickScore(1,2);a.el('toggle').click();const b=app(a.shared,1005000);assert.equal(b.state().scores[1],2);assert.equal(b.state().remaining,595000);assert.equal(b.state().status,'paused');assert.equal(b.state().deadline,null);});
test('saving failure is honest and keeps in-memory score',()=>{const a=app();a.failSave();a.clickScore(0,1);assert.equal(a.state().scores[0],1);assert(a.el('save').textContent.startsWith('Not saved'));assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).current.scores[0],0);});
test('second tab revision does not overwrite another match',()=>{const a=app(),b=app(a.shared);b.clickScore(1,3);a.clickScore(0,2);assert.equal(a.state().scores[0],2);assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).current.scores[0],0);assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).current.scores[1],3);assert(a.el('save').textContent.includes('another tab'));});
test('corrupted storage is kept untouched until explicit new-match approval',()=>{const m=new Map([['pe-scoreboard.v1','{broken']]);const a=app(m);a.clickScore(0,1);assert.equal(m.get('pe-scoreboard.v1'),'{broken');a.el('new').click();a.answer([false]);a.el('setupForm').onsubmit({preventDefault(){}});assert.equal(m.get('pe-scoreboard.v1'),'{broken');});
test('saved results capped at 20; current survives clearing archive',()=>{const a=app();for(let i=0;i<22;i++){a.clickScore(0,1);a.el('finish').click();a.el('new').click();a.el('setupForm').onsubmit({preventDefault(){}});}const p=JSON.parse(a.shared.get('pe-scoreboard.v1'));assert.equal(p.records.length,20);const id=a.state().id;a.el('clearArchive').click();assert.equal(a.state().id,id);assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).records.length,0);});
test('untrusted team names are rendered as text and no external resource loads exist',()=>{const a=app();a.el('new').click();a.el('teamA').value='<img src=x onerror=alert(1)>';a.el('setupForm').onsubmit({preventDefault(){}});assert.equal(a.el('name0').textContent,'<img src=x onerror=alert(1)>');const html=boardHTML;assert(!/<script[^>]+src=|<link[^>]+href=|<img[^>]+src=|@import|fetch\(/i.test(html));});
test('final score can be corrected after reload and re-finalized with same match ID',()=>{const a=app();a.clickScore(0,3);a.el('finish').click();const b=app(a.shared);const id=b.state().id;b.el('edit').click();assert.equal(b.el('editA').min,0);b.el('editA').value=1;b.el('editB').value=4;b.el('editMinutes').value=0;b.el('editSeconds').value=0;b.el('editForm').onsubmit({preventDefault(){}});assert.equal(b.state().status,'periodEnd');assert.equal(b.state().id,id);b.el('finish').click();const result=JSON.parse(b.shared.get('pe-scoreboard.v1'));assert.equal(result.records.length,1);assert.deepEqual(result.records[0].scores,[1,4]);assert.deepEqual(result.records[0].periods[0].score,[1,4]);});
test('cancelling a final edit leaves the saved final untouched',()=>{const a=app();a.el('finish').click();a.el('edit').click();assert.equal(a.state().status,'final');assert.equal(JSON.parse(a.shared.get('pe-scoreboard.v1')).records.length,1);});
// Coach pure-function checks execute selected original declarations, not rewritten logic.
const coachHTML=fs.readFileSync(path.join(DIR,'PE_Coach_Board.html'),'utf8');
const coachSource=[...coachHTML.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
new vm.Script(coachSource);
function declaration(name){
 const start=coachSource.indexOf('function '+name+'(');assert(start>=0,name);
 const open=coachSource.indexOf('{',start);let depth=0;
 // Selected declarations contain no braces inside strings/templates.
 for(let i=open;i<coachSource.length;i++){if(coachSource[i]==='{')depth++;if(coachSource[i]==='}'&&--depth===0)return coachSource.slice(start,i+1);}
 throw Error('Unclosed declaration: '+name);
}
const coachContext={};vm.createContext(coachContext);
const constants=['const sports=','const exampleNames='].map(prefix=>coachSource.split('\n').find(x=>x.startsWith(prefix))).join('\n');
vm.runInContext("let lang='en';const clone=x=>JSON.parse(JSON.stringify(x));const t=k=>k==='newTitle'?'My coaching scenario':k;\n"+constants+'\n'+['id','formation','fresh','pathPosition','positionsAt','validate','demo'].map(declaration).join('\n')+'\nglobalThis.API={fresh,pathPosition,positionsAt,validate,demo,sports};',coachContext);
const C=coachContext.API;
for(const sport of ['basketball','football','volleyball','handball'])for(let i=0;i<3;i++)test('coach '+sport+' demonstration '+(i+1)+' validates, round-trips and preserves phase continuity',()=>{
 const s=C.demo(sport,i);C.validate(s);C.validate(JSON.parse(JSON.stringify(s)));
 for(let p=0;p<s.phases.length;p++){
  const phase=s.phases[p],end=C.positionsAt(phase,1);
  for(const c of phase.commands){const e=end.find(x=>x.id===c.entityId),last=c.points.at(-1);assert(Math.abs(e.x-last.x)<1e-9);assert(Math.abs(e.y-last.y)<1e-9);}
  if(p+1<s.phases.length)assert.deepEqual(plain(end),plain(s.phases[p+1].entities));
 }
});
test('coach player-count limits and sport defaults',()=>{for(const sport of Object.keys(C.sports)){let s=C.fresh(sport);C.validate(s);assert.equal(s.phases[0].entities.filter(e=>e.team==='A').length,C.sports[sport].n);s=C.fresh(sport,50,-2);C.validate(s);assert.equal(s.phases[0].entities.filter(e=>e.team==='A').length,22);assert.equal(s.phases[0].entities.filter(e=>e.team==='B').length,0);}});
test('coach rejects corrupted schema, duplicate IDs, bad routes and volleyball dribble',()=>{
 let s=C.fresh();s.schema='other';assert.throws(()=>C.validate(s));
 s=C.fresh();s.phases[0].entities[1].id=s.phases[0].entities[0].id;assert.throws(()=>C.validate(s));
 s=C.demo('basketball',0);s.phases[0].commands[0].points[0].x=1e9;assert.throws(()=>C.validate(s));
 s=C.fresh('volleyball');const entities=s.phases[0].entities;s.phases[0].commands.push({id:'route',type:'dribble',entityId:entities[0].id,ballId:entities.at(-1).id,points:[{x:10,y:10},{x:20,y:20}]});assert.throws(()=>C.validate(s));
});
test('coach dribble preserves ball offset and interpolates distance',()=>{const s=C.demo('basketball',1),p=s.phases[0],route=p.commands.find(c=>c.type==='dribble');const start=p.entities.find(e=>e.id===route.entityId),ball=p.entities.find(e=>e.id===route.ballId);const mid=C.positionsAt(p,.5),playerMid=mid.find(e=>e.id===start.id),ballMid=mid.find(e=>e.id===ball.id);assert.equal(ballMid.x-playerMid.x,ball.x-start.x);assert.equal(ballMid.y-playerMid.y,ball.y-start.y);assert.equal(playerMid.x,(route.points[0].x+route.points.at(-1).x)/2);});
test('both files have unique element IDs and no runtime remote assets',()=>{for(const html of [boardHTML,coachHTML]){const nodes=parseNodes(html),ids=nodes.map(n=>n.id).filter(Boolean);assert.equal(ids.length,new Set(ids).size);assert(!/<script[^>]+src=|<link[^>]+href=|<img[^>]+src=|@import|fetch\(/i.test(html));}});
