'use strict';
// Validator tests: one or more cases per rule, quote matching, placements.csv, directory walk, CLI.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const V = require('../validate.js');

const ROOT = path.join(__dirname, '..');
const EX = path.join(ROOT, 'examples');
const EXPORT = path.join(EX, 'export-en');

// A valid, non-fixture scene.
function base() {
  return {
    schema: 'pe-diagram/1', id: 'BB-09-D1', family: 'BB-09', sport: 'basketball', template: 'bb-half',
    anchor: { section: 'mainB', step: 1, quote_en: 'Two attackers advance wide.' },
    group_shown: 'representative',
    title: { he: 'שניים מול אחד', en: '2v1 to the basket', ar: 'اثنان ضد واحد', ru: 'Два против одного', es: 'Dos contra uno' },
    alt: { he: 'תיאור', en: 'Two attackers, one defender.', ar: 'وصف', ru: 'Описание', es: 'Descripción' },
    objects: [
      { type: 'player', team: 'A', n: 1, x: 20, y: 30 },
      { type: 'player', team: 'A', n: 2, x: 20, y: 70 },
      { type: 'player', team: 'B', n: 1, x: 70, y: 50 },
      { type: 'ball', x: 23, y: 34 },
      { type: 'cone', x: 50, y: 10 },
      { type: 'zone', x: 0, y: 80, w: 20, h: 20, label: 'W' },
      { type: 'station', n: 1, x: 40, y: 90 },
      { type: 'teacher', x: 50, y: 98 }
    ],
    paths: [
      { kind: 'dribble', from: [20, 30], to: [45, 30], order: 1 },
      { kind: 'pass', from: [45, 30], to: [20, 70], order: 2 },
      { kind: 'move', from: [70, 50], to: [60, 40], via: [[72, 40]], order: 2 }
    ],
    safety: 'Waiting zone behind the start.', notes: 'n', status: 'draft'
  };
}
function mut(fn) { const s = base(); fn(s); return s; }
function codes(issues, level) { return issues.filter((i) => !level || i.level === level).map((i) => i.code); }
function errors(scene, opts) { return codes(V.validateScene(scene, opts), 'error'); }
function expectError(scene, code, opts) {
  const e = errors(scene, opts);
  assert.ok(e.includes(code), 'expected ' + code + ', got ' + JSON.stringify(e));
}
function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'pediag-')); }

test('valid scene has no issues', () => {
  assert.deepEqual(V.validateScene(base()), []);
});

test('rule: schema must be pe-diagram/1', () => {
  expectError(mut((s) => { s.schema = 'pe-diagram/2'; }), 'schema');
  expectError(mut((s) => { delete s.schema; }), 'schema');
});

test('rule: id must be <FAMILY>-D<n> matching family', () => {
  expectError(mut((s) => { s.id = 'BB-09-1'; }), 'id');
  expectError(mut((s) => { s.id = 'BB-09-D0'; }), 'id');
  expectError(mut((s) => { s.id = 'BB-09-D01'; }), 'id');
  expectError(mut((s) => { s.id = 'BB-08-D1'; }), 'id');
  assert.deepEqual(errors(mut((s) => { s.id = 'BB-09-D12'; })), []);
});

test('rule: family must be BB|FB|HB|VB|AT|FIT-01..10', () => {
  expectError(mut((s) => { s.family = 'XX-01'; s.id = 'XX-01-D1'; }), 'family');
  expectError(mut((s) => { s.family = 'BB-11'; s.id = 'BB-11-D1'; }), 'family');
  expectError(mut((s) => { s.family = 'BB-9'; s.id = 'BB-9-D1'; }), 'family');
  expectError(mut((s) => { s.family = 'ATH-01'; s.id = 'ATH-01-D1'; s.sport = 'athletics'; }), 'family');
  assert.deepEqual(errors(mut((s) => { s.family = 'BB-10'; s.id = 'BB-10-D3'; })), []);
});

test('rule: family must match the folder', () => {
  expectError(base(), 'folder', { folder: 'BB-08' });
  assert.deepEqual(errors(base(), { folder: 'BB-09' }), []);
});

test('rule: fixture family -00 and status "fixture" only in fixture mode', () => {
  const fx = mut((s) => { s.family = 'BB-00'; s.id = 'BB-00-D1'; s.status = 'fixture'; });
  expectError(fx, 'fixture-family');
  expectError(fx, 'fixture-status');
  assert.deepEqual(errors(fx, { fixtures: true }), []);
  expectError(base(), 'fixture-family', { fixtures: true });
  expectError(base(), 'fixture-status', { fixtures: true });
});

test('rule: sport must be consistent with the family prefix', () => {
  expectError(mut((s) => { s.sport = 'football'; }), 'sport');
  const map = { BB: 'basketball', FB: 'football', HB: 'handball', VB: 'volleyball', AT: 'athletics', FIT: 'fitness' };
  for (const [p, sport] of Object.entries(map)) {
    const s = mut((x) => { x.family = p + '-01'; x.id = p + '-01-D1'; x.sport = sport; x.template = 'open-area'; });
    assert.deepEqual(errors(s), [], p);
  }
});

test('rule: template must be known', () => {
  expectError(mut((s) => { s.template = 'tennis-court'; }), 'template');
  expectError(mut((s) => { delete s.template; }), 'template');
});

test('rule: template must be allowed for the sport', () => {
  expectError(mut((s) => { s.template = 'fb-half'; }), 'template-sport');
  expectError(mut((s) => { s.template = 'fit-stations'; }), 'template-sport');
  const sport = (p, sp, t) => mut((s) => { s.family = p + '-02'; s.id = p + '-02-D1'; s.sport = sp; s.template = t; });
  assert.deepEqual(errors(sport('AT', 'athletics', 'fit-stations')), []);
  assert.deepEqual(errors(sport('FIT', 'fitness', 'fit-stations')), []);
  expectError(sport('FIT', 'fitness', 'at-lanes'), 'template-sport');
  expectError(sport('VB', 'volleyball', 'hb-half'), 'template-sport');
  for (const [p, sp] of [['BB', 'basketball'], ['FB', 'football'], ['HB', 'handball'], ['VB', 'volleyball'], ['AT', 'athletics'], ['FIT', 'fitness']]) {
    assert.deepEqual(errors(sport(p, sp, 'open-area')), [], 'open-area allowed for ' + sp);
  }
});

test('rule: anchor.section in warmup|mainA|mainB|appliedGame', () => {
  for (const sec of ['warmup', 'mainA', 'mainB', 'appliedGame']) assert.deepEqual(errors(mut((s) => { s.anchor.section = sec; })), []);
  expectError(mut((s) => { s.anchor.section = 'opening'; }), 'anchor-section');
  expectError(mut((s) => { s.anchor.section = 'closing'; }), 'anchor-section');
  expectError(mut((s) => { delete s.anchor; }), 'anchor');
});

test('rule: anchor.step positive integer', () => {
  expectError(mut((s) => { s.anchor.step = 0; }), 'anchor-step');
  expectError(mut((s) => { s.anchor.step = 1.5; }), 'anchor-step');
  expectError(mut((s) => { s.anchor.step = '1'; }), 'anchor-step');
  expectError(mut((s) => { s.anchor.step = -2; }), 'anchor-step');
});

test('rule: anchor.quote_en non-empty', () => {
  expectError(mut((s) => { s.anchor.quote_en = '  '; }), 'anchor-quote');
  expectError(mut((s) => { delete s.anchor.quote_en; }), 'anchor-quote');
});

test('rule: coordinates finite and within 0-100', () => {
  expectError(mut((s) => { s.objects[0].x = -1; }), 'coord');
  expectError(mut((s) => { s.objects[0].y = 100.01; }), 'coord');
  expectError(mut((s) => { s.objects[0].x = '20'; }), 'coord');
  expectError(mut((s) => { s.objects[0].x = NaN; }), 'coord');
  expectError(mut((s) => { s.objects[0].y = Infinity; }), 'coord');
  expectError(mut((s) => { delete s.objects[3].x; }), 'coord');
  expectError(mut((s) => { s.paths[0].to = [101, 5]; }), 'coord');
  expectError(mut((s) => { s.paths[2].via = [[50, -3]]; }), 'coord');
  assert.deepEqual(errors(mut((s) => { s.objects[0].x = 0; s.objects[0].y = 100; })), []);
});

test('rule: zones fully inside 0-100 with positive size', () => {
  expectError(mut((s) => { s.objects[5].x = 85; }), 'zone-bounds');
  expectError(mut((s) => { s.objects[5].y = 85; }), 'zone-bounds');
  expectError(mut((s) => { s.objects[5].w = 0; }), 'zone-size');
  expectError(mut((s) => { s.objects[5].h = -5; }), 'zone-size');
  assert.deepEqual(errors(mut((s) => { s.objects[5] = { type: 'zone', x: 80, y: 80, w: 20, h: 20, label: 'S' }; })), []);
});

test('rule: zone label is one capital letter', () => {
  expectError(mut((s) => { s.objects[5].label = 'WA'; }), 'zone-label');
  expectError(mut((s) => { s.objects[5].label = 'w'; }), 'zone-label');
  expectError(mut((s) => { s.objects[5].label = 'א'; }), 'zone-label');
  const w = V.validateScene(mut((s) => { delete s.objects[5].label; }));
  assert.deepEqual(codes(w, 'error'), []);
  assert.ok(codes(w, 'warning').includes('zone-label-missing'));
});

test('rule: team A|B', () => {
  expectError(mut((s) => { s.objects[0].team = 'C'; }), 'team');
  expectError(mut((s) => { s.objects[0].team = 'a'; }), 'team');
  expectError(mut((s) => { delete s.objects[0].team; }), 'team');
});

test('rule: player numbers positive integers, no duplicate (team, n)', () => {
  expectError(mut((s) => { s.objects[0].n = 0; }), 'player-n');
  expectError(mut((s) => { s.objects[0].n = 1.5; }), 'player-n');
  expectError(mut((s) => { s.objects[0].n = '1'; }), 'player-n');
  expectError(mut((s) => { s.objects[1].n = 1; }), 'player-dup');
  // Same number in different teams is fine (numbers start at 1 for each team).
  assert.deepEqual(errors(base()), []);
});

test('rule: station numbers positive integers, unique', () => {
  expectError(mut((s) => { s.objects[6].n = 0; }), 'station-n');
  expectError(mut((s) => { s.objects.push({ type: 'station', n: 1, x: 60, y: 90 }); }), 'station-dup');
});

test('rule: object type known', () => {
  expectError(mut((s) => { s.objects.push({ type: 'hoop', x: 1, y: 1 }); }), 'object-type');
  expectError(mut((s) => { s.objects.push('cone'); }), 'object-type');
  expectError(mut((s) => { s.objects = {}; }), 'objects');
});

test('rule: path kind move|pass|dribble; via and order well-formed', () => {
  expectError(mut((s) => { s.paths[0].kind = 'run'; }), 'path-kind');
  expectError(mut((s) => { s.paths[0].kind = 'Pass'; }), 'path-kind');
  expectError(mut((s) => { s.paths[0].from = [1, 2, 3]; }), 'path-point');
  expectError(mut((s) => { delete s.paths[0].to; }), 'path-point');
  expectError(mut((s) => { s.paths[2].via = [70, 40]; }), 'path-point');
  expectError(mut((s) => { s.paths[2].via = 'x'; }), 'path-via');
  expectError(mut((s) => { s.paths[0].order = 0; }), 'path-order');
  expectError(mut((s) => { s.paths[0].order = '1'; }), 'path-order');
  expectError(mut((s) => { s.paths = 'none'; }), 'paths');
  assert.deepEqual(errors(mut((s) => { delete s.paths[0].order; s.paths[2].via = []; })), []);
});

test('rule: title and alt non-empty in all five languages', () => {
  for (const l of ['he', 'en', 'ar', 'ru', 'es']) {
    expectError(mut((s) => { delete s.title[l]; }), 'title-missing');
    expectError(mut((s) => { s.alt[l] = ' '; }), 'alt-missing');
  }
  expectError(mut((s) => { s.title = 'x'; }), 'title-missing');
  expectError(mut((s) => { delete s.alt; }), 'alt-missing');
});

test('rule: title <= 60 characters, alt <= 400 characters (code points)', () => {
  assert.deepEqual(errors(mut((s) => { s.title.he = 'א'.repeat(60); })), []);
  expectError(mut((s) => { s.title.he = 'א'.repeat(61); }), 'title-length');
  assert.deepEqual(errors(mut((s) => { s.alt.ar = 'ب'.repeat(400); })), []);
  expectError(mut((s) => { s.alt.ar = 'ب'.repeat(401); }), 'alt-length');
  const w = V.validateScene(mut((s) => { s.alt.ru = 'я'.repeat(301); }));
  assert.ok(codes(w, 'warning').includes('alt-long'));
});

test('rule: group_shown whole-class|representative', () => {
  assert.deepEqual(errors(mut((s) => { s.group_shown = 'whole-class'; })), []);
  expectError(mut((s) => { s.group_shown = 'all'; }), 'group_shown');
  expectError(mut((s) => { delete s.group_shown; }), 'group_shown');
});

test('rule: status present', () => {
  expectError(mut((s) => { delete s.status; }), 'status');
  expectError(mut((s) => { s.status = ''; }), 'status');
});

test('warnings: missing safety, unknown fields, missing paths', () => {
  const w = codes(V.validateScene(mut((s) => { delete s.safety; s.colour = 'red'; s.objects[0].numer = 3; delete s.paths; })), 'warning');
  assert.ok(w.includes('safety-missing'));
  assert.ok(w.includes('unknown-field'));
  assert.ok(w.includes('paths-missing'));
});

test('render check: valid scenes render well-formed with numbers/letters only', () => {
  const issues = V.validateScene(base(), { render: true });
  assert.deepEqual(codes(issues), []);
});

// ------------------------------------------------------------- quote_en
test('quote_en: found after whitespace normalisation; front matter ignored; NFC', () => {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, 'BB-09.md'),
    '---\nid: BB-09\ntitle: "Two attackers advance wide."\n---\n# Lesson\n\n1. Two  attackers\n   advance\twide. Then rotate.\n');
  assert.deepEqual(errors(base(), { enExportDir: dir }), []);
  // Quote that is only present in the front matter is not accepted.
  fs.writeFileSync(path.join(dir, 'BB-09.md'), '---\ntitle: "Two attackers advance wide."\n---\nSomething else.\n');
  expectError(base(), 'quote-not-found', { enExportDir: dir });
  // Different words are not accepted (whitespace-only normalisation).
  fs.writeFileSync(path.join(dir, 'BB-09.md'), 'Two attackers advance wide!\n');
  expectError(base(), 'quote-not-found', { enExportDir: dir });
  // Curly vs straight quotes differ (no punctuation folding).
  fs.writeFileSync(path.join(dir, 'BB-09.md'), 'The cone "closes" one side.\n');
  expectError(mut((s) => { s.anchor.quote_en = 'The cone “closes” one side.'; }), 'quote-not-found', { enExportDir: dir });
  // Unicode normalisation: decomposed text in the export matches a composed quote.
  fs.writeFileSync(path.join(dir, 'BB-09.md'), 'Pase de pecho y desplazamiento lateral.'.replace('é', 'é') + ' Café corto.\n');
  assert.deepEqual(errors(mut((s) => { s.anchor.quote_en = 'Café corto.'; }), { enExportDir: dir }), []);
});

test('quote_en: missing export file is a warning, not an error', () => {
  const dir = tmpdir();
  const issues = V.validateScene(base(), { enExportDir: dir });
  assert.deepEqual(codes(issues, 'error'), []);
  assert.deepEqual(codes(issues, 'warning'), ['export-missing']);
  // Without enExportDir the quote is not checked at all.
  assert.deepEqual(V.validateScene(base()), []);
});

test('normalizeText and stripFrontMatter helpers', () => {
  assert.equal(V.normalizeText('  a \n\t b c  '), 'a b c');
  assert.equal(V.stripFrontMatter('---\na: 1\n---\nbody'), 'body');
  assert.equal(V.stripFrontMatter('no front matter\n---\n'), 'no front matter\n---\n');
});

// ------------------------------------------------------------- placements.csv
const HEADER = 'family,diagram_id,section,step,template,group_shown,reason,open_question';
function row(s, reason, q) { return [s.family, s.id, s.anchor.section, s.anchor.step, s.template, s.group_shown, reason || '', q || ''].join(','); }
function second() { return mut((s) => { s.id = 'BB-09-D2'; s.anchor.step = 2; }); }

test('placements: valid file passes', () => {
  const a = base(), b = second();
  assert.deepEqual(V.validatePlacements([HEADER, row(a), row(b, '', '"Is it 2 or 3 lanes, ""wide""?"')].join('\n') + '\n', [a, b]), []);
});

test('placements: header must match exactly', () => {
  const a = base();
  assert.deepEqual(codes(V.validatePlacements('family,diagram,section\n' + row(a), [a])), ['placements-columns']);
});

test('placements: every scene listed; no orphan, duplicate or mismatched rows', () => {
  const a = base(), b = second();
  assert.ok(codes(V.validatePlacements([HEADER, row(a)].join('\n'), [a, b])).includes('placements-missing'));
  assert.ok(codes(V.validatePlacements([HEADER, row(a), row(b), row(mut((s) => { s.id = 'BB-09-D9'; }))].join('\n'), [a, b])).includes('placements-orphan'));
  assert.ok(codes(V.validatePlacements([HEADER, row(a), row(a), row(b)].join('\n'), [a, b])).includes('placements-dup'));
  const wrong = row(a).replace('bb-half', 'bb-full');
  assert.ok(codes(V.validatePlacements([HEADER, wrong, row(b)].join('\n'), [a, b])).includes('placements-mismatch'));
});

test('placements: exception rows need a reason; few diagrams without reason warns', () => {
  const a = base(), b = second();
  const noReason = 'FB-03,,,,,,,';
  assert.ok(codes(V.validatePlacements([HEADER, row(a), row(b), noReason].join('\n'), [a, b])).includes('placements-reason'));
  const withReason = 'FB-03,,,,,,"Non-spatial lesson, text is enough",';
  assert.deepEqual(V.validatePlacements([HEADER, row(a), row(b), withReason].join('\n'), [a, b]), []);
  const w = V.validatePlacements([HEADER, row(a)].join('\n'), [a]);
  assert.deepEqual(codes(w, 'warning'), ['placements-few']);
  assert.deepEqual(V.validatePlacements([HEADER, row(a, 'Only one spatial step')].join('\n'), [a]), []);
});

test('parseCsv handles quotes, doubled quotes, CRLF and BOM', () => {
  assert.deepEqual(V.parseCsv('﻿a,"b,c","d ""e"""\r\n1,,3\r\n'), [['a', 'b,c', 'd "e"'], ['1', '', '3']]);
});

// ------------------------------------------------------------- directory + CLI
test('validateDir: examples are clean in fixture mode', () => {
  const res = V.validateDir(EX, { fixtures: true, enExportDir: EXPORT });
  assert.equal(res.files.length, 14);
  assert.equal(res.errors, 0);
  assert.equal(res.warnings, 0);
  assert.ok(res.placements.endsWith('placements.csv'));
});

test('validateDir: examples fail outside fixture mode (reserved family / status)', () => {
  const res = V.validateDir(EX, { enExportDir: EXPORT });
  assert.ok(res.errors >= 28);
});

test('validateDir: file name, duplicate id, bad JSON and loose files are reported', () => {
  const dir = tmpdir();
  fs.mkdirSync(path.join(dir, 'BB-09'));
  fs.writeFileSync(path.join(dir, 'BB-09', 'BB-09-D1.json'), JSON.stringify(base()));
  fs.writeFileSync(path.join(dir, 'BB-09', 'renamed.json'), JSON.stringify(base()));
  fs.writeFileSync(path.join(dir, 'BB-09', 'BB-09-D3.json'), '{ not json');
  fs.writeFileSync(path.join(dir, 'loose.json'), '{}');
  const res = V.validateDir(dir, {});
  const all = res.files.flatMap((f) => codes(f.issues, 'error'));
  for (const c of ['filename', 'id-dup', 'json', 'folder']) assert.ok(all.includes(c), c);
  assert.equal(res.placements, null);
});

test('CLI: exit code and summary line', () => {
  const script = path.join(ROOT, 'validate.js');
  const ok = cp.spawnSync(process.execPath, [script, EX, '--fixtures', '--en-export', EXPORT], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /14 scene file\(s\), 0 error\(s\), 0 warning\(s\) \[fixture mode\]/);
  const bad = cp.spawnSync(process.execPath, [script, EX], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /ERROR BB-00-D1 family \[fixture-family\]/);
  const json = cp.spawnSync(process.execPath, [script, EX, '--fixtures', '--json'], { encoding: 'utf8' });
  assert.equal(JSON.parse(json.stdout).errors, 0);
  const usage = cp.spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(usage.status, 2);
});

// ------------------------------------------------------------------ cross-scene checks
function xcodes(list) { return list.map((i) => i.level + ':' + i.code); }

test('cross-scene: distinct alts and titles pass', () => {
  const a = base();
  const b = base(); b.id = 'BB-09-D2';
  b.title = { he: 'כותרת שנייה', en: 'Second', ar: 'ثان', ru: 'Второй', es: 'Segundo' };
  b.alt = { he: 'תיאור שני', en: 'Second alt.', ar: 'وصف ثان', ru: 'Описание два', es: 'Descripción dos' };
  assert.deepEqual(V.validateAcrossScenes([a, b]), []);
});

test('cross-scene: the same alt in one language on two scenes is an error', () => {
  const a = base();
  const b = base(); b.id = 'FB-07-D1'; b.family = 'FB-07';
  b.alt = Object.assign({}, b.alt, { en: 'Different English alt.' });
  const c = xcodes(V.validateAcrossScenes([a, b]));
  assert.ok(c.includes('error:alt-dup'));
  assert.equal(c.filter((x) => x === 'error:alt-dup').length, 4); // he, ar, ru, es still shared
});

test('cross-scene: alt duplicates are found after whitespace normalisation', () => {
  const a = base();
  const b = base(); b.id = 'FB-07-D1'; b.family = 'FB-07';
  b.alt = { he: 'x1', en: '  Two attackers,\n one defender. ', ar: 'x3', ru: 'x4', es: 'x5' };
  assert.deepEqual(xcodes(V.validateAcrossScenes([a, b])), ['error:alt-dup']);
});

test('cross-scene: the same title twice within one family is an error, across families it is not', () => {
  const a = base();
  const b = base(); b.id = 'BB-09-D2';
  b.alt = { he: '1', en: '2', ar: '3', ru: '4', es: '5' };
  b.title = Object.assign({}, a.title, { en: 'Other' });
  assert.equal(xcodes(V.validateAcrossScenes([a, b])).filter((x) => x === 'error:title-dup').length, 4);
  const c = base(); c.id = 'FB-07-D1'; c.family = 'FB-07';
  c.alt = { he: '1', en: '2', ar: '3', ru: '4', es: '5' };
  assert.deepEqual(V.validateAcrossScenes([a, c]), []);
});

test('cross-scene: a ball on top of a player is a warning', () => {
  const a = base();
  a.objects = a.objects.map((o) => (o.type === 'ball' ? { type: 'ball', x: 21, y: 31 } : o));
  assert.deepEqual(xcodes(V.validateAcrossScenes([a])), ['warning:ball-overlap']);
});
