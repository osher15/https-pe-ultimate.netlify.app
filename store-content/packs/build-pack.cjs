#!/usr/bin/env node
'use strict';
/*
 * PE Tools Store - print-ready lesson pack generator (task C15).
 *
 * For one sport and one or all languages it writes ONE self-contained, printable HTML file per language:
 * cover page, table of contents, then every lesson rendered from its exported Markdown with the lesson's
 * diagrams (pe-diagram/1 scenes, via ../diagrams/render.js) inlined as SVG after the section they are anchored to.
 *
 * Only Node built-ins and the diagram engine are used. No network. Output has no external requests.
 * The lesson text is never rewritten: Markdown is only turned into HTML (HTML is escaped).
 *
 *   node store-content/packs/build-pack.cjs --sport basketball --lang all \
 *        --export-dir <dir containing en/ he/ ar/ ru/ es/> --scenes-dir <dir with <FAMILY>/<id>.json> \
 *        --placements <placements.csv> --out <dir>
 *
 * Optional: --legal-dir <dir> (default ../legal), --skip-sections 16,17,20 (omit numbered top-level
 * sections of every lesson by their 1-based position; default: print everything).
 */

const fs = require('fs');
const path = require('path');
const engine = require('../diagrams/render.js');

const LANGS = ['he', 'en', 'ar', 'ru', 'es'];
const RTL = { he: true, ar: true, en: false, ru: false, es: false };
const SOURCE_LANG = 'he';

/* ---------------------------------------------------------------------------------------------------------
 * Sport table. To add a sport: add one entry (prefix = family prefix used in file names and scene ids).
 * The `sport` name fields are interface labels (draft, pending native-speaker review).
 * ------------------------------------------------------------------------------------------------------ */
const SPORTS = {
  basketball: {
    prefix: 'BB',
    name: { he: 'כדורסל', en: 'Basketball', ar: 'كرة السلة', ru: 'Баскетбол', es: 'Baloncesto' },
    packTitle: {
      he: 'ערכת שיעורים: כדורסל',
      en: 'Basketball Lesson Pack',
      ar: 'حزمة دروس: كرة السلة',
      ru: 'Пакет уроков: баскетбол',
      es: 'Paquete de lecciones: baloncesto'
    }
  }
};

/* Interface strings (draft, pending native-speaker review). */
const UI = {
  he: { sport: 'ענף', lessons: 'שיעורים', language: 'שפה', langName: 'עברית', contents: 'תוכן עניינים', colLesson: 'מערך', colTitle: 'כותרת', colAge: 'גיל', colDuration: 'משך', diagram: 'תרשים' },
  en: { sport: 'Sport', lessons: 'Lessons', language: 'Language', langName: 'English', contents: 'Contents', colLesson: 'Lesson', colTitle: 'Title', colAge: 'Age', colDuration: 'Duration', diagram: 'Diagram' },
  ar: { sport: 'الرياضة', lessons: 'الدروس', language: 'اللغة', langName: 'العربية', contents: 'المحتويات', colLesson: 'الدرس', colTitle: 'العنوان', colAge: 'العمر', colDuration: 'المدة', diagram: 'رسم' },
  ru: { sport: 'Вид спорта', lessons: 'Уроков', language: 'Язык', langName: 'Русский', contents: 'Содержание', colLesson: 'Урок', colTitle: 'Название', colAge: 'Возраст', colDuration: 'Продолжительность', diagram: 'Схема' },
  es: { sport: 'Deporte', lessons: 'Lecciones', language: 'Idioma', langName: 'Español', contents: 'Contenido', colLesson: 'Lección', colTitle: 'Título', colAge: 'Edad', colDuration: 'Duración', diagram: 'Diagrama' }
};

/* Order of the lesson-sequence sub-headings (the H2s under the lesson-sequence H1). */
const SECTION_INDEX = { opening: 0, warmup: 1, mainA: 2, mainB: 3, appliedGame: 4, closing: 5 };

/* Labels of the identity block that carry the TOC fields (lower-case, all five languages). */
const LABELS = {
  title: ['full name', 'full title', 'name', 'lesson name', 'title', 'שם מלא', 'שם', 'الاسم الكامل', 'الاسم', 'полное название', 'название', 'título completo', 'título', 'nombre'],
  age: ['age', 'גיל', 'العمر', 'возраст', 'edad'],
  duration: ['duration', 'משך', 'المدة', 'продолжительность', 'время', 'duración', 'time']
};

/* ------------------------------------------------------------------------------------------------------ */
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function normNewlines(s) { return String(s).replace(/^﻿/, '').replace(/\r\n?/g, '\n'); }

/* Remove a leading YAML-ish front matter block (--- ... ---). Returns { body, front } (front is never printed). */
function splitFrontMatter(text) {
  text = normNewlines(text);
  const m = text.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!m) return { body: text, front: '' };
  return { body: text.slice(m[0].length), front: m[1] };
}

/* ---------------- minimal safe Markdown renderer ---------------- */
const PUA = '';

function renderInline(raw) {
  const stash = [];
  const keep = (html) => { stash.push(html); return PUA + (stash.length - 1) + PUA; };
  let s = String(raw);
  // backslash escapes of Markdown punctuation: keep the literal character
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|>~])/g, (m, c) => keep(escapeHtml(c)));
  // code spans
  s = s.replace(/`([^`\n]+)`/g, (m, c) => keep('<code>' + escapeHtml(c) + '</code>'));
  // links: keep the visible text only. Link targets are not printed, so the output never contains a URL.
  s = s.replace(/\[([^\]\n]+)\]\(([^)\s]*)\)/g, (m, t) => t);
  s = escapeHtml(s);
  s = s.replace(/\*\*(?=\S)([\s\S]+?)(?<=\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(?<![\w*])\*(?=[^\s*])([^*\n]+?)(?<=[^\s*])\*(?![\w*])/g, '<em>$1</em>');
  s = s.replace(new RegExp(PUA + '(\\d+)' + PUA, 'g'), (m, i) => stash[+i]);
  return s;
}

function isTableSep(line) {
  return /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/.test(line) && line.indexOf('-') >= 0 && line.indexOf('|') >= 0;
}
function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '\\' && t[i + 1] === '|') { cur += '|'; i++; } else if (t[i] === '|') { cells.push(cur.trim()); cur = ''; } else cur += t[i];
  }
  cells.push(cur.trim());
  return cells;
}

const RE_HEADING = /^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
const RE_HR = /^[ \t]*([-*_])([ \t]*\1){2,}[ \t]*$/;
const RE_LIST = /^([ \t]*)([-*+]|\d+[.)])[ \t]+(.*)$/;

function startsBlock(line, nextLine) {
  return RE_HEADING.test(line) || RE_HR.test(line) || /^[ \t]*>/.test(line) || RE_LIST.test(line) ||
    (line.indexOf('|') >= 0 && nextLine !== undefined && isTableSep(nextLine));
}

function renderList(lines) {
  // lines: array of {indent, ordered, text}; build nested lists by indentation
  let html = '';
  const stack = []; // {indent, tag}
  const closeTo = (indent) => {
    while (stack.length && stack[stack.length - 1].indent > indent) {
      html += '</li></' + stack.pop().tag + '>';
    }
  };
  for (const it of lines) {
    const tag = it.ordered ? 'ol' : 'ul';
    closeTo(it.indent);
    const top = stack[stack.length - 1];
    if (top && top.indent === it.indent) {
      html += '</li><li>';
    } else {
      html += '<' + tag + '><li>';
      stack.push({ indent: it.indent, tag });
    }
    html += it.parts.map(renderInline).join('<br>');
  }
  closeTo(-1);
  return html;
}

/*
 * Parse Markdown into blocks: { kind: 'heading', level, html } | { kind: 'html', html }.
 * Heading level is the Markdown level (1-6).
 */
function parseBlocks(md, opts) {
  opts = opts || {};
  const lines = normNewlines(md).split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    let m = line.match(RE_HEADING);
    if (m) {
      blocks.push({ kind: 'heading', level: m[1].length, text: m[2], html: renderInline(m[2]) });
      i++; continue;
    }
    if (RE_HR.test(line)) { blocks.push({ kind: 'html', html: '<hr>' }); i++; continue; }
    if (/^[ \t]*>/.test(line)) {
      const q = [];
      while (i < lines.length && /^[ \t]*>/.test(lines[i])) { q.push(lines[i].replace(/^[ \t]*>[ \t]?/, '')); i++; }
      const inner = parseBlocks(q.join('\n'), { demoteHeadings: true }).map((b) => b.html).join('\n');
      blocks.push({ kind: 'html', html: '<blockquote>' + inner + '</blockquote>' });
      continue;
    }
    if (line.indexOf('|') >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && lines[i].indexOf('|') >= 0) { rows.push(splitRow(lines[i])); i++; }
      let h = '<table><thead><tr>' + head.map((c) => '<th>' + renderInline(c) + '</th>').join('') + '</tr></thead><tbody>';
      for (const r of rows) {
        const cells = [];
        for (let k = 0; k < head.length; k++) cells.push('<td>' + renderInline(r[k] === undefined ? '' : r[k]) + '</td>');
        h += '<tr>' + cells.join('') + '</tr>';
      }
      blocks.push({ kind: 'html', html: h + '</tbody></table>' });
      continue;
    }
    m = line.match(RE_LIST);
    if (m) {
      const items = [];
      while (i < lines.length && !/^\s*$/.test(lines[i])) {
        const lm = lines[i].match(RE_LIST);
        if (lm) {
          items.push({ indent: lm[1].replace(/\t/g, '    ').length, ordered: /\d/.test(lm[2]), parts: [lm[3].replace(/\s+$/, '')] });
          i++;
        } else if (/^[ \t]+\S/.test(lines[i]) && items.length) {
          items[items.length - 1].parts.push(lines[i].trim()); i++;
        } else if (startsBlock(lines[i], lines[i + 1])) {
          break;
        } else {
          items[items.length - 1].parts.push(lines[i].trim()); i++;
        }
      }
      // normalise indents to levels so 2- and 4-space nesting both work
      const levels = [];
      for (const it of items) {
        while (levels.length && levels[levels.length - 1] > it.indent) levels.pop();
        if (!levels.length || levels[levels.length - 1] < it.indent) levels.push(it.indent);
        it.indent = levels.length - 1;
      }
      blocks.push({ kind: 'html', html: renderList(items) });
      continue;
    }
    // paragraph: consecutive lines, each source line break is kept as a visible line break
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !(para.length && startsBlock(lines[i], lines[i + 1]))) {
      para.push(lines[i].replace(/\s+$/, '').replace(/^\s+/, '')); i++;
    }
    blocks.push({ kind: 'html', html: '<p>' + para.map(renderInline).join('<br>\n') + '</p>' });
  }
  // finish headings (render to html here so callers can place diagrams between blocks)
  for (const b of blocks) {
    if (b.kind === 'heading') {
      const lvl = Math.min(6, b.level + (opts.demoteHeadings ? 3 : 2));
      b.html = '<h' + lvl + '>' + b.html + '</h' + lvl + '>';
    }
  }
  return blocks;
}

/* Public: Markdown -> HTML string (headings H1 -> h3 etc., so the lesson title can be h2). */
function renderMarkdown(md) {
  return parseBlocks(md).map((b) => b.html).join('\n');
}

/* ---------------- lesson parsing ---------------- */
function labelKey(raw) {
  return raw.replace(/[:：]\s*$/, '').trim().toLowerCase();
}

/* Extract { title, age, duration } from the first H1 block (the identity block). Absent -> null. */
function extractIdentity(body) {
  const lines = normNewlines(body).split('\n');
  const out = { title: null, age: null, duration: null };
  let h1 = 0;
  const found = {};
  for (const line of lines) {
    if (/^#\s/.test(line)) { h1++; if (h1 > 1) break; continue; }
    if (h1 !== 1) continue;
    const m = line.match(/^\s*(?:[-*]\s+)?\*\*([^*]+?)\*\*\s*(.*)$/);
    if (!m) continue;
    let label = m[1];
    let value = m[2];
    // the colon may sit inside or right after the bold label
    if (!/[:：]\s*$/.test(label) && /^[:：]/.test(value)) value = value.replace(/^[:：]\s*/, '');
    label = labelKey(label);
    value = value.replace(/\s+$/, '').trim();
    const labels = label.split('/').map((x) => x.trim());
    let values = [value];
    if (labels.length > 1) {
      values = value.split(/\s*[;؛]\s*/);
      if (values.length !== labels.length) continue; // ambiguous: leave blank rather than guess
    }
    labels.forEach((l, idx) => {
      for (const key of Object.keys(LABELS)) {
        if (LABELS[key].indexOf(l) >= 0 && found[key] === undefined) found[key] = values[idx];
      }
    });
  }
  for (const k of Object.keys(out)) {
    const v = found[k];
    out[k] = v && v.trim() ? v.trim() : null;
  }
  return out;
}

/* ---------------- CSV (RFC 4180) ---------------- */
function parseCsv(text) {
  text = normNewlines(text);
  const rows = [];
  let row = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((x) => x.trim() !== '')).map((r) => {
    const o = {};
    head.forEach((h, idx) => { o[h] = r[idx] === undefined ? '' : r[idx]; });
    return o;
  });
}

function naturalCompare(a, b) {
  const ra = String(a).match(/\d+|\D+/g) || [];
  const rb = String(b).match(/\d+|\D+/g) || [];
  for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
    const x = ra[i]; const y = rb[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (/^\d/.test(x) && /^\d/.test(y)) { const d = (+x) - (+y); if (d) return d; } else if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/* ---------------- legal notices (single source of truth: store-content/legal) ---------------- */
function blockquoteAfter(lines, headingRe) {
  const idx = lines.findIndex((l) => headingRe.test(l));
  if (idx < 0) return null;
  const q = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (/^>/.test(lines[i])) q.push(lines[i].replace(/^>\s?/, ''));
    else if (q.length) break;
    else if (/^##\s/.test(lines[i])) break;
  }
  return q.length ? q.join(' ').replace(/\s+/g, ' ').trim() : null;
}
function readNotices(legalDir, lang) {
  const file = (l) => path.join(legalDir, 'content-and-translation-notice.' + l + '.md');
  const en = normNewlines(fs.readFileSync(file('en'), 'utf8')).split('\n');
  const enTranslation = blockquoteAfter(en, /^##\s+1\.\s/);
  const enResp = blockquoteAfter(en, /^##\s+1a\.\s/);
  if (!enTranslation || !enResp) throw new Error('legal notice blocks not found in ' + file('en'));
  if (lang === SOURCE_LANG) {
    const he = normNewlines(fs.readFileSync(file('he'), 'utf8')).split('\n');
    const heResp = blockquoteAfter(he, /^##\s+1א\.\s/);
    if (!heResp) throw new Error('Hebrew responsibility block not found in ' + file('he'));
    return { translation: null, responsibility: { text: heResp, lang: 'he', dir: 'rtl' } };
  }
  return {
    translation: { text: enTranslation, lang: 'en', dir: 'ltr' },
    responsibility: { text: enResp, lang: 'en', dir: 'ltr' }
  };
}

/* ---------------- CSS ---------------- */
function buildCss(lessonIds) {
  const pageRules = lessonIds.map((id) => {
    const cls = pageClass(id);
    return '@page ' + cls + '{@bottom-center{content:"' + id + ' \\00B7  " counter(page)}}\n.' + cls + '{page:' + cls + '}';
  }).join('\n');
  return [
    '@page{size:A4;margin:18mm 16mm 20mm 16mm;@bottom-center{content:counter(page);font:9pt/1 var(--f);color:#555}}',
    '@page cover{@bottom-center{content:none}}',
    pageRules,
    ':root{--f:"Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,"Noto Sans","Noto Sans Hebrew","Noto Sans Arabic","Arial Hebrew","Droid Sans Hebrew","DejaVu Sans",sans-serif}',
    '*{box-sizing:border-box}',
    'html{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    'body{margin:0;background:#fff;color:#111;font:10pt/1.45 var(--f);overflow-wrap:anywhere}',
    '.cover{page:cover;break-after:page;min-height:250mm;display:flex;flex-direction:column;justify-content:space-between;padding:10mm 0}',
    '.cover .store{font-size:12pt;letter-spacing:.04em;color:#444}',
    '.cover h1{font-size:30pt;line-height:1.15;margin:40mm 0 8mm}',
    '.cover dl{display:grid;grid-template-columns:max-content 1fr;gap:2mm 8mm;font-size:12pt;margin:0 0 10mm}',
    '.cover dt{color:#555}.cover dd{margin:0;font-weight:600}',
    '.cover .licence{border:0.3mm solid #999;padding:3mm 4mm;font-size:10pt;margin:0 0 6mm}',
    '.notice{border-inline-start:1.2mm solid #888;padding:1mm 4mm;margin:0 0 5mm;font-size:9.5pt;color:#222;break-inside:avoid}',
    '.toc{break-after:page}',
    '.toc h2{font-size:18pt;margin:0 0 6mm}',
    '.toc table{width:100%;border-collapse:collapse;font-size:10pt}',
    '.toc th{text-align:start;border-bottom:0.4mm solid #333;padding:1.5mm 2mm;font-weight:700}',
    '.toc td{border-bottom:0.2mm solid #bbb;padding:1.6mm 2mm;vertical-align:top}',
    '.toc tr{break-inside:avoid}',
    '.toc{overflow-wrap:normal}',
    '.toc th:not(:nth-child(2)),.toc td:not(:nth-child(2)){white-space:nowrap}',
    '.toc a{color:inherit;text-decoration:none}',
    '.lesson{break-before:page}',
    '.lesson-head{display:flex;align-items:baseline;gap:4mm;font-size:17pt;line-height:1.2;margin:0 0 5mm;padding-bottom:2mm;border-bottom:0.5mm solid #222;break-after:avoid}',
    '.lesson-head .lid{font-weight:700;color:#333;flex:none}',
    '.lesson h3{font-size:12.5pt;margin:6mm 0 2mm;break-after:avoid;page-break-after:avoid}',
    '.lesson h4{font-size:11pt;margin:4mm 0 1.5mm;break-after:avoid;page-break-after:avoid}',
    '.lesson h5,.lesson h6{font-size:10pt;margin:3mm 0 1mm;break-after:avoid}',
    '.lesson p{margin:0 0 2.2mm;orphans:3;widows:3}',
    '.lesson ul,.lesson ol{margin:0 0 2.6mm;padding-inline-start:6mm}',
    '.lesson li{margin:0 0 .8mm;orphans:2;widows:2}',
    '.lesson blockquote{margin:0 0 3mm;padding:.5mm 4mm;border-inline-start:1mm solid #999;color:#222}',
    '.lesson hr{border:0;border-top:0.2mm solid #999;margin:4mm 0}',
    '.lesson table{border-collapse:collapse;width:100%;margin:0 0 3mm;font-size:9.5pt}',
    '.lesson th,.lesson td{border:0.2mm solid #888;padding:1.2mm 2mm;text-align:start;vertical-align:top}',
    '.lesson tr{break-inside:avoid}',
    '.lesson code{font-family:ui-monospace,Menlo,Consolas,"DejaVu Sans Mono",monospace;font-size:9pt}',
    'figure.diagram{margin:4mm 0;break-inside:avoid;page-break-inside:avoid;text-align:center}',
    'figure.diagram svg{display:block;margin:0 auto;width:100%;height:auto;max-height:92mm}',
    'figure.diagram svg[data-template$="-half"]{max-height:122mm}',
    'figure.diagram figcaption{margin-top:1.5mm;font-size:9pt;color:#333}',
    'bdi{unicode-bidi:isolate}'
  ].join('\n');
}

function safeId(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, '-'); }
function pageClass(id) { return 'pg-' + safeId(id); }

/* ---------------- building ---------------- */
function loadPlacements(placementsPath, scenesDir, prefix, warn) {
  const rows = parseCsv(fs.readFileSync(placementsPath, 'utf8'));
  const byFamily = {};
  const used = new Set();
  for (const r of rows) {
    const fam = (r.family || '').trim();
    const id = (r.diagram_id || '').trim();
    if (!id || !fam.startsWith(prefix + '-')) continue;
    if (used.has(id)) { warn('duplicate placement row for ' + id + ' ignored'); continue; }
    used.add(id);
    const sceneFile = path.join(scenesDir, fam, id + '.json');
    if (!fs.existsSync(sceneFile)) throw new Error('scene file missing for placement ' + id + ': ' + sceneFile);
    const scene = JSON.parse(fs.readFileSync(sceneFile, 'utf8'));
    (byFamily[fam] = byFamily[fam] || []).push({ id, section: (r.section || '').trim(), step: parseInt(r.step, 10) || 1, scene });
  }
  for (const fam of Object.keys(byFamily)) {
    byFamily[fam].sort((a, b) => (a.step - b.step) || naturalCompare(a.id, b.id));
  }
  // scenes that exist on disk but have no placement row are not printed
  if (fs.existsSync(scenesDir)) {
    for (const d of fs.readdirSync(scenesDir).sort()) {
      const dir = path.join(scenesDir, d);
      if (!d.startsWith(prefix + '-') || !fs.statSync(dir).isDirectory()) continue;
      for (const f of fs.readdirSync(dir).sort()) {
        if (/\.json$/.test(f) && !used.has(f.replace(/\.json$/, ''))) warn('scene ' + f + ' has no row in placements.csv; not printed');
      }
    }
  }
  return byFamily;
}

function figureHtml(placement, lang, ui) {
  const scene = placement.scene;
  let svg = engine.renderScene(scene, { lang });
  svg = svg.replace(/\sxmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '');
  const titles = scene.title || {};
  const caption = (titles[lang] && String(titles[lang]).trim()) || (titles.en && String(titles.en).trim()) || '';
  const dir = RTL[lang] ? 'rtl' : 'ltr';
  return '<figure class="diagram" data-diagram="' + escapeHtml(placement.id) + '" dir="' + dir + '">' + svg +
    '<figcaption><bdi>' + escapeHtml(placement.id) + '</bdi>' + (caption ? ' — ' + escapeHtml(caption) : '') + '</figcaption></figure>';
}

function renderLesson(id, body, placements, lang, ui, skipSections, warn) {
  const blocks = parseBlocks(body);
  // locate the lesson-sequence H1: the first H1 followed by >= 5 H2 headings before the next H1
  let seq = null;
  for (let i = 0; i < blocks.length && !seq; i++) {
    if (blocks[i].kind === 'heading' && blocks[i].level === 1) {
      const h2 = [];
      let end = blocks.length;
      for (let j = i + 1; j < blocks.length; j++) {
        if (blocks[j].kind === 'heading' && blocks[j].level === 1) { end = j; break; }
        if (blocks[j].kind === 'heading' && blocks[j].level === 2) h2.push(j);
      }
      if (h2.length >= 5) seq = { h2, end };
    }
  }
  // after[blockIndex] = html inserted after block blockIndex
  const after = {};
  const tail = [];
  for (const p of placements) {
    const idx = SECTION_INDEX[p.section];
    const fig = figureHtml(p, lang, ui);
    if (!seq || idx === undefined || idx >= seq.h2.length) {
      warn(id + ': anchor ' + p.section + ' of ' + p.id + ' not found in lesson; placed at the end of the lesson');
      tail.push(fig);
      continue;
    }
    const start = seq.h2[idx];
    const stop = idx + 1 < seq.h2.length ? seq.h2[idx + 1] : seq.end;
    const pos = stop - 1; // last block of the section
    (after[pos] = after[pos] || []).push(fig);
    void start;
  }
  // numbered top-level sections to skip
  const skipRanges = [];
  if (skipSections && skipSections.length) {
    let n = 0; let cur = null;
    blocks.forEach((b, i) => {
      if (b.kind === 'heading' && b.level === 1) { n++; cur = skipSections.indexOf(n) >= 0 ? { from: i } : null; if (cur) skipRanges.push(cur); }
      if (cur) cur.to = i;
    });
  }
  const skipped = (i) => skipRanges.some((r) => i >= r.from && i <= r.to);
  const out = [];
  blocks.forEach((b, i) => {
    if (!skipped(i)) out.push(b.html);
    if (after[i]) out.push(after[i].join('\n'));
  });
  out.push(tail.join('\n'));
  return out.join('\n');
}

function listLessonFiles(dir, prefix) {
  return fs.readdirSync(dir).filter((f) => new RegExp('^' + prefix + '-\\d{2}\\.md$').test(f)).sort(naturalCompare);
}

function buildPack(opts) {
  const sport = SPORTS[opts.sport];
  if (!sport) throw new Error('unknown sport "' + opts.sport + '" (known: ' + Object.keys(SPORTS).join(', ') + ')');
  const lang = opts.lang;
  if (LANGS.indexOf(lang) < 0) throw new Error('unknown language "' + lang + '"');
  const warnings = [];
  const warn = (m) => warnings.push(m);
  const ui = UI[lang];
  const legalDir = opts.legalDir || path.join(__dirname, '..', 'legal');
  const langDir = path.join(opts.exportDir, lang);
  if (!fs.existsSync(langDir)) throw new Error('export directory missing for ' + lang + ': ' + langDir);
  const files = listLessonFiles(langDir, sport.prefix);
  if (!files.length) throw new Error('no ' + sport.prefix + '-NN.md lessons in ' + langDir);
  const placementsByFamily = loadPlacements(opts.placements, opts.scenesDir, sport.prefix, warn);
  const notices = readNotices(legalDir, lang);

  const lessons = files.map((f) => {
    const id = f.replace(/\.md$/, '');
    const { body } = splitFrontMatter(fs.readFileSync(path.join(langDir, f), 'utf8'));
    const ident = extractIdentity(body);
    const placements = placementsByFamily[id] || [];
    return { id, ident, body, placements };
  });

  const dir = RTL[lang] ? 'rtl' : 'ltr';
  const ids = lessons.map((l) => l.id);
  const diagramCount = lessons.reduce((n, l) => n + l.placements.length, 0);
  const cell = (v) => (v ? escapeHtml(v) : '');

  let html = '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + dir + '">\n<head>\n<meta charset="utf-8">\n' +
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + escapeHtml(sport.packTitle[lang]) + '</title>\n<style>\n' + buildCss(ids) + '\n</style>\n</head>\n<body>\n';

  // cover
  html += '<section class="cover">\n<div class="store">{{STORE_NAME}}</div>\n<div>\n<h1>' + escapeHtml(sport.packTitle[lang]) + '</h1>\n<dl>' +
    '<dt>' + escapeHtml(ui.sport) + '</dt><dd>' + escapeHtml(sport.name[lang]) + '</dd>' +
    '<dt>' + escapeHtml(ui.lessons) + '</dt><dd>' + lessons.length + '</dd>' +
    '<dt>' + escapeHtml(ui.language) + '</dt><dd>' + escapeHtml(ui.langName) + '</dd></dl>\n' +
    '<p class="licence" dir="ltr">{{LICENCE_LINE}}</p>\n</div>\n<div>\n';
  if (notices.translation) {
    html += '<p class="notice" lang="' + notices.translation.lang + '" dir="' + notices.translation.dir + '">' + escapeHtml(notices.translation.text) + '</p>\n';
  }
  html += '<p class="notice" lang="' + notices.responsibility.lang + '" dir="' + notices.responsibility.dir + '">' + escapeHtml(notices.responsibility.text) + '</p>\n</div>\n</section>\n';

  // table of contents
  html += '<nav class="toc" aria-label="' + escapeHtml(ui.contents) + '">\n<h2>' + escapeHtml(ui.contents) + '</h2>\n<table>\n<thead><tr><th>' +
    escapeHtml(ui.colLesson) + '</th><th>' + escapeHtml(ui.colTitle) + '</th><th>' + escapeHtml(ui.colAge) + '</th><th>' + escapeHtml(ui.colDuration) + '</th></tr></thead>\n<tbody>\n';
  for (const l of lessons) {
    html += '<tr><td><a href="#lesson-' + safeId(l.id) + '"><bdi>' + escapeHtml(l.id) + '</bdi></a></td><td>' + cell(l.ident.title) + '</td><td>' + cell(l.ident.age) + '</td><td>' + cell(l.ident.duration) + '</td></tr>\n';
  }
  html += '</tbody>\n</table>\n</nav>\n';

  // lessons
  for (const l of lessons) {
    html += '<section class="lesson ' + pageClass(l.id) + '" id="lesson-' + safeId(l.id) + '" data-lesson="' + escapeHtml(l.id) + '">\n' +
      '<h2 class="lesson-head"><bdi class="lid">' + escapeHtml(l.id) + '</bdi>' + (l.ident.title ? '<span>' + escapeHtml(l.ident.title) + '</span>' : '') + '</h2>\n' +
      renderLesson(l.id, l.body, l.placements, lang, ui, opts.skipSections, warn) + '\n</section>\n';
  }
  html += '</body>\n</html>\n';
  const urls = html.match(/https?:\/\/[^\s<"')]+/gi);
  if (urls) warn('output contains ' + urls.length + ' URL text(s) from the lesson text (printed as text, never requested), first: ' + urls[0]);
  return { html, warnings, stats: { lang, lessons: lessons.length, diagrams: diagramCount, bytes: Buffer.byteLength(html, 'utf8') } };
}

/* ---------------- CLI ---------------- */
function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error('unexpected argument ' + a);
    const k = a.slice(2);
    if (i + 1 >= argv.length) throw new Error('missing value for ' + a);
    o[k] = argv[++i];
  }
  return o;
}

function main(argv) {
  let a;
  try { a = parseArgs(argv); } catch (e) { console.error(e.message); return 2; }
  const need = ['sport', 'lang', 'export-dir', 'scenes-dir', 'placements', 'out'];
  const miss = need.filter((k) => !a[k]);
  if (miss.length) {
    console.error('missing: ' + miss.map((k) => '--' + k).join(' ') + '\nusage: build-pack.cjs --sport basketball --lang <he|en|ar|ru|es|all> --export-dir <dir> --scenes-dir <dir> --placements <csv> --out <dir> [--legal-dir <dir>] [--skip-sections 16,17,20]');
    return 2;
  }
  const langs = a.lang === 'all' ? LANGS : a.lang.split(',');
  const skip = a['skip-sections'] ? a['skip-sections'].split(',').map((x) => parseInt(x, 10)).filter((n) => n > 0) : [];
  try {
    fs.mkdirSync(a.out, { recursive: true });
    for (const lang of langs) {
      const r = buildPack({
        sport: a.sport, lang, exportDir: a['export-dir'], scenesDir: a['scenes-dir'], placements: a.placements,
        legalDir: a['legal-dir'], skipSections: skip
      });
      const file = path.join(a.out, a.sport + '-lesson-pack.' + lang + '.html');
      fs.writeFileSync(file, r.html);
      r.warnings.forEach((w) => console.error('warning [' + lang + ']: ' + w));
      console.log('wrote ' + file + ' lessons=' + r.stats.lessons + ' diagrams=' + r.stats.diagrams + ' bytes=' + r.stats.bytes);
    }
  } catch (e) {
    console.error('error: ' + e.message);
    return 1;
  }
  return 0;
}

module.exports = { buildPack, renderMarkdown, renderInline, splitFrontMatter, extractIdentity, parseCsv, readNotices, SPORTS, LANGS, escapeHtml };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
