'use strict';
// node --test store-content/packs/test/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const pack = require('../build-pack.cjs');

const FIX = path.join(__dirname, 'fixtures');
const SCRIPT = path.join(__dirname, '..', 'build-pack.cjs');
const LEGAL = path.join(__dirname, '..', '..', 'legal');
const COPY = path.join(__dirname, '..', '..', 'copy', 'products.en.md');

function opts(lang, extra) {
  return Object.assign({
    sport: 'basketball', lang,
    exportDir: path.join(FIX, 'export'), scenesDir: path.join(FIX, 'scenes'), placements: path.join(FIX, 'placements.csv')
  }, extra || {});
}
const build = (lang, extra) => pack.buildPack(opts(lang, extra));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const bodyOf = (html) => html.slice(html.indexOf('<body>'));
const textOf = (html) => bodyOf(html).replace(/<svg[\s\S]*?<\/svg>/g, '');

test('escaping: raw HTML in lesson text, titles and tables never becomes markup', () => {
  const { html } = build('en');
  assert.ok(!/<script/i.test(html), 'no script element');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('Fixture &lt;b&gt;Lesson&lt;/b&gt; &amp; &quot;One&quot;'), 'title escaped in TOC/heading');
  assert.ok(html.includes('b1 &amp; &lt;c&gt;'), 'table cell escaped');
  assert.ok(html.includes('<code>code &lt;x&gt;</code>'));
  assert.ok(html.includes('Quoted line with &lt;em&gt;html&lt;/em&gt;'));
  // scene titles are escaped in captions
  assert.ok(html.includes('Fixture diagram one &amp; &lt;b&gt;'));
  assert.ok(!/<b>Lesson/.test(html));
});

test('markdown renderer: headings, bold, italic, lists, nesting, tables, escapes, links', () => {
  const h = pack.renderMarkdown('# T\n## S\n**b** *i* \\*x\\*\n\n- a\n  - b\n- c\n\n1. one\n2. two\n\n|x|y|\n|-|-|\n|1|2|\n\n[t](javascript:alert(1)) <img src=x onerror=1>');
  assert.ok(h.includes('<h3>T</h3>') && h.includes('<h4>S</h4>'));
  assert.ok(h.includes('<strong>b</strong> <em>i</em> *x*'));
  assert.ok(h.includes('<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>'));
  assert.ok(h.includes('<ol><li>one</li><li>two</li></ol>'));
  assert.ok(h.includes('<table><thead><tr><th>x</th><th>y</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'));
  assert.ok(!/href=/.test(h), 'links are never clickable');
  assert.ok(!h.includes('javascript:'), 'link target is dropped');
  assert.ok(h.includes('&lt;img src=x onerror=1&gt;'));
  // single newlines are kept as line breaks, text is not rewritten
  assert.equal(pack.renderMarkdown('a\nb'), '<p>a<br>\nb</p>');
});

test('RTL attribute and language: he/ar are rtl, en is ltr; notices keep their own direction', () => {
  assert.match(build('he').html, /^<!DOCTYPE html>\n<html lang="he" dir="rtl">/);
  assert.match(build('ar').html, /<html lang="ar" dir="rtl">/);
  const en = build('en').html;
  assert.match(en, /<html lang="en" dir="ltr">/);
  // English notice on an Arabic page is an LTR island
  const ar = build('ar').html;
  assert.match(ar, /<p class="notice" lang="en" dir="ltr">Translations were produced with AI/);
  // diagrams are never mirrored: the same SVG geometry in he and en
  const geom = (h) => (h.match(/<g data-layer="paths">[\s\S]*?<\/g>/) || [''])[0];
  assert.equal(geom(build('he').html), geom(en));
});

test('table of contents: id, title, age, duration from the export only; blank where absent', () => {
  const en = build('en').html;
  const toc = en.slice(en.indexOf('<nav class="toc"'), en.indexOf('</nav>'));
  assert.ok(toc.includes('<bdi>BB-01</bdi></a></td><td>Fixture &lt;b&gt;Lesson&lt;/b&gt; &amp; &quot;One&quot;</td><td>9–11</td><td>40 minutes</td>'));
  // BB-02 uses combined labels (Name/code, Age/experience) and has no duration line
  assert.ok(toc.includes('<bdi>BB-02</bdi></a></td><td>Fixture Lesson Two</td><td>12–14</td><td></td>'), toc);
  const he = build('he').html;
  assert.ok(he.includes('<td>שיעור בדיקה ראשון</td><td>9–11</td><td>40 דקות</td>'));
  assert.ok(he.includes('<td>שיעור בדיקה שני</td><td>12–14</td><td></td>'));
  const ar = build('ar').html;
  assert.ok(ar.includes('<td>درس اختبار أول</td><td>9–11 سنة</td><td>40 دقيقة</td>'));
  assert.ok(ar.includes('<td>درس اختبار ثان</td><td></td><td></td>'), 'ambiguous or missing values stay blank');
  assert.deepEqual(pack.extractIdentity('# 1. x\n**Age:** 10\n# 2. y\n**Duration:** 5'), { title: null, age: '10', duration: null });
});

test('diagram inlining: after the anchored section, in section order, caption and alt in the language', () => {
  const { html, stats } = build('en');
  assert.equal(stats.diagrams, 2);
  const at = (s) => { const i = html.indexOf(s); assert.ok(i > 0, 'missing ' + s); return i; };
  const warm = at('WARM-MARK');
  const d2 = at('data-diagram="BB-01-D2"');
  const mainAHead = at('<h4>Main activity A</h4>');
  const mainB = at('MAINB-MARK');
  const d1 = at('data-diagram="BB-01-D1"');
  const gameHead = at('<h4>Applied game</h4>');
  const after = at('AFTER-MARK');
  assert.ok(warm < d2 && d2 < mainAHead, 'D2 (warmup) sits between warm-up text and Main activity A');
  assert.ok(mainB < d1 && d1 < gameHead, 'D1 (mainB) sits between main B text and Applied game');
  assert.ok(gameHead < after);
  assert.ok(html.includes('<figcaption><bdi>BB-01-D1</bdi> — Fixture diagram one &amp; &lt;b&gt;</figcaption>'));
  assert.ok(html.includes('Synthetic alt en BB-01-D1</desc>'));
  const he = build('he').html;
  assert.ok(he.includes('<svg') && he.includes('lang="he"'));
  assert.ok(he.includes('Synthetic alt he BB-01-D1</desc>'));
  assert.ok(he.includes('— תרשים בדיקה שני</figcaption>'));
  // lesson without placements has no figure
  const bb2 = html.slice(html.indexOf('id="lesson-BB-02"'));
  assert.ok(!bb2.includes('<figure'));
  // inline SVG carries no xmlns URL
  assert.ok(!html.includes('http://www.w3.org'));
});

test('front matter is never printed', () => {
  for (const lang of ['en', 'he', 'ar']) {
    const html = build(lang).html;
    for (const s of ['SENTINEL', 'example.invalid', 'source_page_id', 'status:']) assert.ok(!html.includes(s), lang + ' leaks ' + s);
  }
  assert.deepEqual(pack.splitFrontMatter('---\na: 1\n---\nBody'), { body: 'Body', front: 'a: 1' });
  assert.equal(pack.splitFrontMatter('no front matter\n---\nx').body, 'no front matter\n---\nx');
});

test('self-contained: strict CSP, no external URLs or resources', () => {
  for (const lang of ['en', 'he', 'ar']) {
    const { html } = build(lang);
    assert.ok(html.includes('<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'">'));
    assert.ok(!/https?:\/\//i.test(html), 'no http(s) URL');
    assert.ok(!/(^|[\s"'(=])\/\/[a-z]/i.test(textOf(html)), 'no protocol-relative URL');
    assert.ok(!/\ssrc=|<link|<script|<img|<iframe|<object|<embed|@import|url\(/i.test(html));
    assert.ok(!/href="(?!#)/.test(html), 'only in-page anchors');
    assert.ok(!/<a [^>]*target=/.test(html));
  }
});

test('cover: placeholders, pack facts and the owner wording from the legal files / product copy', () => {
  const en = build('en').html;
  assert.ok(en.includes('{{STORE_NAME}}') && en.includes('{{LICENCE_LINE}}'));
  assert.ok(en.includes('<h1>Basketball Lesson Pack</h1>'));
  assert.ok(en.includes('<dt>Lessons</dt><dd>2</dd>') && en.includes('<dd>English</dd>'));
  const copy = fs.readFileSync(COPY, 'utf8').split('\n');
  const blockAfter = (marker) => {
    const i = copy.findIndex((l) => l.startsWith(marker));
    const q = [];
    for (let k = i + 1; k < copy.length; k++) { if (/^>/.test(copy[k])) q.push(copy[k].replace(/^>\s?/, '')); else if (q.length) break; }
    return norm(q.join(' '));
  };
  const T = blockAfter('**Block T');
  const S = blockAfter('**Block S');
  assert.ok(T.startsWith('Translations were produced with AI.') && S.startsWith('All content, drills'));
  const plain = (h) => norm(h.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
  assert.ok(plain(en).includes(T), 'translation notice equals block T');
  assert.ok(plain(en).includes(S), 'responsibility line equals block S');
  assert.ok(/recommendations only/.test(S) && /decides/.test(S) && /adapt/.test(S));
  // Hebrew is the source language: no translation notice, Hebrew responsibility wording
  const he = build('he').html;
  assert.ok(!he.includes('Translations were produced with AI'));
  assert.ok(he.includes('<p class="notice" lang="he" dir="rtl">כל התכנים, התרגילים'));
  assert.ok(he.includes('<dd>עברית</dd>'));
  // notices come straight from store-content/legal
  assert.equal(pack.readNotices(LEGAL, 'en').translation.text, T);
});

test('page footer rules: one named @page per lesson with its id; print CSS present', () => {
  const { html } = build('en');
  assert.ok(html.includes('size:A4'));
  assert.ok(html.includes('@page pg-BB-01{@bottom-center{content:"BB-01 \\00B7  " counter(page)}}'));
  assert.ok(html.includes('.pg-BB-02{page:pg-BB-02}'));
  assert.ok(/<section class="lesson pg-BB-01" id="lesson-BB-01"/.test(html));
  assert.ok(html.includes('.lesson{break-before:page}'));
  assert.ok(html.includes('break-after:avoid'));
});

test('--skip-sections omits top-level sections by position; default prints everything', () => {
  assert.ok(build('en').html.includes('INTERNAL-MARK'));
  const r = build('en', { skipSections: [5] });
  assert.ok(!r.html.includes('INTERNAL-MARK'));
  assert.ok(r.html.includes('AFTER-MARK'));
});

test('anchor not found: figure is kept at the end of the lesson with a warning', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-'));
  fs.mkdirSync(path.join(tmp, 'en'));
  fs.writeFileSync(path.join(tmp, 'en', 'BB-01.md'), '# 1. Lesson identity\n**Full name:** Short\n# 2. Text\nNo sequence here.\n');
  const r = pack.buildPack(opts('en', { exportDir: tmp }));
  assert.equal(r.warnings.length, 2);
  assert.ok(r.html.includes('data-diagram="BB-01-D1"') && r.html.includes('data-diagram="BB-01-D2"'));
});

function runCli(args) {
  return cp.spawnSync(process.execPath, [SCRIPT].concat(args), { encoding: 'utf8' });
}
const baseArgs = (out, lang) => ['--sport', 'basketball', '--lang', lang, '--export-dir', path.join(FIX, 'export'),
  '--scenes-dir', path.join(FIX, 'scenes'), '--placements', path.join(FIX, 'placements.csv'), '--out', out];

test('determinism: two CLI runs write byte-identical files', () => {
  const a = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-a-'));
  const b = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pack-b-')), 'nested');
  const r1 = runCli(baseArgs(a, 'he,en,ar'));
  const r2 = runCli(baseArgs(b, 'he,en,ar'));
  assert.equal(r1.status, 0, r1.stderr);
  assert.equal(r2.status, 0, r2.stderr);
  const files = fs.readdirSync(a).sort();
  assert.deepEqual(files, ['basketball-lesson-pack.ar.html', 'basketball-lesson-pack.en.html', 'basketball-lesson-pack.he.html']);
  for (const f of files) assert.ok(fs.readFileSync(path.join(a, f)).equals(fs.readFileSync(path.join(b, f))), f);
  assert.deepEqual(fs.readdirSync(b).sort(), files);
});

test('CLI errors: missing arguments, unknown sport, missing scene file, missing language folder', () => {
  assert.equal(runCli([]).status, 2);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-e-'));
  const bad = baseArgs(out, 'en'); bad[1] = 'curling';
  const r = runCli(bad);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown sport/);
  assert.equal(runCli(baseArgs(out, 'ru')).status, 1, 'no ru fixtures');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pack-s-'));
  const miss = baseArgs(out, 'en'); miss[miss.indexOf('--scenes-dir') + 1] = tmp;
  const r3 = runCli(miss);
  assert.equal(r3.status, 1);
  assert.match(r3.stderr, /scene file missing/);
});

test('CSV parser handles quotes, commas and empty cells', () => {
  const rows = pack.parseCsv('a,b,c\n1,"x, ""y""",\n2,z,w\n');
  assert.deepEqual(rows, [{ a: '1', b: 'x, "y"', c: '' }, { a: '2', b: 'z', c: 'w' }]);
});
