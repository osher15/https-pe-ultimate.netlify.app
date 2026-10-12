'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');
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
 }finally{await browser.close();await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({pass,fail,evidence:'Chromium browser; synthetic storage; no physical device'}));process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exit(1);});
