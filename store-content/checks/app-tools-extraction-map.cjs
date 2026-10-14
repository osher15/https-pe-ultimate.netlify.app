'use strict';
/*
 * Extraction map for app-embedded tools that might be sold standalone
 * (beep test, fitness trainer/timers, fitness tests, lesson generator). Read-only: it never
 * edits app files. Planning evidence only; it does not extract anything.
 *
 * Part A (Node, static): bytes, storage keys, cross-module/global dependencies, student-data
 *   coupling markers, audio/speech mechanism, assets, Hebrew literals, data-i18n key coverage.
 * Part B (headless Chromium, optional): opens the generated Hamegrash.html on loopback in
 *   en/ar/ru/es, opens each tool view and counts visible Hebrew text nodes left untranslated,
 *   horizontal overflow at 360px, external requests; and for the beep test, starts the test and
 *   counts Web Audio oscillators scheduled (synthesized cue evidence, NOT audible output).
 *
 * Run from the repository root:
 *   node store-content/checks/app-tools-extraction-map.cjs            # static only
 *   node store-content/checks/app-tools-extraction-map.cjs --browser   (Playwright found locally or via `npm root -g`)
 * Writes JSON to stdout (and to JSON_OUT if set).
 */
const fs = require('fs'), path = require('path'), http = require('http');
const REPO = path.resolve(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');
const app = read('hm-app.js'), html = read('index.html'), i18n = read('hm-i18n.js');

function slice(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker); if (a < 0) throw new Error('marker not found: ' + startMarker);
  const b = endMarker ? src.indexOf(endMarker, a + startMarker.length) : src.length; if (b < 0) throw new Error('end marker not found: ' + endMarker);
  return src.slice(a, b);
}
function view(id) { return slice(html, '<section class="view" id="view-' + id + '">', '<section class="view"'); }

const MODULES = {
  beep: { label: 'Beep test (BT, hm-app.js)', js: slice(app, 'מודול 1 — ביפ טסט', 'מודול 2 — PhotoFinish'), markup: view('beep') },
  fitTrainer: { label: 'Fitness trainer: interval timer, circuit generator, exercise library, dice (FIT, hm-app.js)', js: slice(app, 'מודול 4 — מאמן הכושר', '/* ===== bridge for new modules'), markup: view('fit') },
  fitnessTests: { label: 'Fitness tests (FT, hm-tests.js)', js: read('hm-tests.js'), markup: view('ft') },
  lessonGenerator: { label: 'Lesson generator (LESSON, hm-lesson.js)', js: read('hm-lesson.js'), markup: view('lesson') },
};
// Shared helpers defined at hm-app.js top level (or exposed as window.HM) that modules call.
const HELPERS = ['LS', 'SET', 'saveSet', 'ac', 'AC', 'beep', 'horn', 'tripleBeep', 'say', 'keepAwake', 'holdAwake', 'toast', 'ask', 'undo', 'actToast',
  'confetti', 'dlCSV', 'esc', 'modal', 'go', 'fmtMS', 'fmtMSc', 't', 'trUI', 'clsUI', 'loc', 'voiceLoc', 'H_LOC', 'typingIn', 'SESSION', 'session', 'assign'];
const HEB = /[֐-׿]/;

function uniq(a) { return [...new Set(a)].sort(); }
function all(re, s, g = 1) { const out = []; let m; const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = r.exec(s))) out.push(m[g]); return out; }

function analyse(name, m) {
  const js = m.js, mk = m.markup;
  // Any get/set/raw call on a dotted key (LS, H().LS, store, local wrappers) counts as app storage.
  const lsKeys = uniq(all(/\b(?:get|set|raw)\(\s*["'`]([a-z][\w]*\.[\w.]+)["'`]/, js));
  const windowRefs = uniq(all(/\bwindow\.([A-Z][A-Za-z0-9_]+)/, js));
  const hHelpers = uniq(all(/\bH\(\)\.([A-Za-z_]+)/, js));
  const bareHelpers = HELPERS.filter(h => new RegExp('(^|[^.\\w$])' + h.replace('$', '\\$') + '\\s*[(.]').test(js));
  const hmdata = uniq([...all(/HMDATA\.([A-Za-z_]+)/, js), ...all(/\bDT0?\(\)?\.([A-Za-z_]+)/, js)]);
  const coupling = {};
  for (const [k, re] of Object.entries({ 'stu.list (student roster)': /stu\.list/, 'STU module': /\bSTU\b/, 'FT.ingest / FT.pick (class results / roster picker)': /FT\.(ingest|pick)/,
    'SESSION / live lesson': /\bSESSION\b|\.session\b/, 'cid / class identity': /\bcid\b/, 'sid / student identity': /\bsid\b/, 'class label (cls)': /\bcls\b/,
    'GAMES bank': /GAMES\./, 'KNOW base': /KNOW\./, 'lesson bank (bankCopy/LB)': /bankCopy|LESSONBANK|HMLB/ })) { const n = (js.match(new RegExp(re.source, 'g')) || []).length; if (n) coupling[k] = n; }
  const audio = {
    webAudioOscillator: /createOscillator|\btone\(|\bbeep\(|\bhorn\(|\bac\(\)/.test(js),
    audioFiles: uniq(all(/["'`]([^"'`]+\.(?:mp3|wav|ogg|m4a))["'`]/, js + mk)),
    speechSynthesis: /\bsay\(/.test(js),
    wakeLock: /keepAwake|holdAwake/.test(js),
  };
  const assets = uniq(all(/(exercise-gifs\/[A-Za-z0-9_\/${}.]+)/, js + mk));
  const urls = uniq(all(/(https?:\/\/[^\s"'`<>)]+)/, js + mk));
  const hebLiterals = all(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/, js, 2).filter(s => HEB.test(s));
  const i18nKeys = uniq([...all(/data-i18n="([^"]+)"/, mk), ...all(/\bt\(\s*["']([a-zA-Z][\w.]+)["']/, js)]);
  const keyLangs = i18nKeys.map(k => (i18n.match(new RegExp('"' + k.replace(/\./g, '\\.') + '"\\s*:', 'g')) || []).length);
  return {
    label: m.label,
    bytes: { js: Buffer.byteLength(js), markup: Buffer.byteLength(mk) },
    storageKeys: lsKeys.map(k => 'peultimate.' + k),
    globals: { window: windowRefs, viaHM: hHelpers, sharedHelpers: bareHelpers, hmData: hmdata },
    studentDataCoupling: coupling,
    audio, assets, externalUrls: urls,
    hebrewStringLiterals: hebLiterals.length,
    i18nKeys: { count: i18nKeys.length, withAll4Translations: keyLangs.filter(n => n >= 4).length },
    domIds: uniq(all(/id="([^"]+)"/, mk)).length,
  };
}

// The app opens behind a teacher-code lock; the e2e harness uses the same first-run code.
async function unlock(page) {
  for (let i = 0; i < 2 && await page.locator('#lockOv.on').count(); i++) { await page.fill('#lock-pass', '1234'); await page.click('#lock-enter'); await page.waitForTimeout(400); }
}
async function browserPass(out) {
  const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require(path.join(require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright')); } })();
  const D = require(path.join(REPO, 'hm-data.js'));
  const srv = http.createServer((req, rs) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''); const f = path.join(REPO, rel);
    if (f.indexOf(REPO) !== 0) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); rs.end(b); });
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const res = { evidence: 'headless Chromium, generated Hamegrash.html on loopback, emulated 360x740 phone viewport; no device, no audible audio', views: {}, external: [] };
  const VIEWS = { beep: 'beep', fitTrainer: 'fit', fitnessTests: 'ft', lessonGenerator: 'lesson' };
  try {
    for (const lang of ['en', 'ar', 'ru', 'es']) {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
      await ctx.route('**/*', r => { const u = r.request().url(); if (/^(data:|blob:|http:\/\/127\.0\.0\.1)/.test(u)) return r.continue(); res.external.push(u); return r.abort(); });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(seed => { Object.entries(seed).forEach(([k, v]) => localStorage.setItem('peultimate.' + k, JSON.stringify(v))); }, { 'hx.leadDone': true, 'schema.version': D.SCHEMA_VERSION, lang });
      await page.goto(base + 'Hamegrash.html', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900); await unlock(page);
      for (const [name, mod] of Object.entries(VIEWS)) {
        await page.evaluate(m => window.HM.go(m), mod); await page.waitForTimeout(500);
        const r = await page.evaluate(id => {
          const root = document.getElementById('view-' + id); const heb = /[֐-׿]/; const left = [];
          const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          for (let n = w.nextNode(); n; n = w.nextNode()) {
            const el = n.parentElement; if (!el || !el.getClientRects().length) continue; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden') continue;
            if (heb.test(n.nodeValue)) left.push(n.nodeValue.trim().slice(0, 60));
          }
          let visible = 0; const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); for (let n = w2.nextNode(); n; n = w2.nextNode()) if (n.nodeValue.trim() && n.parentElement && n.parentElement.getClientRects().length) visible++;
          return { visibleTextNodes: visible, hebrewLeft: left.length, samples: [...new Set(left)].slice(0, 6), overflowX: document.documentElement.scrollWidth > innerWidth };
        }, mod);
        (res.views[name] = res.views[name] || {})[lang] = r;
      }
      if (errors.length) res.views['pageErrors_' + lang] = errors.slice(0, 5);
      await ctx.close();
    }
    // Beep test: count synthesized Web Audio cues during the first ~10 s (standard 20 m / 8.0 km/h: first shuttle at 9 s).
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route('**/*', r => /^(data:|blob:|http:\/\/127\.0\.0\.1)/.test(r.request().url()) ? r.continue() : r.abort());
    const page = await ctx.newPage();
    await page.addInitScript(seed => {
      Object.entries(seed).forEach(([k, v]) => localStorage.setItem('peultimate.' + k, JSON.stringify(v)));
      window.__osc = 0; const C = window.AudioContext || window.webkitAudioContext; if (C) { const o = C.prototype.createOscillator; C.prototype.createOscillator = function () { window.__osc++; return o.call(this); }; }
      window.__files = 0; const A = window.Audio; window.Audio = function (...a) { window.__files++; return new A(...a); };
    }, { 'hx.leadDone': true, 'schema.version': D.SCHEMA_VERSION, lang: 'en' });
    await page.goto(base + 'Hamegrash.html', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(900); await unlock(page);
    await page.evaluate(() => window.HM.go('beep')); await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.__osc);
    await page.click('#bt-startBtn'); await page.waitForTimeout(10500);
    res.beepAudio = await page.evaluate(b => ({ oscillatorsCreatedIn10_5s: window.__osc - b, audioElementsCreated: window.__files, stage: document.querySelector('#bt-stageVal').textContent, distance: document.querySelector('#bt-distVal').textContent, time: document.querySelector('#bt-timeVal').textContent }), before);
    await ctx.close();
  } finally { await browser.close(); srv.close(); }
  out.browser = res;
}

(async () => {
  const out = { generatedFrom: 'working tree', modules: {} };
  for (const [k, m] of Object.entries(MODULES)) out.modules[k] = analyse(k, m);
  // Shared runtime the standalone build would still need (sizes for context).
  out.sharedRuntime = Object.fromEntries(['hm-data.js', 'hm-i18n.js', 'hm-terms.js', 'hm-texts.js', 'hm-styles.css', 'hm-app.js', 'hm-games.js', 'hm-know.js'].filter(f => fs.existsSync(path.join(REPO, f))).map(f => [f, fs.statSync(path.join(REPO, f)).size]));
  out.exerciseGifsBytes = (function du(d) { let n = 0; for (const e of fs.readdirSync(d, { withFileTypes: true })) n += e.isDirectory() ? du(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size; return n; })(path.join(REPO, 'exercise-gifs'));
  if (process.argv.includes('--browser')) await browserPass(out);
  const json = JSON.stringify(out, null, 2);
  if (process.env.JSON_OUT) fs.writeFileSync(process.env.JSON_OUT, json);
  console.log(json);
})().catch(e => { console.error(e); process.exit(1); });
