'use strict';
/*
 * Browser check for store-content/tools/shuttle-run/shuttle-run.html.
 * Evidence type: headless Chromium via Playwright, file:// with the network blocked, desktop
 * and emulated phone/tablet viewports. NOT a physical device, NOT audible output, NOT iOS Safari.
 *
 *   NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
 *     node store-content/tools/shuttle-run/checks/browser-shuttle-run.cjs
 * Options: SHOTS_DIR=<dir> (screenshots; default <os tmp>/shuttle-run-shots).
 * Uses an installed Playwright (local, NODE_PATH or `npm root -g`); adds no dependency.
 */
const fs = require('fs'), path = require('path'), os = require('os'), url = require('url');
const assert = require('node:assert/strict');
function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* fall through */ }
  const root = require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim();
  return require(path.join(root, 'playwright'));
}
const { chromium } = loadPlaywright();
const FILE = path.resolve(__dirname, '..', 'shuttle-run.html');
const URL0 = url.pathToFileURL(FILE).href;
const SHOTS = process.env.SHOTS_DIR || path.join(os.tmpdir(), 'shuttle-run-shots');
fs.mkdirSync(SHOTS, { recursive: true });
const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '1366x768', width: 1366, height: 768, mobile: false },
];
const LANGS = ['en', 'he', 'ar', 'ru', 'es'];
const external = [];
let pass = 0, fail = 0;
async function check(name, fn) {
  try { await fn(); pass++; console.log('PASS ' + name); } catch (e) { fail++; console.log('FAIL ' + name + '\n  ' + (e.stack || e).toString().split('\n').slice(0, 4).join('\n  ')); }
}
/* Counts AudioContext constructions (must stay 0 until a user gesture). */
const AUDIO_SPY = `(() => { window.__acNew = 0; for (const n of ['AudioContext','webkitAudioContext']) { const C = window[n]; if (!C) continue;
  window[n] = class extends C { constructor(...a) { super(...a); window.__acNew++; } }; } })();`;
const BLOCK_STORAGE = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });`;
const QUOTA_STORAGE = `(() => { const p = Storage.prototype; const orig = p.setItem; p.setItem = function () { const e = new DOMException('full', 'QuotaExceededError'); throw e; }; })();`;

async function newPage(browser, vp, opts = {}) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1, acceptDownloads: true, offline: true });
  await context.route('**/*', route => { const u = route.request().url(); if (u.startsWith('file:')) return route.continue(); external.push(u); return route.abort(); });
  await context.addInitScript(AUDIO_SPY);
  for (const s of opts.init || []) await context.addInitScript(s);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  await page.goto(URL0);
  return { context, page, errors };
}
const noHScroll = async page => {
  const s = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, w: innerWidth }));
  assert.ok(s.doc <= s.w && s.body <= s.w, 'horizontal scroll ' + JSON.stringify(s));
};
const state = page => page.evaluate(() => window.PEShuttle.getState());

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=user-gesture-required'] });
  console.log('Chromium ' + browser.version());
  try {
    /* 1. Layout x languages (real <select>). */
    for (const vp of VIEWPORTS) for (const lang of LANGS) await check(`layout ${vp.name} ${lang}`, async () => {
      const { context, page, errors } = await newPage(browser, vp);
      try {
        assert.equal(await page.getAttribute('html', 'lang'), 'en', 'English default');
        await page.selectOption('#language', lang);
        assert.equal(await page.getAttribute('html', 'lang'), lang);
        assert.equal(await page.getAttribute('html', 'dir'), ['he', 'ar'].includes(lang) ? 'rtl' : 'ltr');
        // Fill some state: runners, lanes, a result, reference thresholds, open folds.
        await page.evaluate(() => { window.PEShuttle.__test.useFakeClock(); });
        await page.click('#startBtn');
        await page.evaluate(() => window.PEShuttle.__test.advance(5 + 130));
        await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; });
        await page.fill('#runnersText', 'Alexandra Konstantinopoulou\nBen\n12');
        await page.click('#runnersApply');
        await page.check('#laneMode');
        await page.click('#bandAdd');
        await page.click('#runnerChips button >> nth=0');
        await page.click('#dropBtn');
        await page.waitForTimeout(30);
        const raw = await page.evaluate(() => [...document.querySelectorAll('[data-t]')].filter(n => n.textContent === n.dataset.t && n.dataset.t !== 'm').map(n => n.dataset.t));
        assert.deepEqual(raw, [], 'raw keys shown');
        if (lang !== 'en') assert.notEqual(await page.textContent('#title'), '20 m Shuttle Run (Beep Test)');
        await noHScroll(page);
        for (const sel of ['#startBtn', '#stopBtn', '#dropBtn', '#language', '#presentBtn', '#csvBtn']) {
          const hit = await page.evaluate(sel => { const el = document.querySelector(sel); el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!top && (top === el || el.contains(top)) && r.width >= 40 && r.height >= 40; }, sel);
          assert.ok(hit, sel + ' reachable and >= 40px');
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(SHOTS, `${vp.name}-${lang}.png`), fullPage: true });
        // Gym display.
        await page.click('#presentBtn');
        assert.ok(await page.evaluate(() => document.body.classList.contains('present')));
        await noHScroll(page);
        const big = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('levelVal')).fontSize));
        assert.ok(big >= 70, 'level digits >= 70px in gym display, got ' + big);
        const dropBox = await page.evaluate(() => { const r = document.getElementById('dropBtn').getBoundingClientRect(); return { bottom: r.bottom, h: innerHeight }; });
        assert.ok(dropBox.bottom <= dropBox.h, 'drop-out button visible without scrolling in gym display ' + JSON.stringify(dropBox));
        await page.screenshot({ path: path.join(SHOTS, `${vp.name}-${lang}-display.png`) });
        await page.click('#exitPresent');
        assert.equal(await page.evaluate(() => document.body.classList.contains('present')), false);
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    /* 2. Start/pause/stop flow with a fast test clock; audio only after the gesture; CSV. */
    await check('flow: gesture-gated audio, countdown, levels, pause, drop-outs, stop, reset, CSV download', async () => {
      const { context, page, errors } = await newPage(browser, VIEWPORTS[1]);
      try {
        assert.equal(await page.evaluate(() => window.__acNew), 0, 'no AudioContext before a gesture');
        assert.equal((await state(page)).audioContexts, 0);
        await page.evaluate(() => window.PEShuttle.__test.useFakeClock());
        await page.click('#dropBtn', { trial: true }).catch(() => {});
        assert.equal(await page.isDisabled('#dropBtn'), true, 'drop disabled before start');
        await page.click('#startBtn');
        assert.equal(await page.evaluate(() => window.__acNew), 1, 'AudioContext created by the Start tap');
        let s = await state(page);
        assert.equal(s.phase, 'countdown'); assert.equal(s.elapsed, -5);
        assert.equal((await page.textContent('#cdVal')).trim(), '5');
        await page.evaluate(() => window.PEShuttle.__test.advance(5));
        assert.equal((await state(page)).phase, 'running');
        await page.evaluate(() => window.PEShuttle.__test.advance(72 / 8.5 + 0.01)); // first shuttle done
        assert.equal(await page.textContent('#levelVal'), '1');
        assert.equal(await page.textContent('#shuttleVal'), '2/7');
        assert.equal(await page.textContent('#distVal'), '20');
        await page.evaluate(() => window.PEShuttle.__test.advance(60));
        assert.equal(await page.textContent('#levelVal'), '2');
        assert.equal(await page.textContent('#speedVal'), '9.0');
        await page.click('#startBtn'); // pause
        s = await state(page); assert.equal(s.phase, 'paused');
        await page.evaluate(() => window.PEShuttle.__test.advance(30));
        assert.equal((await state(page)).elapsed, s.elapsed, 'paused clock frozen');
        await page.click('#startBtn'); // resume
        assert.equal((await state(page)).phase, 'running');
        await page.evaluate(() => window.PEShuttle.__test.advance(1));
        await page.click('#runnersFold summary');
        await page.fill('#runnersText', 'Ana\nBen\n=cmd\nana');
        await page.click('#runnersApply');
        assert.equal(await page.locator('#runnerChips button').count(), 3);
        await page.click('#runnerChips button:has-text("Ana")');
        await page.click('#runnerChips button:has-text("=cmd")');
        await page.click('#dropBtn');
        s = await state(page);
        assert.deepEqual(s.results.map(r => r.name), ['Ana', '=cmd', 'Runner 1']);
        assert.equal(s.results[0].level, 2); assert.equal(s.results[0].dist, 160);
        assert.equal(await page.isDisabled('#runnerChips button:has-text("Ana")'), true);
        await page.click('#stopBtn');
        s = await state(page); assert.equal(s.phase, 'stopped');
        assert.equal(await page.isDisabled('#startBtn'), true);
        const dl = page.waitForEvent('download');
        await page.click('#csvBtn');
        const d = await dl;
        assert.match(d.suggestedFilename(), /^shuttle-run-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/);
        const csv = fs.readFileSync(await d.path(), 'utf8');
        fs.writeFileSync(path.join(SHOTS, 'export.csv'), csv);
        assert.ok(csv.startsWith('﻿No.,Name,Level,Shuttle,Distance (m)'), csv.slice(0, 80));
        const lines = csv.trim().split('\r\n');
        assert.equal(lines.length, 4);
        assert.match(lines[1], /^1,Ana,2,1,160,/);
        assert.match(lines[2], /^2,'=cmd,/, 'formula guard');
        await page.click('#resetBtn');
        assert.equal((await state(page)).phase, 'idle');
        assert.equal((await state(page)).results.length, 3, 'reset keeps results');
        // Run to the end of the protocol.
        await page.click('#startBtn');
        const total = await page.evaluate(() => window.PEShuttle.__test.advance(5 + 25 * 60));
        s = await state(page); assert.equal(s.phase, 'finished'); assert.ok(total >= 20 * 59);
        assert.equal(await page.textContent('#levelVal'), '20');
        assert.equal(await page.evaluate(() => window.__acNew), 1, 'one AudioContext for the session');
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    /* 3. Reload persistence and "delete all data". */
    await check('reload keeps settings, language, runners and results; delete-all removes only pe-shuttle keys', async () => {
      const { context, page, errors } = await newPage(browser, VIEWPORTS[0]);
      try {
        await page.evaluate(() => localStorage.setItem('unrelated', 'keep'));
        await page.click('#setupFold summary');
        await page.click('#distSeg button[data-d="15"]');
        await page.click('#spPlus'); await page.click('#spPlus');
        await page.fill('#age', '15'); await page.press('#age', 'Tab');
        await page.selectOption('#countdown', '3');
        await page.selectOption('#language', 'ru');
        await page.evaluate(() => window.PEShuttle.__test.useFakeClock());
        await page.click('#startBtn');
        await page.evaluate(() => window.PEShuttle.__test.advance(3 + 30));
        await page.click('#dropBtn');
        await page.reload();
        const s = await state(page);
        assert.equal(s.lang, 'ru'); assert.equal(await page.getAttribute('html', 'lang'), 'ru');
        assert.equal(s.settings.dist, 15); assert.equal(s.settings.start, 9.5); assert.equal(s.settings.age, 15); assert.equal(s.settings.countdown, 3);
        assert.equal(s.results.length, 1); assert.equal(s.results[0].course, 15);
        assert.equal(s.phase, 'idle', 'a reload never resumes a running clock');
        assert.equal(await page.textContent('#protoPill'), 'Изменённый протокол');
        const keys = await page.evaluate(() => Object.keys(localStorage).sort());
        assert.deepEqual(keys, ['pe-shuttle.v1', 'pe-shuttle.v1.lang', 'unrelated']);
        await page.click('#clearAll'); await page.click('#clearAll');
        assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['unrelated']);
        assert.equal((await state(page)).results.length, 0);
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    /* 4. Blocked and full storage. */
    for (const [label, init] of [['blocked storage (SecurityError)', BLOCK_STORAGE], ['full storage (QuotaExceededError)', QUOTA_STORAGE]]) await check(label + ': tool works, says "Not saved", CSV still exports', async () => {
      const { context, page, errors } = await newPage(browser, VIEWPORTS[1], { init: [init] });
      try {
        await page.evaluate(() => window.PEShuttle.__test.useFakeClock());
        await page.click('#startBtn');
        await page.evaluate(() => window.PEShuttle.__test.advance(5 + 20));
        await page.click('#dropBtn');
        assert.equal((await state(page)).results.length, 1);
        assert.match(await page.textContent('#saveStatus'), /^Not saved/);
        assert.ok(await page.evaluate(() => document.getElementById('saveStatus').classList.contains('error')));
        const dl = page.waitForEvent('download'); await page.click('#csvBtn'); await dl;
        await page.selectOption('#language', 'he');
        assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    /* 5. Corrupted saved data is set aside with a notice. */
    await check('corrupted saved data: fresh start, original kept under .corrupt, notice shown', async () => {
      const { context, page, errors } = await newPage(browser, VIEWPORTS[3]);
      try {
        await page.evaluate(() => localStorage.setItem('pe-shuttle.v1', '{oops'));
        await page.reload();
        assert.equal(await page.evaluate(() => localStorage.getItem('pe-shuttle.v1.corrupt')), '{oops');
        assert.match(await page.textContent('#saveStatus'), /could not be read/);
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    /* 6. Real clock smoke test (no fake clock): audio clock path runs and beeps are scheduled. */
    await check('real clock: Start runs the countdown and advances on its own; Pause stops it', async () => {
      const { context, page, errors } = await newPage(browser, VIEWPORTS[3]);
      try {
        await page.click('#setupFold summary');
        await page.selectOption('#countdown', '0');
        await page.click('#startBtn');
        await page.waitForTimeout(1200);
        const s = await state(page);
        assert.equal(s.phase, 'running'); assert.ok(s.elapsed > 0.8 && s.elapsed < 3, String(s.elapsed));
        const ac = await page.evaluate(() => window.__acNew);
        assert.equal(ac, 1);
        await page.click('#startBtn');
        const p1 = (await state(page)).elapsed; await page.waitForTimeout(300);
        assert.equal((await state(page)).elapsed, p1);
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });

    await check('offline: no request left file:// in any case', async () => { assert.deepEqual(external, []); });
  } finally { await browser.close(); }
  console.log(`\n${pass} passed, ${fail} failed. Screenshots: ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
