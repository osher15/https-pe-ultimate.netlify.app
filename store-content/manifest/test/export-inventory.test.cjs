'use strict';
// Read-only regression test of the real G1 export inventory (not Notion fidelity).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..'); // store-content
const langs = ['he', 'en', 'ar', 'ru', 'es'];
const sports = ['BB', 'FB', 'HB', 'VB', 'AT', 'FIT'];
const kinds = { DR: [80, 'drill'], GM: [24, 'game'], AC: [16, 'activity'] };
const expected = [];
for (const lang of langs) {
  for (const sport of sports) for (let i = 1; i <= 10; i++)
    expected.push(['lessons', lang, `${sport}-${String(i).padStart(2, '0')}`, 'lesson']);
  for (const [prefix, [count, kind]] of Object.entries(kinds))
    for (let i = 1; i <= count; i++)
      expected.push(['activities', lang, `${prefix}-${String(i).padStart(3, '0')}`, kind]);
}
function parseExport(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/.exec(text);
  assert.ok(match, `${file}: invalid front matter`);
  const meta = Object.create(null);
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    assert.ok(colon > 0, `${file}: malformed metadata line`);
    const key = line.slice(0, colon);
    assert.ok(!(key in meta), `${file}: duplicate metadata ${key}`);
    meta[key] = line.slice(colon + 1).trim();
  }
  return { meta, body: match[2] };
}
test('all 900 source exports are unique, structurally valid and in expected paths', () => {
  const seen = new Set();
  for (const [group, lang, id, kind] of expected) {
    const file = path.join(root, 'export', group, lang, `${id}.md`);
    const { meta, body } = parseExport(file);
    assert.equal(meta.lang, lang, file);
    assert.equal(meta[group === 'lessons' ? 'family' : 'id'], id, file);
    if (group === 'activities') assert.equal(meta.kind, kind, file);
    assert.ok(body.trim().length >= 100, `${file}: empty/short body`);
    const uuid = meta.source_page_id.replace(/-/g, '').toLowerCase();
    assert.match(uuid, /^[0-9a-f]{32}$/, `${file}: invalid source UUID`);
    assert.ok(!seen.has(uuid), `${file}: duplicate source UUID`);
    seen.add(uuid);
    const url = new URL(meta.source);
    assert.equal(url.protocol, 'https:', file);
    assert.equal(url.hostname, 'app.notion.com', file);
    assert.equal(url.pathname, `/p/${uuid}`, file);
    assert.ok(!Number.isNaN(Date.parse(meta.source_last_edited_at)), `${file}: bad timestamp`);
    if (group === 'lessons') {
      const headings = [...body.matchAll(/^# (\d+)\./gm)].map(m => Number(m[1]));
      assert.deepEqual(headings, Array.from({ length: 20 }, (_, i) => i + 1), `${file}: numbered lesson headings`);
    } else {
      assert.ok((body.match(/^## /gm) || []).length >= 4, `${file}: missing activity sections`);
    }
  }
  assert.equal(seen.size, 900);
  for (const group of ['lessons', 'activities']) for (const lang of langs) {
    const dir = path.join(root, 'export', group, lang);
    const actual = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
    const wanted = expected.filter(x => x[0] === group && x[1] === lang).map(x => x[2] + '.md').sort();
    assert.deepEqual(actual, wanted, `${group}/${lang}: missing or unexpected export`);
  }
});
test('published manifests describe the exact source bodies', () => {
  const lessons = JSON.parse(fs.readFileSync(path.join(root, 'manifest/lessons.json'), 'utf8'));
  const activities = JSON.parse(fs.readFileSync(path.join(root, 'manifest/activities.json'), 'utf8'));
  assert.equal(lessons.length, 300);
  assert.equal(activities.length, 600);
  for (const entry of [...lessons, ...activities]) {
    const source = path.join(root, entry.source_file);
    const { meta, body } = parseExport(source);
    const hash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
    assert.equal(entry.body_sha256, hash, entry.source_file);
    assert.equal(entry.notion_page_id.replace(/-/g, ''), meta.source_page_id.replace(/-/g, ''), entry.source_file);
    assert.equal(entry.notion_last_edited, meta.source_last_edited_at, entry.source_file);
    assert.equal(entry.repo_compare, null, entry.source_file);
  }
  const csv = fs.readFileSync(path.join(root, 'manifest/manifest.csv'), 'utf8').trimEnd().split('\n');
  assert.equal(csv.length, 901, 'CSV header + 900 rows');
});
