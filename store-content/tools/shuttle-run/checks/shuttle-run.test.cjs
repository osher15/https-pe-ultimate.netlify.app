'use strict';
/*
 * Node checks for store-content/tools/shuttle-run/shuttle-run.html (no dependencies).
 * Evidence type: N (Node + vm). Logic, data handling, dictionaries and static content only;
 * not layout, audio output, touch or downloads (see browser-shuttle-run.cjs for those).
 *
 *   node --test store-content/tools/shuttle-run/checks/
 *   node --test store-content/tools/shuttle-run/checks/shuttle-run.test.cjs
 *
 * The schedule is compared with the PE app's own BT module: the BT IIFE is read from
 * hm-app.js (read-only) and executed in a sandbox with small DOM/storage stubs.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');

const TOOL = path.resolve(__dirname, '..');
const REPO = path.resolve(TOOL, '..', '..', '..');
const HTML = fs.readFileSync(path.join(TOOL, 'shuttle-run.html'), 'utf8');
const SCRIPTS = [...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const engineCtx = { module: { exports: {} } };
vm.createContext(engineCtx);
vm.runInContext(SCRIPTS[0], engineCtx);
const E = engineCtx.module.exports;
const plain = x => JSON.parse(JSON.stringify(x));

/* ---------- the PE app's BT module, loaded read-only from hm-app.js ---------- */
function loadAppBT() {
  const src = fs.readFileSync(path.join(REPO, 'hm-app.js'), 'utf8');
  const start = src.indexOf('const BT=(function(){');
  assert.ok(start > 0, 'BT module found in hm-app.js');
  const endMarker = '_test:{buildSchedule:';
  const tail = src.indexOf('})();', src.indexOf(endMarker, start));
  assert.ok(tail > start, 'BT module end found');
  const code = src.slice(start, tail + 5) + '\nglobalThis.__BT=BT;';
  const el = () => ({ classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, style: {}, textContent: '', innerHTML: '', value: '', open: false, querySelector: () => null });
  const ctx = {
    LS: { get: (k, d) => d, set() {} }, SET: { sound: true, voice: true }, $: () => el(), $$: () => [],
    t: (k, d) => d, trUI: x => x, clsUI: x => x, H_LOC: () => 'en', fmtMS: x => String(x), esc: x => x,
    toast() {}, say() {}, beep() {}, keepAwake() {}, ac: () => null, AC: null, ask: async () => null, undo() {}, dlCSV() {}, typingIn: () => false,
    DATA: require(path.join(REPO, 'hm-data.js')), // the app's BT delegates vo2max to the shared data layer (#58)
    SESSION: { active: () => null }, document: { addEventListener() {} }, requestAnimationFrame: () => 0, cancelAnimationFrame() {}, Math, Date, JSON,
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.__BT;
}
const BT = loadAppBT();
const START_SPEEDS = []; for (let v = 4.0; v <= 10.0001; v += 0.5) START_SPEEDS.push(Math.round(v * 2) / 2);

test('HTML has exactly two inline scripts that compile, and no external resource of any kind', () => {
  assert.equal(SCRIPTS.length, 2);
  for (const s of SCRIPTS) new vm.Script(s);
  assert.doesNotMatch(HTML, /<script[^>]+src=|<link[^>]+href=|<img[^>]+src=|<iframe|<audio|<video|@import|(?<![A-Za-z])url\(|fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts/i);
  assert.doesNotMatch(HTML, /https?:\/\//i, 'no absolute URL anywhere');
  assert.doesNotMatch(HTML, /\.(mp3|wav|ogg|m4a)\b/i, 'no audio files');
});

test('schedule reproduces the PE app BT._test.buildSchedule exactly (15/20 m x 4.0-10.0 km/h)', () => {
  let compared = 0;
  for (const d of E.DISTANCES) for (const s of START_SPEEDS) {
    BT._test.setProto(d, s);
    const app = plain(BT._test.buildSchedule());
    const ours = plain(E.buildSchedule(d, s));
    assert.equal(ours.length, app.length, `length ${d} m @ ${s}`);
    assert.deepEqual(ours, app, `schedule ${d} m @ ${s}`);
    for (let i = 0; i < ours.length; i++) assert.ok(ours[i].t === app[i].t, 'bit-identical time');
    compared++;
  }
  assert.equal(compared, 26);
});

test('Léger 1988 default: 20 m, 8.5 km/h, +0.5 km/h per level, shuttle time = 20 m / speed, levels ~60 s', () => {
  assert.equal(E.DEFAULT_START, 8.5);
  const b = E.buildSchedule(20, 8.5);
  const lv = E.levelSummary(b);
  assert.equal(lv.length, 20, '8.5 to 18.0 km/h');
  assert.equal(lv[0].speed, 8.5); assert.equal(lv[19].speed, 18.0);
  lv.forEach((l, i) => {
    assert.equal(l.speed, 8.5 + 0.5 * i);
    const st = 20 / (l.speed / 3.6);
    assert.ok(Math.abs(l.shuttleSec - st) < 1e-9, 'shuttle time');
    assert.equal(l.shuttles, Math.max(2, Math.round(60 / st)));
    assert.ok(Math.abs(l.duration - 60) <= st / 2 + 1e-9, `level ${l.level} lasts about 60 s (${l.duration.toFixed(2)})`);
  });
  // Hand-computed values.
  assert.ok(Math.abs(b[0].t - 72 / 8.5) < 1e-12, 'first beep at 8.47 s');
  assert.deepEqual(plain(lv.slice(0, 4).map(l => l.shuttles)), [7, 8, 8, 8]);
  assert.ok(Math.abs(lv[1].shuttleSec - 8.0) < 1e-12, 'level 2 at 9.0 km/h: 8.0 s per shuttle');
  assert.equal(b.filter(x => x.levelEnd).length, 20);
  assert.equal(b.at(-1).last, true); assert.equal(b.filter(x => x.last).length, 1);
  assert.equal(b.at(-1).cum, b.length * 20);
  // 15 m course keeps the same speeds.
  const b15 = E.buildSchedule(15, 8.5);
  assert.ok(Math.abs(b15[0].t - 15 / (8.5 / 3.6)) < 1e-12);
});

test('start speed is clamped to 4.0-10.0 in 0.5 steps (as in the source module)', () => {
  assert.equal(E.clampStart(3), 4); assert.equal(E.clampStart(11), 10); assert.equal(E.clampStart(8.74), 8.5);
  assert.equal(E.clampStart(8.76), 9); assert.equal(E.clampStart('x'), 8.5);
  assert.equal(E.isStandard(20, 8.5), true); assert.equal(E.isStandard(20, 8.0), false); assert.equal(E.isStandard(15, 8.5), false);
});

test('15 m is a supported adapted course (not "modified"); non-standard start speeds are still modified', () => {
  assert.equal(E.protocolKind(20, 8.5), 'std');
  assert.equal(E.protocolKind(15, 8.5), 'adapted');
  assert.equal(E.protocolKind(20, 8.0), 'mod');
  assert.equal(E.protocolKind(15, 9.0), 'mod');
  assert.equal(E.protocolKind(15, 4.0), 'mod');
  // The 15 m setup shows the adapted-course info (not the modified-protocol warning).
  assert.match(SCRIPTS[1], /\$\('infoBox'\)\.hidden=st\.dist===20/);
  assert.match(SCRIPTS[1], /kind==='mod'\?t\(st\.dist===20\?'warnMod':'warnModSpeed'\)/);
  for (const l of E.LANGS) {
    const d = E.L[l];
    assert.ok(d.info15.includes('15') && d.info15.includes('20') && /VO₂m[aá]x/.test(d.info15), `${l}.info15 mentions 15 m, 20 m and VO2max`);
    assert.ok(d.protoAdapted.includes('15'), `${l}.protoAdapted`);
    assert.notEqual(d.protoAdapted, d.protoMod, `${l}: adapted label differs from modified`);
  }
  assert.match(E.L.en.info15, /younger pupils or pupils with disabilities/);
  assert.match(E.L.en.info15, /positive experience of success/);
  assert.match(E.L.en.info15, /not comparable with the 20 m course; no VO₂max estimate/);
  assert.match(HTML, /<p data-t="info15">/, 'About panel explains the 15 m course');
});

test('owner-approved AI translation notice in all five languages; no "pending native review" text', () => {
  const want = {
    en: 'Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors are possible.',
  };
  assert.equal(E.L.en.aiNote, want.en);
  const markers = { he: 'בינה מלאכותית', ar: 'الذكاء الاصطناعي', ru: 'ИИ', es: 'IA' };
  const ministry = { he: 'משרד החינוך', ar: 'وزارة التربية والتعليم', ru: 'Министерства образования', es: 'Ministerio de Educación' };
  for (const l of ['he', 'ar', 'ru', 'es']) {
    assert.ok(E.L[l].aiNote.includes(markers[l]), `${l}.aiNote mentions AI`);
    assert.ok(E.L[l].aiNote.includes(ministry[l]), `${l}.aiNote mentions the Ministry of Education`);
  }
  assert.match(HTML, /<p class="meta" data-t="aiNote">Translations were produced with AI\./);
  assert.equal('reviewNote' in E.L.en, false);
  const README = fs.readFileSync(path.join(TOOL, 'README.md'), 'utf8');
  assert.ok(README.includes(want.en), 'README carries the notice');
  for (const text of [README, ...E.LANGS.flatMap(l => Object.values(E.L[l]))]) {
    assert.doesNotMatch(text, /native[- ](speaker |PE-teacher )?review|awaiting|draft translation|borradores|черновик|טיוטות|مسودات/i);
  }
});

test('VO2max estimate uses the Léger 1988 equation (same as the app) with hand-checked values', () => {
  const cases = [[10, 12, 42.861], [12.5, 18, 47.596], [11, 13, 46.3838], [8.5, 10, 39.124]];
  for (const [S, A, want] of cases) {
    assert.ok(Math.abs(E.vo2max(S, A) - want) < 1e-9, `${S} km/h, ${A} y`);
    assert.equal(E.vo2max(S, A), BT._test.vo2max(S, A));
  }
  // Shown only for the 20 m course and a positive distance.
  const r = { course: 20, dist: 400, speed: 10 };
  assert.ok(Math.abs(E.resultVo2(r, 12) - 42.861) < 1e-9);
  assert.equal(E.resultVo2({ ...r, course: 15 }, 12), null);
  assert.equal(E.resultVo2({ ...r, dist: 0 }, 12), null);
});

test('drop-out record and live snapshot follow the source module semantics', () => {
  const b = E.buildSchedule(20, 8.5);
  const r0 = E.makeResult(b, 3, 20, 8.5, 'A', 'x');
  assert.deepEqual(plain(r0), { id: 'x', name: 'A', level: 1, sh: 0, dist: 0, time: 3, speed: 8.5, course: 20, start: 8.5 });
  const r3 = E.makeResult(b, b[2].t + 0.1, 20, 8.5, 'B', 'y');
  assert.equal(r3.level, 1); assert.equal(r3.sh, 3); assert.equal(r3.dist, 60);
  const r8 = E.makeResult(b, b[7].t + 0.01, 20, 8.5, 'C', 'z');
  assert.equal(r8.level, 2); assert.equal(r8.sh, 1); assert.equal(r8.speed, 9); assert.equal(r8.dist, 160);
  let s = E.snapshot(b, -2.4, 20, 13);
  assert.equal(s.countdown, 3); assert.equal(s.done, 0); assert.equal(s.level, 1); assert.equal(s.shuttle, 1); assert.equal(s.vo2, null);
  s = E.snapshot(b, b[6].t + 0.5, 20, 13);
  assert.equal(s.level, 2); assert.equal(s.shuttle, 1); assert.equal(s.lastLevel, 1); assert.equal(s.distance, 140);
  assert.ok(Math.abs(s.vo2 - E.vo2max(8.5, 13)) < 1e-12);
  assert.ok(Math.abs(s.nextIn - (b[7].t - (b[6].t + 0.5))) < 1e-9);
  s = E.snapshot(b, 1e6, 20, 13); assert.equal(s.finished, true);
  assert.equal(E.snapshot(b, 100, 15, 13).vo2, null, 'no VO2 on 15 m');
});

test('audio cue list: countdown pips, start tone, one cue per beep, triple-beep levels, 3 s level warnings', () => {
  const b = E.buildSchedule(20, 8.5), c = E.buildCues(b, 5);
  assert.equal(c.filter(x => x.kind === 'pip').length, 5);
  assert.equal(c.filter(x => x.kind === 'start').length, 1);
  assert.equal(c.filter(x => x.kind === 'shuttle' || x.kind === 'level').length, b.length);
  assert.equal(c.filter(x => x.kind === 'level').length, 20);
  const warns = c.filter(x => x.kind === 'warn');
  assert.equal(warns.length, 19);
  assert.ok(Math.abs(warns[0].t - (b[6].t - 3)) < 1e-12); assert.equal(warns[0].level, 2);
  for (let i = 1; i < c.length; i++) assert.ok(c[i].t >= c[i - 1].t, 'sorted');
  assert.equal(E.buildCues(b, 0).filter(x => x.kind === 'pip').length, 0);
});

test('no forbidden or app branding words anywhere in the HTML or README (case-insensitive)', () => {
  const forbidden = ['fitnessgram', 'pacer', 'healthy fitness zone', 'hfz', 'cooper'];
  for (const file of ['shuttle-run.html', 'README.md']) {
    const p = path.join(TOOL, file);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8').toLowerCase();
    for (const w of forbidden) assert.equal(text.includes(w), false, `${file} contains "${w}"`);
    assert.equal(text.includes('pe ultimate'), false, `${file} uses app branding`);
    for (const claim of ['officially approved', 'compatible with', 'certified test']) assert.equal(text.includes(claim), false, claim);
  }
  assert.match(HTML, /Léger, Mercier, Gadoury &(amp;)? Lambert, J Sports Sci 6\(2\):93–101, 1988/);
  assert.match(HTML, /not a medical test/);
  assert.match(HTML, /Licence terms: to be set by the publisher before sale\./);
  assert.match(HTML, /PE Tools/);
});

test('five dictionaries have identical keys, no empty strings and matching placeholders', () => {
  const en = Object.keys(E.L.en).sort();
  assert.deepEqual(plain(E.LANGS), ['en', 'he', 'ar', 'ru', 'es']);
  for (const l of E.LANGS) {
    assert.deepEqual(Object.keys(E.L[l]).sort(), en, l);
    for (const k of en) {
      assert.ok(typeof E.L[l][k] === 'string' && E.L[l][k].trim(), `${l}.${k} empty`);
      const ph = s => (s.match(/\{\d\}/g) || []).sort().join();
      assert.equal(ph(E.L[l][k]), ph(E.L.en[k]), `${l}.${k} placeholders`);
    }
  }
  for (const k of E.REUSED_FROM_APP) assert.ok(k in E.L.en, 'reused key exists: ' + k);
  // Every key used in markup or code exists.
  const markupKeys = [...HTML.matchAll(/data-t="([^"]+)"/g)].map(m => m[1]);
  const codeKeys = [...SCRIPTS[1].matchAll(/\bt\('([A-Za-z0-9]+)'/g)].map(m => m[1]);
  assert.ok(markupKeys.length > 40 && codeKeys.length > 40);
  for (const k of new Set([...markupKeys, ...codeKeys])) assert.ok(k in E.L.en, 'missing key ' + k);
  // Non-English dictionaries are really translated (differ from English for most keys).
  for (const l of ['he', 'ar', 'ru', 'es']) {
    const same = en.filter(k => E.L[l][k] === E.L.en[k]);
    assert.ok(same.length <= 4, `${l} untranslated: ${same}`);
  }
});

/* ---------- storage ---------- */
function memStorage(opts = {}) {
  const m = new Map(opts.seed || []);
  return {
    map: m,
    getItem: k => { if (opts.getThrows) throw new Error('blocked'); return m.has(k) ? m.get(k) : null; },
    setItem: (k, v) => { if (opts.setThrows) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
  };
}

test('storage: blocked access (getter throws) never throws, loads defaults and reports not saved', () => {
  const s = E.createStore(() => { throw new Error('SecurityError'); });
  const st = s.load();
  assert.deepEqual(plain(st), plain(E.defaultState()));
  assert.equal(s.save(st), false);
  assert.equal(s.status.ok, false);
  assert.equal(s.loadLang(), null); assert.equal(s.saveLang('he'), false);
  assert.equal(s.clear(), false);
  const s2 = E.createStore(memStorage({ getThrows: true }));
  assert.deepEqual(plain(s2.load()), plain(E.defaultState()));
  assert.equal(s2.status.ok, false);
});

test('storage: quota/write failure is reported and keeps the previous saved copy', () => {
  const mem = memStorage();
  const s = E.createStore(mem);
  const st = s.load();
  st.results.push({ id: 'a', name: 'X', level: 2, sh: 3, dist: 200, time: 90, speed: 9, course: 20, start: 8.5 });
  assert.equal(s.save(st), true); assert.equal(s.status.ok, true);
  const before = mem.map.get(E.KEY);
  const failing = memStorage({ seed: mem.map, setThrows: true });
  const s2 = E.createStore(failing);
  const st2 = s2.load();
  assert.equal(st2.results.length, 1);
  st2.results.push({ id: 'b', name: 'Y', level: 1, sh: 1, dist: 20, time: 9, speed: 8.5, course: 20, start: 8.5 });
  assert.equal(s2.save(st2), false);
  assert.equal(s2.status.ok, false); assert.equal(s2.status.reason, 'failed');
  assert.equal(failing.map.get(E.KEY), before);
});

test('storage: corrupted data is set aside (or left untouched if it cannot be) and never silently lost', () => {
  const mem = memStorage({ seed: [[E.KEY, '{broken']] });
  const s = E.createStore(mem);
  assert.deepEqual(plain(s.load()), plain(E.defaultState()));
  assert.equal(s.status.reason, 'corrupt');
  assert.equal(mem.map.get(E.CORRUPT_KEY), '{broken');
  assert.equal(s.save(E.defaultState()), true);
  // Cannot set aside: read-only until "delete all data".
  const ro = memStorage({ seed: [[E.KEY, '{broken']], setThrows: true });
  const s2 = E.createStore(ro);
  s2.load();
  assert.equal(s2.status.readOnly, true); assert.equal(s2.status.reason, 'corruptReadOnly');
  assert.equal(s2.save(E.defaultState()), false);
  assert.equal(ro.map.get(E.KEY), '{broken');
});

test('storage: only keys with the pe-shuttle.v1 prefix are written; clear removes them and nothing else', () => {
  const mem = memStorage({ seed: [['peultimate.bt.results', '[1]'], ['other', 'x']] });
  const s = E.createStore(mem);
  const st = s.load();
  assert.equal(st.results.length, 0, 'never reads app keys');
  s.save(st); s.saveLang('ar');
  for (const k of mem.map.keys()) if (!['peultimate.bt.results', 'other'].includes(k)) assert.ok(k.startsWith('pe-shuttle.v1'), k);
  assert.equal(s.loadLang(), 'ar');
  assert.equal(s.clear(), true);
  assert.deepEqual([...mem.map.keys()].sort(), ['other', 'peultimate.bt.results']);
});

test('sanitize: invalid saved values are clamped or dropped', () => {
  const st = E.sanitize({
    settings: { dist: 33, start: 12, age: 40, countdown: 7, sound: 'no', voice: false, laneMode: true, laneN: 99, sort: 'x' },
    runners: ['  Ana  ', 'ana', '', 7, 'B'.repeat(80)],
    results: [{ id: 1, name: 'ok', level: 1, sh: 0, dist: 0, time: 1, speed: 8.5 }, { id: 'bad', name: 'x', level: 0, sh: 0, dist: 0, time: 0, speed: 8 }, null, { name: 'no id' }],
    bands: { metric: 'vo2', list: [{ label: 'Goal', min: 40 }, { label: 'neg', min: -1 }, { label: 3, min: 1 }] },
  });
  assert.equal(st.settings.dist, 20); assert.equal(st.settings.start, 10); assert.equal(st.settings.age, 18);
  assert.equal(st.settings.countdown, 5); assert.equal(st.settings.sound, true); assert.equal(st.settings.voice, false);
  assert.equal(st.settings.laneN, 20); assert.equal(st.settings.sort, 'order');
  assert.deepEqual(plain(st.runners), ['Ana', 'B'.repeat(E.NAME_MAX)]);
  assert.equal(st.results.length, 1); assert.equal(st.results[0].id, '1'); assert.equal(st.results[0].course, 20);
  assert.deepEqual(plain(st.bands), { metric: 'vo2', list: [{ label: 'Goal', min: 40 }] });
  assert.deepEqual(plain(E.sanitize('nonsense')), plain(E.defaultState()));
});

test('reference bands: highest reached threshold; none shipped by default', () => {
  assert.deepEqual(plain(E.defaultState().bands.list), []);
  const bands = [{ label: 'A', min: 400 }, { label: 'B', min: 800 }, { label: 'C', min: 0 }];
  assert.equal(E.bandFor(820, bands).label, 'B');
  assert.equal(E.bandFor(400, bands).label, 'A');
  assert.equal(E.bandFor(10, bands).label, 'C');
  assert.equal(E.bandFor(null, bands), null); assert.equal(E.bandFor(500, []), null);
});

test('CSV: UTF-8 BOM, CRLF, quoting and spreadsheet formula guard', () => {
  const csv = E.toCSV([['Name', 'Distance (m)'], ['=HYPERLINK("x")', 200], ['Ana, "B"', 0], ['-2', -1], ['@x\nline', 1.5]]);
  assert.ok(csv.startsWith('﻿Name,Distance (m)\r\n'));
  const lines = csv.slice(1).split('\r\n');
  assert.equal(lines[1], `"'=HYPERLINK(""x"")",200`);
  assert.equal(lines[2], '"Ana, ""B""",0');
  assert.equal(lines[3], "'-2,-1", 'numbers are not guarded, text is');
  assert.ok(csv.includes(`"'@x\nline",1.5`));
});

test('runner list: trimmed, case-insensitive de-duplicated, capped', () => {
  assert.deepEqual(plain(E.parseRunners(' Ana \n\nana\nBen  Levi\n12')), ['Ana', 'Ben Levi', '12']);
  const many = Array.from({ length: 80 }, (_, i) => 'R' + i).join('\n');
  assert.equal(E.parseRunners(many).length, E.MAX_RUNNERS);
});

test('time format', () => {
  assert.equal(E.fmtMS(0), '00:00'); assert.equal(E.fmtMS(59.99), '00:59'); assert.equal(E.fmtMS(600), '10:00'); assert.equal(E.fmtMS(-3), '00:00');
});
