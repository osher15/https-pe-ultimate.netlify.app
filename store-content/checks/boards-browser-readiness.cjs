'use strict';
/*
 * Store readiness browser pass for prototypes/pe-boards (read-only; never edits the boards).
 *
 * Evidence type: headless Chromium (Playwright) on loopback and file://, desktop and
 * emulated phone/tablet viewports (isMobile + hasTouch). NOT a physical device, NOT real
 * audio output, NOT a real phone download/share sheet.
 *
 * Run from the repository root (no package.json change; uses a global Playwright):
 *   node store-content/checks/boards-browser-readiness.cjs   (finds Playwright locally or via `npm root -g`)
 * Options (environment):
 *   SHOTS_DIR=/some/scratch/dir   where screenshots/PDFs are written (default: <os tmp>/pe-boards-readiness)
 *   JSON_OUT=/path/result.json    machine-readable result (default: SHOTS_DIR/result.json)
 *   BOARDS_DIR=/scratch/copy      run against a (patched) copy instead of prototypes/pe-boards
 * Exit code 1 if any hard check fails. Observations (gaps that are not regressions) are
 * listed separately and do not fail the run.
 */
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
const assert = require('node:assert/strict');

let PW_VERSION = 'unknown';
function loadPlaywright() {
  const ver = dir => { try { PW_VERSION = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version; } catch (e) { /* ignore */ } };
  for (const p of ['playwright', 'playwright-core']) { try { const m = require(p); ver(path.dirname(require.resolve(p + '/package.json'))); return m; } catch (e) { /* next */ } }
  const { execSync } = require('child_process');
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  ver(path.join(root, 'playwright'));
  return require(path.join(root, 'playwright'));
}
const { chromium } = loadPlaywright();

const REPO = path.resolve(__dirname, '..', '..');
// BOARDS_DIR lets a reviewer run the same checks against a patched scratch copy.
const BOARDS = process.env.BOARDS_DIR ? path.resolve(process.env.BOARDS_DIR) : path.join(REPO, 'prototypes', 'pe-boards');
const SHOTS = process.env.SHOTS_DIR || path.join(os.tmpdir(), 'pe-boards-readiness');
fs.mkdirSync(SHOTS, { recursive: true });
const JSON_OUT = process.env.JSON_OUT || path.join(SHOTS, 'result.json');

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '1366x768', width: 1366, height: 768, mobile: false },
];
const LANGS = ['en', 'he', 'ar', 'ru', 'es'];
const RTL = new Set(['he', 'ar']);
const BOARD = {
  scoreboard: {
    file: 'PE_Ultimate_Scoreboard.html', api: 'PEScoreboard', key: 'pe-scoreboard.v1', i18nAttr: 't',
    controls: ['#language', '#display', '#toggle', '#next', '#edit', '[data-action="score"][data-team="0"][data-delta="1"]',
      '[data-action="score"][data-team="1"][data-delta="1"]', '[data-action="foul"][data-team="0"][data-delta="1"]',
      '[data-action="timeout"][data-team="1"]', '#undo', '#finish', '#new', '#export', '#sound'],
  },
  coach: {
    file: 'PE_Coach_Board.html', api: 'PECoachBoard', key: 'pe-ultimate-coach-board-v1', i18nAttr: 'i',
    // 'A|B' = at least one of the alternatives must be reachable (quick bar on narrow screens, sidebar on wide).
    controls: ['#language', '#help', '#focus', '#quickSport|#sport', '#quickHalf|#half', '#quickRotate|#rotate', '#loadExample',
      '#save', '#open', '#image', '#board', '#play', '#stop', '#addPhase', '#undo', '#redo'],
  },
};

const results = []; const observations = []; const external = [];
let pass = 0, fail = 0;
async function check(name, fn) {
  try { const info = await fn(); pass++; results.push({ name, ok: true, info: info || null }); console.log('PASS ' + name + (info ? ' ' + JSON.stringify(info) : '')); }
  catch (e) { fail++; results.push({ name, ok: false, error: String(e && e.message || e) }); console.log('FAIL ' + name + ' ' + (e && e.message || e)); }
}
function observe(topic, detail) { observations.push({ topic, detail }); console.log('OBSERVE ' + topic + ': ' + JSON.stringify(detail)); }

function serve() {
  const allow = new Set(['index.html', 'PE_Coach_Board.html', 'PE_Ultimate_Scoreboard.html']);
  return new Promise(res => {
    const srv = http.createServer((req, rs) => {
      let f = path.basename(decodeURIComponent(req.url.split('?')[0])) || 'index.html';
      if (!allow.has(f)) { rs.writeHead(404); return rs.end(); }
      rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); rs.end(fs.readFileSync(path.join(BOARDS, f)));
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, base: 'http://127.0.0.1:' + srv.address().port + '/' }));
  });
}

async function newContext(browser, vp, extra) {
  const ctx = await browser.newContext(Object.assign({
    viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile,
    deviceScaleFactor: vp.mobile ? 2 : 1, acceptDownloads: true,
  }, extra || {}));
  // Block and record every request that leaves loopback/file/data/blob.
  await ctx.route('**/*', route => {
    const u = route.request().url();
    if (/^(file:|data:|blob:|about:)/.test(u) || /^https?:\/\/127\.0\.0\.1(:\d+)?\//.test(u)) return route.continue();
    external.push(u); return route.abort();
  });
  return ctx;
}
function watch(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());
  return errors;
}

// Horizontal overflow and reachability of a control (scrolls it into view, then hit-tests its centre).
async function layout(page, controls) {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth, width: innerWidth }));
  const ctl = {};
  for (const group of controls) {
    let best = null;
    for (const sel of group.split('|')) {
      const r = await reach(page, sel);
      if (best === null || String(r).startsWith('ok')) best = r;
      if (String(r).startsWith('ok')) { best = (group.includes('|') ? sel + ' ' : '') + r; break; }
    }
    ctl[group] = best;
  }
  return { sizes, ctl };
}
async function reach(page, sel) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) return 'missing';
    if (!(await loc.isVisible())) return 'hidden';
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    return loc.evaluate(el => {
      const r = el.getBoundingClientRect();
      if (r.left < -1 || r.right > innerWidth + 1) return 'offscreen-x';
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      const mine = h => h && (h === el || el.contains(h));
      // A transient toast is not a permanent blocker: hide it, re-test, and report the overlap.
      if (hit && hit.id === 'toast' && !mine(hit)) {
        const prev = hit.style.visibility; hit.style.visibility = 'hidden';
        const again = document.elementFromPoint(x, y); hit.style.visibility = prev;
        if (mine(again)) return 'ok-under-transient-toast';
      }
      if (!mine(hit)) return 'covered-by:' + (hit ? hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') + (hit.className && typeof hit.className === 'string' ? '.' + hit.className.trim().split(/\s+/).join('.') : '') : 'nothing');
      return (r.height < 40 || r.width < 40) ? 'ok-small(' + Math.round(r.width) + 'x' + Math.round(r.height) + ')' : 'ok';
    });
}
// Visible UI strings (own text nodes, option labels, placeholders, aria-labels).
async function uiStrings(page) {
  return page.evaluate(() => {
    const out = new Set();
    const vis = el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden'; };
    for (const el of document.querySelectorAll('body *')) {
      if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue;
      if (el.closest('dialog:not([open])')) continue;
      if (!vis(el)) continue;
      for (const n of el.childNodes) if (n.nodeType === 3) { const s = n.textContent.trim(); if (/[A-Za-z]{3,}/.test(s)) out.add(s); }
      for (const a of ['placeholder', 'aria-label', 'title']) { const v = el.getAttribute(a); if (v && /[A-Za-z]{3,}/.test(v)) out.add(v); }
    }
    return [...out];
  });
}
const NEUTRAL = /^(Total|PE ULTIMATE|PE ULTIMATE.*|English|Español|Русский|VS|JSON|PNG|PG|SG|SF|PF|C|GK|RB|CB|LB|DM|CM|RW|ST|LW)$/;

(async () => {
  const { srv, base } = await serve();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    // ---------- 1. Layout x language x viewport ----------
    for (const [bname, b] of Object.entries(BOARD)) {
      let enStrings = null;
      for (const vp of VIEWPORTS) for (const lang of LANGS) {
        await check(`${bname} layout ${vp.name} ${lang}`, async () => {
          const ctx = await newContext(browser, vp); const page = await ctx.newPage(); const errors = watch(page);
          try {
            await page.goto(base + b.file);
            await page.selectOption('#language', lang); // real UI path, not the API hook
            await page.waitForTimeout(80);
            assert.equal(await page.getAttribute('html', 'lang'), lang);
            assert.equal(await page.getAttribute('html', 'dir'), RTL.has(lang) ? 'rtl' : 'ltr');
            const raw = await page.evaluate(a => [...document.querySelectorAll('[data-' + a + ']')].filter(el => el.textContent.trim() === el.dataset[a]).map(el => el.dataset[a]), b.i18nAttr);
            assert.deepEqual(raw, [], 'raw i18n keys visible');
            const { sizes, ctl } = await layout(page, b.controls);
            assert.ok(sizes.scroll <= sizes.width && sizes.body <= sizes.width, 'horizontal page scroll ' + JSON.stringify(sizes));
            const bad = Object.entries(ctl).filter(([, v]) => !/(^|\s)ok/.test(String(v)));
            assert.deepEqual(bad, [], 'unreachable controls');
            const small = Object.entries(ctl).filter(([, v]) => /ok-(small|under)/.test(String(v))).map(([k, v]) => k + ' ' + v);
            const strings = await uiStrings(page);
            if (lang === 'en' && vp.name === '390x844') enStrings = new Set(strings);
            let leftover = [];
            if (lang !== 'en' && enStrings && vp.name === '390x844') leftover = strings.filter(s => enStrings.has(s) && !NEUTRAL.test(s));
            if (vp.name === '360x740' || lang === 'en') {
              await page.evaluate(() => scrollTo(0, 0));
              await page.screenshot({ path: path.join(SHOTS, `${bname}-${vp.name}-${lang}.png`), fullPage: true });
            }
            assert.deepEqual(errors, []);
            const info = {}; if (small.length) info.smallTargets = small; if (leftover.length) info.untranslatedEnglish = leftover;
            return Object.keys(info).length ? info : null;
          } finally { await ctx.close(); }
        });
      }
    }

    // ---------- 2. Persistence across reload (language + content) ----------
    const phone = VIEWPORTS[1];
    await check('scoreboard persistence: score + language survive reload', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.scoreboard.file);
        await page.selectOption('#language', 'ar');
        await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
        await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
        await page.click('[data-action="foul"][data-team="1"][data-delta="1"]');
        const id = await page.evaluate(() => window.PEScoreboard.getState().id);
        await page.reload();
        assert.equal(await page.textContent('#score0'), '2'); assert.equal(await page.textContent('#foul1'), '1');
        assert.equal(await page.evaluate(() => window.PEScoreboard.getState().id), id);
        assert.equal(await page.getAttribute('html', 'lang'), 'ar');
        assert.deepEqual(errors, []);
        return { saveText: (await page.textContent('#save')).slice(0, 60) };
      } finally { await ctx.close(); }
    });
    await check('coach persistence: sport + language survive reload', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.coach.file);
        await page.selectOption('#language', 'ru');
        await page.selectOption('#quickSport', 'football');
        await page.reload();
        assert.equal(await page.evaluate(() => window.PECoachBoard.getState().sport), 'football');
        assert.equal(await page.getAttribute('html', 'lang'), 'ru');
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });

    await check('scoreboard keeps autosaving after a same-tab reload (no false "another tab" conflict)', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      await page.addInitScript(() => { window.__storageEvents = []; addEventListener('storage', e => window.__storageEvents.push(e.key)); });
      try {
        await page.goto(base + BOARD.scoreboard.file);
        await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
        await page.reload(); await page.waitForTimeout(300);
        await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
        const shown = await page.textContent('#score0');
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pe-scoreboard.v1')).current.scores[0]);
        const info = { shown, stored: String(stored), storageEventsSeenByNewDocument: await page.evaluate(() => window.__storageEvents.length), save: (await page.textContent('#save')).slice(0, 60) };
        assert.equal(String(stored), shown, 'displayed score not persisted after reload: ' + JSON.stringify(info));
        assert.deepEqual(errors, []);
        return info;
      } finally { await ctx.close(); }
    });
    await check('scoreboard first-ever open does not claim "Match restored"', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.scoreboard.file);
        const toast = (await page.textContent('#toast')).trim();
        assert.equal(toast, '', 'first-open toast: ' + toast);
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });

    // ---------- 3. Export / import (download events) ----------
    await check('scoreboard export: JSON download event + valid content; archive download', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.scoreboard.file);
        await page.click('[data-action="score"][data-team="1"][data-delta="1"]');
        const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#export')]);
        const body = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
        assert.equal(body.format, 'pe-scoreboard-result'); assert.equal(body.match.scores[1], 1);
        await page.click('#finish');
        await page.click('#archive summary');
        const [dl2] = await Promise.all([page.waitForEvent('download'), page.locator('#archiveRows button').first().click()]);
        assert.match(dl2.suggestedFilename(), /\.json$/);
        const hasImport = await page.evaluate(() => !!document.querySelector('input[type=file]'));
        if (!hasImport) observe('scoreboard JSON import', 'No file input / import UI: exported results cannot be re-imported.');
        assert.deepEqual(errors, []);
        return { file: dl.suggestedFilename(), bytes: fs.statSync(await dl.path()).size };
      } finally { await ctx.close(); }
    });
    await check('coach export: JSON + PNG download events, JSON re-import round trip', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.coach.file);
        await page.selectOption('#example', { index: 1 }); await page.click('#loadExample');
        const before = await page.evaluate(() => JSON.stringify(window.PECoachBoard.getState()));
        const [dj] = await Promise.all([page.waitForEvent('download'), page.click('#save')]);
        const jpath = await dj.path(); const j = JSON.parse(fs.readFileSync(jpath, 'utf8'));
        assert.ok(Array.isArray(j.phases) && j.phases.length > 1);
        const [dp] = await Promise.all([page.waitForEvent('download'), page.click('#image')]);
        const png = fs.readFileSync(await dp.path());
        assert.equal(png.slice(1, 4).toString(), 'PNG');
        const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
        fs.copyFileSync(await dp.path(), path.join(SHOTS, 'coach-export.png'));
        await page.click('#reset');
        await page.setInputFiles('#file', jpath);
        await page.waitForTimeout(150);
        const after = await page.evaluate(() => JSON.stringify(window.PECoachBoard.getState()));
        assert.equal(after, before, 'imported scenario equals exported one');
        assert.deepEqual(errors, []);
        return { json: dj.suggestedFilename(), png: dp.suggestedFilename(), pngSize: w + 'x' + h, pngBytes: png.length };
      } finally { await ctx.close(); }
    });

    // ---------- 4. Storage throwing (getter blocked, and setItem quota) ----------
    for (const [bname, b] of Object.entries(BOARD)) {
      await check(`${bname} storage getter throws (SecurityError): renders, works in memory, says unsaved`, async () => {
        const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
        await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } }); });
        try {
          await page.goto(base + b.file);
          await page.selectOption('#language', 'he');
          let status;
          if (bname === 'scoreboard') {
            await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
            assert.equal(await page.textContent('#score0'), '1');
            status = { save: (await page.textContent('#save')).trim(), saveIsError: await page.evaluate(() => document.querySelector('#save').classList.contains('error')), toast: (await page.textContent('#toast')).trim() };
            assert.ok(status.saveIsError, 'save status flagged');
          } else {
            await page.click('#quickRotate');
            status = { autosave: (await page.textContent('[data-i="autosave"]')).trim() };
          }
          assert.deepEqual(errors, []);
          return status;
        } finally { await ctx.close(); }
      });
      await check(`${bname} setItem quota error: no crash, unsaved state shown`, async () => {
        const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
        await page.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
        try {
          await page.goto(base + b.file);
          let status;
          if (bname === 'scoreboard') {
            await page.click('[data-action="score"][data-team="0"][data-delta="1"]');
            status = { save: (await page.textContent('#save')).trim() };
            assert.ok(await page.evaluate(() => document.querySelector('#save').classList.contains('error')));
          } else {
            await page.click('#quickRotate');
            status = { autosave: (await page.textContent('[data-i="autosave"]')).trim() };
            assert.match(status.autosave, /unavailable|not/i);
          }
          assert.deepEqual(errors.filter(e => !/QuotaExceeded/.test(e)), []);
          return status;
        } finally { await ctx.close(); }
      });
    }

    // ---------- 5. Print (print media screenshot + PDF) ----------
    for (const [bname, b] of Object.entries(BOARD)) {
      await check(`${bname} print media screenshot + PDF`, async () => {
        const ctx = await newContext(browser, VIEWPORTS[3]); const page = await ctx.newPage(); const errors = watch(page);
        try {
          await page.goto(base + b.file);
          if (bname === 'coach') { await page.selectOption('#example', { index: 1 }); await page.click('#loadExample'); }
          else { await page.click('[data-action="score"][data-team="0"][data-delta="1"]'); }
          await page.emulateMedia({ media: 'print' });
          await page.screenshot({ path: path.join(SHOTS, `${bname}-print.png`), fullPage: true });
          const pdf = await page.pdf({ path: path.join(SHOTS, `${bname}-print.pdf`), format: 'A4', printBackground: true });
          const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
          const hasPrintCss = await page.evaluate(() => [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.media && /print/.test(r.media.mediaText)); } catch (e) { return false; } }));
          if (!hasPrintCss) observe(bname + ' print', 'No @media print rules: printing outputs the dark on-screen UI including buttons.');
          assert.deepEqual(errors, []);
          return { pdfPages: pages, pdfBytes: pdf.length, hasPrintCss };
        } finally { await ctx.close(); }
      });
    }

    // ---------- 6. Offline: file:// with network disabled ----------
    for (const [bname, b] of Object.entries(BOARD)) {
      await check(`${bname} offline file:// (context offline, all requests recorded)`, async () => {
        const ctx = await newContext(browser, phone); await ctx.setOffline(true);
        const page = await ctx.newPage(); const errors = watch(page); const reqs = [];
        page.on('request', r => reqs.push(r.url()));
        try {
          await page.goto('file://' + path.join(BOARDS, b.file));
          assert.equal(await page.evaluate(api => typeof window[api].getState, b.api), 'function');
          const nonFile = reqs.filter(u => !/^(file:|data:|blob:)/.test(u));
          assert.deepEqual(nonFile, []);
          assert.deepEqual(errors, []);
          return { requests: reqs.length };
        } finally { await ctx.close(); }
      });
    }

    // ---------- 7. Presentation/fullscreen + sound toggles (behaviour only, no real audio) ----------
    await check('scoreboard display mode + sound toggle (no audio output verified)', async () => {
      const ctx = await newContext(browser, VIEWPORTS[3]); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.scoreboard.file);
        await page.click('#sound');
        const pressed = await page.getAttribute('#sound', 'aria-pressed');
        await page.click('#display');
        await page.waitForTimeout(200);
        const project = await page.evaluate(() => document.body.classList.contains('project'));
        await page.screenshot({ path: path.join(SHOTS, 'scoreboard-display-1366.png') });
        await page.click('#exitproject');
        assert.equal(pressed, 'true'); assert.ok(project);
        assert.deepEqual(errors, []);
        return { soundPressed: pressed, displayMode: project };
      } finally { await ctx.close(); }
    });
    await check('coach demo playback runs and help dialog opens', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + BOARD.coach.file);
        await page.selectOption('#example', { index: 0 }); await page.click('#loadExample');
        await page.click('#play'); await page.waitForTimeout(600);
        const progress = await page.inputValue('#progress');
        await page.screenshot({ path: path.join(SHOTS, 'coach-playing-390.png'), fullPage: false });
        await page.click('#help'); assert.ok((await page.textContent('#helpBody')).length > 100);
        assert.deepEqual(errors, []);
        return { progressAfter600ms: progress };
      } finally { await ctx.close(); }
    });
    await check('launcher index.html links both boards', async () => {
      const ctx = await newContext(browser, phone); const page = await ctx.newPage(); const errors = watch(page);
      try {
        await page.goto(base + 'index.html');
        const hrefs = await page.$$eval('a', as => as.map(a => a.getAttribute('href')));
        assert.deepEqual(hrefs.sort(), ['PE_Coach_Board.html', 'PE_Ultimate_Scoreboard.html']);
        const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
        assert.ok(sizes.scroll <= sizes.width);
        await page.screenshot({ path: path.join(SHOTS, 'launcher-390.png'), fullPage: true });
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });

    // ---------- 8. Static product observations ----------
    for (const [bname, b] of Object.entries(BOARD)) {
      const html = fs.readFileSync(path.join(BOARDS, b.file), 'utf8');
      const visibleText = html.replace(/<!--[\s\S]*?-->/, '');
      observe(bname + ' static', {
        bytes: Buffer.byteLength(html), title: (html.match(/<title>([^<]*)/) || [])[1],
        brandPEUltimate: /PE ULTIMATE|PE Ultimate/.test(visibleText),
        licenceOrTermsText: /licen[cs]e|terms of use|©|copyright/i.test(visibleText),
        versionOrAboutUI: /data-[ti]="(about|version)"/.test(html),
      });
    }
  } finally { await browser.close(); srv.close(); }
  observe('external requests (all runs)', external.length ? external : 'none');
  const summary = { pass, fail, evidence: 'Headless Chromium (Playwright ' + PW_VERSION + '), loopback + file://; emulated viewports; no physical device, no audio output, no phone download UI', shots: SHOTS };
  fs.writeFileSync(JSON_OUT, JSON.stringify({ summary, results, observations }, null, 2));
  console.log(JSON.stringify(summary));
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
