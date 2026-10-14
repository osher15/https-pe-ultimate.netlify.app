#!/usr/bin/env node
/*
 * Regenerates the synthetic TEST FIXTURES under store-content/diagrams/examples/:
 * one scene per template (reserved families BB-00 ... FIT-00, status "fixture"),
 * examples/placements.csv and examples/export-en/<FAMILY>.md (synthetic text used
 * only to exercise the quote_en check). These are not lesson diagrams.
 *
 *   node store-content/diagrams/tools/make-fixtures.js
 *
 * Deterministic: re-running produces identical files. It deletes and rewrites
 * the whole examples/ directory.
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'examples');

const SPORT = { BB: 'basketball', FB: 'football', HB: 'handball', VB: 'volleyball', AT: 'athletics', FIT: 'fitness' };
const P = (team, n, x, y) => ({ type: 'player', team, n, x, y });
const ball = (x, y) => ({ type: 'ball', x, y });
const cone = (x, y) => ({ type: 'cone', x, y });
const zone = (x, y, w, h, label) => ({ type: 'zone', x, y, w, h, label });
const st = (n, x, y) => ({ type: 'station', n, x, y });
const te = (x, y) => ({ type: 'teacher', x, y });

// [family, id, template, section, step, group, objects, paths]
const F = [
  ['BB-00', 'BB-00-D1', 'bb-full', 'mainA', 1, 'representative',
    [zone(0, 70, 12, 24, 'W'), P('A', 1, 14, 35), ball(17, 41), P('A', 2, 62, 50), P('B', 1, 80, 66), cone(30, 15), cone(30, 85), st(1, 50, 84), te(50, 97)],
    [{ kind: 'dribble', from: [14, 35], to: [40, 25], order: 1 }, { kind: 'pass', from: [40, 25], to: [62, 50], order: 2 }, { kind: 'move', from: [80, 66], to: [86, 50], via: [[90, 60]], order: 2 }]],
  ['BB-00', 'BB-00-D2', 'bb-half', 'mainB', 2, 'whole-class',
    [zone(0, 76, 20, 18, 'W'), P('A', 1, 15, 30), ball(19, 35), P('A', 2, 55, 72), P('B', 1, 74, 52), cone(35, 10), cone(35, 90), st(1, 22, 55), te(50, 97)],
    [{ kind: 'dribble', from: [15, 30], to: [45, 22], order: 1 }, { kind: 'pass', from: [45, 22], to: [55, 72], order: 2 }, { kind: 'move', from: [74, 52], to: [80, 38], via: [[84, 47]], order: 2 }]],
  ['FB-00', 'FB-00-D1', 'fb-full', 'warmup', 1, 'whole-class',
    [zone(0, 72, 14, 24, 'W'), P('A', 1, 15, 40), ball(18, 46), P('A', 2, 60, 30), P('B', 1, 75, 60), cone(30, 20), cone(30, 80), st(1, 50, 86), te(50, 98)],
    [{ kind: 'dribble', from: [15, 40], to: [40, 45], order: 1 }, { kind: 'pass', from: [40, 45], to: [60, 30], order: 2 }, { kind: 'move', from: [75, 60], to: [70, 40], via: [[80, 50]], order: 2 }]],
  ['FB-00', 'FB-00-D2', 'fb-half', 'mainA', 2, 'representative',
    [zone(0, 78, 18, 16, 'W'), P('A', 1, 15, 35), ball(19, 40), P('A', 2, 60, 70), P('B', 1, 72, 50), cone(30, 15), cone(30, 85), st(1, 40, 90), te(98, 20)],
    [{ kind: 'dribble', from: [15, 35], to: [45, 30], order: 1 }, { kind: 'pass', from: [45, 30], to: [60, 70], order: 2 }, { kind: 'move', from: [72, 50], to: [78, 64], via: [[80, 55]], order: 2 }]],
  ['FB-00', 'FB-00-D3', 'fb-grid', 'appliedGame', 1, 'representative',
    [zone(20, 0, 30, 7, 'W'), P('A', 1, 20, 25), ball(24, 30), P('A', 2, 75, 30), P('B', 1, 60, 70), cone(30, 70), cone(70, 80), st(1, 82, 84), te(50, 97)],
    [{ kind: 'dribble', from: [20, 25], to: [45, 40], order: 1 }, { kind: 'pass', from: [45, 40], to: [75, 30], order: 2 }, { kind: 'move', from: [60, 70], to: [50, 52], via: [[64, 58]], order: 2 }]],
  ['HB-00', 'HB-00-D1', 'hb-full', 'mainA', 1, 'whole-class',
    [zone(0, 72, 12, 22, 'W'), P('A', 1, 14, 35), ball(17, 41), P('A', 2, 62, 40), P('B', 1, 78, 62), cone(30, 15), cone(30, 85), st(1, 50, 86), te(50, 98)],
    [{ kind: 'dribble', from: [14, 35], to: [40, 25], order: 1 }, { kind: 'pass', from: [40, 25], to: [62, 40], order: 2 }, { kind: 'move', from: [78, 62], to: [84, 46], via: [[86, 56]], order: 2 }]],
  ['HB-00', 'HB-00-D2', 'hb-half', 'mainB', 1, 'representative',
    [zone(0, 75, 18, 18, 'W'), P('A', 1, 20, 25), ball(24, 30), P('A', 2, 55, 72), P('B', 1, 72, 42), cone(40, 10), cone(40, 90), st(1, 10, 45), te(98, 15)],
    [{ kind: 'dribble', from: [20, 25], to: [48, 30], order: 1 }, { kind: 'pass', from: [48, 30], to: [55, 72], order: 2 }, { kind: 'move', from: [72, 42], to: [70, 58], via: [[77, 50]], order: 2 }]],
  ['VB-00', 'VB-00-D1', 'vb-full', 'mainA', 2, 'whole-class',
    [zone(0, 10, 7, 30, 'W'), P('A', 1, 20, 70), ball(24, 76), P('A', 2, 40, 40), P('B', 1, 70, 40), cone(20, 20), cone(35, 88), st(1, 66, 84), te(44, 97)],
    [{ kind: 'dribble', from: [20, 70], to: [30, 55], order: 1 }, { kind: 'pass', from: [30, 55], to: [40, 40], order: 2 }, { kind: 'move', from: [70, 40], to: [75, 62], via: [[82, 50]], order: 2 }]],
  ['VB-00', 'VB-00-D2', 'vb-half', 'appliedGame', 1, 'representative',
    [zone(0, 60, 9, 30, 'W'), P('A', 1, 25, 75), ball(29, 80), P('A', 2, 80, 45), P('B', 1, 55, 25), cone(30, 15), cone(30, 90), st(1, 52, 84), te(62, 97)],
    [{ kind: 'dribble', from: [25, 75], to: [42, 60], order: 1 }, { kind: 'pass', from: [42, 60], to: [80, 45], order: 2 }, { kind: 'move', from: [55, 25], to: [70, 30], via: [[62, 18]], order: 2 }]],
  ['AT-00', 'AT-00-D1', 'at-lanes', 'mainA', 1, 'representative',
    [zone(20, 0, 60, 9, 'W'), P('A', 1, 5, 40), ball(8, 46), P('A', 2, 60, 40), P('B', 1, 5, 60), cone(10, 5), cone(90, 5), st(1, 96, 95), te(50, 95)],
    [{ kind: 'dribble', from: [5, 40], to: [40, 40], order: 1 }, { kind: 'pass', from: [40, 40], to: [60, 40], order: 2 }, { kind: 'move', from: [5, 60], to: [75, 60], via: [[40, 62]], order: 2 }]],
  ['AT-00', 'AT-00-D2', 'at-jump', 'mainB', 1, 'whole-class',
    [zone(0, 70, 30, 25, 'W'), P('A', 1, 8, 50), ball(11, 56), P('A', 2, 50, 25), P('B', 1, 85, 85), cone(62, 36), cone(62, 64), st(1, 90, 12), te(28, 14)],
    [{ kind: 'dribble', from: [8, 50], to: [40, 50], order: 1 }, { kind: 'pass', from: [40, 50], to: [50, 25], order: 2 }, { kind: 'move', from: [85, 85], to: [60, 88], via: [[75, 93]], order: 2 }]],
  ['AT-00', 'AT-00-D3', 'at-throw', 'appliedGame', 2, 'representative',
    [zone(0, 72, 9, 26, 'W'), P('A', 1, 12, 50), ball(16, 54), P('A', 2, 5, 62), P('B', 1, 92, 4), cone(20, 30), cone(20, 70), st(1, 40, 92), te(25, 85)],
    [{ kind: 'dribble', from: [5, 85], to: [5, 62], order: 1 }, { kind: 'pass', from: [12, 50], to: [70, 50], order: 2 }, { kind: 'move', from: [92, 4], to: [60, 3], via: [[76, 1]], order: 3 }]],
  ['FIT-00', 'FIT-00-D1', 'fit-stations', 'mainA', 1, 'whole-class',
    [zone(40, 40, 20, 20, 'W'), st(1, 25, 30), st(2, 75, 30), st(3, 75, 70), st(4, 25, 70), P('A', 1, 25, 48), P('A', 2, 75, 48), P('B', 1, 75, 86), ball(31, 52), cone(50, 30), cone(50, 70), te(50, 50)],
    [{ kind: 'move', from: [25, 48], to: [69, 30], via: [[50, 18]], order: 1 }, { kind: 'dribble', from: [75, 48], to: [75, 61], order: 2 }, { kind: 'pass', from: [75, 86], to: [30, 72], order: 2 }]],
  ['FIT-00', 'FIT-00-D2', 'open-area', 'warmup', 2, 'whole-class',
    [zone(0, 0, 20, 30, 'W'), P('A', 1, 30, 40), ball(34, 46), P('A', 2, 70, 40), P('B', 1, 50, 70), cone(20, 80), cone(80, 80), st(1, 85, 15), te(50, 95)],
    [{ kind: 'dribble', from: [30, 40], to: [50, 30], order: 1 }, { kind: 'pass', from: [50, 30], to: [70, 40], order: 2 }, { kind: 'move', from: [50, 70], to: [65, 60], via: [[60, 75]], order: 2 }]]
];

function texts(id, tpl, extraEn) {
  return {
    title: {
      he: 'תרחיש בדיקה: ' + tpl,
      en: 'Test fixture: ' + tpl,
      ar: 'نموذج اختبار: ' + tpl,
      ru: 'Тестовый пример: ' + tpl,
      es: 'Ejemplo de prueba: ' + tpl
    },
    alt: {
      he: 'תרחיש בדיקה סינתטי לתבנית ' + tpl + ', לא תרשים שיעור. משולשים 1 ו-2 של קבוצה א׳, ריבוע 1 של קבוצה ב׳, כדור, שני קונוסים, אזור המתנה W, תחנה 1 והמורה. החצים הממוספרים מראים את סדר התנועה.',
      en: 'Synthetic test fixture for template ' + tpl + ', not a lesson diagram. Team A triangles 1 and 2, team B square 1, a ball, two cones, waiting zone W, station 1 and the teacher. Numbered arrows show the order of dribble, pass and movement.' + (extraEn || ''),
      ar: 'نموذج اختبار اصطناعي للقالب ' + tpl + '، وليس رسمًا لدرس. مثلثا الفريق أ رقم 1 و2، ومربع الفريق ب رقم 1، وكرة، وقمعان، ومنطقة انتظار W، ومحطة 1، والمعلّم. الأسهم المرقمة تبين ترتيب الحركة.',
      ru: 'Синтетический тестовый пример для шаблона ' + tpl + ', не схема урока. Треугольники 1 и 2 команды А, квадрат 1 команды Б, мяч, два конуса, зона ожидания W, станция 1 и учитель. Номера у стрелок показывают порядок действий.',
      es: 'Ejemplo de prueba sintético para la plantilla ' + tpl + ', no es un diagrama de clase. Triángulos 1 y 2 del equipo A, cuadrado 1 del equipo B, un balón, dos conos, zona de espera W, estación 1 y el docente. Las flechas numeradas indican el orden.'
    }
  };
}
const quote = (id, tpl) => 'Fixture ' + id + ': players start in the marked positions and follow the numbered paths on the ' + tpl + ' template.';

fs.rmSync(ROOT, { recursive: true, force: true });
const exportDir = path.join(ROOT, 'export-en');
fs.mkdirSync(exportDir, { recursive: true });
const csv = ['family,diagram_id,section,step,template,group_shown,reason,open_question'];
const byFam = {};
for (const [family, id, template, section, step, group, objects, paths] of F) {
  const prefix = family.split('-')[0];
  const t = texts(id, template, id === 'FIT-00-D2' ? ' Escaping check: <tag> & "quotes".' : '');
  const scene = {
    schema: 'pe-diagram/1', id, family, sport: SPORT[prefix], template,
    anchor: { section, step, quote_en: quote(id, template) },
    group_shown: group, title: t.title, alt: t.alt, objects, paths,
    safety: 'Synthetic fixture: waiting zone W is outside the working paths.',
    notes: 'Test fixture for renderer and validator coverage. Not lesson content.',
    status: 'fixture'
  };
  const dir = path.join(ROOT, family);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify(scene, null, 2) + '\n');
  csv.push([family, id, section, step, template, group, 'Synthetic test fixture', ''].join(','));
  (byFam[family] = byFam[family] || []).push({ id, template, section, step });
}
for (const fam of Object.keys(byFam)) {
  let md = '---\nid: ' + fam + '\nkind: lesson\nlang: en\ntitle: "Synthetic test fixture - not a lesson"\n---\n';
  md += '# Synthetic test fixture (not a lesson)\n\nThis file exists only to test the quote_en check of the diagram validator.\n\n';
  for (const s of byFam[fam]) {
    // Wrap the sentence over two lines with extra spaces to exercise whitespace normalisation.
    const q = quote(s.id, s.template).replace(' and follow', '\n   and  follow');
    md += '## ' + s.section + '\n\n' + s.step + '. ' + q + '\n\n';
  }
  fs.writeFileSync(path.join(exportDir, fam + '.md'), md);
}
fs.writeFileSync(path.join(ROOT, 'placements.csv'), csv.join('\n') + '\n');
console.log('fixtures:', F.length);
