'use strict';
// Gallery + docs tests: deterministic, self-contained, committed outputs in sync.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const G = require('../gallery.js');
const { templateTable } = require('../tools/schema-table.js');

const ROOT = path.join(__dirname, '..');
const EX = path.join(ROOT, 'examples');
const DEFAULT = { dir: EX, fixtures: true, enExportDir: path.join(EX, 'export-en') };

test('gallery build is deterministic', () => {
  assert.equal(G.buildGallery(DEFAULT), G.buildGallery(DEFAULT));
});

test('committed gallery.html is up to date (node gallery.js)', () => {
  const committed = fs.readFileSync(path.join(ROOT, 'gallery.html'), 'utf8');
  assert.equal(committed, G.buildGallery(DEFAULT));
});

test('gallery is self-contained and offline: no scripts, no external URLs', () => {
  const html = G.buildGallery(DEFAULT);
  assert.ok(!/<script/i.test(html));
  assert.ok(!/(src|href)\s*=\s*["']?(https?:)?\/\//i.test(html));
  assert.ok(!/@import|url\(/i.test(html));
  assert.ok(!html.includes(path.resolve(ROOT)), 'no absolute paths');
});

test('gallery lists every scene with all five languages, RTL for he/ar, escaped text', () => {
  const html = G.buildGallery(DEFAULT);
  for (const fam of fs.readdirSync(EX)) {
    const d = path.join(EX, fam);
    if (!fs.statSync(d).isDirectory() || fam === 'export-en') continue;
    for (const f of fs.readdirSync(d)) assert.ok(html.includes('id="scene-' + f.replace('.json', '') + '"'), f);
  }
  assert.ok(html.includes('lang="he" dir="rtl"'));
  assert.ok(html.includes('lang="ar" dir="rtl"'));
  assert.ok(html.includes('lang="ru" dir="ltr"'));
  assert.ok(html.includes('Escaping check: &lt;tag&gt; &amp; &quot;quotes&quot;.'));
  assert.ok(html.includes('@media print'));
  assert.ok(html.includes('Validation: 0 errors, 0 warnings'));
});

test('gallery CLI renders an arbitrary scenes dir to --out and requires --out', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pediag-g-'));
  const out = path.join(dir, 'g.html');
  const script = path.join(ROOT, 'gallery.js');
  const r = cp.spawnSync(process.execPath, [script, EX, '--fixtures', '--out', out], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.readFileSync(out, 'utf8').includes('id="scene-FIT-00-D2"'));
  const noOut = cp.spawnSync(process.execPath, [script, EX], { encoding: 'utf8' });
  assert.equal(noOut.status, 2);
});

test('schema.md template table is in sync with the template code', () => {
  const md = fs.readFileSync(path.join(ROOT, 'schema.md'), 'utf8');
  const m = /<!-- template-table:start -->\n([\s\S]*?)\n<!-- template-table:end -->/.exec(md);
  assert.ok(m, 'markers present');
  assert.equal(m[1], templateTable());
});
