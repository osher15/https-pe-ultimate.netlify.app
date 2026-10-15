'use strict';
/*
 * C18 browser checks: backup-first "Delete all data on this device" + optional restore.
 * Shared helper; the copy next to each tool's checks is identical on purpose (tools stay self-contained).
 * Evidence type: headless Chromium via Playwright (synthetic storage, real downloads into a temp dir).
 * NOT a physical device, NOT a native WebView.
 *
 * Usage: await runDeviceDataChecks({ browser, cfg, check })
 *   cfg = { id, url, api, tool, own:[sorted own keys after seed], open, restore, langSel,
 *           seed(page), mutate(page), marker(page) -> JSON-able, defaults(page) -> asserts defaults }
 */
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');

const WORDS = { en: 'DELETE', he: 'מחק', ar: 'احذف', ru: 'УДАЛИТЬ', es: 'BORRAR' };
const ALL_TOOL_KEYS = ['pe-scoreboard.v1', 'pe-scoreboard.lang.v1', 'pe-ultimate-coach-board-v1', 'pe-tools.interval-trainer.v1', 'pe-shuttle.v1', 'pe-shuttle.v1.lang'];
const NEAR_MISS = ['unrelated', 'pe-scoreboard.v2', 'pe-shuttle.v2', 'pe-tools.other.v1', 'hm_unrelated_app_key'];
/* Logs every removeItem on localStorage and every download-anchor click, across reloads (sessionStorage). */
const LOG_INIT = `(() => {
  const L = () => JSON.parse(sessionStorage.getItem('__ddlog') || '[]');
  const P = e => { const a = L(); a.push(e); sessionStorage.setItem('__ddlog', JSON.stringify(a)); };
  const r = Storage.prototype.removeItem;
  Storage.prototype.removeItem = function (k) { if (this === window.localStorage) P('remove:' + k); return r.call(this, k); };
  const c = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (this.hasAttribute('download')) P('download:' + this.getAttribute('download')); return c.call(this); };
})();`;
const BLOCK_STORAGE = `Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });`;

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dd-checks-'));

async function openPage(browser, cfg, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width || 390, height: 844 }, acceptDownloads: true });
  await ctx.addInitScript(LOG_INIT);
  for (const s of opts.init || []) await ctx.addInitScript(s);
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const errors = [], dialogs = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => { dialogs.push(d.type()); d.dismiss().catch(() => {}); });
  await page.goto(cfg.url);
  return { ctx, page, errors, dialogs };
}
const decoyMap = cfg => {
  const m = {};
  for (const k of ALL_TOOL_KEYS.concat(NEAR_MISS)) if (!cfg.own.includes(k) && !(cfg.ownPrefix && k.indexOf(cfg.ownPrefix) === 0)) m[k] = 'decoy-value-for-' + k;
  return m;
};
const putAll = (page, map) => page.evaluate(m => { for (const [k, v] of Object.entries(m)) localStorage.setItem(k, v); }, map);
const readAll = (page, keys) => page.evaluate(ks => Object.fromEntries(ks.map(k => [k, localStorage.getItem(k)])), keys);
const ownSnap = async (page, cfg) => {
  const m = await page.evaluate(own => Object.fromEntries(own.map(k => [k, localStorage.getItem(k)]).filter(e => e[1] !== null)), cfg.own);
  return m;
};
const log = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('__ddlog') || '[]'));
const visible = (page, id) => page.evaluate(i => !document.getElementById(i).hidden, id);
const text = (page, sel) => page.evaluate(s => document.querySelector(s).textContent, sel);
const dialogOpen = page => page.evaluate(() => document.getElementById('dd-dlg').open);
const activeId = page => page.evaluate(() => document.activeElement && document.activeElement.id);
async function setup(browser, cfg, opts) {
  const p = await openPage(browser, cfg, opts);
  await putAll(p.page, decoyMap(cfg));
  await cfg.seed(p.page);
  p.decoys = decoyMap(cfg);
  p.before = await ownSnap(p.page, cfg);
  assert.deepEqual(Object.keys(p.before).sort(), cfg.own.slice().sort(), 'seeded own keys');
  return p;
}
async function downloadFile(page, clickSel, name) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(clickSel)]);
  const file = path.join(TMP, name);
  await dl.saveAs(file);
  return { dl, file, json: JSON.parse(fs.readFileSync(file, 'utf8')) };
}
const reloadAfter = (page, fn) => Promise.all([page.waitForEvent('load'), fn()]);

async function runDeviceDataChecks({ browser, cfg, check }) {
  const N = '[device-data ' + cfg.id + '] ';

  await check(N + 'backup is downloaded BEFORE deletion; typed word deletes only this tool\'s keys; reloads to defaults', async () => {
    const { ctx, page, errors, dialogs, decoys, before } = await setup(browser, cfg);
    try {
      const markerBefore = await cfg.marker(page);
      await page.click(cfg.open);
      assert.equal(await dialogOpen(page), true, 'in-page dialog is open');
      assert.equal(await visible(page, 'dd-s1'), true); assert.equal(await visible(page, 'dd-s2'), false);
      assert.equal(await activeId(page), 'dd-backup', 'focus lands on the primary action (backup)');
      assert.equal(await text(page, '#dd-title'), 'Delete all data on this device?');
      assert.match(await text(page, '#dd-s1'), /Download backup \(JSON\)/);
      assert.match(await text(page, '#dd-s1'), /Other tools and apps on this device are not touched/);
      const order = await page.evaluate(() => { const a = document.getElementById('dd-backup'), b = document.getElementById('dd-skip'); return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? 'backup-first' : 'skip-first'; });
      assert.equal(order, 'backup-first');
      assert.equal(await page.evaluate(() => document.getElementById('dd-skip').classList.contains('primary')), false, 'skip is not styled as the primary action');
      /* 1. backup */
      const { dl, json } = await downloadFile(page, '#dd-backup', 'b1.json');
      assert.match(dl.suggestedFilename(), new RegExp('^' + cfg.tool + '-backup-\\d{4}-\\d\\d-\\d\\d\\.json$'));
      assert.equal(json.format, 'pe-ultimate-tool-backup'); assert.equal(json.version, 1); assert.equal(json.tool, cfg.tool);
      assert.ok(!Number.isNaN(Date.parse(json.exportedAt)));
      assert.deepEqual(json.keys, before, 'backup holds the exact raw values of every own key');
      for (const k of Object.keys(decoys)) assert.ok(!(k in json.keys), 'backup never contains foreign key ' + k);
      /* nothing has been deleted yet */
      assert.deepEqual(await ownSnap(page, cfg), before, 'own data still present after the backup download');
      assert.deepEqual((await log(page)).filter(e => e.startsWith('remove:')), [], 'no removal before the confirmation');
      assert.equal(await visible(page, 'dd-s2'), true);
      assert.match(await text(page, '#dd-status'), /Backup downloaded/);
      /* 2. typed-word confirmation */
      assert.equal(await activeId(page), 'dd-word');
      assert.equal(await page.isDisabled('#dd-confirm'), true);
      await page.fill('#dd-word', 'delet'); assert.equal(await page.isDisabled('#dd-confirm'), true);
      await page.fill('#dd-word', 'delete'); assert.equal(await page.isDisabled('#dd-confirm'), false, 'case-insensitive match enables the button');
      await reloadAfter(page, () => page.click('#dd-confirm'));
      const events = await log(page);
      assert.match(events[0], /^download:/, 'download is the first event');
      assert.deepEqual(events.slice(1).filter(e => e.startsWith('remove:')).sort(), cfg.own.map(k => 'remove:' + k).sort(), 'only this tool\'s keys were removed');
      assert.deepEqual(await readAll(page, Object.keys(decoys)), decoys, 'other localStorage keys untouched');
      await cfg.defaults(page);
      assert.notDeepEqual(await cfg.marker(page), markerBefore);
      assert.deepEqual(dialogs, [], 'no alert()/confirm()/prompt()');
      assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  await check(N + 'cancel at every step (button, Escape, after backup) leaves all data intact and returns focus', async () => {
    const { ctx, page, errors, dialogs, decoys, before } = await setup(browser, cfg);
    try {
      const marker = await cfg.marker(page);
      const intact = async why => {
        assert.deepEqual(await ownSnap(page, cfg), before, why + ': own data');
        assert.deepEqual(await readAll(page, Object.keys(decoys)), decoys, why + ': other keys');
        assert.deepEqual((await log(page)).filter(e => e.startsWith('remove:')), [], why + ': no removal');
        assert.deepEqual(await cfg.marker(page), marker, why + ': tool state');
        assert.equal(await dialogOpen(page), false, why + ': dialog closed');
        assert.equal(await activeId(page), cfg.open.slice(1), why + ': focus back on the opener');
      };
      await page.click(cfg.open); await page.click('#dd-s1 .dd-close'); await intact('Cancel on step 1');
      await page.click(cfg.open); await page.keyboard.press('Escape'); await intact('Escape on step 1');
      await page.click(cfg.open); await downloadFile(page, '#dd-backup', 'b2.json');
      await page.fill('#dd-word', WORDS.en); assert.equal(await page.isDisabled('#dd-confirm'), false);
      await page.click('#dd-s2 .dd-close'); await intact('Cancel on step 2 after a backup');
      await page.click(cfg.open); await page.click('#dd-skip'); await page.keyboard.press('Escape'); await intact('Escape on step 2');
      /* the typed word does not survive a cancelled attempt */
      await page.click(cfg.open); assert.equal(await page.inputValue('#dd-word'), ''); assert.equal(await page.isDisabled('#dd-confirm'), true);
      await page.keyboard.press('Escape');
      assert.deepEqual(dialogs, []); assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  await check(N + '"Delete without backup" is a secondary text action, makes no download and still needs the typed word', async () => {
    const { ctx, page, errors, decoys, before } = await setup(browser, cfg);
    try {
      let downloads = 0; page.on('download', () => downloads++);
      await page.click(cfg.open);
      await page.click('#dd-skip');
      assert.equal(await visible(page, 'dd-s2'), true);
      assert.match(await text(page, '#dd-status'), /No backup will be made/);
      assert.equal(await page.isDisabled('#dd-confirm'), true);
      assert.deepEqual(await ownSnap(page, cfg), before, 'skipping the backup does not delete anything');
      await page.fill('#dd-word', WORDS.en);
      await reloadAfter(page, () => page.press('#dd-word', 'Enter'));
      assert.equal(downloads, 0);
      const events = await log(page);
      assert.ok(!events.some(e => e.startsWith('download:')));
      assert.deepEqual(events.filter(e => e.startsWith('remove:')).sort(), cfg.own.map(k => 'remove:' + k).sort());
      assert.deepEqual(await readAll(page, Object.keys(decoys)), decoys);
      await cfg.defaults(page);
      assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  await check(N + 'restore from a backup file: validated, confirmed in-page, only this tool\'s keys written; invalid files rejected', async () => {
    const { ctx, page, errors, dialogs, decoys, before } = await setup(browser, cfg);
    try {
      const marker = await cfg.marker(page);
      await page.click(cfg.open);
      const { file, json } = await downloadFile(page, '#dd-backup', 'b3.json');
      await page.click('#dd-s2 .dd-close');
      await cfg.mutate(page);
      const changed = await cfg.marker(page);
      assert.notDeepEqual(changed, marker, 'mutation changed the tool state');
      const afterMutation = await ownSnap(page, cfg);
      /* invalid files first: nothing may change */
      const bad = {
        'garbage.json': 'not json at all',
        'other-tool.json': JSON.stringify({ ...json, tool: 'pe-someone-else' }),
        'foreign-key.json': JSON.stringify({ ...json, keys: { ...json.keys, unrelated: 'x' } }),
        'broken-value.json': JSON.stringify({ ...json, keys: Object.fromEntries(Object.entries(json.keys).map(([k, v]) => [k, k.includes('lang') ? 'xx' : '{broken'])) }),
        'empty-keys.json': JSON.stringify({ ...json, keys: {} }),
        'wrong-format.json': JSON.stringify({ ...json, format: 'x' })
      };
      for (const [name, body] of Object.entries(bad)) {
        const f = path.join(TMP, name); fs.writeFileSync(f, body);
        await page.setInputFiles('#dd-file', f);
        await page.waitForFunction(() => document.getElementById('dd-dlg').open);
        assert.equal(await visible(page, 'dd-s3'), true, name);
        assert.match(await text(page, '#dd-s3msg'), /not a valid backup/, name);
        assert.equal(await page.evaluate(() => document.getElementById('dd-go').hidden), true, name + ': no restore button');
        await page.click('#dd-close3');
        assert.deepEqual(await ownSnap(page, cfg), afterMutation, name + ': storage untouched');
        assert.deepEqual(await cfg.marker(page), changed, name + ': state untouched');
      }
      /* valid file */
      await page.setInputFiles('#dd-file', file);
      await page.waitForFunction(() => document.getElementById('dd-dlg').open);
      assert.match(await text(page, '#dd-s3msg'), /This backup was made on/);
      assert.equal(await activeId(page), 'dd-go');
      assert.deepEqual(await ownSnap(page, cfg), afterMutation, 'nothing is written before the confirmation');
      /* "download current first" is offered and works */
      const cur = await downloadFile(page, '#dd-cur', 'current.json');
      assert.deepEqual(cur.json.keys, afterMutation);
      await reloadAfter(page, () => page.click('#dd-go'));
      assert.deepEqual(await cfg.marker(page), marker, 'state is the backed-up state again');
      assert.deepEqual(await readAll(page, Object.keys(decoys)), decoys, 'other keys untouched by restore');
      assert.deepEqual((await log(page)).filter(e => e.startsWith('remove:')), [], 'restore removes nothing');
      assert.deepEqual(dialogs, []); assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  await check(N + 'failures are reported in the dialog and change nothing: removeItem blocked, setItem full during restore', async () => {
    const { ctx, page, errors, before } = await setup(browser, cfg);
    try {
      const marker = await cfg.marker(page);
      await page.click(cfg.open); await page.click('#dd-skip'); await page.fill('#dd-word', WORDS.en);
      await page.evaluate(() => { window.__stay = 1; window.__rm = Storage.prototype.removeItem; Storage.prototype.removeItem = function () { throw new DOMException('blocked', 'SecurityError'); }; });
      await page.click('#dd-confirm');
      assert.match(await text(page, '#dd-msg'), /Could not delete/);
      assert.equal(await page.evaluate(() => window.__stay), 1, 'no reload after a failed delete');
      assert.equal(await dialogOpen(page), true);
      await page.evaluate(() => { Storage.prototype.removeItem = window.__rm; });
      assert.deepEqual(await ownSnap(page, cfg), before, 'data intact after failed delete');
      await page.click('#dd-s2 .dd-close');
      await cfg.mutate(page);
      assert.notDeepEqual(await cfg.marker(page), marker);
      assert.notDeepEqual(await ownSnap(page, cfg), before, 'tool still saves after a failed delete (not left frozen)');
      /* restore with a full storage */
      await page.click(cfg.open);
      const { file } = await downloadFile(page, '#dd-backup', 'b4.json');
      await page.click('#dd-s2 .dd-close');
      const current = await ownSnap(page, cfg);
      await page.setInputFiles('#dd-file', file);
      await page.waitForFunction(() => document.getElementById('dd-dlg').open && !document.getElementById('dd-go').hidden);
      await page.evaluate(() => { window.__si = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; });
      await page.click('#dd-go');
      assert.match(await text(page, '#dd-msg'), /Could not restore/);
      assert.equal(await page.evaluate(() => window.__stay), 1, 'no reload after a failed restore');
      await page.evaluate(() => { Storage.prototype.setItem = window.__si; });
      assert.deepEqual(await ownSnap(page, cfg), current, 'failed restore leaves the current data as it was');
      assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  await check(N + 'blocked storage: dialog opens, says there is nothing to delete, no errors', async () => {
    const { ctx, page, errors } = await openPage(browser, cfg, { init: [BLOCK_STORAGE] });
    try {
      await page.click(cfg.open);
      assert.equal(await dialogOpen(page), true);
      assert.equal(await visible(page, 'dd-s0'), true);
      assert.match(await text(page, '#dd-s0'), /no saved data/);
      await page.click('#dd-close0');
      assert.equal(await dialogOpen(page), false);
      assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });

  for (const lang of ['en', 'he', 'ar', 'ru', 'es']) {
    await check(N + 'dialog in ' + lang + ': translated, typed word accepted, RTL-safe and no horizontal scroll at 320px', async () => {
      const { ctx, page, errors } = await setup(browser, cfg, { width: 320 });
      try {
        await page.selectOption(cfg.langSel, lang);
        await page.click(cfg.open);
        const rtl = ['he', 'ar'].includes(lang);
        assert.equal(await page.getAttribute('html', 'dir'), rtl ? 'rtl' : 'ltr');
        const info = await page.evaluate(() => ({
          title: document.getElementById('dd-title').textContent,
          texts: [...document.querySelectorAll('#dd-s1 [data-dd]')].map(e => e.textContent),
          word: document.getElementById('dd-wordshow').textContent,
          prompt: document.getElementById('dd-prompt').textContent,
          opener: document.querySelector('#dd-open,#clearAll') && [...document.querySelectorAll('#dd-open,#clearAll')].map(e => e.textContent)
        }));
        assert.ok(info.title.length > 5 && info.texts.every(t => t.length > 2), JSON.stringify(info));
        assert.ok(info.texts.every(t => !/^(what|scope|backupNote|backupBtn|skipBtn|cancel)$/.test(t)), 'no raw keys shown');
        assert.equal(info.word, WORDS[lang]);
        if (lang !== 'en') assert.notEqual(info.title, 'Delete all data on this device?');
        await page.click('#dd-skip');
        await page.fill('#dd-word', WORDS[lang].toLowerCase());
        assert.equal(await page.isDisabled('#dd-confirm'), false, 'typed word accepted in ' + lang);
        const fit = await page.evaluate(() => { const d = document.getElementById('dd-dlg'); const r = d.getBoundingClientRect(); return { dlgScroll: d.scrollWidth - d.clientWidth, docOver: document.documentElement.scrollWidth - innerWidth, left: r.left, right: r.right, w: innerWidth,
          btns: [...d.querySelectorAll('button:not([hidden])')].filter(b => b.offsetParent).map(b => { const x = b.getBoundingClientRect(); return [x.left, x.right]; }) }; });
        assert.ok(fit.dlgScroll <= 0, 'dialog has no horizontal overflow ' + JSON.stringify(fit));
        assert.ok(fit.docOver <= 0, 'page has no horizontal scroll');
        assert.ok(fit.left >= 0 && fit.right <= fit.w, 'dialog inside viewport');
        assert.ok(fit.btns.every(b => b[0] >= 0 && b[1] <= fit.w), 'buttons inside viewport');
        await page.keyboard.press('Escape');
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });
  }

  await check(N + 'pure helpers: backup holds only own keys; removeOwn spares foreign keys; parseBackup rejects foreign/malformed input', async () => {
    const { ctx, page, errors } = await setup(browser, cfg);
    try {
      const res = await page.evaluate(({ api, own, ownPrefix, decoys }) => {
        const dd = window[api].deviceData;
        const m = new Map(); const st = { get length() { return m.size; }, key: i => [...m.keys()][i] ?? null, getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); } };
        for (const k of own) m.set(k, 'raw-' + k);
        if (ownPrefix) m.set(ownPrefix + '.corrupt', 'corrupt-raw');
        for (const [k, v] of Object.entries(decoys)) m.set(k, v);
        const b = dd.buildBackup(st, Date.UTC(2026, 9, 15, 12, 0, 0));
        const ownList = dd.ownKeys(st);
        const removed = dd.removeOwn(st);
        return { b, ownList, removed, left: [...m.keys()].sort(), format: dd.FORMAT };
      }, { api: cfg.api, own: cfg.own, ownPrefix: cfg.ownPrefix || null, decoys: decoyMap(cfg) });
      assert.equal(res.b.exportedAt, '2026-10-15T12:00:00.000Z'); assert.equal(res.b.tool, cfg.tool); assert.equal(res.format, 'pe-ultimate-tool-backup');
      const expectOwn = cfg.own.slice().concat(cfg.ownPrefix ? [cfg.ownPrefix + '.corrupt'] : []).sort();
      assert.deepEqual(res.ownList, expectOwn);
      assert.deepEqual(Object.keys(res.b.keys).sort(), expectOwn);
      assert.equal(res.removed, true);
      assert.deepEqual(res.left, Object.keys(decoyMap(cfg)).sort(), 'only foreign keys remain');
      assert.deepEqual(errors, []);
    } finally { await ctx.close(); }
  });
}

module.exports = { runDeviceDataChecks, WORDS };
