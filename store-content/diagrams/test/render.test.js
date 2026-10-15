'use strict';
// Renderer tests: templates, mapping, determinism, escaping, accessibility, RTL, notation.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const R = require('../render.js');
const { checkXml } = require('../lib/xml-check.js');

const ROOT = path.join(__dirname, '..');
const EX = path.join(ROOT, 'examples');
const TEMPLATE_IDS = ['bb-full', 'bb-half', 'fb-full', 'fb-half', 'fb-grid', 'hb-full', 'hb-half',
  'vb-full', 'vb-half', 'at-lanes', 'at-jump', 'at-throw', 'fit-stations', 'open-area'];

function loadFixtures() {
  const out = [];
  for (const fam of fs.readdirSync(EX).sort()) {
    const d = path.join(EX, fam);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d).sort()) if (f.endsWith('.json')) out.push(JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
  }
  return out;
}
function scene(over) {
  return Object.assign({
    schema: 'pe-diagram/1', id: 'BB-09-D1', family: 'BB-09', sport: 'basketball', template: 'bb-half',
    anchor: { section: 'mainA', step: 1, quote_en: 'q' }, group_shown: 'representative',
    title: { he: 'כותרת', en: 'Title', ar: 'عنوان', ru: 'Заголовок', es: 'Título' },
    alt: { he: 'תיאור', en: 'Description', ar: 'وصف', ru: 'Описание', es: 'Descripción' },
    objects: [], paths: [], safety: 's', notes: 'n', status: 'draft'
  }, over);
}
function body(svg) {
  // Strip language-dependent parts: <title>, <desc>, lang and ids.
  return svg.replace(/<title[^>]*>[\s\S]*?<\/title>/, '').replace(/<desc[^>]*>[\s\S]*?<\/desc>/, '')
    .replace(/ lang="[a-z]+"/, '').replace(/ped-[A-Za-z0-9_-]+?-(he|en|ar|ru|es)/g, 'ID');
}
function fieldTexts(svg) {
  return checkXml(svg).texts.filter((t) => t.parent === 'text').map((t) => t.text);
}

test('exactly the 14 template IDs from the brief are exported', () => {
  assert.deepEqual(R.templateIds.slice().sort(), TEMPLATE_IDS.slice().sort());
  for (const id of TEMPLATE_IDS) assert.ok(R.getTemplate(id), id);
});

test('every template renders well-formed SVG with 1000-unit width', () => {
  for (const id of TEMPLATE_IDS) {
    const svg = R.renderTemplate(id);
    const res = checkXml(svg);
    assert.deepEqual(res.errors, [], id);
    assert.equal(res.root, 'svg');
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 1000 /);
    const t = R.getTemplate(id);
    assert.equal(t.viewBox.w, 1000);
    assert.ok(t.area.x >= 0 && t.area.y >= 0 && t.area.x + t.area.w <= t.viewBox.w && t.area.y + t.area.h <= t.viewBox.h + 0.5, id + ' area inside viewBox');
  }
});

test('every fixture renders well-formed SVG in all five languages', () => {
  const fx = loadFixtures();
  assert.equal(fx.length, 14);
  for (const s of fx) for (const l of R.LANGS) {
    const res = checkXml(R.renderScene(s, { lang: l }));
    assert.deepEqual(res.errors, [], s.id + ' ' + l);
  }
});

test('fixtures: one per template, each exercises every object type and path kind', () => {
  const fx = loadFixtures();
  assert.deepEqual(fx.map((s) => s.template).sort(), TEMPLATE_IDS.slice().sort());
  for (const s of fx) {
    assert.equal(s.status, 'fixture');
    assert.match(s.family, /^(BB|FB|HB|VB|AT|FIT)-00$/);
    const types = new Set(s.objects.map((o) => o.type === 'player' ? 'player-' + o.team : o.type));
    for (const t of ['player-A', 'player-B', 'ball', 'cone', 'zone', 'station', 'teacher']) assert.ok(types.has(t), s.id + ' has ' + t);
    const kinds = new Set(s.paths.map((p) => p.kind));
    for (const k of ['move', 'pass', 'dribble']) assert.ok(kinds.has(k), s.id + ' has ' + k);
    assert.ok(s.paths.some((p) => Array.isArray(p.via) && p.via.length), s.id + ' has a via path');
    assert.ok(new Set(s.paths.map((p) => p.order)).size > 1, s.id + ' has several order values');
  }
});

test('determinism: identical bytes for repeated renders and for a deep clone', () => {
  for (const s of loadFixtures()) {
    const a = R.renderScene(s, { lang: 'he' });
    const b = R.renderScene(s, { lang: 'he' });
    const c = R.renderScene(JSON.parse(JSON.stringify(s)), { lang: 'he' });
    assert.equal(a, b);
    assert.equal(a, c);
  }
  assert.equal(R.renderLegend('ar'), R.renderLegend('ar'));
});

test('coordinate mapping: corners and centre of the playing area', () => {
  for (const id of TEMPLATE_IDS) {
    const t = R.getTemplate(id);
    assert.deepEqual(R.mapPoint(id, 0, 0), [t.area.x, t.area.y], id + ' top-left');
    const br = R.mapPoint(id, 100, 100);
    assert.ok(Math.abs(br[0] - (t.area.x + t.area.w)) < 1e-9 && Math.abs(br[1] - (t.area.y + t.area.h)) < 1e-9, id + ' bottom-right');
    const tr = R.mapPoint(id, 100, 0), bl = R.mapPoint(id, 0, 100);
    assert.ok(tr[0] > bl[0] && tr[1] < bl[1], id + ' x right, y down');
    const c = R.mapPoint(id, 50, 50);
    assert.ok(Math.abs(c[0] - (t.area.x + t.area.w / 2)) < 1e-9 && Math.abs(c[1] - (t.area.y + t.area.h / 2)) < 1e-9, id + ' centre');
  }
});

test('mapped markers appear at the mapped coordinates (balls at the four corners)', () => {
  const corners = [[0, 0], [100, 0], [0, 100], [100, 100]];
  const s = scene({ template: 'fb-full', family: 'FB-01', id: 'FB-01-D1', sport: 'football', objects: corners.map(([x, y]) => ({ type: 'ball', x, y })) });
  const svg = R.renderScene(s);
  const t = R.getTemplate('fb-full');
  for (const [x, y] of corners) {
    const cx = R.templates.fmt(t.area.x + x / 100 * t.area.w), cy = R.templates.fmt(t.area.y + y / 100 * t.area.h);
    assert.ok(svg.includes('cx="' + cx + '" cy="' + cy + '" r="' + R.SIZES.ballR + '"'), 'ball at ' + x + ',' + y);
  }
});

test('escaping: title and alt text are XML-escaped; control characters removed', () => {
  const evil = '<script>alert("x")</script> & \'q\' \u0001';
  const s = scene({ title: Object.fromEntries(R.LANGS.map((l) => [l, evil])), alt: Object.fromEntries(R.LANGS.map((l) => [l, evil])), id: 'BB-09-D1"><x' });
  const svg = R.renderScene(s);
  assert.deepEqual(checkXml(svg).errors, []);
  assert.ok(!svg.includes('<script'));
  assert.ok(svg.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &apos;q&apos;'));
  assert.ok(!svg.includes('\u0001'));
  assert.equal(R.escapeXml('a<b>&"\''), 'a&lt;b&gt;&amp;&quot;&apos;');
});

test('accessibility: role=img, aria-labelledby points at title and desc in the chosen language', () => {
  const s = scene();
  for (const l of R.LANGS) {
    const svg = R.renderScene(s, { lang: l });
    const m = /aria-labelledby="([^"]+) ([^"]+)"/.exec(svg);
    assert.ok(m, 'aria-labelledby');
    assert.ok(svg.includes('role="img"'));
    assert.ok(svg.includes('lang="' + l + '"'));
    assert.ok(svg.includes('<title id="' + m[1] + '">' + R.escapeXml(s.title[l]) + '</title>'), l + ' title');
    assert.ok(svg.includes('<desc id="' + m[2] + '">' + R.escapeXml(s.alt[l]) + '</desc>'), l + ' desc');
  }
  // Missing language falls back to English; default language is English.
  const partial = scene({ title: { en: 'Only English' } });
  assert.ok(R.renderScene(partial, { lang: 'ru' }).includes('>Only English</title>'));
  assert.ok(R.renderScene(scene()).includes('lang="en"'));
  // Custom id prefix for inlining several diagrams in one page.
  assert.ok(R.renderScene(scene(), { idPrefix: 'fig 1' }).includes('aria-labelledby="fig_1-title fig_1-desc"'));
});

test('no words in the field: only numerals and single capital letters are drawn', () => {
  for (const s of loadFixtures()) {
    for (const t of fieldTexts(R.renderScene(s))) assert.match(t, /^([0-9]+|[A-Z])$/, s.id);
  }
  const s = scene({ objects: [
    { type: 'zone', x: 10, y: 10, w: 20, h: 20, label: 'Wait' },
    { type: 'zone', x: 40, y: 10, w: 20, h: 20, label: 'w' },
    { type: 'player', team: 'A', n: 1.5, x: 50, y: 50 },
    { type: 'player', team: 'A', n: 'one', x: 60, y: 50 },
    { type: 'station', n: -2, x: 70, y: 70 }
  ] });
  assert.deepEqual(fieldTexts(R.renderScene(s)), []);
});

test('RTL languages never mirror the drawing', () => {
  for (const s of loadFixtures()) {
    const en = R.renderScene(s, { lang: 'en' });
    assert.equal(body(R.renderScene(s, { lang: 'he' })), body(en), s.id + ' he');
    assert.equal(body(R.renderScene(s, { lang: 'ar' })), body(en), s.id + ' ar');
    assert.ok(!/scale\(-1/.test(en) && !/direction="rtl"/.test(R.renderScene(s, { lang: 'he' })), s.id);
  }
});

test('order numerals are drawn only when more than one order value exists', () => {
  const base = { from: [10, 10], to: [40, 40] };
  const one = scene({ paths: [Object.assign({ kind: 'move', order: 1 }, base), { kind: 'pass', from: [60, 60], to: [80, 80], order: 1 }] });
  assert.ok(!R.renderScene(one).includes('data-layer="order"'));
  const none = scene({ paths: [Object.assign({ kind: 'move' }, base)] });
  assert.ok(!R.renderScene(none).includes('data-layer="order"'));
  const two = scene({ paths: [Object.assign({ kind: 'move', order: 1 }, base), { kind: 'pass', from: [60, 60], to: [80, 80], order: 2 }] });
  const svg = R.renderScene(two);
  assert.ok(svg.includes('data-layer="order"'));
  assert.deepEqual(fieldTexts(svg).sort(), ['1', '2']);
});

test('notation: team A triangle, team B square, pass dashed, dribble wavy, move solid', () => {
  const s = scene({
    objects: [{ type: 'player', team: 'A', n: 7, x: 20, y: 20 }, { type: 'player', team: 'B', n: 8, x: 60, y: 60 }],
    paths: [{ kind: 'pass', from: [10, 80], to: [40, 80] }]
  });
  const svg = R.renderScene(s);
  assert.match(svg, /<polygon points="[^"]+" fill="#1d4ed8"/);
  assert.match(svg, /<rect [^>]*fill="#c62828"/);
  assert.match(svg, /stroke-dasharray="16 11"/);
  const move = R.renderScene(scene({ paths: [{ kind: 'move', from: [10, 80], to: [40, 80] }] }));
  const dribble = R.renderScene(scene({ paths: [{ kind: 'dribble', from: [10, 80], to: [40, 80] }] }));
  const pathD = (svg2) => /data-layer="paths"><path d="([^"]+)"/.exec(svg2)[1];
  assert.ok(!/stroke-dasharray="16 11"/.test(move));
  assert.equal(pathD(move).split(' L ').length, 2, 'straight move is one segment');
  assert.ok(pathD(dribble).split(' L ').length > 20, 'dribble is a wave');
});

test('unknown template throws; invalid objects and paths are skipped', () => {
  assert.throws(() => R.renderScene(scene({ template: 'tennis' })), /Unknown template/);
  const s = scene({
    objects: [{ type: 'ball', x: 'a', y: 1 }, null, { type: 'cone', x: NaN, y: 2 }, { type: 'zone', x: 1, y: 1, w: -3, h: 4 }],
    paths: [{ kind: 'pass', from: [1], to: [2, 2] }, { kind: 'run', from: [1, 1], to: [5, 5] }, null]
  });
  const svg = R.renderScene(s);
  assert.deepEqual(checkXml(svg).errors, []);
  assert.ok(svg.includes('<g data-layer="paths"></g>'));
  assert.ok(svg.includes('<g data-layer="objects"></g>'));
});

test('browser build: templates + render evaluate in a window-like context and match Node output', () => {
  const ctx = {};
  ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'templates', 'index.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'render.js'), 'utf8'), ctx);
  assert.equal(typeof ctx.PEDiagram.renderScene, 'function');
  const s = loadFixtures()[0];
  assert.equal(ctx.PEDiagram.renderScene(s, { lang: 'ar' }), R.renderScene(s, { lang: 'ar' }));
  assert.equal(ctx.PEDiagram.renderLegend('he'), R.renderLegend('he'));
});
