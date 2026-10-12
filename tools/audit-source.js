"use strict";
// Read-only data extraction follows the existing unit-test VM pattern.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
function arrayFrom(file,name){
 const src=fs.readFileSync(path.join(ROOT,file),'utf8');
 const m=src.match(new RegExp('const '+name+'=\\[[\\s\\S]*?\\n\\];'));
 if(!m)throw new Error('Cannot locate '+name+' in '+file);
 return vm.runInNewContext('('+m[0].replace('const '+name+'=','').replace(/;$/,'')+')',{}, {timeout:2000});
}
function translations(){
 const win={localStorage:{getItem:()=>null,setItem(){}},document:{documentElement:{setAttribute(){}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,body:null},addEventListener(){}};
 win.window=win;const ctx=vm.createContext({...win,console,CustomEvent:function(){}});
 for(const f of ['hm-terms.js','hm-texts.js','hm-i18n.js'])vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f,timeout:5000});
 const I=ctx.window.I18N;
 return {tr:s=>I.tr(s),set:l=>{try{I.set(l);}catch(e){if(!/dataset/.test(e.message))throw e;}if(I.lang()!==l)throw new Error('Language selection failed: '+l);}};
}
function cell(s){return String(s??'').replace(/\|/g,' / ').replace(/\r?\n/g,' ');}
module.exports={ROOT,arrayFrom,translations,cell};
