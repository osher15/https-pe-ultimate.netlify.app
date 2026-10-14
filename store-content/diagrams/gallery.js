#!/usr/bin/env node
/*
 * Static review gallery for pe-diagram/1 scenes.
 *
 *   node store-content/diagrams/gallery.js
 *       -> renders store-content/diagrams/examples/ (fixture mode, quotes checked against
 *          examples/export-en/) into store-content/diagrams/gallery.html and rewrites
 *          store-content/diagrams/legend.svg.
 *
 *   node store-content/diagrams/gallery.js <scenesDir> --out <file.html>
 *       [--en-export <dir>] [--fixtures] [--placements <file>]
 *       -> review page for any scenes directory (nothing else is written).
 *
 * Output is deterministic (sorted input, no timestamps, no absolute paths) and fully
 * self-contained: inline CSS and inline SVG, no scripts, no external assets.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var R = require('./render.js');
var V = require('./validate.js');

var HERE = __dirname;
var LANG_NAMES = { he: 'Hebrew', en: 'English', ar: 'Arabic', ru: 'Russian', es: 'Spanish' };
var esc = R.escapeXml;

function rel(p) {
  return path.relative(HERE, path.resolve(p)).split(path.sep).join('/') || '.';
}
function dirAttr(lang) { return R.RTL_LANGS.indexOf(lang) >= 0 ? 'rtl' : 'ltr'; }
function str(v) { return typeof v === 'string' ? v : (v === undefined || v === null ? '' : JSON.stringify(v)); }

var CSS = [
  ':root{--ink:#111827;--muted:#4b5563;--line:#d1d5db;--bg:#f3f4f6;--card:#ffffff;--err:#b91c1c;--warn:#92400e;--ok:#166534}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 Arial,Helvetica,sans-serif}',
  'header,main{max-width:1100px;margin:0 auto;padding:16px}',
  'svg{max-width:100%;height:auto}',
  'h1{font-size:22px;margin:8px 0}h2{font-size:18px;margin:0 0 6px}h3{font-size:15px;margin:12px 0 4px}',
  '.summary{color:var(--muted)}',
  '.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px;margin:14px 0}',
  '.meta{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--muted);font-size:13px;margin-bottom:8px}',
  '.meta b{color:var(--ink)}',
  'figure{margin:8px 0}figure svg{display:block;width:100%;height:auto;max-height:70vh}',
  'blockquote{margin:6px 0;padding:6px 10px;border-left:4px solid var(--line);background:#f9fafb}',
  '.langs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px}',
  '.lang{border:1px solid var(--line);border-radius:6px;padding:6px 8px}',
  '.lang .code{font-size:12px;color:var(--muted);font-weight:700;direction:ltr;unicode-bidi:isolate}',
  '.issues{margin:4px 0;padding-left:20px}.issues .error{color:var(--err)}.issues .warning{color:var(--warn)}',
  '.ok{color:var(--ok);font-weight:700}.bad{color:var(--err);font-weight:700}',
  '.legends{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px}',
  '.legends svg,.tpl svg{width:100%;height:auto;display:block}',
  '.tpls{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px}',
  '.tpl{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:13px}',
  'table{border-collapse:collapse;font-size:13px}td,th{border:1px solid var(--line);padding:3px 6px;text-align:left;vertical-align:top}',
  '.printopt{font-size:13px;color:var(--muted)}',
  '@media (max-width:480px){header,main{padding:8px}.card{padding:8px}figure{margin:6px -4px}}',
  '@page{size:A4;margin:12mm}',
  '@media print{body{background:#fff;font-size:11px}header,main{max-width:none;padding:0}',
  '.printopt,.templates,.legend-all{display:none}',
  '.card{border:0;border-bottom:1px dashed #999;border-radius:0;margin:0;padding:2mm 0;min-height:0;break-inside:avoid;page-break-inside:avoid}',
  'h2{font-size:14px}.meta{font-size:10px;margin-bottom:2px}blockquote{padding:3px 8px}p{margin:3px 0}',
  'figure{margin:2mm 0}figure svg{max-height:78mm;width:auto;max-width:100%;margin:0 auto}',
  '.legend-en svg{max-height:60mm;width:auto}',
  '.i18n{display:none}body:has(#print-all:checked) .i18n{display:block}',
  'body:has(#print-all:checked) .card{min-height:0}}'
].join('\n');

function issuesHtml(list) {
  if (!list.length) return '<p class="ok">Validation: 0 errors, 0 warnings</p>';
  var e = list.filter(function (i) { return i.level === 'error'; }).length;
  var w = list.length - e;
  var out = '<p class="' + (e ? 'bad' : 'ok') + '">Validation: ' + e + ' error(s), ' + w + ' warning(s)</p><ul class="issues">';
  list.forEach(function (i) {
    out += '<li class="' + i.level + '">' + esc(i.level.toUpperCase() + (i.path ? ' ' + i.path : '') + ' [' + i.code + '] ' + i.message) + '</li>';
  });
  return out + '</ul>';
}

function langBlocks(map, cls) {
  var out = '<div class="langs ' + cls + '">';
  R.LANGS.forEach(function (l) {
    var v = map && typeof map === 'object' ? map[l] : undefined;
    out += '<div class="lang" lang="' + l + '" dir="' + dirAttr(l) + '"><div class="code">' + l + ' - ' + LANG_NAMES[l] + '</div>' +
      (typeof v === 'string' && v.trim() ? esc(v) : '<span class="bad">(missing)</span>') + '</div>';
  });
  return out + '</div>';
}

function sceneCard(entry, enExportDir) {
  var s = entry.scene;
  var id = entry.id ? String(entry.id) : rel(entry.file);
  var out = '<section class="card" id="' + esc('scene-' + id) + '">';
  if (!s || typeof s !== 'object') {
    return out + '<h2>' + esc(id) + '</h2><p>' + esc(rel(entry.file)) + '</p>' + issuesHtml(entry.issues) + '</section>';
  }
  var title = s.title && typeof s.title.en === 'string' ? s.title.en : '';
  var anchor = s.anchor && typeof s.anchor === 'object' ? s.anchor : {};
  out += '<h2>' + esc(id) + (title ? ' - ' + esc(title) : '') + '</h2>';
  out += '<div class="meta"><span>file <b>' + esc(rel(entry.file)) + '</b></span><span>sport <b>' + esc(str(s.sport)) + '</b></span>' +
    '<span>template <b>' + esc(str(s.template)) + '</b></span><span>anchor <b>' + esc(str(anchor.section)) + ' / step ' + esc(str(anchor.step)) + '</b></span>' +
    '<span>group <b>' + esc(str(s.group_shown)) + '</b></span><span>status <b>' + esc(str(s.status)) + '</b></span></div>';
  out += '<blockquote lang="en">' + esc(str(anchor.quote_en)) + '</blockquote>';
  var svg;
  try { svg = R.renderScene(s, { lang: 'en' }); } catch (e) { svg = '<p class="bad">Render failed: ' + esc(e.message) + '</p>'; }
  out += '<figure>' + svg + '</figure>';
  out += '<p><b>Safety:</b> ' + esc(str(s.safety)) + '</p>';
  out += '<p><b>Notes:</b> ' + esc(str(s.notes)) + '</p>';
  out += '<p lang="en"><b>Alt (en):</b> ' + esc(s.alt && s.alt.en ? s.alt.en : '') + '</p>';
  out += issuesHtml(entry.issues);
  out += '<div class="i18n"><h3>Titles</h3>' + langBlocks(s.title, 'titles') + '<h3>Alt text</h3>' + langBlocks(s.alt, 'alts') + '</div>';
  return out + '</section>';
}

function templatesSection() {
  var out = '<section class="templates"><h2>Templates</h2><p class="summary">Blank templates with their scene-coordinate landmarks (0-100, origin top-left of the playing area).</p><div class="tpls">';
  R.templates.list.forEach(function (t) {
    out += '<div class="tpl"><h3>' + esc(t.id) + ' - ' + esc(t.label) + '</h3>' + R.renderTemplate(t.id) +
      '<p>' + esc(t.orientation) + '</p><p><b>Sports:</b> ' + esc(t.sports.join(', ')) + '</p><table><tbody>';
    Object.keys(t.landmarks).forEach(function (k) {
      out += '<tr><th>' + esc(k) + '</th><td>' + esc(String(t.landmarks[k])) + '</td></tr>';
    });
    out += '</tbody></table></div>';
  });
  return out + '</div></section>';
}

/**
 * buildGallery({ dir, fixtures, enExportDir, placements }) -> HTML string.
 */
function buildGallery(opts) {
  var dir = opts.dir;
  var res = V.validateDir(dir, { fixtures: !!opts.fixtures, enExportDir: opts.enExportDir, placements: opts.placements });
  var out = '<!DOCTYPE html>\n<html lang="en" dir="ltr">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>PE diagram review gallery</title>\n<style>\n' + CSS + '\n</style>\n</head>\n<body>\n<header>\n';
  out += '<h1>PE diagram review gallery (pe-diagram/1)</h1>\n';
  out += '<p class="summary">Scenes: <b>' + esc(rel(dir)) + '</b>' + (opts.fixtures ? ' (fixture mode)' : '') +
    ' | EN export: <b>' + esc(opts.enExportDir ? rel(opts.enExportDir) : 'not checked') + '</b>' +
    ' | placements: <b>' + esc(res.placements ? rel(res.placements) : 'not found') + '</b>' +
    ' | ' + res.files.length + ' scene file(s), ' + res.errors + ' error(s), ' + res.warnings + ' warning(s).</p>\n';
  out += '<p class="summary">Draft review material. Courts are schematic, not regulation-accurate. Diagrams are language-neutral and never mirrored; only &lt;title&gt;/&lt;desc&gt; change per language.</p>\n';
  out += '<p class="printopt"><label><input type="checkbox" id="print-all"> Include all five languages when printing</label> (default print: one diagram per half A4 page, English only).</p>\n';
  if (res.issues.length) out += '<div class="card"><h2>placements.csv</h2>' + issuesHtml(res.issues) + '</div>\n';
  out += '</header>\n<main>\n';
  out += '<section class="card legend-en"><h2>Legend</h2>' + R.renderLegend('en') + '</section>\n';
  out += '<details class="card legend-all"><summary>Legend in all five languages</summary><div class="legends">';
  R.LANGS.forEach(function (l) { out += '<div lang="' + l + '" dir="' + dirAttr(l) + '">' + R.renderLegend(l) + '</div>'; });
  out += '</div></details>\n';
  res.files.forEach(function (f) { out += sceneCard(f, opts.enExportDir) + '\n'; });
  out += templatesSection() + '\n';
  out += '</main>\n</body>\n</html>\n';
  return out;
}

function main(argv) {
  var o = { dir: null, out: null, enExportDir: null, fixtures: false, placements: undefined };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a === '--out') o.out = argv[++i];
    else if (a === '--en-export') o.enExportDir = argv[++i];
    else if (a === '--fixtures') o.fixtures = true;
    else if (a === '--placements') o.placements = argv[++i];
    else if (a.charAt(0) === '-') { console.error('unknown option ' + a); return 2; }
    else o.dir = a;
  }
  var writeLegend = false;
  if (!o.dir) {
    o.dir = path.join(HERE, 'examples');
    o.fixtures = true;
    if (!o.enExportDir) o.enExportDir = path.join(HERE, 'examples', 'export-en');
    if (!o.out) o.out = path.join(HERE, 'gallery.html');
    writeLegend = true;
  } else if (!o.out) {
    console.error('usage: node store-content/diagrams/gallery.js [<scenesDir> --out <file.html>] [--en-export <dir>] [--fixtures] [--placements <file>]');
    return 2;
  }
  var html = buildGallery(o);
  fs.writeFileSync(o.out, html);
  console.log('wrote ' + o.out + ' (' + Buffer.byteLength(html) + ' bytes)');
  if (writeLegend) {
    var lp = path.join(HERE, 'legend.svg');
    fs.writeFileSync(lp, R.renderLegend('en') + '\n');
    console.log('wrote ' + lp);
  }
  return 0;
}

module.exports = { buildGallery: buildGallery, main: main };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
