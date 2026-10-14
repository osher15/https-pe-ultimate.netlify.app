'use strict';
/*
 * Interval Trainer — browser pass (headless Chromium via Playwright; no new dependency).
 * Evidence type: headless Chromium on file:// with desktop and emulated phone/tablet viewports.
 * NOT a physical device, NOT iOS Safari, NOT audible audio output.
 *
 *   NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
 *     node store-content/tools/interval-trainer/checks/browser.cjs
 * Options: SHOTS_DIR (default <os tmp>/interval-trainer-shots), TOOL_DIR (run against a copy).
 * Exit code 1 if any check fails.
 */
const fs = require('fs'), path = require('path'), os = require('os');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  for (const p of ['playwright', 'playwright-core']) { try { return require(p); } catch (e) { /* next */ } }
  const root = require('child_process').execSync('npm root -g', { encoding: 'utf8' }).trim();
  return require(path.join(root, 'playwright'));
}
const { chromium } = loadPlaywright();
const TOOL = process.env.TOOL_DIR ? path.resolve(process.env.TOOL_DIR) : path.resolve(__dirname, '..');
const URL_ = pathToFileURL(path.join(TOOL, 'interval-trainer.html')).href;
const SHOTS = process.env.SHOTS_DIR || path.join(os.tmpdir(), 'interval-trainer-shots');
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '1366x768', width: 1366, height: 768, mobile: false },
];
const LANGS = ['en', 'he', 'ar', 'ru', 'es'];
const results = [];
let failed = 0;
async function check(name, fn) {
  try { await fn(); results.push({ name, ok: true }); console.log('ok   ' + name); }
  catch (e) { failed++; results.push({ name, ok: false, error: String(e && e.message || e) }); console.log('FAIL ' + name + '\n     ' + String(e && e.message || e).split('\n')[0]); }
}
function assert(c, m) { if (!c) throw new Error(m || 'assertion failed'); }

/* Counts AudioContext constructions and records every request URL. */
const INIT = `(() => {
  window.__audioMade = 0;
  const A = window.AudioContext;
  if (A) window.AudioContext = class extends A { constructor(...a) { super(...a); window.__audioMade++; } };
})();`;
const BLOCK_STORAGE = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { const e = new Error('denied'); e.name = 'SecurityError'; throw e; } });`;

async function newPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 });
  await ctx.addInitScript(INIT);
  if (opts.blockStorage) await ctx.addInitScript(BLOCK_STORAGE);
  if (opts.offline) await ctx.setOffline(true);
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  page.__requests = []; page.__errors = [];
  page.on('request', r => page.__requests.push(r.url()));
  page.on('pageerror', e => page.__errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') page.__errors.push(m.text()); });
  await page.goto(URL_);
  return { ctx, page };
}
const state = page => page.evaluate(() => window.PEIntervalTrainer.getState());
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(page, fn, arg, ms = 15000) { await page.waitForFunction(fn, arg, { timeout: ms }); }

(async () => {
  const browser = await chromium.launch();
  console.log('Chromium ' + browser.version() + ' · ' + URL_);

  /* 1. Layout matrix: 4 viewports x 5 languages x 4 tabs */
  for (const vp of VIEWPORTS) for (const lang of LANGS) {
    await check(`layout ${vp.name} ${lang}: no horizontal scroll on any tab, dir/lang, no raw keys, no stray Hebrew`, async () => {
      const { ctx, page } = await newPage(browser, vp);
      await page.selectOption('#lang', lang);
      const dir = await page.evaluate(() => [document.documentElement.lang, document.documentElement.dir]);
      assert(dir[0] === lang && dir[1] === (lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'), 'lang/dir ' + dir);
      for (const tab of ['timer', 'circuit', 'lib', 'dice']) {
        await page.click(`[data-tab="${tab}"]`);
        if (tab === 'circuit') await page.click('#c-gen');
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
          text: document.body.innerText, keys: Object.keys(window.PE_IT_DATA.i18n) }));
        assert(m.sw <= m.cw + 1, `${tab}: horizontal scroll ${m.sw} > ${m.cw}`);
        const visible = m.text.replace(/English|עברית|العربية|Русский|Español/g, '');
        const raw = m.keys.filter(k => new RegExp('(^|\\s)' + k.replace(/\./g, '\\.') + '(\\s|$)').test(visible));
        assert(!raw.length, tab + ': raw keys ' + raw.join(','));
        if (lang !== 'he') assert(!/[֐-׿]/.test(visible), tab + ': Hebrew text visible in ' + lang);
        if (tab === 'timer' || (tab === 'lib' && vp.name === '360x740')) await page.screenshot({ path: path.join(SHOTS, `${tab}-${vp.name}-${lang}.png`) });
      }
      assert(page.__errors.length === 0, 'page errors: ' + page.__errors.join(' | '));
      await ctx.close();
    });
  }

  /* 2. Run a preset with a sped-up clock: audio only after a gesture, pause/resume/skip, finish */
  await check('timer: Quick preset (148 s) at 40x — audio after gesture only, pause/resume/skip, finishes', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[1]);
    let s = await state(page);
    assert(s.audioContexts === 0 && await page.evaluate(() => window.__audioMade) === 0, 'no AudioContext before any gesture');
    await page.selectOption('#lang', 'es'); await page.selectOption('#lang', 'en');
    await page.click('[data-p="quick"]');
    assert(await page.evaluate(() => window.__audioMade) === 0, 'choosing a preset does not create audio');
    await page.evaluate(() => window.PEIntervalTrainer.__test.setClockSpeed(40));
    await page.click('#t-go');
    assert(await page.evaluate(() => window.__audioMade) === 1, 'AudioContext created by the Start gesture');
    s = await state(page); assert(s.running && s.mode === 'timer' && s.phase.kind === 'prep', 'running prep ' + JSON.stringify(s.phase));
    await waitFor(page, () => window.PEIntervalTrainer.getState().phase && window.PEIntervalTrainer.getState().phase.kind === 'work');
    await page.screenshot({ path: path.join(SHOTS, 'run-work-390-en.png') });
    await page.click('#t-pause');
    const p1 = await state(page); assert(p1.paused, 'paused');
    const t1 = await page.textContent('#t-time'); await sleep(800);
    const p2 = await state(page); assert(p2.phase.index === p1.phase.index && p2.phase.remain === p1.phase.remain && await page.textContent('#t-time') === t1, 'time frozen while paused');
    assert((await page.textContent('#t-pause')).includes('Resume'), 'pause button says Resume');
    await page.click('#t-pause'); assert(!(await state(page)).paused, 'resumed');
    const before = (await state(page)).phase.index; await page.click('#t-skip');
    assert((await state(page)).phase.index === before + 1, 'skip moves to the next phase');
    await waitFor(page, () => window.PEIntervalTrainer.getState().finished.timer, null, 20000);
    assert((await page.textContent('#t-ph')).includes('Finished'), 'finished label');
    assert(!(await state(page)).running, 'stopped after finish');
    assert(page.__errors.length === 0, page.__errors.join(' | '));
    await ctx.close();
  });

  await check('timer: Stop resets; Strength preset shows set labels (he, RTL)', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[0]);
    await page.selectOption('#lang', 'he'); await page.click('[data-p="strength"]');
    await page.evaluate(() => window.PEIntervalTrainer.__test.setClockSpeed(20));
    await page.click('#t-go');
    await waitFor(page, () => window.PEIntervalTrainer.getState().phase.kind === 'work');
    const label = await page.textContent('#t-ph'); assert(/סבב 1\/6 · סט 1/.test(label), 'Hebrew set label: ' + label);
    await page.screenshot({ path: path.join(SHOTS, 'run-work-360-he.png') });
    await page.click('#t-stop'); const s = await state(page);
    assert(!s.running && (await page.textContent('#t-ph')).includes('הופסק'), 'stopped');
    await ctx.close();
  });

  /* 3. Stations */
  await check('stations: draw, run at 100x with skip, finish; current station figure shown', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[1]);
    await page.click('[data-tab="circuit"]'); await page.fill('#c-n', '4'); await page.dispatchEvent('#c-n', 'change');
    await page.click('#c-gen');
    assert(await page.locator('#c-list .st').count() === 4, '4 stations');
    await page.evaluate(() => window.PEIntervalTrainer.__test.setClockSpeed(5));
    await page.click('#c-go');
    await waitFor(page, () => window.PEIntervalTrainer.getState().phase && window.PEIntervalTrainer.getState().phase.kind === 'work');
    await page.click('#c-pause');
    assert(await page.locator('#c-list .st.now').count() === 1, 'current station highlighted');
    assert(await page.locator('#c-fig img').count() + await page.locator('#c-fig .ph-img').count() === 1, 'station figure in run panel');
    await page.click('#c-full'); await page.screenshot({ path: path.join(SHOTS, 'stations-display-390-en.png') }); await page.click('#c-full');
    await page.click('#c-pause');
    await page.evaluate(() => window.PEIntervalTrainer.__test.setClockSpeed(100));
    await page.click('#c-skip');
    await waitFor(page, () => window.PEIntervalTrainer.getState().finished.circuit, null, 20000);
    assert((await page.textContent('#c-ph')).includes('Round complete'), 'done label');
    await ctx.close();
  });

  /* 4. Full screen / gym display mode */
  await check('display mode: overlay on, huge timer, Esc exits', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[3]);
    await page.click('[data-p="tabata"]'); await page.click('#t-go'); await page.click('#t-full');
    assert(await page.evaluate(() => document.body.classList.contains('display') && document.querySelector('#t-run').classList.contains('show')), 'display on');
    await sleep(300);
    const fs_ = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#t-time')).fontSize));
    assert(fs_ >= 300, 'timer font ' + fs_ + 'px');
    await page.screenshot({ path: path.join(SHOTS, 'display-1366-en.png') });
    await page.keyboard.press('Escape');
    assert(await page.evaluate(() => !document.body.classList.contains('display')), 'Esc exits');
    await ctx.close();
  });

  /* 5. Library + dice */
  await check('library: every figure loads from media/, placeholders for no-media exercises, detail dialog', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[1]);
    await page.click('[data-tab="lib"]');
    await page.evaluate(() => Promise.all([...document.querySelectorAll('#l-grid img')].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })));
    const m = await page.evaluate(() => ({ imgs: [...document.querySelectorAll('#l-grid img')].map(i => [i.getAttribute('src'), i.naturalWidth]), ph: document.querySelectorAll('#l-grid .ph-img').length, cards: document.querySelectorAll('#l-grid .ex').length }));
    assert(m.cards === 47, 'cards ' + m.cards);
    assert(m.ph === 2, 'placeholders ' + m.ph);
    const bad = m.imgs.filter(([s, w]) => !w || !/^media\/[a-z0-9]+\.gif$/.test(s)); assert(!bad.length, 'broken ' + JSON.stringify(bad));
    await page.click('#l-grid [data-id="squat"]');
    assert(await page.evaluate(() => document.querySelector('#ex-dlg').open), 'dialog open');
    assert((await page.textContent('#ex-body')).includes('Recommended volume'), 'dose section');
    await page.screenshot({ path: path.join(SHOTS, 'lib-dialog-390-en.png') });
    await page.click('#ex-dlg [data-close]');
    await page.click('#l-grid [data-id="gluteb"]');
    assert(await page.locator('#ex-body .ph-img').count() === 1, 'placeholder in dialog');
    await ctx.close();
  });

  await check('dice: roll shows exercise and amount; audio created by the roll gesture', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[0]);
    await page.selectOption('#lang', 'ar'); await page.click('[data-tab="dice"]');
    assert(await page.evaluate(() => window.__audioMade) === 0);
    await page.click('#roll'); await sleep(900);
    assert((await page.textContent('#dice-res')).includes('×'), 'result');
    assert(await page.evaluate(() => window.__audioMade) === 1, 'audio after roll');
    await page.screenshot({ path: path.join(SHOTS, 'dice-360-ar.png') });
    await ctx.close();
  });

  /* 6. Persistence across reload */
  await check('reload keeps language, timer values, tab, sound, station list (own key only)', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[1]);
    await page.selectOption('#lang', 'ru'); await page.fill('#t-w', '33'); await page.dispatchEvent('#t-w', 'change');
    await page.click('#snd'); await page.click('[data-tab="circuit"]'); await page.click('#c-gen');
    const list = (await state(page)).settings.circuit.list;
    await page.reload();
    const s = await state(page);
    assert(s.settings.lang === 'ru' && await page.evaluate(() => document.documentElement.lang) === 'ru', 'lang');
    assert(await page.inputValue('#t-w') === '33' && s.settings.timer.preset === '', 'work 33, custom');
    assert(s.settings.sound === false && (await page.getAttribute('#snd', 'aria-pressed')) === 'false', 'sound off');
    assert(s.settings.tab === 'circuit' && await page.isVisible('#sec-circuit'), 'tab');
    assert(JSON.stringify(s.settings.circuit.list) === JSON.stringify(list) && await page.locator('#c-list .st').count() === list.length, 'station list');
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert(JSON.stringify(keys) === '["pe-tools.interval-trainer.v1"]', 'keys ' + keys);
    assert(s.storage === 'ok', 'storage ' + s.storage);
    await ctx.close();
  });

  /* 7. Blocked storage */
  await check('blocked storage: page works in memory and shows the notice', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[0], { blockStorage: true });
    assert(await page.isVisible('#store-note'), 'notice visible');
    await page.selectOption('#lang', 'es');
    assert((await page.textContent('#store-note')).includes('No se pueden guardar'), 'notice translated');
    await page.click('[data-p="quick"]'); await page.evaluate(() => window.PEIntervalTrainer.__test.setClockSpeed(50));
    await page.click('#t-go'); await waitFor(page, () => window.PEIntervalTrainer.getState().phase.kind === 'work');
    assert((await state(page)).storage === 'blocked');
    assert(page.__errors.length === 0, page.__errors.join(' | '));
    await page.screenshot({ path: path.join(SHOTS, 'blocked-360-es.png') });
    await ctx.close();
  });

  /* 8. Offline from file:// — no request leaves file:// */
  await check('offline file://: loads, runs, opens library; every request is file://', async () => {
    const { ctx, page } = await newPage(browser, VIEWPORTS[2], { offline: true });
    await page.click('[data-tab="lib"]'); await page.click('#l-grid [data-id="plank"]');
    await page.click('#ex-dlg [data-close]'); await page.click('[data-tab="dice"]'); await page.click('#roll'); await sleep(900);
    await page.click('[data-tab="timer"]'); await page.click('#t-go'); await sleep(300);
    const other = page.__requests.filter(u => !u.startsWith('file://'));
    assert(page.__requests.length > 1, 'requests seen'); assert(!other.length, 'non-file requests: ' + other.join(', '));
    assert(page.__errors.length === 0, page.__errors.join(' | '));
    await ctx.close();
  });

  await browser.close();
  const out = path.join(SHOTS, 'result.json');
  fs.writeFileSync(out, JSON.stringify({ when: new Date().toISOString(), url: URL_, results }, null, 1));
  console.log(`\n${results.length - failed}/${results.length} passed · screenshots + result.json in ${SHOTS}`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
