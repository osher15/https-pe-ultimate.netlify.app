"use strict";
/* Motion checks on the solved skeleton (pure Node, no browser). */
const test = require("node:test");
const assert = require("node:assert/strict");
const { spec, LIMITS, cameraProj, frames, jointAngles } = require("./_lib.cjs");

const POINTS = ["pelvis", "mid", "neck", "head", "shoulderR", "elbowR", "wristR", "shoulderL", "elbowL", "wristL",
  "hipR", "kneeR", "ankleR", "toeR", "heelR", "hipL", "kneeL", "ankleL", "toeL", "heelL"];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0));

for (const ex of spec.exercises) {
  test(`${ex.id}: loop length is 2-3 s and keys cover one cycle`, () => {
    assert.ok(ex.duration >= 2 && ex.duration <= 3, `duration ${ex.duration}`);
    const cycle = ex.duration / (ex.cycles || 1);
    assert.equal(ex.keys[0].t, 0);
    assert.ok(Math.abs(ex.keys[ex.keys.length - 1].t - cycle) < 1e-9, "last key must end the cycle");
    for (let i = 1; i < ex.keys.length; i++) assert.ok(ex.keys[i].t > ex.keys[i - 1].t, "keys strictly increasing");
    assert.ok(Number.isInteger(Math.round(ex.duration * spec.fps)));
  });

  test(`${ex.id}: seamless loop (end pose = start pose, no jump at the wrap)`, () => {
    const { frames: F, n } = frames(ex);
    for (const p of POINTS) assert.ok(dist(F[0][p], F[n][p]) < 1e-6, `${p} differs between t=0 and t=end`);
    // the wrap step (frame n-1 -> frame 0) must look like any other step
    let maxStep = 0;
    for (let i = 1; i < n; i++) for (const p of POINTS) maxStep = Math.max(maxStep, dist(F[i][p], F[i - 1][p]));
    let wrap = 0;
    for (const p of POINTS) wrap = Math.max(wrap, dist(F[n - 1][p], F[0][p]));
    assert.ok(wrap <= maxStep * 1.05 + 1e-9, `wrap step ${wrap.toFixed(2)} > max step ${maxStep.toFixed(2)}`);
  });

  test(`${ex.id}: no frame-to-frame teleport (smooth motion)`, () => {
    const { frames: F, n } = frames(ex);
    // 25 fps; even a fast arm swing stays under ~6 m/s = 25 cm per frame; an explosive jump take-off may declare maxStepCm
    for (let i = 1; i <= n; i++) for (const p of POINTS) {
      const d = dist(F[i][p], F[i - 1][p]);
      assert.ok(d < (ex.maxStepCm || 25), `${p} moved ${d.toFixed(1)} cm between frames ${i - 1} and ${i}`);
    }
  });

  test(`${ex.id}: joint angles within anatomical limits`, () => {
    const { frames: F, n } = frames(ex);
    const bad = [];
    for (let i = 0; i <= n; i++) {
      const ja = jointAngles(F[i]);
      for (const [name, [kind, val]] of Object.entries(ja)) {
        const [lo, hi] = LIMITS[kind];
        if (!(val >= lo && val <= hi)) bad.push(`frame ${i} ${name}=${val.toFixed(1)} not in [${lo},${hi}]`);
      }
    }
    assert.deepEqual(bad.slice(0, 5), []);
  });

  test(`${ex.id}: bone lengths constant (rigid limbs)`, () => {
    const { frames: F } = frames(ex);
    const pairs = [["shoulderR", "elbowR"], ["elbowR", "wristR"], ["hipR", "kneeR"], ["kneeR", "ankleR"], ["pelvis", "mid"], ["mid", "neck"]];
    for (const [a, b] of pairs) {
      const L0 = dist(F[0][a], F[0][b]);
      for (const J of F) assert.ok(Math.abs(dist(J[a], J[b]) - L0) < 1e-6, `${a}-${b} length changes`);
    }
  });

  test(`${ex.id}: planted hands/feet do not slide; nothing goes through the floor`, () => {
    const { frames: F, n } = frames(ex);
    const P = cameraProj(ex);
    for (const c of ex.contacts || []) {
      const from = c.from != null ? c.from : 0, to = c.to != null ? c.to : ex.duration;
      const idx = [];
      for (let i = 0; i <= n; i++) { const t = i / spec.fps; if (t >= from - 1e-9 && t <= to + 1e-9) idx.push(i); }
      assert.ok(idx.length >= 2, `contact ${c.eff} spans no frames`);
      const p0 = P(F[idx[0]][c.eff]);
      let worst = 0;
      for (const i of idx) { const p = P(F[i][c.eff]); worst = Math.max(worst, Math.hypot(p[0] - p0[0], p[1] - p0[1])); }
      // 0.6 world units is under 1 px in every pilot view
      assert.ok(worst <= 0.6, `${c.eff} slides ${worst.toFixed(2)} units in ${from}-${to}s`);
    }
    const floorPts = ["toeR", "heelR", "toeL", "heelL", "kneeR", "kneeL", "wristR", "wristL", "elbowR", "elbowL"];
    for (let i = 0; i <= n; i++) for (const p of floorPts) assert.ok(F[i][p][1] > -0.5, `${p} below floor at frame ${i} (${F[i][p][1].toFixed(2)})`);
  });
}
