'use strict';
// Legend tests: five languages, RTL attributes, well-formedness, committed legend.svg in sync.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const R = require('../render.js');
const { checkXml } = require('../lib/xml-check.js');

// x position of each item's label (labels use font-size 28; icon numerals do not).
function labelX(svg) {
  const out = {};
  for (const m of svg.matchAll(/<g data-key="(\w+)">([\s\S]*?)<\/g>/g)) {
    const t = /<text x="([\d.]+)" y="[\d.]+" font-size="28"/.exec(m[2]);
    out[m[1]] = +t[1];
  }
  return out;
}

const KEYS = ['teamA', 'teamB', 'ball', 'cone', 'station', 'move', 'pass', 'dribble', 'zone', 'teacher'];

test('legend renders well-formed SVG with all ten labels in each language', () => {
  for (const l of R.LANGS) {
    const svg = R.renderLegend(l);
    assert.deepEqual(checkXml(svg).errors, [], l);
    for (const k of KEYS) {
      assert.ok(svg.includes('data-key="' + k + '"'), l + ' ' + k);
      const label = R.LEGEND_LABELS[k][l];
      assert.ok(label && label.trim(), l + ' ' + k + ' label');
      assert.ok(svg.includes('>' + R.escapeXml(label) + '</text>'), l + ' ' + k + ' drawn');
    }
    assert.ok(svg.includes('lang="' + l + '"'));
    assert.ok(svg.includes('role="img"'));
  }
  assert.equal(R.LEGEND_LABELS.teamA.en, 'Team A');
  assert.equal(R.LEGEND_LABELS.station.en, 'Station');
});

test('Hebrew and Arabic legends are right-to-left via direction attributes', () => {
  for (const l of ['he', 'ar']) {
    const svg = R.renderLegend(l);
    assert.match(svg, /^<svg [^>]*direction="rtl"/, l + ' root');
    // Label and heading texts (icon numerals are digits and stay neutral).
    const texts = svg.match(/<text [^>]*font-size="(28|34)"[^>]*>/g);
    assert.equal(texts.length, 11);
    for (const t of texts) {
      assert.ok(t.includes('direction="rtl"'), l + ' text direction');
      assert.ok(t.includes('text-anchor="start"'), l + ' anchored at reading start');
    }
    // Reading order starts on the right: the first item's label sits right of the
    // second column's label.
    const x = labelX(svg);
    assert.ok(x.teamA > x.move, l + ' first column is on the right');
  }
  for (const l of ['en', 'ru', 'es']) {
    const svg = R.renderLegend(l);
    assert.ok(!svg.includes('direction="rtl"'), l);
    const x = labelX(svg);
    assert.ok(x.teamA < x.move, l + ' first column is on the left');
  }
});

test('committed legend.svg equals renderLegend("en")', () => {
  const file = fs.readFileSync(path.join(__dirname, '..', 'legend.svg'), 'utf8');
  assert.equal(file, R.renderLegend('en') + '\n');
});

test('unknown language falls back to English', () => {
  assert.equal(R.renderLegend('fr'), R.renderLegend('en'));
});
