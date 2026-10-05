'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const context = vm.createContext({ window: {} });
const files = ['hm-lessonbank.js', ...fs.readdirSync(root)
  .filter(name => /^hm-lessonbank-.+\.js$/.test(name)).sort()];
for (const file of files) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context,
    { filename: file, timeout: 2000 });
}
const bank = context.window.LESSONBANK;
const languages = ['he', 'en', 'ar', 'ru', 'es'];
const sections = ['opening', 'warmup', 'mainA', 'mainB', 'appliedGame', 'closing'];
const arrays = ['objectives', 'safety', 'commonErrors', 'teachingPoints'];
const strings = ['title', 'identity', 'ageRange', 'duration', 'purpose',
  'priorKnowledge', 'pathwayPosition', 'unitContribution', 'equipment',
  'adaptations', 'assessment', 'reflection', 'continuity', 'bankLink',
  'systemData', 'teacherSummary', 'pedagogicalValue', 'selfQualityCheck'];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function schemaErrors(lesson) {
  const errors = [];
  if (!Number.isInteger(lesson.n) || lesson.n < 1 || lesson.n > 10) errors.push('n');
  for (const field of strings) if (!nonempty(lesson[field])) errors.push(field);
  for (const field of arrays) {
    if (!Array.isArray(lesson[field]) || !lesson[field].length ||
        !lesson[field].every(nonempty)) errors.push(field);
  }
  for (const section of sections) {
    if (!nonempty(lesson.sections?.[section])) errors.push('sections.' + section);
  }
  if (!/^\d+(?:\.\d+)?$/.test(String(lesson.duration)) ||
      !Number.isFinite(Number(lesson.duration)) || Number(lesson.duration) <= 0) {
    errors.push('duration.numericMinutes');
  }
  return errors;
}

// Parse an explicit section budget, never repetitions or timings inside drills.
// Unknown/range budgets are reported for human review rather than guessed.
function sectionMinutes(text) {
  const clean = text.replace(/\*\*/g, '').replace(/[٠-٩]/g,
    digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
  const clauses = clean.split(/(?<!\d)\.|\.(?!\d)|[!\r\n]/)
    .map(value => value.trim()).filter(Boolean).slice(0, 3);
  const unit = '(?:minutes?\\b|minutos?\\b|минут(?:ы|а)?\\b|דקות|דקה|دقائق|دقيقة)';
  // Cyrillic word boundaries are not ASCII \b.
  const units = unit.replace('минут(?:ы|а)?\\b', 'минут(?:ы|а)?');
  const pattern = new RegExp('(?<![\\d–—-])(\\d+(?:\\.\\d+)?)\\s*' + units, 'gu');
  for (const [index, header] of clauses.entries()) {
    const budgetHeading = /^(?:[-•]\s*)?(?:משך|Duration|Time|المدة|Время|Duración|Tiempo)\s*:/iu.test(header);
    const bareBudget = /^\d/.test(header);
    const titleBudget = index === 0 && /[—–]\s*\d/.test(header);
    if (!budgetHeading && !bareBudget && !titleBudget) continue;
    const matches = [...header.matchAll(pattern)];
    if (matches.length === 0 && !budgetHeading) continue;
    if (matches.length !== 1 || /\d\s*[–—-]\s*\d/.test(header)) return null;
    return Number(matches[0][1]);
  }
  return null;
}

// Original project-authored plans do not require an external source per record.
// This checks editorial metadata, not authorship or research citations.
function reviewMetadataErrors(lesson) {
  const errors = [];
  if (!nonempty(lesson.contentVersion)) errors.push('contentVersion');
  if (!['imported', 'draft', 'teacher-reviewed', 'native-reviewed'].includes(lesson.reviewStatus)) {
    errors.push('reviewStatus');
  }
  return errors;
}

test('lesson bank declares five languages and only known sports', () => {
  assert.deepEqual(Array.from(bank.meta.langs), languages);
  assert.equal(new Set(bank.meta.sportOrder).size, bank.meta.sportOrder.length);
  assert.ok(Object.keys(bank.sports).length > 0, 'No sport data loaded');
  for (const sport of Object.keys(bank.sports)) {
    assert.ok(bank.meta.sportOrder.includes(sport), sport + ': undeclared sport');
  }
});

const records = [];
for (const sport of bank.meta.sportOrder) {
  if (!bank.sports[sport]) continue; // Later imports must pass the same checks.
  for (const lang of languages) {
    const rows = bank.sports[sport][lang];
    test(`lesson bank ${sport}/${lang}: ten complete, uniquely numbered lessons`, t => {
      assert.ok(Array.isArray(rows), 'Missing language: ' + sport + '/' + lang);
      assert.equal(rows.length, 10);
      assert.deepEqual(Array.from(rows, row => row.n).sort((a, b) => a - b),
        Array.from({ length: 10 }, (_, i) => i + 1));
      for (const row of rows) assert.deepEqual(schemaErrors(row), [], `${sport}/${lang}/${row.n}`);
      t.diagnostic(`${sport}/${lang}: ${rows.length} records`);
    });
    if (Array.isArray(rows)) for (const row of rows) records.push({ sport, lang, row });
  }
}

test('non-Hebrew lessons contain no Hebrew letters', () => {
  const errors = [];
  for (const { sport, lang, row } of records) {
    if (lang === 'he') continue;
    // Identifiers such as BB-01-HE use Latin letters and need no exception.
    for (const [field, value] of Object.entries(row)) {
      if (/[\u05d0-\u05ea]/u.test(JSON.stringify(value))) errors.push(`${sport}/${lang}/${row.n}:${field}`);
    }
  }
  assert.deepEqual(errors, []);
});

test('explicit section budgets equal lesson duration (zero-minute tolerance)', t => {
  const mismatches = [], unknown = [];
  let checked = 0;
  for (const { sport, lang, row } of records) {
    const id = `${sport}/${lang}/${row.n}`;
    const minutes = sections.map(section => sectionMinutes(row.sections[section]));
    if (minutes.some(value => value === null)) { unknown.push(id); continue; }
    checked++;
    const sum = minutes.reduce((a, b) => a + b, 0);
    if (sum !== Number(row.duration)) mismatches.push(`${id}: sections=${sum}, duration=${row.duration}`);
  }
  t.diagnostic(`Checked ${checked}/${records.length} budgets; explicit timing unavailable for ${unknown.length}`);
  if (unknown.length) t.diagnostic('Manual timing review: ' + unknown.join(', '));
  assert.deepEqual(mismatches, []);
});

const reviewMetadataMissing = records.filter(({ row }) => reviewMetadataErrors(row).length);
// Step 3 belongs to Claude. Until its metadata lands, expose the gap as a skip.
// CI/release review can enforce it immediately with LESSONBANK_REQUIRE_REVIEW_METADATA=1.
const metadataStarted = records.some(({ row }) =>
  ['contentVersion', 'reviewStatus'].some(field => Object.hasOwn(row, field)));
test('every language record has editorial version and review status', {
  skip: !metadataStarted && process.env.LESSONBANK_REQUIRE_REVIEW_METADATA !== '1'
    ? `Step 3 pending: ${reviewMetadataMissing.length}/${records.length} records lack per-record editorial metadata` : false
}, () => {
  const errors = records.flatMap(({ sport, lang, row }) =>
    reviewMetadataErrors(row).map(field => `${sport}/${lang}/${row.n}:${field}`));
  assert.deepEqual(errors, []);
});

test('validator rejects incomplete records and invalid editorial metadata', () => {
  const valid = structuredClone(records[0].row);
  assert.deepEqual(schemaErrors(valid), []);
  delete valid.sections.closing;
  valid.objectives = [''];
  valid.duration = '45 minutes';
  assert.deepEqual(schemaErrors(valid), ['objectives', 'sections.closing', 'duration.numericMinutes']);
  assert.deepEqual(reviewMetadataErrors({ reviewStatus: 'draft' }), ['contentVersion']);
  assert.deepEqual(reviewMetadataErrors({ contentVersion: 'V2', reviewStatus: 'draft' }), []);
  assert.deepEqual(reviewMetadataErrors({ contentVersion: 'V2', reviewStatus: 'teacher-reviewed' }), []);
  assert.deepEqual(reviewMetadataErrors({ contentVersion: 'V2', reviewStatus: 'unknown' }), ['reviewStatus']);

});

test('budget parsing recognizes five languages without guessing ranges or drill repeats', () => {
  for (const text of ['משך: 3 דקות.', 'Duration: 3 minutes.', '**المدة:** ٣ دقائق.',
    'Время: 3 минуты.', 'Duración: 3 minutos.', 'Main activity — 3 minutes\nDo 20 repeats.',
    'Main A — Pass. Time: 3 minutes.', 'Main A — Pass. 3 minutes.', 'مرر واملأ\n- المدة: 3 دقائق']) {
    assert.equal(sectionMinutes(text), 3);
  }
  assert.equal(sectionMinutes('Time: 3.5 minutes.'), 3.5);
  for (const text of ['Duration: 3–5 minutes.', 'Do 20 repeats.', 'Main activity\nDo 3 minutes per drill.']) {
    assert.equal(sectionMinutes(text), null);
  }
});
