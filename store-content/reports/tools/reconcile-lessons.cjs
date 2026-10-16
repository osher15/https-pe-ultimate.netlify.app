#!/usr/bin/env node
"use strict";
/* Lesson bank reconciliation (task C14) - READ ONLY.
   Compares the 300 exported lesson pages (60 families x 5 languages, from the
   Notion export pilot) with the app's own lesson bank (hm-lessonbank-<sport>.js)
   and writes a deterministic JSON mapping. It never writes to the app sources,
   the export or any generated file.

   Usage:
     node store-content/reports/tools/reconcile-lessons.cjs --export-dir <dir> [--app-root <repo>] [--out <file>]

   <dir> is the export's store-content directory (contains export/lessons/<lang>/<ID>.md and
   manifest/lessons.json). A directory that directly contains lessons/<lang>/ is also accepted.
   Without --out the JSON goes to stdout. Output has no timestamps and no absolute paths, so two
   runs on the same inputs are byte-identical. */
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");

const APP_ROOT_DEFAULT = path.resolve(__dirname, "..", "..", "..");
const LANGS = ["he", "en", "ar", "ru", "es"];
const SPORTS = [["AT", "athletics"], ["BB", "basketball"], ["FB", "football"], ["FIT", "fitness"], ["HB", "handball"], ["VB", "volleyball"]];
const PREFIX_OF = {}; SPORTS.forEach(([p, s]) => { PREFIX_OF[s] = p; });
const SPORT_OF = {}; SPORTS.forEach(([p, s]) => { SPORT_OF[p] = s; });

/* ---- argument parsing ---- */
function parseArgs(argv) {
  const o = { exportDir: "", appRoot: APP_ROOT_DEFAULT, out: "" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--export-dir") o.exportDir = argv[++i];
    else if (argv[i] === "--app-root") o.appRoot = path.resolve(argv[++i]);
    else if (argv[i] === "--out") o.out = argv[++i];
    else { console.error("unknown argument " + argv[i]); process.exit(2); }
  }
  if (!o.exportDir) { console.error("usage: reconcile-lessons.cjs --export-dir <dir> [--app-root <repo>] [--out <file>]"); process.exit(2); }
  return o;
}

/* ---- reuse the app's own Notion parsing helpers (the same ones that built the bank) ---- */
function loadHelpers(appRoot) {
  const imp = require(path.join(appRoot, "tools", "notion-lessons-import.js"));
  return imp;
}
function loadAppBank(appRoot) {
  const ctx = { window: {} }; vm.createContext(ctx);
  const files = ["hm-lessonbank.js"].concat(fs.readdirSync(appRoot).filter(f => /^hm-lessonbank-[a-z]+\.js$/.test(f)).sort());
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(appRoot, f), "utf8"), ctx, { filename: f }));
  return ctx.window.LESSONBANK;
}

function loadArchiveDocs(appRoot) {
  const f = path.join(appRoot, "hm-plans.js");
  if (!fs.existsSync(f)) return [];
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: "hm-plans.js" });
  return (ctx.window.LESSONDOCS || []).map(d => ({ id: d.id, title: d.title, meta: d.meta, textChars: String(d.text || "").length, language: "he", exportCounterpart: null }));
}

/* ---- export locations ---- */
function resolveExport(dir) {
  const cands = [
    { lessons: path.join(dir, "export", "lessons"), manifest: path.join(dir, "manifest", "lessons.json") },
    { lessons: path.join(dir, "lessons"), manifest: path.join(dir, "..", "manifest", "lessons.json") },
    { lessons: path.join(dir, "store-content", "export", "lessons"), manifest: path.join(dir, "store-content", "manifest", "lessons.json") }
  ];
  const hit = cands.find(c => fs.existsSync(c.lessons));
  if (!hit) { console.error("no lessons/<lang> directory found under " + dir); process.exit(2); }
  return hit;
}

/* ---- export page parsing ---- */
function splitFrontMatter(raw) {
  const t = raw.replace(/\r/g, "");
  const m = /^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/.exec(t);
  if (!m) return { fm: {}, body: t };
  const fm = {};
  m[1].split("\n").forEach(l => { const k = /^([a-z_]+):\s*(.*)$/.exec(l); if (k) fm[k[1]] = k[2]; });
  return { fm, body: m[2] };
}
function parseBody(body, H) {
  const lines = body.split("\n");
  const idx = []; lines.forEach((l, i) => { const x = /^# (\d{1,2})\.\s/.exec(l); if (x) idx.push([+x[1], i]); });
  const blocks = {};
  idx.forEach(([n, i], k) => { blocks[n] = lines.slice(i + 1, k + 1 < idx.length ? idx[k + 1][1] : lines.length); });
  const out = {}, present = idx.map(x => x[0]);
  for (let n = 1; n <= 20; n++) {
    const key = H.SECTION_KEYS[n], b = blocks[n] || [];
    if (key === "sections") {
      const subs = []; b.forEach((l, i) => { if (/^## /.test(l)) subs.push(i); });
      const secs = {};
      H.FLOW_KEYS.forEach((fk, j) => { const a = subs[j]; if (a == null) return; secs[fk] = H.textOf(b.slice(a + 1, j + 1 < subs.length ? subs[j + 1] : b.length)); });
      out.sections = secs;
    } else if (key === "objectives" || key === "safety" || key === "commonErrors" || key === "teachingPoints") out[key] = H.listOf(b);
    else out[key] = H.textOf(b);
  }
  return { lesson: out, sectionsPresent: present };
}

/* ---- identity helpers (label sets per language; same approach as the app importer) ---- */
const LABELS = {
  age: ["גיל", "Age", "العمر", "Возраст", "Edad"],
  duration: ["משך", "Duration", "المدة", "Продолжительность", "Время", "Duración"],
  equipment: ["ציוד", "Equipment", "الأدوات", "Инвентарь", "Material"]
};
function identityValue(identity, labels) {
  const lines = String(identity || "").split("\n");
  for (const ln of lines) {
    const m = /^[-\s]*([^:：]+)[:：]\s*(.*)$/.exec(ln); if (!m) continue;
    const label = m[1].trim();
    if (labels.some(x => label === x || label.indexOf(x + "/") === 0)) return m[2].split(/\s+\/\s+/)[0].trim();
  }
  return "";
}
function identityTitle(identity) {
  const first = String(identity || "").split("\n")[0] || "";
  const m = /^[-\s]*[^:：]+[:：]\s*(.*)$/.exec(first);
  /* some pages put the lesson code on the same line: "Title; BB-09-EN", "Title / BB-05-HE" */
  return (m ? m[1] : first).replace(/\s*(?:[;؛]|\/)\s*[A-Z]{2,3}-\d{2}-[A-Z]{2}\s*$/, "").trim();
}
function ageBand(v) { const m = /\d+\s*[–-]\s*\d+|\d+\+?/.exec(String(v || "")); return m ? m[0].replace(/\s+/g, "").replace("-", "–") : ""; }
function minutesOf(v) { const m = /\d+/.exec(String(v || "")); return m ? +m[0] : null; }
function sectionMinutes(t) {   /* same rule as HMDATA.bankSectionMinutes (first 120 chars) */
  const m = /(\d+)\s*(?:דק|min|دق|мин|minut)/i.exec(String(t || "").slice(0, 120));
  return m && +m[1] > 0 && +m[1] <= 90 ? +m[1] : 0;
}

/* ---- text comparison ---- */
const norm = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
function flat(v) { return Array.isArray(v) ? v.map(norm).join("\n") : norm(v); }
function dice(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 1; if (a.length < 2 || b.length < 2) return 0;
  const m = new Map(); for (let i = 0; i < a.length - 1; i++) { const g = a.substr(i, 2); m.set(g, (m.get(g) || 0) + 1); }
  let hit = 0; for (let i = 0; i < b.length - 1; i++) { const g = b.substr(i, 2), c = m.get(g); if (c > 0) { hit++; m.set(g, c - 1); } }
  return (2 * hit) / (a.length + b.length - 2);
}
const r3 = x => Math.round(x * 1000) / 1000;
const FIELDS = ["identity", "purpose", "objectives", "priorKnowledge", "pathwayPosition", "unitContribution", "equipment", "safety",
  "sections.opening", "sections.warmup", "sections.mainA", "sections.mainB", "sections.appliedGame", "sections.closing",
  "commonErrors", "teachingPoints", "adaptations", "assessment", "reflection", "continuity", "bankLink", "systemData",
  "teacherSummary", "pedagogicalValue", "selfQualityCheck"];
const getF = (l, f) => { const p = f.split("."); return p.length === 2 ? (l.sections || {})[p[1]] : l[f]; };

/* lead-in the app adds to every observable objective (see tests/unit/lessonbankobjectives.test.js) */
const LEAD_RE = {
  he: /התלמיד (?:יצליח|יבצע)\s+/g,
  en: /(?:the student can|the student will)\s+/gi,
  ar: /يستطيع الطالب\s+/g,
  ru: /Ученик сможет\s+/g,
  es: /el alumno será capaz de\s+/gi
};
const stripLead = (lang, v) => flat(v).replace(LEAD_RE[lang], "").toLowerCase().replace(/(^|\n)\s*[,.;:\-–—\s]+/g, "$1");
const stripTitleNo = t => norm(t).replace(/^.{1,30}?\s\d{2}\s*[—-]\s*/, "").toLowerCase();
function excerpt(x, y) {
  let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++;
  const from = Math.max(0, i - 40);
  return { at: i, export: x.slice(from, i + 80), app: y.slice(from, i + 80) };
}

/* sub-labels used inside the six flow sections ("Duration:", "Teaching points:" ...), first word group before a colon */
function subLabels(sections) {
  const out = {};
  Object.keys(sections || {}).forEach(k => String(sections[k] || "").split("\n").forEach(l => {
    const m = /^([^:：\n]{2,28})[:：]\s/.exec(l); if (m) out[m[1].trim()] = (out[m[1].trim()] || 0) + 1;
  }));
  return out;
}

function main() {
  const opt = parseArgs(process.argv.slice(2));
  const H = loadHelpers(opt.appRoot);
  const LB = loadAppBank(opt.appRoot);
  const loc = resolveExport(path.resolve(opt.exportDir));
  const manifest = fs.existsSync(loc.manifest) ? JSON.parse(fs.readFileSync(loc.manifest, "utf8")) : [];
  const mfKey = {}; manifest.forEach(r => { mfKey[r.id + "|" + r.lang] = r; });

  /* export inventory */
  const exp = {};   /* "BB-01|en" -> record */
  const exportErrors = [];
  LANGS.forEach(lang => {
    const dir = path.join(loc.lessons, lang);
    if (!fs.existsSync(dir)) { exportErrors.push("missing language dir " + lang); return; }
    fs.readdirSync(dir).filter(f => /\.md$/.test(f)).sort().forEach(f => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const sp = splitFrontMatter(raw), id = f.replace(/\.md$/, "");
      const parsed = parseBody(sp.body, H);
      const hash = crypto.createHash("sha256").update(sp.body.replace(/\r\n/g, "\n"), "utf8").digest("hex");
      exp[id + "|" + lang] = { id, lang, file: "export/lessons/" + lang + "/" + f, fm: sp.fm, lesson: parsed.lesson, sectionsPresent: parsed.sectionsPresent, hash };
    });
  });

  /* app inventory */
  const app = {};   /* "BB-01|en" -> {sport,n,lesson} */
  const appCounts = {};
  Object.keys(LB.sports).sort().forEach(sp => {
    appCounts[sp] = {};
    LANGS.forEach(lang => {
      const arr = (LB.sports[sp] || {})[lang] || [];
      const bands = {};
      arr.forEach(l => {
        const id = PREFIX_OF[sp] + "-" + String(l.n).padStart(2, "0");
        app[id + "|" + lang] = { sport: sp, n: l.n, lesson: l, id };
        bands[l.ageRange] = (bands[l.ageRange] || 0) + 1;
      });
      const sortedBands = {}; Object.keys(bands).sort().forEach(k => { sortedBands[k] = bands[k]; });
      appCounts[sp][lang] = { lessons: arr.length, ageBands: sortedBands, durations: Array.from(new Set(arr.map(l => String(l.duration)))).sort() };
    });
  });

  /* compare */
  const ids = Array.from(new Set(Object.keys(exp).concat(Object.keys(app)).map(k => k.split("|")[0]))).sort();
  const families = [];
  const summary = { families: 0, rows: 0, verdictCounts: {}, objectivesLeadInOnly: 0, exportOnly: 0, appOnly: 0,
    fieldDiffsByField: {}, manifestHashMismatch: 0, manifestMissing: 0, repoCompareNonNull: 0,
    titleFormatDifferences: 0, titleBestMatchDisagreements: 0, ageConflicts: 0, durationConflicts: 0, equipmentConflicts: 0, titleConflicts: 0,
    exportSectionMinutesMismatch: 0, appSectionMinutesMismatch: 0 };
  const conflicts = [];
  const labelInv = { export: {}, app: {} };

  ids.forEach(id => {
    const pm = /^([A-Z]+)-(\d{2})$/.exec(id), sport = pm ? SPORT_OF[pm[1]] : null, n = pm ? +pm[2] : null;
    const fam = { family: id, sport, n, appId: sport ? sport + ":" + n : null, confidence: "", verdict: "", perLang: {} };
    const confs = [], verdicts = [];
    LANGS.forEach(lang => {
      const e = exp[id + "|" + lang], a = app[id + "|" + lang], row = {};
      summary.rows++;
      if (e && !a) { row.verdict = "export-only"; summary.exportOnly++; row.exportFile = e.file; fam.perLang[lang] = row; verdicts.push("export-only"); return; }
      if (a && !e) { row.verdict = "app-only"; summary.appOnly++; fam.perLang[lang] = row; verdicts.push("app-only"); return; }
      const mf = mfKey[id + "|" + lang];
      row.exportFile = e.file; row.appId = a.sport + ":" + a.n + ":" + lang;
      row.exportBodySha256 = e.hash;
      row.manifest = mf ? { status: mf.status, repo_compare: mf.repo_compare, sha256Matches: mf.body_sha256 === e.hash } : null;
      if (!mf) summary.manifestMissing++; else { if (mf.body_sha256 !== e.hash) summary.manifestHashMismatch++; if (mf.repo_compare !== null) summary.repoCompareNonNull++; }
      row.frontMatterOk = e.fm.family === id && e.fm.lang === lang;
      row.sectionsPresent = e.sectionsPresent.length;

      let totalLen = 0, sameLen = 0; const diffs = [], sims = {};
      FIELDS.forEach(f => {
        const x = flat(getF(e.lesson, f)), y = flat(getF(a.lesson, f));
        totalLen += Math.max(x.length, y.length);
        if (x === y) { sameLen += Math.max(x.length, y.length); return; }
        const s = dice(x, y);
        sameLen += s * Math.max(x.length, y.length);
        diffs.push(f); sims[f] = r3(s);
        summary.fieldDiffsByField[f] = (summary.fieldDiffsByField[f] || 0) + 1;
      });
      row.differingFields = diffs;
      row.fieldSimilarity = sims;
      row.similarity = r3(totalLen ? sameLen / totalLen : 1);
      const contentDiffs = diffs.filter(f => f !== "objectives");
      row.contentDifferingFields = contentDiffs;
      if (diffs.indexOf("objectives") >= 0) {
        const ox = stripLead(lang, e.lesson.objectives), oy = stripLead(lang, a.lesson.objectives);
        row.objectives = { itemsExport: e.lesson.objectives.length, itemsApp: a.lesson.objectives.length, similarityAfterLeadInRemoved: r3(dice(ox, oy)), identicalAfterLeadInRemoved: ox === oy };
        if (ox === oy) summary.objectivesLeadInOnly++;
      }
      row.diffs = contentDiffs.map(f => Object.assign({ field: f }, excerpt(flat(getF(e.lesson, f)), flat(getF(a.lesson, f)))));
      row.verdict = diffs.length === 0 ? "exact" : (row.similarity < 0.85 ? "divergent" : (contentDiffs.length === 0 ? "near-objective-frame-only" : "near-edited"));
      summary.verdictCounts[row.verdict] = (summary.verdictCounts[row.verdict] || 0) + 1;

      /* identity-derived values */
      const ev = { title: identityTitle(e.lesson.identity), age: identityValue(e.lesson.identity, LABELS.age), duration: identityValue(e.lesson.identity, LABELS.duration), equipmentIdentity: identityValue(e.lesson.identity, LABELS.equipment), equipmentSection: e.lesson.equipment };
      const av = { title: a.lesson.title, ageRange: a.lesson.ageRange, durationField: String(a.lesson.duration), age: identityValue(a.lesson.identity, LABELS.age), duration: identityValue(a.lesson.identity, LABELS.duration), equipmentIdentity: identityValue(a.lesson.identity, LABELS.equipment), equipmentSection: a.lesson.equipment };
      row.age = { export: ageBand(ev.age), app: av.ageRange, same: ageBand(ev.age) === av.ageRange };
      row.duration = { export: minutesOf(ev.duration), app: minutesOf(av.durationField), same: minutesOf(ev.duration) === minutesOf(av.durationField) };
      row.equipment = { exportIdentity: ev.equipmentIdentity, appIdentity: av.equipmentIdentity, sameIdentity: norm(ev.equipmentIdentity) === norm(av.equipmentIdentity),
        exportSection: norm(ev.equipmentSection), appSection: norm(av.equipmentSection), sameSection: flat(ev.equipmentSection) === flat(av.equipmentSection) };
      row.title = { export: ev.title, app: av.title, same: norm(ev.title) === norm(av.title), sameIgnoringSportNumberPrefix: stripTitleNo(ev.title) === stripTitleNo(av.title) };
      const ref = (s, f) => s + " " + f;
      if (!row.age.same) { summary.ageConflicts++; conflicts.push({ kind: "age", family: id, lang, exportRef: e.file + " # 1 Age", exportQuote: ev.age, appRef: "hm-lessonbank-" + a.sport + ".js " + lang + "[" + (a.n - 1) + "].ageRange", appQuote: av.ageRange }); }
      if (!row.duration.same) { summary.durationConflicts++; conflicts.push({ kind: "duration", family: id, lang, exportRef: e.file + " # 1 Duration", exportQuote: ev.duration, appRef: "hm-lessonbank-" + a.sport + ".js " + lang + "[" + (a.n - 1) + "].duration", appQuote: av.durationField }); }
      if (!row.equipment.sameIdentity || !row.equipment.sameSection) { summary.equipmentConflicts++; conflicts.push({ kind: "equipment", family: id, lang, exportRef: e.file + " # 1 Equipment / # 7", exportQuote: ev.equipmentIdentity + " || " + norm(ev.equipmentSection), appRef: "hm-lessonbank-" + a.sport + ".js " + lang + "[" + (a.n - 1) + "].identity/.equipment", appQuote: av.equipmentIdentity + " || " + norm(av.equipmentSection) }); }
      if (!row.title.same) summary.titleFormatDifferences++;
      if (!row.title.sameIgnoringSportNumberPrefix) { summary.titleConflicts++; conflicts.push({ kind: "title", family: id, lang, exportRef: e.file + " # 1 Full title", exportQuote: ev.title, appRef: "hm-lessonbank-" + a.sport + ".js " + lang + "[" + (a.n - 1) + "].title", appQuote: av.title }); }

      /* internal timing consistency of each side */
      const sumOf = l => H.FLOW_KEYS.reduce((t, k) => t + sectionMinutes((l.sections || {})[k]), 0);
      const unparsed = l => H.FLOW_KEYS.filter(k => !sectionMinutes((l.sections || {})[k]));
      const es = sumOf(e.lesson), as = sumOf(a.lesson);
      row.sectionMinutes = { export: es, app: as, exportUnparsedSections: unparsed(e.lesson), appUnparsedSections: unparsed(a.lesson), exportMatchesDeclared: es === row.duration.export, appMatchesDeclared: as === row.duration.app };
      if (!row.sectionMinutes.exportMatchesDeclared) summary.exportSectionMinutesMismatch++;
      if (!row.sectionMinutes.appMatchesDeclared) summary.appSectionMinutesMismatch++;

      /* match confidence for this pair */
      let c = "high";
      if (!row.title.sameIgnoringSportNumberPrefix || !row.age.same || row.similarity < 0.95 || contentDiffs.length > 3) c = "medium";
      if (row.similarity < 0.6 || !row.frontMatterOk) c = "low";
            row.confidence = c; confs.push(c); verdicts.push(row.verdict);
      if (lang === "en") { fam.title = ev.title; }
      /* sub-label inventory (counted per language, summed) */
      const inv = (o, l) => { const s = subLabels(l.sections); Object.keys(s).forEach(k => { const kk = lang + ":" + k; o[kk] = (o[kk] || 0) + s[k]; }); };
      inv(labelInv.export, e.lesson); inv(labelInv.app, a.lesson);
      fam.perLang[lang] = row;
    });
    const rank = { high: 3, medium: 2, low: 1 };
    fam.confidence = confs.length ? confs.reduce((m, c) => rank[c] < rank[m] ? c : m, "high") : "none";
    fam.verdict = verdicts.every(v => v === "exact") ? "exact-duplicate" : verdicts.some(v => v === "export-only") ? "new-in-export" : verdicts.some(v => v === "app-only") ? "app-only" : verdicts.some(v => v === "divergent") ? "divergent" : verdicts.every(v => v === "exact" || v === "near-objective-frame-only") ? "near-duplicate-objective-frame-only" : "near-duplicate-with-text-edits";
    fam.languagesWithTextEdits = LANGS.filter(l => fam.perLang[l] && fam.perLang[l].verdict === "near-edited");
    /* independent topic check: is the app lesson with the most similar title (same language) the one with the same id? */
    fam.titleMatchCheck = {};
    LANGS.forEach(l => {
      const e = exp[id + "|" + l]; if (!e) return;
      const et = stripTitleNo(identityTitle(e.lesson.identity));
      const scores = [];
      Object.keys(app).filter(k => k.split("|")[1] === l).sort().forEach(k => scores.push({ id: k.split("|")[0], sc: dice(et, stripTitleNo(app[k].lesson.title)) }));
      const ownRec = scores.find(x => x.id === id), own = ownRec ? ownRec.sc : null;
      const top = scores.reduce((m, x) => x.sc > m ? x.sc : m, 0);
      const tied = scores.filter(x => x.id !== id && own != null && Math.abs(x.sc - own) < 1e-9).map(x => x.id);
      const better = scores.filter(x => own != null && x.sc > own + 1e-9).sort((x, y) => y.sc - x.sc || (x.id < y.id ? -1 : 1));
      fam.titleMatchCheck[l] = { sameIdScore: own == null ? null : r3(own), bestScore: r3(top), agreesWithId: better.length === 0, betterAppId: better.length ? better[0].id : null, otherIdsWithIdenticalTitleScore: tied };
      if (better.length) summary.titleBestMatchDisagreements++;
    });
    fam.identicalLanguages = LANGS.filter(l => fam.perLang[l] && fam.perLang[l].verdict === "exact");
    /* cross-language age agreement inside each side */
    const ages = side => Array.from(new Set(LANGS.map(l => { const r = fam.perLang[l]; return r && r.age ? (side === "export" ? r.age.export : r.age.app) : null; }).filter(Boolean))).sort();
    fam.ageBandsAcrossLanguages = { export: ages("export"), app: ages("app") };
    families.push(fam);
  });
  summary.families = families.length;
  summary.familiesByVerdict = {}; families.forEach(f => { summary.familiesByVerdict[f.verdict] = (summary.familiesByVerdict[f.verdict] || 0) + 1; });
  summary.familiesByConfidence = {}; families.forEach(f => { summary.familiesByConfidence[f.confidence] = (summary.familiesByConfidence[f.confidence] || 0) + 1; });
  const sortObj = o => { const r = {}; Object.keys(o).sort().forEach(k => { r[k] = o[k]; }); return r; };
  summary.fieldDiffsByField = sortObj(summary.fieldDiffsByField);
  summary.exportSectionsPresent20 = Object.keys(exp).filter(k => exp[k].sectionsPresent.length === 20).length;

  const out = {
    schema: "pe-ultimate/lesson-bank-reconciliation/1",
    task: "C14",
    readOnly: true,
    inputs: {
      exportLessonFiles: Object.keys(exp).length,
      exportManifestRows: manifest.length,
      appLessons: Object.keys(app).length,
      appBankReviewStatus: (LB.meta && LB.meta.provenance && LB.meta.provenance.reviewStatus) || null,
      appBankContentVersion: (LB.meta && LB.meta.provenance && LB.meta.provenance.contentVersion) || null,
      exportErrors: exportErrors
    },
    idScheme: {
      export: "<PREFIX>-<NN> per family (AT, BB, FB, FIT, HB, VB), file export/lessons/<lang>/<PREFIX>-<NN>.md, lesson code <PREFIX>-<NN>-<LANG> inside identity",
      app: "LESSONBANK.sports.<sport>.<lang>[n-1], n = 1..10; plan source id \"<sport>:<n>\" (bankToPlan src.id), language in src.lang",
      prefixToSport: sortObj(SPORT_OF)
    },
    appCounts: appCounts,
    summary: summary,
    families: families,
    appOnly: ids.filter(id => LANGS.every(l => app[id + "|" + l] && !exp[id + "|" + l])),
    exportOnly: ids.filter(id => LANGS.every(l => exp[id + "|" + l] && !app[id + "|" + l])),
    otherAppLessonContent: { archiveDocuments_hm_plans_js: loadArchiveDocs(opt.appRoot), generatorTopics: "21 topics in hm-lesson.js TOPICS (he only, generated plans); none has an export counterpart" },
    conflicts: conflicts,
    sectionSubLabels: { export: sortObj(labelInv.export), app: sortObj(labelInv.app) }
  };
  const text = JSON.stringify(out, null, 2) + "\n";
  if (opt.out) fs.writeFileSync(opt.out, text); else process.stdout.write(text);
}
main();
