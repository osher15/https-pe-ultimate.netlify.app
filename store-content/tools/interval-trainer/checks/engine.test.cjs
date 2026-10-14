"use strict";
/* Engine checks: schedules vs the app's own definitions, runner, circuits, dice, settings, storage. */
const test = require("node:test"), assert = require("node:assert/strict");
const { load, ROOT } = require("./_load.cjs");
const X = require("../tools/extract-app-data.cjs");
const { D, E } = load();

const fit = X.sliceFit(ROOT);
const APP_PRESETS = JSON.parse(JSON.stringify(X.literalAfter(fit, "const PRESETS=[")));
const appBuild = X.appBuildPhases(fit);
/* The app names phases in Hebrew; map them to kinds for comparison. */
function appKinds(phases) {
  return Array.from(phases, p => ({ kind: p.ph === "prep" ? "prep" : p.ph === "work" ? "work" : (p.name === "מנוחה בין סטים" ? "setrest" : "rest"), dur: p.dur }));
}
const EXPECTED_TOTAL = { tabata: 238, hiit: 443, emom: 593, strength: 1148, quick: 148 };

test("preset values are the app's PRESETS (hm-app.js FIT)", () => {
  assert.equal(D.presets.length, APP_PRESETS.length);
  D.presets.forEach((p, i) => {
    const a = APP_PRESETS[i];
    assert.deepEqual([p.w, p.r, p.n, p.s, p.sr, p.sub], [a.w, a.r, a.n, a.s, a.sr, a.sub], p.id);
  });
});

for (const p of D.presets) {
  test("schedule " + p.id + " matches the app's buildPhases phase by phase", () => {
    const mine = E.buildIntervalPhases(p.w, p.r, p.n, p.s, p.sr).map(x => ({ kind: x.kind, dur: x.dur }));
    const app = appKinds(appBuild(p.w, p.r, p.n, p.s, p.sr));
    assert.deepEqual(mine, app);
    const total = E.totalOf(E.buildIntervalPhases(p.w, p.r, p.n, p.s, p.sr));
    assert.equal(total, EXPECTED_TOTAL[p.id], "total seconds");
    const work = mine.filter(x => x.kind === "work"), rest = mine.filter(x => x.kind === "rest"), setrest = mine.filter(x => x.kind === "setrest");
    assert.equal(work.length, p.n * p.s, "work intervals = rounds x sets");
    assert.equal(work.reduce((a, x) => a + x.dur, 0), p.w * p.n * p.s, "work seconds");
    assert.equal(rest.length, p.r > 0 ? (p.n - 1) * p.s : 0, "rest between rounds, none after the last round of a set");
    assert.equal(setrest.length, p.sr > 0 ? p.s - 1 : 0, "set rest between sets only");
    assert.equal(mine[0].kind, "prep"); assert.equal(mine[0].dur, 8, "8 s preparation as in the app");
    assert.equal(mine[mine.length - 1].kind, "work", "ends on work");
  });
}

test("custom schedules also match the app (rest 0, set rest 0, many sets)", () => {
  for (const c of [[30, 0, 5, 1, 0], [20, 10, 4, 3, 0], [45, 15, 1, 4, 90], [5, 0, 1, 1, 0], [60, 30, 12, 2, 120]]) {
    assert.deepEqual(E.buildIntervalPhases(...c).map(x => ({ kind: x.kind, dur: x.dur })), appKinds(appBuild(...c)), c.join(","));
  }
});

test("locate(): boundaries, ceil() remaining, done", () => {
  const ph = E.buildIntervalPhases(20, 10, 8, 1, 0);
  assert.deepEqual([E.locate(ph, 0).i, E.locate(ph, 0).remain], [0, 8]);
  assert.deepEqual([E.locate(ph, 7.01).i, E.locate(ph, 7.01).remain], [0, 1]);
  assert.deepEqual([E.locate(ph, 8).i, E.locate(ph, 8).remain, E.locate(ph, 8).phase.kind], [1, 20, "work"]);
  assert.equal(E.locate(ph, 28).phase.kind, "rest");
  assert.equal(E.locate(ph, 237.999).done, false);
  assert.equal(E.locate(ph, 238).done, true);
});

test("runner: pause freezes time, resume continues, skip jumps to the next phase, completes at total", () => {
  let ms = 0; const now = () => ms;
  const r = E.createRunner(E.buildIntervalPhases(20, 10, 8, 1, 0), now);
  r.start(); ms = 5000;
  assert.equal(r.state().remain, 3);
  r.pause(); ms = 60000;
  assert.equal(r.state().elapsed, 5); assert.equal(r.state().paused, true);
  r.resume(); ms = 63000;
  assert.equal(r.state().i, 1, "prep (8 s) is over after 5 + 3 s"); assert.equal(r.state().remain, 20);
  r.skip(); assert.equal(r.state().i, 2); assert.equal(r.state().phase.kind, "rest"); assert.equal(r.state().remain, 10);
  r.pause(); r.skip(); assert.equal(r.state().i, 3, "skip also works while paused"); assert.equal(r.state().paused, true);
  r.resume(); ms += 20000; assert.equal(r.state().phase.kind, "rest");
  ms += 1e6; assert.equal(r.state().done, true);
  assert.equal(r.total, 238);
});

test("runner: skip through every phase reaches done in phases.length steps", () => {
  let ms = 0; const ph = E.buildIntervalPhases(40, 20, 6, 3, 60); const r = E.createRunner(ph, () => ms);
  r.start(); let n = 0; while (!r.state().done && n < 1000) { r.skip(); n++; }
  assert.equal(n, ph.length);
});

test("circuit schedule: prep 5 s, work per station, changeover between stations only", () => {
  const ph = E.buildCircuitPhases(6, 45, 15);
  assert.equal(ph[0].kind, "prep"); assert.equal(ph[0].dur, 5);
  assert.equal(ph.filter(p => p.kind === "work").length, 6);
  assert.equal(ph.filter(p => p.kind === "rest").length, 5);
  assert.equal(E.totalOf(ph), 5 + 6 * 45 + 5 * 15);
  assert.equal(ph[ph.length - 1].kind, "work");
  ph.filter(p => p.kind === "rest").forEach(p => assert.ok(p.station >= 1, "changeover announces the NEXT station"));
});

const FOCI = ["mix", "strength", "cardio", "core", "mobility"];
test("circuit generator: deterministic for a seed", () => {
  for (const f of FOCI) for (const n of [2, 6, 12]) {
    assert.deepEqual(E.generateCircuit(D.exercises, f, n, 12345), E.generateCircuit(D.exercises, f, n, 12345));
  }
  const a = E.generateCircuit(D.exercises, "mix", 6, 1), b = E.generateCircuit(D.exercises, "mix", 6, 2);
  assert.notDeepEqual(a, b, "different seeds give different draws");
});

test("circuit generator invariants (5 foci x n 2..12 x 200 seeds): unique, body-weight, app pool rule", () => {
  const byId = Object.fromEntries(D.exercises.map(e => [e.id, e]));
  const bw = D.exercises.filter(e => e.eq === "none");
  for (const f of FOCI) for (let n = 2; n <= 12; n++) {
    const focusPool = bw.filter(e => f === "mix" || e.grp === f || e.grp === "mix");
    const pool = focusPool.length < n ? bw : focusPool;
    const seen = new Set();
    for (let seed = 1; seed <= 200; seed++) {
      const ids = E.generateCircuit(D.exercises, f, n, seed);
      assert.equal(ids.length, n, f + " n=" + n);
      assert.equal(new Set(ids).size, ids.length, "no duplicate station");
      for (const id of ids) {
        assert.equal(byId[id].eq, "none", "body-weight only (as in the app)");
        assert.ok(pool.includes(byId[id]), id + " in pool for " + f);
        seen.add(id);
      }
    }
    if (pool.length > n) assert.ok(seen.size > n, "draws vary across seeds");
  }
});

test("fitness dice: body-weight exercise, amount from the app's lists, time vs reps", () => {
  const byId = Object.fromEntries(D.exercises.map(e => [e.id, e]));
  const seen = new Set();
  for (let seed = 1; seed <= 2000; seed++) {
    const r = E.rollDice(D.exercises, seed); const e = byId[r.id];
    assert.equal(e.eq, "none");
    assert.equal(r.isTime, e.reps.medium[1] !== "");
    assert.ok((r.isTime ? [15, 20, 30, 40, 45, 60] : [5, 8, 10, 12, 15, 20]).includes(r.amount));
    seen.add(r.id);
    assert.deepEqual(E.rollDice(D.exercises, seed), r, "deterministic");
  }
  assert.equal(seen.size, D.exercises.filter(e => e.eq === "none").length, "every body-weight exercise can come up");
});

test("settings validation: garbage in, valid settings out", () => {
  const ids = D.exercises.map(e => e.id), pids = D.presets.map(p => p.id);
  assert.deepEqual(E.validateSettings(null, ids, pids), E.defaults());
  assert.equal(E.defaults().lang, "en", "English is the default for new installs");
  const v = E.validateSettings({ lang: "xx", sound: "yes", tab: "grades", timer: { w: -5, r: "abc", n: 1e9, s: 0, sr: 1e9, preset: "nope" },
    circuit: { focus: "evil", n: 99, T: 1, R: -1, list: ["squat", "squat", "nope", 7, "burpee"] }, libFilter: "x", extra: { a: 1 } }, ids, pids);
  assert.equal(v.lang, "en"); assert.equal(v.sound, true); assert.equal(v.tab, "timer");
  assert.deepEqual(v.timer, { w: 5, r: 10, n: 99, s: 1, sr: 3600, preset: "" });
  assert.deepEqual(v.circuit, { focus: "mix", n: 12, T: 10, R: 5, list: ["squat", "burpee"] });
  assert.equal(v.libFilter, "all"); assert.equal(v.extra, undefined);
  const ok = E.validateSettings({ lang: "ar", sound: false, voice: false, tab: "dice", timer: { w: 30, r: 15, n: 10, s: 1, sr: 0, preset: "hiit" }, circuit: { focus: "core", n: 4, T: 30, R: 10, list: ["plank"] }, libFilter: "core" }, ids, pids);
  assert.deepEqual(ok, { v: 1, lang: "ar", sound: false, voice: false, tab: "dice", timer: { w: 30, r: 15, n: 10, s: 1, sr: 0, preset: "hiit" }, circuit: { focus: "core", n: 4, T: 30, R: 10, list: ["plank"] }, libFilter: "core" });
});

function memStorage() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m }; }
const KEY = "pe-tools.interval-trainer.v1";
test("storage: round trip, own key only", () => {
  const ids = D.exercises.map(e => e.id), pids = D.presets.map(p => p.id), s = memStorage();
  const st = E.createStore(() => s, KEY, ids, pids);
  const a = st.load(); assert.equal(st.status, "empty");
  a.lang = "ru"; a.timer = { w: 45, r: 15, n: 10, s: 1, sr: 0, preset: "emom" };
  assert.equal(st.save(a), true); assert.equal(st.status, "ok");
  assert.deepEqual([...s._m.keys()], [KEY]);
  assert.deepEqual(E.createStore(() => s, KEY, ids, pids).load(), a);
});
test("storage failure: blocked getter, throwing getItem/setItem, quota, corrupt JSON never throw", () => {
  const ids = D.exercises.map(e => e.id), pids = D.presets.map(p => p.id);
  const blocked = E.createStore(() => { const e = new Error("denied"); e.name = "SecurityError"; throw e; }, KEY, ids, pids);
  assert.deepEqual(blocked.load(), E.defaults()); assert.equal(blocked.status, "blocked");
  assert.equal(blocked.save(E.defaults()), false); assert.equal(blocked.status, "blocked");
  const nul = E.createStore(() => null, KEY, ids, pids); nul.load(); assert.equal(nul.status, "blocked");
  const bad = E.createStore(() => ({ getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } }), KEY, ids, pids);
  assert.deepEqual(bad.load(), E.defaults()); assert.equal(bad.status, "blocked");
  const quota = E.createStore(() => ({ getItem: () => null, setItem() { const e = new Error("full"); e.name = "QuotaExceededError"; throw e; } }), KEY, ids, pids);
  quota.load(); assert.equal(quota.save(E.defaults()), false); assert.equal(quota.status, "failed");
  const s = memStorage(); s.setItem(KEY, "{not json");
  const corrupt = E.createStore(() => s, KEY, ids, pids);
  assert.deepEqual(corrupt.load(), E.defaults()); assert.equal(corrupt.status, "corrupt");
  assert.equal(s.getItem(KEY), "{not json", "loading does not overwrite what is stored");
  s.setItem(KEY, JSON.stringify({ lang: "he", timer: "x", circuit: [1, 2] }));
  const partial = E.createStore(() => s, KEY, ids, pids).load();
  assert.equal(partial.lang, "he"); assert.deepEqual(partial.timer, E.defaults().timer);
});

test("formatting helpers", () => {
  assert.equal(E.fmtClock(238), "3:58"); assert.equal(E.fmtClock(1148), "19:08");
  assert.equal(E.fmtRemain(59), "59"); assert.equal(E.fmtRemain(60), "1:00");
  assert.equal(E.fmt("Work · round {0}/{1}", [3, 8]), "Work · round 3/8");
});
