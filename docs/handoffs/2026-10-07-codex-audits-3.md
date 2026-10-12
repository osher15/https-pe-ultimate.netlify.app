# Codex audit batch 3 — 2026-10-07

Owner: Codex. Instructions: Claude `324bed6`, docs/handoffs/2026-10-07-codex-next-tasks-3.md. Source/test base: main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`. Branch: `codex/audits-3-2026-10-07`. Status: review/tests complete; one batched publication, no PR, merge or deployment.

Reservation published in Issue #18, comment 6047397048: exactly docs/GAMES_CONTENT_REVIEW_2026-10-07.md, tests/unit/gamesnumerals.test.js, and this handoff. Claude owns product/content/native/timing fixes. No product/generated file is included in this branch diff. The unmerged batch-3 instruction was read from Claude’s branch; it is not assumed to be main.

## 1. Content and translation review

See docs/GAMES_CONTENT_REVIEW_2026-10-07.md for separate rules, tasks/medals and translation findings. Actual inventory is 44 games, 19 chal games, 155 final-block dictionary rows. Critical points: king succession and returned king; instant re-entry vs elimination win; Arabic two pairs vs one pair; shin-vs-leg target drift; Russian hit-player actor/case; equipment/safety contradiction; mandatory task vs pupil skip option. All are proposals for Claude/teacher, not implemented fixes.

## 2. Numerals test

Real-source extraction and the actual GAME_ADAPT merge cover how/vars/equip/safe/goal/fit/adapt/chal/more and all five TASK_MENU entries. 603 unique source strings; 4 language columns. Seven legacy quoted keys have no full-key row but do have stripped-core rows; only those seven are explicitly allowlisted, with their core row and real I18N.tr required. Missing other rows fail.

17 language/key representation exceptions across 12 keys are pinned to exact source digits, translation digits and full translated text. No broad skip and no product fix. Nine pairs belong to the new games. No genuine numeric value drift found; words/duals preserve quantity. Arabic زوجان is a genuine quantity error with no digits, independently reported in the review.

| Language | Hebrew key | Source digits | Translation digits |
|---|---|---|---|
| ar | 2 חפצים כ״דגל״ (סרט, חולצה, קונוס) | 2 | none |
| ar | פיצול שרשרת ל־2 כשהיא מגיעה ל־6 שחקנים — משחק מהיר יותר. | 2,6 | 6 |
| ar | כדור רך או ציוד אחר + 2 שערים מאולתרים (קונוסים, חבלים, ספסלים, קופסאות או כל ציוד אחר) | 2 | none |
| ar | 2 ספסלים או ציוד אחר + כדור או ציוד אחר | 2 | none |
| en | גרסת 4 כיוונים — חבל מרובע. | 4 | none |
| ar | קליעה מהשדה = 2 נק׳; אחרי קליעה — סדרת עונשין, כל אחד שווה נקודה עד להחטאה. | 2 | none |
| ar | שער קטן אחד (2 קונוסים) במרכז, שוער אחד מתחלף, שאר השחקנים במעגל סביבו. | 2 | none |
| ar | קונוס הזהב מונח במעגל מסומן במרכז המגרש. שתי קבוצות בקצוות הנגדיים, כל קבוצה עם 2 ״שומרים״ קבועים סביב המעגל. | 2 | none |
| en | שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. | 2,3,4,5 | 1,2,3,4,5 |
| ru | שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. | 2,3,4,5 | 1,2,3,4,5 |
| es | שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. | 2,3,4,5 | 1,2,3,4,5 |
| ar | כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר | 2 | none |
| ru | כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר | 2 | none |
| ru | בכל קבוצה יש ״מלך״ (שוער) עם 3 ״פסילות״. הוא שומר על קונוס הזהב ועל הקונוסים הקטנים של קבוצתו. אחרי שנפגע 3 פעמים הוא יוצא, ומכריזים על מלך חדש מבין חברי הקבוצה. | 3,3 | 3 |
| en | לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. | 5 | 1,5 |
| ru | לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. | 5 | 1,5 |
| es | לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. | 5 | 1,5 |

New suite: `node --test tests/unit/gamesnumerals.test.js`: 46/46 passed. Each of the 44 games has a case, plus shared menu and exact exception inventory. Full task branch `npm test`: **746/746 passed**, 0 skipped.

## 3. Leading-quote engine experiment — proposal only

Detached disposable scratch worktree of main, using real hm-terms.js, hm-texts.js and hm-i18n.js loaded in Node vm. Synthetic full-key row was injected only into in-memory dictionaries after the differential comparison; no synthetic product row was committed or built. Node/VM string-path reproduction is not DOM/browser evidence. The previous failed DOM case was already reworded in #46.

Reproduction key: `״בדיקת פתיחה סינתטית״ — ניסוי בלבד.`. Russian row: `«Синтетическая проверка» — только эксперимент.`. Before patch, `I18N.tr` returns the original Hebrew despite the full row; after patch it returns the Russian row exactly. Root cause: splitTerm moves ״ into pre before looking up core, so full-string dictionary key is never tried.

Smallest bounded recommendation: prefer exact row only when stripped prefix contains Hebrew quote ״. Broader exact lookup for all stripped prefixes also changes placeholders and emoji keys; no reason to expand this fix to them. Suggested unified diff (not applied to publication branch):

```diff
diff --git a/hm-i18n.js b/hm-i18n.js
index f12cabb..bd4970c 100644
--- a/hm-i18n.js
+++ b/hm-i18n.js
@@ -3486,6 +3486,8 @@ function term(src){
   const col=TERM_COL[cur];
   if(col==null||!window.I18N_TERMS||!HEB.test(src))return null;
   const [pre,core,post]=splitTerm(src);
+  const exact=pre.includes("״")&&window.I18N_TERMS[src];
+  if(exact&&exact[col])return exact[col];
   const out=termCore(core,col,true);
   if(out)return heQpre(pre,out)+out+heQ(post);
   /* טקסט מורכב — שורת מקור «כותרת — ארגון», משחק שהוכנס למערך
```

Proof on final proposed patch: **6,048 existing I18N_TERMS keys × 5 languages = 30,240 comparisons**, strict identical before/after; **0 changed keys, exception list empty**. he was included. Synthetic quote regression passes. For any future full-key row with a stripped ״ prefix the exact translated row takes priority; existing no-full-row fallback remains intact. Generic stripped-prefix fixes remain a separate proposal.

`node --test tests/unit/translations.test.js` on patched disposable tree: **10/10 passed**. Full `npm test` on that tree: **700/700 passed**, no skips. Both standalone builds have identical hashes to one another; generated files differ from main because they contain the experimental patch, as expected. None are published.

Reproduction script (run from scratch with paths adjusted; uses actual production code):

```js
const BASE_ROOT='/absolute/path/to/main', PATCHED_ROOT='/absolute/path/to/patched-scratch';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function load(root){const w={localStorage:{getItem:()=>null,setItem(){}},document:{documentElement:{setAttribute(){}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,body:null},addEventListener(){}};w.window=w;const c=vm.createContext({...w,CustomEvent:function(){}});for(const f of ['hm-terms.js','hm-texts.js','hm-i18n.js'])vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),c);return {I:c.window.I18N,T:c.window.I18N_TERMS};}
function set(x,l){try{x.I.set(l);}catch(e){if(!/dataset/.test(e.message))throw e;}assert.equal(x.I.lang(),l);}
const a=load(BASE_ROOT),b=load(PATCHED_ROOT),langs=['he','en','ar','ru','es'],changes=[];
for(const l of langs){set(a,l);set(b,l);for(const key of Object.keys(a.T)){const before=a.I.tr(key),after=b.I.tr(key);if(before!==after){assert.match(key,/^[^\p{L}\p{N}_«"(]+/u,'unexpected nonprefix change');changes.push({lang:l,key,before,after});}}}
const key='״בדיקת פתיחה סינתטית״ — ניסוי בלבד.';const row=['“Synthetic opening test” — probe only.','«اختبار بداية اصطناعي» — تجربة فقط.','«Синтетическая проверка» — только эксперимент.','«Prueba de apertura sintética» — solo ensayo.'];a.T[key]=row;b.T[key]=row;set(a,'ru');set(b,'ru');const reproduction={key,before:a.I.tr(key),after:b.I.tr(key)};assert.match(reproduction.before,/[\u0590-\u05ff]/);assert.equal(reproduction.after,row[2]);
fs.writeFileSync(__dirname+'/engine-results.json',JSON.stringify({keys:Object.keys(a.T).length-1,languages:langs,comparisons:(Object.keys(a.T).length-1)*5,changes,reproduction},null,2));console.log(JSON.stringify({keys:Object.keys(a.T).length-1,comparisons:(Object.keys(a.T).length-1)*5,changes:changes.length,reproduction},null,2));
```

## 4. Original games audit rerun

Reused `tools/games-audit.js` and `tools/audit-source.js` verbatim from published batch-2 branch (their audit logic unchanged). Because those tools are not on main, copies lived outside the deliverable tree; only require/root paths were adjusted to point to the exact main worktree. Executed `node /workspace/scratch/2993d19a2409/games-audit.js --json`. The original tool scans base GAMES (not GAME_ADAPT additions); extended prose coverage is the new numeral suite/content review.

| Metric | Batch 1 main 070c47e | Current main 348c1ab | Delta |
|---|---|---|---|
| Games | 42 | 44 | +2 |
| Difference from historical expectation 78 | -36 | -34 | +2; no new imports authorized |
| Exception rows | 25 | 26 | +1 |
| Affected games | 21 | 22 | +1 |
| fix rows | 0 | 0 | unchanged |
| approve rows | 25 | 26 | +1 |

All 25 previous exception signatures remain; one new approval row: **g-strikeball / noncatalog equipment / בספסלים** in `2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר`. Benches are not matched to a tracked unavailable item; this is a substitution/filter decision, not proof of acceptable equipment. No new empty/duplicate/metadata/translation-residue defect from the original tool. Dodgegold adds no audit exception.

**Important argument semantics:** `equipConflicts(str, unavailable)` receives UNAVAILABLE items, not available equipment. Catalog test below marks every EQUIP_CHOICES item unavailable. “Only ציוד אחר” means only that category is unavailable, not that it is the only equipment available. Empty unavailable list returns no conflicts by design.

| ID | Catalog entirely unavailable | Only ציוד אחר unavailable | No unavailable items |
|---|---|---|---|
| g-strikeball | כדור ספוג, כדור גומי, ציוד אחר | [] | [] |
| g-dodgegold | כדור ספוג, כדור גומי, ציוד אחר, קונוסים | [] | [] |

Returned arrays are tracked blocked requirements. Strike-ball’s unrecognized bench alternative bypasses unavailable cones; other-equipment alternatives require teacher-safe substitutions. This is distinct from numeric equipment quantities, which equipConflicts does not validate.

| ID | Parsed grades | Pupils | Minutes | noEquip |
|---|---|---|---|---|
| g-strikeball | 8–12 | 10–24 | 15–25 | false |
| g-dodgegold | 8–12 | 12–30 | 15–25 | false |

Search probe used the exact hay() composition from hm-know.js: name/goal/fit/who/equip/space/category + current-language translations, followed by HMDATA.foldSearch and HMDATA.searchMatch. It did not render a view.

| ID | Language | Translated name searched | Match |
|---|---|---|---|
| g-strikeball | he | כדור־מכה משולב | true |
| g-strikeball | en | Combined strike-ball | true |
| g-strikeball | ar | كرة الضربة المدمجة | true |
| g-strikeball | ru | Комбинированная игра «удар по мячу» | true |
| g-strikeball | es | Balón de golpeo combinado | true |
| g-dodgegold | he | מחניים זהב | true |
| g-dodgegold | en | Golden dodgeball | true |
| g-dodgegold | ar | كرة المطاردة الذهبية | true |
| g-dodgegold | ru | Золотые вышибалы | true |
| g-dodgegold | es | Balón prisionero dorado | true |

## Validation and limitations

| Tree | Command / check | Result |
|---|---|---|
| Publication main-based task tree | npm test | 746/746, 0 failures/skips |
| Publication tree | node build-standalone.js twice; sha256sum index.html Hamegrash.html sw.js; diff hash files | identical |
| Publication tree | git diff --exit-code -- index.html Hamegrash.html sw.js | no generated diff from main |
| Patched scratch | node --test tests/unit/translations.test.js | 10/10 |
| Patched scratch | npm test | 700/700, 0 failures/skips |
| Patched scratch | node build-standalone.js twice; SHA-256 comparison | deterministic; contains proposed patch only in scratch |
| Source/patch VM differential | node engine-probe.js | 30,240 existing outputs identical, synthetic quote fixed |
| Games integrity / search probes | node games-audit.js --json; node new-games-probe.js | metrics/tables above |

No browser suite or physical-device check was run. This batch’s VM/digit/hash checks do not certify DOM translation, layout, timing or native behavior. On the next integrated candidate, owner/Claude should run `gameadapt`, `library21`, `i18n15`, `stage2`, `builder19`. No new CI result is claimed. Chromium installation is not part of this docs/tests task.

Commands/logs were kept in disposable scratch. The proposed engine file and generated outputs are uncommitted and must not be transferred into the publication branch. English documentation, teacher control, stable data and shared-file reservations preserved.

## Claude next actions

Review content findings with teacher before changing approved rules/thresholds; correct verified translation quantity/case/actor issues in a scoped content branch. Consider the two-line quote patch with a committed regression and browser i18n15 after owner review. Reconcile actual 19 chal games/155 rows. Keep backup gm.mine label/count and personal-copy/timing/native ownership in their existing sessions. No merge/deploy performed by Codex.
