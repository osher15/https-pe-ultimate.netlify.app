"use strict";
// Exceptions-only integrity review using the app's actual translation fallback.
const D=require('../hm-data.js'),{ROOT,arrayFrom,translations,cell}=require('./audit-source');
const {execFileSync}=require('node:child_process');
function audit(){
 const games=arrayFrom('hm-know.js','GAMES'),I=translations(),exceptions=[],seenIds=new Map(),seenNames=new Map();
 const add=(g,action,kind,note)=>exceptions.push({id:g.id,name:g.name,category:g.cat,action,kind,note});
 const norm=s=>String(s).normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();
 const fields=['time','who','equip','safe','goal','how','yt'];
 const catalog=D.EQUIP_CHOICES.map(c=>c[0]);
 for(const g of games){
  for(const f of fields)if(Array.isArray(g[f])?!g[f].length||g[f].some(x=>!String(x).trim()):!String(g[f]||'').trim())add(g,'fix','empty '+f,'Missing or empty field');
  for(const [map,key,label] of [[seenIds,g.id,'id'],[seenNames,norm(g.name),'normalized name']]){if(map.has(key))add(g,'fix','duplicate '+label,'Also '+map.get(key));else map.set(key,g.id);}
  for(const l of ['he','en','ar','ru','es']){
   I.set(l);const missing=[];
   for(const f of ['name','who','space','equip','time','goal','fit','how','vars','safe'])for(const s of Array.isArray(g[f])?g[f]:[g[f]]){
    if(!s)continue;const translated=String(I.tr(s)||'');
    if(!translated.trim()||(l!=='he'&&/[\u0590-\u05ff]/.test(translated)))missing.push(f+': '+String(s).slice(0,90));
   }
   if(missing.length)add(g,'fix','translation '+l,missing.join('; '));
  }
  const m=D.parseGameMeta(g);
  if(!(m.gFrom>=1&&m.gTo>=m.gFrom&&m.gTo<=12&&m.pMin>=1&&m.pMax>=m.pMin))add(g,'fix','filter metadata',JSON.stringify(m));
  if(/\d.*דק/.test(g.time)&&m.tMin==null)add(g,'fix','unparsed duration',g.time);
  if(m.tMin!=null&&!(m.tMin>0&&m.tMax>=m.tMin))add(g,'fix','invalid duration',JSON.stringify(m));
  if(m.noEquip&&/(כדור|חבל|קונוס|מזר|חישוק|רשת|רמקול)/.test(g.equip))add(g,'fix','equipment filter mismatch',g.equip);
  // Unknown alternatives can make the existing equipment filter accept an otherwise blocked game.
  if(!m.noEquip)for(const p of D.equipParts(g.equip)){
   const alts=p.split(/\/|\s+או\s+/);
   const unknown=alts.filter(x=>!D.equipConflicts(x,catalog).length);
   if(unknown.length)add(g,'approve','noncatalog equipment',unknown.join(' / ')+'; visible part: '+p+'; no unavailable catalog match (not automatically a defect)');
  }
  // Narrow checks of explicit decisions recorded in the September 30 review.
  if(g.id==='g-machanaim'&&(!/כדור ספוג/.test(g.equip)||!/כדור גומי/.test(g.equip)))add(g,'fix','review conflict','Dodgeball review requires foam/rubber alternatives');
  if(/משיכת חבל/.test(g.name)&&!/חבל עבה|חבל טיפוס/.test(g.equip))add(g,'fix','review conflict','Tug of war must distinguish thick/climbing rope');
  if(/מונדיאל/.test(g.name)&&!/4\s*קונוס/.test(g.equip))add(g,'fix','review conflict','Review records 4 cones for two goal variants');
  if(/מוזיקה/.test((g.how||[]).join(' '))&&!/רמקול/.test(g.equip))add(g,'approve','review conflict','Music instructions but no speaker in equipment');
 }
 // Near names: token overlap, report for review rather than infer duplicate rules.
 for(let i=0;i<games.length;i++)for(let j=i+1;j<games.length;j++){
  const a=games[i],b=games[j],aa=new Set(a.name.split(/[\s—–-]+/).map(norm).filter(Boolean)),bb=new Set(b.name.split(/[\s—–-]+/).map(norm).filter(Boolean));
  const common=[...aa].filter(x=>bb.has(x)).length,union=new Set([...aa,...bb]).size;
  if(common/union>=.6&&norm(a.name)!==norm(b.name))add(b,'approve','near name',a.id+' '+a.name+'; token Jaccard '+(common/union).toFixed(2)+' (heuristic only)');
 }
 return {base:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),count:games.length,expected:78,difference:games.length-78,exceptionCount:exceptions.length,affectedGames:new Set(exceptions.map(e=>e.id)).size,exceptions};
}
function markdown(a){
 const out=['# Games integrity audit — 2026-10-07','', 'Source main: `'+a.base+'`. Actual total **'+a.count+'**, owner expectation **78**, difference **'+a.difference+'**. '+a.exceptionCount+' exception rows across '+a.affectedGames+' games. No content changed.','',
  'Language check calls I18N.tr, including current term/composite fallback, for each visible field in all five languages. Hebrew residue means fallback left untranslated text; this does not validate idiomatic quality. The yt field stores a watch-search query, not a verified video URL; external availability was not tested. Duration "open" is valid, not missing.','',
  'Equipment uses equipParts/equipConflicts and EQUIP_CHOICES. Unknown alternatives are approval questions, since generic "other equipment" and optional props are intentional. Review conflicts below test explicit foam/rubber, thick rope, four-cone and speaker decisions; remaining prose decisions need teacher review. Near-name matching is a heuristic, not proof of duplicate instructions.',''];
 for(const action of ['approve','fix','add']){
  out.push('## '+action,'');
  if(action==='add'){out.push('The numerical shortfall is '+Math.max(0,78-a.count)+'. This does not identify missing game IDs or authorize new imports. PR #46 is not merged; its reported 44 games cannot be counted as main. Re-run this tool after owner integration.','');continue;}
  out.push('| ID | Name | Category | Exception | Evidence / owner action |','|---|---|---|---|---|');
  for(const e of a.exceptions.filter(e=>e.action===action))out.push('| '+[e.id,e.name,e.category,e.kind,e.note].map(cell).join(' | ')+' |');
  if(!a.exceptions.some(e=>e.action===action))out.push('| — | — | — | No exceptions | — |');out.push('');
 }
 return out.join('\n').trimEnd()+'\n';
}
if(require.main===module){const a=audit();process.stdout.write(process.argv.includes('--json')?JSON.stringify(a,null,2)+'\n':markdown(a));}
module.exports={audit,markdown};
