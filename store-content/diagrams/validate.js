#!/usr/bin/env node
/*
 * Validator for pe-diagram/1 scenes.
 *
 *   node store-content/diagrams/validate.js <scenesDir> [--en-export <dir>] [--fixtures]
 *                                           [--placements <file>] [--json]
 *
 * <scenesDir> holds one folder per family: <scenesDir>/<FAMILY>/<FAMILY>-D<n>.json.
 * Exit code 1 when any error is found, 0 otherwise (warnings do not fail).
 *
 * API (Node):
 *   validateScene(scene, opts) -> issues[]   issue = { level: 'error'|'warning', code, path, message }
 *     opts.enExportDir  directory with <FAMILY>.md English lesson exports (quote_en check)
 *     opts.folder       name of the folder the scene file sits in (must equal family)
 *     opts.fixtures     true = test-fixture mode (reserved family <PREFIX>-00, status "fixture")
 *     opts.render       false = skip the render/well-formedness check (default true)
 *   validatePlacements(csvText, scenes) -> issues[]
 *   validateDir(dir, opts) -> { files: [{ file, id, scene, issues }], issues, errors, warnings }
 */
'use strict';

var fs = require('fs');
var path = require('path');
var R = require('./render.js');
var checkXml = require('./lib/xml-check.js').checkXml;

var SCHEMA = 'pe-diagram/1';
var LANGS = R.LANGS;
var PREFIX_SPORT = { BB: 'basketball', FB: 'football', HB: 'handball', VB: 'volleyball', AT: 'athletics', FIT: 'fitness' };
var FAMILY_RE = /^(BB|FB|HB|VB|AT|FIT)-(\d{2})$/;
var SECTIONS = ['warmup', 'mainA', 'mainB', 'appliedGame'];
var GROUPS = ['whole-class', 'representative'];
var KINDS = ['move', 'pass', 'dribble'];
var TEAMS = ['A', 'B'];
var TOP_FIELDS = ['schema', 'id', 'family', 'sport', 'template', 'anchor', 'group_shown', 'title', 'alt', 'objects', 'paths', 'safety', 'notes', 'status'];
var ANCHOR_FIELDS = ['section', 'step', 'quote_en'];
var OBJECT_FIELDS = {
  player: ['type', 'team', 'n', 'x', 'y'],
  ball: ['type', 'x', 'y'],
  cone: ['type', 'x', 'y'],
  zone: ['type', 'x', 'y', 'w', 'h', 'label'],
  station: ['type', 'n', 'x', 'y'],
  teacher: ['type', 'x', 'y']
};
var PATH_FIELDS = ['kind', 'from', 'to', 'via', 'order'];
var TITLE_MAX = 60;
var ALT_MAX = 400;
var ALT_SOFT = 300;
var PLACEMENT_COLUMNS = ['family', 'diagram_id', 'section', 'step', 'template', 'group_shown', 'reason', 'open_question'];

// ------------------------------------------------------------------ helpers
function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isNum(v) { return typeof v === 'number' && isFinite(v); }
function isPosInt(v) { return isNum(v) && Math.floor(v) === v && v > 0; }
function nonEmpty(v) { return typeof v === 'string' && v.trim().length > 0; }
function chars(s) { return Array.from(s).length; }
function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

/** Whitespace normalisation used for quote matching (NFC + collapse all whitespace). */
function normalizeText(s) {
  return String(s).normalize('NFC').replace(/\s+/g, ' ').trim();
}
/** Removes a leading YAML front-matter block (--- ... ---) if present. */
function stripFrontMatter(text) {
  var t = text.replace(/^﻿/, '');
  var m = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/.exec(t);
  return m ? t.slice(m[0].length) : t;
}

function Issues() { this.list = []; }
Issues.prototype.error = function (code, p, msg) { this.list.push({ level: 'error', code: code, path: p, message: msg }); };
Issues.prototype.warn = function (code, p, msg) { this.list.push({ level: 'warning', code: code, path: p, message: msg }); };

function checkCoord(issues, v, p, name) {
  if (!isNum(v)) { issues.error('coord', p, name + ' must be a finite number (got ' + JSON.stringify(v) + ')'); return false; }
  if (v < 0 || v > 100) { issues.error('coord', p, name + ' must be within 0-100 (got ' + v + ')'); return false; }
  return true;
}
function checkPoint(issues, pt, p) {
  if (!Array.isArray(pt) || pt.length !== 2) { issues.error('path-point', p, 'must be an [x, y] array'); return false; }
  var a = checkCoord(issues, pt[0], p + '[0]', 'x');
  var b = checkCoord(issues, pt[1], p + '[1]', 'y');
  return a && b;
}
function unknownFields(issues, obj, allowed, p) {
  Object.keys(obj).forEach(function (k) {
    if (allowed.indexOf(k) < 0) issues.warn('unknown-field', p ? p + '.' + k : k, 'unknown field "' + k + '" (ignored by the renderer)');
  });
}

// ------------------------------------------------------------------ scene
function validateScene(scene, opts) {
  opts = opts || {};
  var issues = new Issues();
  if (!isObj(scene)) { issues.error('type', '', 'scene must be a JSON object'); return issues.list; }
  unknownFields(issues, scene, TOP_FIELDS, '');

  if (scene.schema !== SCHEMA) issues.error('schema', 'schema', 'schema must be "' + SCHEMA + '"');

  // family / folder / fixture mode
  var fam = scene.family;
  var famMatch = typeof fam === 'string' ? FAMILY_RE.exec(fam) : null;
  var expectedSport = null;
  if (!famMatch) {
    issues.error('family', 'family', 'family must be one of BB|FB|HB|VB|AT|FIT followed by -01..-10 (got ' + JSON.stringify(fam) + ')');
  } else {
    var num = parseInt(famMatch[2], 10);
    expectedSport = PREFIX_SPORT[famMatch[1]];
    if (opts.fixtures) {
      if (num !== 0) issues.error('fixture-family', 'family', 'fixture mode: family number must be the reserved -00 (got ' + fam + ')');
    } else if (num === 0) {
      issues.error('fixture-family', 'family', fam + ' is reserved for test fixtures (use --fixtures)');
    } else if (num > 10) {
      issues.error('family', 'family', 'family number must be 01..10 (got ' + fam + ')');
    }
  }
  if (opts.folder !== undefined && opts.folder !== fam) {
    issues.error('folder', 'family', 'family ' + JSON.stringify(fam) + ' does not match folder "' + opts.folder + '"');
  }

  // id
  var idm = typeof scene.id === 'string' ? /^(.+)-D([1-9][0-9]*)$/.exec(scene.id) : null;
  if (!idm) issues.error('id', 'id', 'id must be <FAMILY>-D<n> with n >= 1 (got ' + JSON.stringify(scene.id) + ')');
  else if (idm[1] !== fam) issues.error('id', 'id', 'id prefix ' + idm[1] + ' does not match family ' + fam);

  // sport
  if (expectedSport && scene.sport !== expectedSport) {
    issues.error('sport', 'sport', 'sport must be "' + expectedSport + '" for family ' + fam + ' (got ' + JSON.stringify(scene.sport) + ')');
  }

  // template
  var tpl = typeof scene.template === 'string' ? R.templates.get(scene.template) : null;
  if (!tpl) {
    issues.error('template', 'template', 'unknown template ' + JSON.stringify(scene.template) + '; known: ' + R.templateIds.join(', '));
  } else {
    var sport = expectedSport || scene.sport;
    if (tpl.sports.indexOf(sport) < 0) {
      issues.error('template-sport', 'template', 'template ' + tpl.id + ' is not allowed for ' + sport + ' (allowed for: ' + tpl.sports.join(', ') + ')');
    }
  }

  // anchor
  var anchor = scene.anchor;
  if (!isObj(anchor)) {
    issues.error('anchor', 'anchor', 'anchor must be an object {section, step, quote_en}');
  } else {
    unknownFields(issues, anchor, ANCHOR_FIELDS, 'anchor');
    if (SECTIONS.indexOf(anchor.section) < 0) issues.error('anchor-section', 'anchor.section', 'section must be one of ' + SECTIONS.join('|') + ' (got ' + JSON.stringify(anchor.section) + ')');
    if (!isPosInt(anchor.step)) issues.error('anchor-step', 'anchor.step', 'step must be a positive integer (got ' + JSON.stringify(anchor.step) + ')');
    if (!nonEmpty(anchor.quote_en)) {
      issues.error('anchor-quote', 'anchor.quote_en', 'quote_en must be a non-empty string');
    } else if (opts.enExportDir && famMatch) {
      var file = path.join(opts.enExportDir, fam + '.md');
      var exists = (opts.exists || fs.existsSync)(file);
      if (!exists) {
        issues.warn('export-missing', 'anchor.quote_en', 'EN export missing: ' + file + ' (quote not checked)');
      } else {
        var body = stripFrontMatter((opts.readFile || function (f) { return fs.readFileSync(f, 'utf8'); })(file));
        if (normalizeText(body).indexOf(normalizeText(anchor.quote_en)) < 0) {
          issues.error('quote-not-found', 'anchor.quote_en', 'quote_en not found verbatim (after whitespace normalisation) in ' + file);
        }
      }
    }
  }

  if (GROUPS.indexOf(scene.group_shown) < 0) issues.error('group_shown', 'group_shown', 'group_shown must be whole-class|representative (got ' + JSON.stringify(scene.group_shown) + ')');

  // title / alt
  [['title', TITLE_MAX], ['alt', ALT_MAX]].forEach(function (pair) {
    var key = pair[0], max = pair[1];
    var v = scene[key];
    if (!isObj(v)) { issues.error(key + '-missing', key, key + ' must be an object with he/en/ar/ru/es'); return; }
    LANGS.forEach(function (l) {
      if (!nonEmpty(v[l])) issues.error(key + '-missing', key + '.' + l, key + '.' + l + ' must be a non-empty string');
      else if (chars(v[l]) > max) issues.error(key + '-length', key + '.' + l, key + '.' + l + ' is ' + chars(v[l]) + ' characters (max ' + max + ')');
      else if (key === 'alt' && chars(v[l]) > ALT_SOFT) issues.warn('alt-long', key + '.' + l, 'alt.' + l + ' is ' + chars(v[l]) + ' characters (brief target ~' + ALT_SOFT + ')');
    });
    Object.keys(v).forEach(function (l) { if (LANGS.indexOf(l) < 0) issues.warn('lang-unknown', key + '.' + l, 'unexpected language key "' + l + '"'); });
  });

  // status
  if (!nonEmpty(scene.status)) issues.error('status', 'status', 'status must be a non-empty string');
  else if (opts.fixtures && scene.status !== 'fixture') issues.error('fixture-status', 'status', 'fixture mode: status must be "fixture"');
  else if (!opts.fixtures && scene.status === 'fixture') issues.error('fixture-status', 'status', 'status "fixture" is reserved for test fixtures (use --fixtures)');

  if (!nonEmpty(scene.safety)) issues.warn('safety-missing', 'safety', 'safety line is empty or missing');
  if (has(scene, 'notes') && typeof scene.notes !== 'string') issues.warn('notes-type', 'notes', 'notes should be a string');

  // objects
  if (!Array.isArray(scene.objects)) {
    issues.error('objects', 'objects', 'objects must be an array');
  } else {
    var seenPlayers = {}, seenStations = {};
    scene.objects.forEach(function (o, i) {
      var p = 'objects[' + i + ']';
      if (!isObj(o)) { issues.error('object-type', p, 'object must be a JSON object'); return; }
      if (!has(OBJECT_FIELDS, o.type)) { issues.error('object-type', p + '.type', 'unknown object type ' + JSON.stringify(o.type) + ' (player|ball|cone|zone|station|teacher)'); return; }
      unknownFields(issues, o, OBJECT_FIELDS[o.type], p);
      var okX = checkCoord(issues, o.x, p + '.x', 'x');
      var okY = checkCoord(issues, o.y, p + '.y', 'y');
      if (o.type === 'player') {
        if (TEAMS.indexOf(o.team) < 0) issues.error('team', p + '.team', 'team must be "A" or "B" (got ' + JSON.stringify(o.team) + ')');
        if (!isPosInt(o.n)) issues.error('player-n', p + '.n', 'player number must be a positive integer (got ' + JSON.stringify(o.n) + ')');
        else if (TEAMS.indexOf(o.team) >= 0) {
          var key = o.team + ':' + o.n;
          if (seenPlayers[key] !== undefined) issues.error('player-dup', p, 'duplicate player team ' + o.team + ' n ' + o.n + ' (also objects[' + seenPlayers[key] + '])');
          else seenPlayers[key] = i;
        }
      } else if (o.type === 'station') {
        if (!isPosInt(o.n)) issues.error('station-n', p + '.n', 'station number must be a positive integer (got ' + JSON.stringify(o.n) + ')');
        else if (seenStations[o.n] !== undefined) issues.error('station-dup', p, 'duplicate station n ' + o.n + ' (also objects[' + seenStations[o.n] + '])');
        else seenStations[o.n] = i;
      } else if (o.type === 'zone') {
        var okW = isNum(o.w) && o.w > 0, okH = isNum(o.h) && o.h > 0;
        if (!okW) issues.error('zone-size', p + '.w', 'zone w must be a number > 0');
        if (!okH) issues.error('zone-size', p + '.h', 'zone h must be a number > 0');
        if (okX && okY && okW && okH && (o.x + o.w > 100 || o.y + o.h > 100)) {
          issues.error('zone-bounds', p, 'zone must lie fully inside 0-100 (x+w=' + (o.x + o.w) + ', y+h=' + (o.y + o.h) + ')');
        }
        if (!has(o, 'label')) issues.warn('zone-label-missing', p + '.label', 'zone has no label letter');
        else if (typeof o.label !== 'string' || !/^[A-Z]$/.test(o.label)) issues.error('zone-label', p + '.label', 'zone label must be one capital letter A-Z (got ' + JSON.stringify(o.label) + ')');
      }
    });
  }

  // paths
  if (!has(scene, 'paths')) {
    issues.warn('paths-missing', 'paths', 'paths missing (treated as empty)');
  } else if (!Array.isArray(scene.paths)) {
    issues.error('paths', 'paths', 'paths must be an array');
  } else {
    scene.paths.forEach(function (pt, i) {
      var p = 'paths[' + i + ']';
      if (!isObj(pt)) { issues.error('path-kind', p, 'path must be a JSON object'); return; }
      unknownFields(issues, pt, PATH_FIELDS, p);
      if (KINDS.indexOf(pt.kind) < 0) issues.error('path-kind', p + '.kind', 'kind must be move|pass|dribble (got ' + JSON.stringify(pt.kind) + ')');
      var a = checkPoint(issues, pt.from, p + '.from');
      var b = checkPoint(issues, pt.to, p + '.to');
      if (has(pt, 'via')) {
        if (!Array.isArray(pt.via)) issues.error('path-via', p + '.via', 'via must be an array of [x, y] points');
        else pt.via.forEach(function (v, j) { checkPoint(issues, v, p + '.via[' + j + ']'); });
      }
      if (has(pt, 'order') && !isPosInt(pt.order)) issues.error('path-order', p + '.order', 'order must be a positive integer (got ' + JSON.stringify(pt.order) + ')');
      if (a && b && pt.from[0] === pt.to[0] && pt.from[1] === pt.to[1] && !(Array.isArray(pt.via) && pt.via.length)) {
        issues.warn('path-zero', p, 'path starts and ends at the same point');
      }
    });
  }

  // Render check: well-formed SVG and no words inside the field.
  if (opts.render !== false && tpl) {
    try {
      LANGS.forEach(function (l) {
        var svg = R.renderScene(scene, { lang: l });
        var res = checkXml(svg);
        res.errors.forEach(function (e) { issues.error('render', '', '[' + l + '] rendered SVG is not well-formed: ' + e); });
        res.texts.forEach(function (t) {
          if (t.parent === 'text' && !/^([0-9]+|[A-Z])$/.test(t.text)) issues.error('render-text', '', 'rendered field text "' + t.text + '" is not a number or a single letter');
        });
      });
    } catch (e) {
      issues.error('render', '', 'renderer failed: ' + e.message);
    }
  }
  return issues.list;
}

// ------------------------------------------------------------------ placements.csv
/** RFC-4180-style CSV parser (quotes, doubled quotes, CRLF, BOM). Returns rows of strings. */
function parseCsv(text) {
  var s = String(text).replace(/^﻿/, '');
  var rows = [], row = [], field = '', i = 0, q = false;
  while (i < s.length) {
    var c = s.charAt(i);
    if (q) {
      if (c === '"') {
        if (s.charAt(i + 1) === '"') { field += '"'; i += 2; continue; }
        q = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === '') { q = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\r' && s.charAt(i + 1) === '\n') i++;
    if (c === '\n' || c === '\r') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(function (r) { return !(r.length === 1 && r[0] === ''); });
}

function validatePlacements(csvText, scenes) {
  var issues = new Issues();
  var rows = parseCsv(csvText);
  if (!rows.length) { issues.error('placements-columns', 'placements.csv', 'file is empty'); return issues.list; }
  var header = rows[0].map(function (h) { return h.trim(); });
  if (header.join(',') !== PLACEMENT_COLUMNS.join(',')) {
    issues.error('placements-columns', 'placements.csv', 'header must be exactly ' + PLACEMENT_COLUMNS.join(',') + ' (got ' + header.join(',') + ')');
    return issues.list;
  }
  var byId = {};
  scenes.forEach(function (s) { if (s && typeof s.id === 'string') byId[s.id] = s; });
  var listed = {};
  var reasonFamilies = {};
  rows.slice(1).forEach(function (r, i) {
    var p = 'placements.csv line ' + (i + 2);
    if (r.length !== PLACEMENT_COLUMNS.length) { issues.error('placements-row', p, 'expected ' + PLACEMENT_COLUMNS.length + ' columns, got ' + r.length); return; }
    var row = {};
    PLACEMENT_COLUMNS.forEach(function (c, k) { row[c] = r[k].trim(); });
    if (!FAMILY_RE.test(row.family)) issues.error('placements-row', p, 'bad family ' + JSON.stringify(row.family));
    if (row.reason) reasonFamilies[row.family] = true;
    if (!row.diagram_id) {
      if (!row.reason) issues.error('placements-reason', p, 'exception row (empty diagram_id) for ' + row.family + ' must give a reason');
      return;
    }
    if (listed[row.diagram_id]) { issues.error('placements-dup', p, 'diagram ' + row.diagram_id + ' listed twice'); return; }
    listed[row.diagram_id] = true;
    var s = byId[row.diagram_id];
    if (!s) { issues.error('placements-orphan', p, 'diagram ' + row.diagram_id + ' has no scene file'); return; }
    var anchor = isObj(s.anchor) ? s.anchor : {};
    var expect = { family: s.family, section: anchor.section, step: anchor.step === undefined ? undefined : String(anchor.step), template: s.template, group_shown: s.group_shown };
    Object.keys(expect).forEach(function (k) {
      if (String(expect[k]) !== row[k]) issues.error('placements-mismatch', p, row.diagram_id + ': ' + k + ' is "' + row[k] + '" in placements.csv but "' + expect[k] + '" in the scene');
    });
  });
  var perFamily = {};
  scenes.forEach(function (s) {
    if (!s || typeof s.id !== 'string') return;
    if (!listed[s.id]) issues.error('placements-missing', 'placements.csv', 'scene ' + s.id + ' is not listed');
    perFamily[s.family] = (perFamily[s.family] || 0) + 1;
  });
  Object.keys(perFamily).sort().forEach(function (f) {
    if (perFamily[f] < 2 && !reasonFamilies[f]) issues.warn('placements-few', 'placements.csv', f + ' has ' + perFamily[f] + ' diagram(s) and no reason row');
  });
  return issues.list;
}

// ------------------------------------------------------------------ directory
function byCodePoint(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

function findPlacements(dir) {
  var own = path.join(dir, 'placements.csv');
  if (fs.existsSync(own)) return own;
  if (path.basename(path.resolve(dir)) === 'scenes') {
    var parent = path.join(dir, '..', 'placements.csv');
    if (fs.existsSync(parent)) return parent;
  }
  return null;
}

// ------------------------------------------------------------------ cross-scene checks
// Per-scene checks cannot see boilerplate copied between scenes, so these run over the whole set:
// - the same alt text in one language on two scenes is an error (each alt must describe its own diagram);
// - the same title in one language on two scenes of one family is an error;
// - a ball drawn on top of a player hides the player's number (warning).
var BALL_OVERLAP = 2.5;

function validateAcrossScenes(scenes) {
  var issues = new Issues();
  var valid = scenes.filter(function (s) { return isObj(s) && typeof s.id === 'string'; });
  LANGS.forEach(function (l) {
    var altSeen = {};
    var titleSeen = {};
    valid.forEach(function (s) {
      var alt = isObj(s.alt) && nonEmpty(s.alt[l]) ? normalizeText(s.alt[l]) : null;
      if (alt) {
        if (altSeen[alt]) issues.error('alt-dup', s.id + ' alt.' + l, 'same alt text as ' + altSeen[alt] + '; each alt must describe its own diagram');
        else altSeen[alt] = s.id;
      }
      var title = isObj(s.title) && nonEmpty(s.title[l]) ? normalizeText(s.title[l]) : null;
      if (title) {
        var key = s.family + '\u0000' + title;
        if (titleSeen[key]) issues.error('title-dup', s.id + ' title.' + l, 'same title as ' + titleSeen[key] + ' in family ' + s.family);
        else titleSeen[key] = s.id;
      }
    });
  });
  valid.forEach(function (s) {
    if (!Array.isArray(s.objects)) return;
    var players = s.objects.filter(function (o) { return isObj(o) && o.type === 'player' && isNum(o.x) && isNum(o.y); });
    s.objects.forEach(function (o) {
      if (!isObj(o) || o.type !== 'ball' || !isNum(o.x) || !isNum(o.y)) return;
      players.forEach(function (p) {
        if (Math.abs(p.x - o.x) < BALL_OVERLAP && Math.abs(p.y - o.y) < BALL_OVERLAP) {
          issues.warn('ball-overlap', s.id + ' objects', 'ball at (' + o.x + ',' + o.y + ') covers the number of player ' + p.team + p.n + '; offset the ball by about 3 units');
        }
      });
    });
  });
  return issues.list;
}

function validateDir(dir, opts) {
  opts = opts || {};
  var result = { files: [], issues: [], errors: 0, warnings: 0, placements: null };
  var entries = fs.readdirSync(dir).sort(byCodePoint);
  var scenes = [];
  var ids = {};
  entries.forEach(function (name) {
    var full = path.join(dir, name);
    var st = fs.statSync(full);
    if (st.isFile() && /\.json$/.test(name)) {
      result.files.push({ file: full, id: null, scene: null, issues: [{ level: 'error', code: 'folder', path: '', message: 'scene files must sit in a <FAMILY>/ folder' }] });
      return;
    }
    if (!st.isDirectory()) return;
    fs.readdirSync(full).sort(byCodePoint).forEach(function (fn) {
      if (!/\.json$/.test(fn)) return;
      var file = path.join(full, fn);
      var entry = { file: file, id: null, scene: null, issues: [] };
      var scene;
      try {
        scene = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (e) {
        entry.issues.push({ level: 'error', code: 'json', path: '', message: 'invalid JSON: ' + e.message });
        result.files.push(entry);
        return;
      }
      entry.scene = scene;
      entry.id = scene && scene.id;
      entry.issues = validateScene(scene, { enExportDir: opts.enExportDir, folder: name, fixtures: !!opts.fixtures });
      if (scene && typeof scene.id === 'string') {
        if (fn !== scene.id + '.json') entry.issues.push({ level: 'error', code: 'filename', path: '', message: 'file name must be ' + scene.id + '.json' });
        if (ids[scene.id]) entry.issues.push({ level: 'error', code: 'id-dup', path: 'id', message: 'duplicate id ' + scene.id + ' (also ' + ids[scene.id] + ')' });
        else ids[scene.id] = file;
      }
      scenes.push(scene);
      result.files.push(entry);
    });
  });
  var pfile = opts.placements === undefined ? findPlacements(dir) : opts.placements;
  if (pfile) {
    result.placements = pfile;
    result.issues = validatePlacements(fs.readFileSync(pfile, 'utf8'), scenes);
  }
  result.issues = result.issues.concat(validateAcrossScenes(scenes));
  result.files.forEach(function (f) { f.issues.forEach(count); });
  result.issues.forEach(count);
  function count(i) { if (i.level === 'error') result.errors++; else result.warnings++; }
  return result;
}

// ------------------------------------------------------------------ CLI
function parseArgs(argv) {
  var o = { dir: null, enExportDir: null, fixtures: false, placements: undefined, json: false };
  for (var i = 0; i < argv.length; i++) {
    var a = argv[i];
    if (a === '--en-export') o.enExportDir = argv[++i];
    else if (a === '--fixtures') o.fixtures = true;
    else if (a === '--placements') o.placements = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a.charAt(0) === '-') throw new Error('unknown option ' + a);
    else if (!o.dir) o.dir = a;
    else throw new Error('unexpected argument ' + a);
  }
  return o;
}

function main(argv) {
  var o;
  try { o = parseArgs(argv); } catch (e) { console.error(e.message); return 2; }
  if (!o.dir) {
    console.error('usage: node store-content/diagrams/validate.js <scenesDir> [--en-export <dir>] [--fixtures] [--placements <file>] [--json]');
    return 2;
  }
  var res = validateDir(o.dir, o);
  if (o.json) {
    console.log(JSON.stringify({
      errors: res.errors, warnings: res.warnings, placements: res.placements,
      files: res.files.map(function (f) { return { file: f.file, id: f.id, issues: f.issues }; }),
      issues: res.issues
    }, null, 2));
  } else {
    res.files.forEach(function (f) {
      f.issues.forEach(function (i) {
        console.log((i.level === 'error' ? 'ERROR' : 'WARN ') + ' ' + (f.id || f.file) + (i.path ? ' ' + i.path : '') + ' [' + i.code + '] ' + i.message);
      });
    });
    res.issues.forEach(function (i) {
      console.log((i.level === 'error' ? 'ERROR' : 'WARN ') + ' ' + i.path + ' [' + i.code + '] ' + i.message);
    });
    console.log((res.placements ? 'placements: ' + res.placements : 'placements.csv: not found (skipped)'));
    console.log(res.files.length + ' scene file(s), ' + res.errors + ' error(s), ' + res.warnings + ' warning(s)' + (o.fixtures ? ' [fixture mode]' : ''));
  }
  return res.errors ? 1 : 0;
}

module.exports = {
  SCHEMA: SCHEMA,
  PREFIX_SPORT: PREFIX_SPORT,
  SECTIONS: SECTIONS,
  PLACEMENT_COLUMNS: PLACEMENT_COLUMNS,
  normalizeText: normalizeText,
  stripFrontMatter: stripFrontMatter,
  parseCsv: parseCsv,
  validateScene: validateScene,
  validatePlacements: validatePlacements,
  validateAcrossScenes: validateAcrossScenes,
  validateDir: validateDir,
  main: main
};

if (require.main === module) process.exitCode = main(process.argv.slice(2));
