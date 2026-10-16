'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');
const {runDeviceDataChecks}=require('./device-data.cjs');
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.basename(req.url.split('?')[0]);if(!['PE_Coach_Board.html','PE_Ultimate_Scoreboard.html'].includes(file)){res.writeHead(404);return res.end();}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,file)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';const browser=await chromium.launch({args:['--no-sandbox']});let pass=0,fail=0;
 async function check(name,fn){try{await fn();pass++;console.log('PASS '+name);}catch(e){fail++;console.log('FAIL '+name+' '+e.stack);}}
 try{
 for(const width of [320,390])for(const board of ['Coach','Scoreboard'])for(const lang of ['en','he','ar','ru','es'])await check(`${board} ${width}px ${lang}`,async()=>{
  const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base+(board==='Coach'?'PE_Coach_Board.html':'PE_Ultimate_Scoreboard.html'));
   assert.equal(await page.getAttribute('html','lang'),'en');
   const api=board==='Coach'?'PECoachBoard':'PEScoreboard';
   const before=await page.evaluate(api=>JSON.stringify(window[api].getState()),api);
   await page.evaluate(({api,lang})=>window[api].setLanguage(lang),{api,lang});
   assert.equal(await page.getAttribute('html','dir'),['he','ar'].includes(lang)?'rtl':'ltr');
   assert.equal(await page.evaluate(api=>JSON.stringify(window[api].getState()),api),before,'language hook preserves scenario/match');
   await page.waitForTimeout(50);
   const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(sizes.scroll<=sizes.width,JSON.stringify(sizes));
   if(board==='Coach'){
    await page.click('#help');assert.ok((await page.textContent('#helpBody')).length>100);await page.locator('#helpDialog [data-close]').click();
    page.on('dialog',d=>d.accept());await page.click('#loadExample');
    assert.ok((await page.evaluate(()=>window.PECoachBoard.getState().phases.length))>1);
   }else{
    page.on('dialog',d=>d.accept());await page.locator('[data-action="score"][data-team="0"][data-delta="1"]').click();
    await page.click('#undo');assert.equal(await page.evaluate(()=>window.PEScoreboard.getState().scores[0]),0);
    const id=await page.evaluate(()=>window.PEScoreboard.getState().id);await page.click('#finish');
    await page.evaluate(()=>document.querySelector('#finish').click());await page.reload();
    assert.equal(await page.evaluate(()=>window.PEScoreboard.getState().id),id);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pe-scoreboard.v1')).records.length),1);
   }
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 });
 await check('Coach invalid import preserves complete prior scenario and original storage',async()=>{
  const context=await browser.newContext(),page=await context.newPage();try{await page.goto(base+'PE_Coach_Board.html');const before=await page.evaluate(()=>localStorage.getItem('pe-ultimate-coach-board-v1'));const invalid=await page.evaluate(()=>{let s=window.PECoachBoard.getState();s.portrait='bad';return s;});await page.setInputFiles('#file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});assert.equal(await page.evaluate(()=>localStorage.getItem('pe-ultimate-coach-board-v1')),before);assert.match(await page.textContent('#toast'),/Invalid/);}finally{await context.close();}
 });
 await check('Coach quota failure reports unsaved; corrupted restore is not overwritten',async()=>{
  const context=await browser.newContext(),page=await context.newPage();try{await page.goto(base+'PE_Coach_Board.html');await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};});await page.click('#rotate');assert.match(await page.textContent('[data-i="autosave"]'),/unavailable/);
   await page.reload();await page.evaluate(()=>localStorage.setItem('pe-ultimate-coach-board-v1','{broken'));await page.reload();await page.click('#rotate');assert.equal(await page.evaluate(()=>localStorage.getItem('pe-ultimate-coach-board-v1')),'{broken');assert.match(await page.textContent('[data-i="autosave"]'),/unavailable/);
  }finally{await context.close();}
 });

 /* C24: scoreboard reload autosave. Same-tab reload/pagehide/visibilitychange must keep the latest state and must not leave the new document in a false "another tab" conflict. */
 const SB=base+'PE_Ultimate_Scoreboard.html',SC='[data-action="score"][data-team="0"][data-delta="1"]',SK='pe-scoreboard.v1';
 const sbStored=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),SK);
 async function sbSetup(p,names){ /* new match with custom team names and a 7-minute period, then start the clock */
  p.on('dialog',d=>d.accept());await p.click('#new');await p.fill('#teamA',names[0]);await p.fill('#teamB',names[1]);await p.fill('#minutes','7');await p.click('#setupForm button[type="submit"]');
 }
 await check('Scoreboard: score/timer/teams survive an immediate reload and later changes still save (C24)',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(SB);await sbSetup(page,['Lions','Tigers']);
   await page.click(SC);await page.click(SC);await page.locator('[data-action="score"][data-team="1"][data-delta="1"]').click();
   await page.click('#toggle');await page.waitForTimeout(1300);await page.click('#toggle'); /* run 1.3 s then pause: remaining < 7:00 */
   const before=await page.evaluate(()=>window.PEScoreboard.getState());assert.deepEqual(before.scores,[2,1]);assert.ok(before.remaining<420000);
   await page.reload(); /* immediately, no debounce wait */
   const after=await page.evaluate(()=>window.PEScoreboard.getState());
   assert.deepEqual(after.scores,[2,1]);assert.deepEqual(after.names,['Lions','Tigers']);assert.equal(after.id,before.id);assert.equal(after.remaining,before.remaining);assert.equal(after.duration,420000);
   assert.ok((await page.textContent('#save')).startsWith('Saved'),'no false conflict after reload: '+await page.textContent('#save'));
   await page.waitForTimeout(400); /* storage events are delivered asynchronously */
   assert.ok((await page.textContent('#save')).startsWith('Saved'),'no late conflict: '+await page.textContent('#save'));
   await page.click(SC);assert.equal((await sbStored(page)).current.scores[0],3,'a change made after the reload is persisted');
   await page.reload();assert.equal(await page.evaluate(()=>window.PEScoreboard.getState().scores[0]),3);
   assert.deepEqual(errors,[]);
  }finally{await context.close();}
 });
 await check('Scoreboard: pagehide and visibilitychange persist the latest running clock without waiting for the 5 s interval (C24)',async()=>{
  for(const mode of ['pagehide','visibilitychange']){
   const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
   try{
    await page.goto(SB);await sbSetup(page,['Owls','Hawks']);await page.click(SC);
    await page.click('#toggle');await page.waitForTimeout(1500); /* running; interval save is 5 s away */
    const savedAt=await sbStored(page);
    const live=await page.evaluate(m=>{const r={};if(m==='pagehide')window.dispatchEvent(new Event('pagehide'));else{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}
     const raw=JSON.parse(localStorage.getItem('pe-scoreboard.v1'));return {stored:raw.current,live:window.PEScoreboard.getState()};},mode);
    assert.equal(live.stored.status,'running',mode+': running state is stored');
    assert.ok(live.stored.deadline!==null,mode+': deadline stored');
    assert.deepEqual(live.stored.scores,[1,0]);assert.deepEqual(live.stored.names,['Owls','Hawks']);
    assert.ok(Math.abs(live.stored.deadline-live.live.deadline)<50,mode+': stored deadline matches the live clock');
    assert.ok(savedAt.current.deadline!==null);
    await page.reload();
    const st=await page.evaluate(()=>window.PEScoreboard.getState());assert.deepEqual(st.scores,[1,0]);assert.equal(st.status,'paused');assert.ok(st.remaining<420000-1000,mode+': elapsed time kept: '+st.remaining);
    await page.waitForTimeout(400);assert.ok((await page.textContent('#save')).startsWith('Saved'),mode+': '+await page.textContent('#save'));
   }finally{await context.close();}
  }
 });
 await check('Scoreboard: after confirmed delete-all a late pagehide/visibilitychange autosave does not bring the data back (C24)',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  try{
   await page.goto(SB);await sbSetup(page,['Keep','Gone']);await page.click(SC);await page.click(SC);
   await page.evaluate(()=>localStorage.setItem('pe-scoreboard.lang.v1','es'));await page.evaluate(()=>localStorage.setItem('unrelated','x'));
   await page.reload();assert.equal(await page.getAttribute('html','lang'),'es');
   await page.click('#dd-open');await page.click('#dd-skip');await page.fill('#dd-word','borrar');
   /* confirm, then fire the late autosave events in the SAME task, before the reload navigation takes over the old document */
   const after=await page.evaluate(()=>{document.getElementById('dd-confirm').click();
    document.querySelector('[data-action="score"][data-team="1"][data-delta="1"]').click(); /* a state change racing with the reload: store() must stay frozen */
    window.dispatchEvent(new Event('pagehide'));Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
    return {main:localStorage.getItem('pe-scoreboard.v1'),lang:localStorage.getItem('pe-scoreboard.lang.v1'),other:localStorage.getItem('unrelated')};});
   assert.equal(after.main,null,'late autosave must not rewrite the match');assert.equal(after.lang,null);assert.equal(after.other,'x');
   await page.waitForLoadState('load');await page.waitForTimeout(400);
   const st=await page.evaluate(()=>window.PEScoreboard.getState());assert.deepEqual(st.scores,[0,0]);assert.notDeepEqual(st.names,['Keep','Gone']);assert.equal(await page.getAttribute('html','lang'),'en');
   assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated')),'x');
   assert.deepEqual((await sbStored(page)).current.scores,[0,0],'only a fresh default match exists after the reload');
  }finally{await context.close();}
 });

 /* C18: backup-first "Delete all data on this device" + restore (shared helper, see device-data.cjs) */
 await runDeviceDataChecks({browser,check,cfg:{id:'scoreboard',url:base+'PE_Ultimate_Scoreboard.html',api:'PEScoreboard',tool:'pe-scoreboard',ownPrefix:'pe-scoreboard.v1',
  own:['pe-scoreboard.lang.v1','pe-scoreboard.v1'],open:'#dd-open',restore:'#dd-restore',langSel:'#language',
  seed:async p=>{await p.evaluate(()=>localStorage.setItem('pe-scoreboard.lang.v1','en'));const b=p.locator('[data-action="score"][data-team="0"][data-delta="1"]');await b.click();await b.click();},
  mutate:async p=>{await p.locator('[data-action="score"][data-team="1"][data-delta="1"]').click();},
  marker:p=>p.evaluate(()=>window.PEScoreboard.getState().scores),
  defaults:async p=>{assert.deepEqual(await p.evaluate(()=>window.PEScoreboard.getState().scores),[0,0]);assert.equal(await p.getAttribute('html','lang'),'en');}}});
 await runDeviceDataChecks({browser,check,cfg:{id:'coach',url:base+'PE_Coach_Board.html',api:'PECoachBoard',tool:'pe-coach-board',
  own:['pe-ultimate-coach-board-v1'],open:'#dd-open',restore:'#dd-restore',langSel:'#language',
  seed:async p=>{await p.click('#rotate');await p.fill('#title','Seeded plan');await p.press('#title','Tab');},
  mutate:async p=>{await p.fill('#title','Changed plan');await p.press('#title','Tab');},
  marker:p=>p.evaluate(()=>{const s=window.PECoachBoard.getState();return [s.portrait,s.title];}),
  defaults:async p=>{const s=await p.evaluate(()=>window.PECoachBoard.getState());assert.equal(s.portrait,false);assert.notEqual(s.title,'Seeded plan');assert.equal(await p.getAttribute('html','lang'),'en');}}});
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({pass,fail,evidence:'Chromium browser; synthetic storage; no physical device'}));process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exit(1);});
