"use strict";
/*
  Procedural cartoon skeleton: forward kinematics from joint angles, two-bone IK for planted
  hands/feet, root anchoring for pivots, and keyframe interpolation.

  World units are roughly centimetres. Floor is y = 0, +y is up. The figure faces +x.
  +z points toward the side-view camera, so the figure's right side (R, side = +1) is the
  near side in a side view and the left side (L, side = -1) is the far side.

  Angle conventions (degrees in specs, radians inside):
    root.pitch  rotation of the pelvis about z, counter-clockwise positive. 0 = upright,
                -90 = prone (face down, head toward +x), +90 = supine (face up, head toward -x).
    root.yaw / root.roll   rotation about y / x (rarely needed).
    lumbar, thoracic       spine flexion, forward bend positive. twistL/twistT = spine rotation.
    neck                   head flexion (chin to chest) positive. headYaw turns the head.
    arm.flex   shoulder flexion (arm forward/up) positive.  arm.abd  abduction (out to the side).
    arm.elbow  elbow flexion positive (0 = straight).
    leg.flex   hip flexion (thigh forward/up) positive.     leg.abd  abduction.
    leg.knee   knee flexion positive (0 = straight).
    leg.ankle  dorsiflexion positive (toes up), 0 = foot perpendicular to the shin.
*/

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

const BODY = {
  hipW: 8.5, shoulderW: 15, lumbar: 22, thoracic: 24, shoulderDrop: 6,
  neck: 6, headR: 11, upperArm: 28, forearm: 24, handR: 4.6,
  thigh: 42, shin: 41, ankleH: 7, toeFwd: 17, heelBack: 6,
  // drawing thickness (stroke widths)
  torsoDepth: 24, torsoBreadth: 30, armW: 8.6, legW: 12, footW: 8.5, neckW: 9
};

/* ---------- 3-vector / 3x3 matrix helpers (row-major arrays) ---------- */
const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = a => Math.sqrt(dot(a, a));
const norm = a => mul(a, 1 / (len(a) || 1));
const lerp = (a, b, t) => a + (b - a) * t;
const lerpV = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const I3 = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];
function mm(A, B) {
  const C = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
  return C;
}
const mv = (A, p) => [A[0] * p[0] + A[1] * p[1] + A[2] * p[2], A[3] * p[0] + A[4] * p[1] + A[5] * p[2], A[6] * p[0] + A[7] * p[1] + A[8] * p[2]];
const mtv = (A, p) => [A[0] * p[0] + A[3] * p[1] + A[6] * p[2], A[1] * p[0] + A[4] * p[1] + A[7] * p[2], A[2] * p[0] + A[5] * p[1] + A[8] * p[2]];
function Rx(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
function Ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
function Rz(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }

/* ---------- easing ---------- */
const EASE = {
  linear: t => t,
  inOut: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  // ballistic: height follows a parabola when used on a flight segment
  quadIn: t => t * t,
  quadOut: t => 1 - (1 - t) * (1 - t)
};

/* ---------- default pose ---------- */
function limbDefaults() { return { flex: 0, abd: 0, bend: 0, ankle: 0, rot: 0, ik: null, rel: null, anchor: "toe", ankleT: null, ikW: 0, footPitch: null, footW: 0 }; }
function defaultPose() {
  return {
    root: { x: 0, y: BODY.ankleH + BODY.shin + BODY.thigh, z: 0, pitch: 0, yaw: 0, roll: 0 },
    rootFrom: null, rootFromW: 0,
    lumbar: 0, thoracic: 0, twistL: 0, twistT: 0, side: 0, neck: 0, headYaw: 0,
    breath: 0, hold: 0,
    armL: limbDefaults(), armR: limbDefaults(), legL: limbDefaults(), legR: limbDefaults()
  };
}

/* Normalise a keyframe pose spec into a full pose object.
   Shorthands: "arms"/"legs" apply to both sides; side-specific keys override.
   Limb keys: flex, abd, elbow (arms) / knee (legs), ankle, ik:[x,y,z] (arm wrist target),
   foot:{toe:[x,z], y?, pitch} (leg IK target given as the toe-tip contact point). */
function normPose(spec) {
  const p = defaultPose();
  if (spec.root) Object.assign(p.root, spec.root);
  if (spec.rootFrom) { p.rootFrom = { eff: spec.rootFrom.eff, at: spec.rootFrom.at.slice() }; p.rootFromW = 1; }
  for (const k of ["lumbar", "thoracic", "twistL", "twistT", "side", "neck", "headYaw", "breath", "hold"]) if (spec[k] != null) p[k] = spec[k];
  const limb = (dst, src, kind) => {
    if (!src) return;
    if (src.flex != null) dst.flex = src.flex;
    if (src.abd != null) dst.abd = src.abd;
    if (src.elbow != null) dst.bend = src.elbow;
    if (src.knee != null) dst.bend = src.knee;
    if (src.ankle != null) dst.ankle = src.ankle;
    if (src.rot != null) dst.rot = src.rot; // rotation about the upper bone (FK only; IK assumes 0)
    if (kind === "arm" && src.ik) { dst.ik = src.ik.slice(); dst.ikW = 1; }
    if (kind === "arm" && src.rel) { dst.rel = src.rel.slice(); dst.ikW = 1; } // target in pelvis frame (e.g. hands on hips)
    if (kind === "leg" && src.foot) {
      const pt = src.foot.heel || src.foot.toe;
      dst.anchor = src.foot.heel ? "heel" : "toe";
      dst.ik = [pt[0], src.foot.y || 0, pt[1]]; dst.ikW = 1;
      dst.footPitch = src.foot.pitch || 0; dst.footW = src.foot.loose ? 0 : 1; // loose: foot follows the shin (flight)
      if (src.foot.loose && src.foot.ankle != null) dst.ankle = src.foot.ankle;
    }
    if (kind === "leg" && src.footPitch != null) { dst.footPitch = src.footPitch; dst.footW = 1; }
  };
  limb(p.armL, spec.arms, "arm"); limb(p.armR, spec.arms, "arm");
  limb(p.legL, spec.legs, "leg"); limb(p.legR, spec.legs, "leg");
  limb(p.armL, spec.armL, "arm"); limb(p.armR, spec.armR, "arm");
  limb(p.legL, spec.legL, "leg"); limb(p.legR, spec.legR, "leg");
  return p;
}

/* Fill IK targets / anchors that a key does not define from the nearest key that does, so
   that blending weights (ikW, rootFromW) can fade smoothly without a target jump. */
function fillTargets(poses) {
  const n = poses.length;
  const fill = (get, set) => {
    for (let i = 0; i < n; i++) {
      if (get(poses[i]) != null) continue;
      for (let d = 1; d < n; d++) {
        const a = get(poses[(i - d + n) % n]), b = get(poses[(i + d) % n]);
        const src = b != null ? b : a;
        if (src != null) { set(poses[i], src); break; }
      }
    }
  };
  for (const L of ["armL", "armR", "legL", "legR"]) {
    fill(p => p[L].ik, (p, s) => { p[L].ik = s.slice(); });
    fill(p => p[L].rel, (p, s) => { p[L].rel = s.slice(); });
    fill(p => p[L].footPitch, (p, s) => { p[L].footPitch = s; });
  }
  fill(p => p.rootFrom, (p, s) => { p.rootFrom = { eff: s.eff, at: s.at.slice() }; });
}

function lerpPose(a, b, t) {
  const r = defaultPose();
  for (const k of ["x", "y", "z", "pitch", "yaw", "roll"]) r.root[k] = lerp(a.root[k] || 0, b.root[k] || 0, t);
  r.rootFromW = lerp(a.rootFromW, b.rootFromW, t);
  if (a.rootFrom && b.rootFrom) r.rootFrom = { eff: a.rootFrom.eff, at: [lerp(a.rootFrom.at[0], b.rootFrom.at[0], t), lerp(a.rootFrom.at[1], b.rootFrom.at[1], t)] };
  for (const k of ["lumbar", "thoracic", "twistL", "twistT", "side", "neck", "headYaw", "breath", "hold"]) r[k] = lerp(a[k], b[k], t);
  for (const L of ["armL", "armR", "legL", "legR"]) {
    const A = a[L], B = b[L], R = r[L];
    for (const k of ["flex", "abd", "bend", "ankle", "ikW", "footW", "rot"]) R[k] = lerp(A[k], B[k], t);
    R.ik = A.ik && B.ik ? lerpV(A.ik, B.ik, t) : (A.ik || B.ik);
    R.rel = A.rel && B.rel ? lerpV(A.rel, B.rel, t) : (A.rel || B.rel);
    R.anchor = A.anchor;
    // feet planted on different points (heel strike -> toe) blend through the ankle position
    if (L[0] === "l" && A.ik && B.ik && A.anchor !== B.anchor) R.ankleT = lerpV(footAnkle(A), footAnkle(B), t);
    R.footPitch = A.footPitch != null && B.footPitch != null ? lerp(A.footPitch, B.footPitch, t) : (A.footPitch != null ? A.footPitch : B.footPitch);
  }
  return r;
}

/* Two-bone IK in the limb plane. The plane is the parent frame after abduction; abduction is
   chosen so that the target lies in it. s = -1 for legs (knee), +1 for arms (elbow).
   Returns {flex, abd, bend} in degrees. */
function solveTwoBone(parentR, base, target, l1, l2, side, s) {
  const loc = mtv(parentR, sub(target, base));
  // abduction: rotate the down direction outward (toward side*z) until the target is in plane
  // Exact in-plane abduction is ill-conditioned when the target lies along the limb's flexion
  // direction (e.g. hands reaching forward from a bent-over torso), so blend toward the plain
  // lateral angle there. The small out-of-plane residual is dropped (it only shifts depth).
  const dist = len(loc) || 1e-9;
  const cDown = Math.max(0, Math.min(1, -loc[1] / dist)) ** 2;
  const abdExact = Math.atan2(side * loc[2], -loc[1]);
  const abdLat = Math.asin(Math.max(-1, Math.min(1, side * loc[2] / dist)));
  const abd = cDown * abdExact + (1 - cDown) * abdLat;
  const Fp = Rx(-side * abd);
  const p = mtv(Fp, loc); // in plane: p[2] ~ 0
  let d = Math.hypot(p[0], p[1]);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-6), l1 + l2 - 1e-9);
  const ck = (d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  const k = Math.acos(Math.max(-1, Math.min(1, ck)));
  const phi = Math.atan2(p[0], -p[1]);
  const th1 = phi - s * Math.atan2(l2 * Math.sin(k), l1 + l2 * Math.cos(k));
  let flex = th1 * R2D;
  while (flex > 180) flex -= 360;
  while (flex <= -180) flex += 360;
  return { flex, abd: abd * R2D, bend: k * R2D };
}

/* Ankle angle that gives the foot a world pitch (deg) — foot forward = facing direction. */
function ankleForPitch(shinR, pitchDeg, facing) {
  const c0 = shinR[3], c1 = shinR[4]; // y components of columns 0 and 1
  const Rm = Math.hypot(c0, c1) || 1e-9;
  const sp = Math.max(-Rm, Math.min(Rm, Math.sin(pitchDeg * D2R)));
  const delta = Math.atan2(c0, c1);
  const a1 = Math.asin(sp / Rm) - delta, a2 = Math.PI - Math.asin(sp / Rm) - delta;
  const fwd = a => dot(mv(shinR, [Math.cos(a), Math.sin(a), 0]), facing);
  let a = fwd(a1) >= fwd(a2) ? a1 : a2;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a * R2D;
}

/* Toe-tip contact point -> ankle position for a given foot world pitch (side-view plane). */
function ankleFromToe(toe, pitchDeg, yawRad) {
  const p = pitchDeg * D2R;
  const f = [Math.cos(p), Math.sin(p), 0], n = [-Math.sin(p), Math.cos(p), 0];
  let off = sub(mul(f, BODY.toeFwd), mul(n, BODY.ankleH));
  off = mv(Ry(yawRad || 0), off);
  return sub(toe, off);
}

/* Heel contact point -> ankle position. */
function ankleFromHeel(heel, pitchDeg, yawRad) {
  const p = pitchDeg * D2R;
  const f = [Math.cos(p), Math.sin(p), 0], n = [-Math.sin(p), Math.cos(p), 0];
  const off = mv(Ry(yawRad || 0), add(mul(n, BODY.ankleH), mul(f, BODY.heelBack)));
  return add(heel, off);
}
function footAnkle(Lg, yawRad) {
  return Lg.anchor === "heel" ? ankleFromHeel(Lg.ik, Lg.footPitch || 0, yawRad) : ankleFromToe(Lg.ik, Lg.footPitch || 0, yawRad);
}

/* End point of a two-bone limb from its angles (s = -1 legs, +1 arms). */
function chainEnd(parentR, base, abd, flex, bend, rot, l1, l2, side, s) {
  const R1 = mm(mm(mm(parentR, Rx(-side * abd * D2R)), Rz(flex * D2R)), Ry(side * (rot || 0) * D2R));
  const mid = add(base, mv(R1, [0, -l1, 0]));
  return add(mid, mv(mm(R1, Rz(s * bend * D2R)), [0, -l2, 0]));
}

/* ---------- forward kinematics ---------- */
function fk(pose, solved) {
  const B = BODY, J = {};
  const P = mm(mm(Ry(pose.root.yaw * D2R), Rz(pose.root.pitch * D2R)), Rx(pose.root.roll * D2R));
  const pelvis = [pose.root.x, pose.root.y, pose.root.z || 0];
  const Lr = mm(mm(P, Rz(-pose.lumbar * D2R)), mm(Ry(pose.twistL * D2R), Rx(-pose.side * D2R)));
  const mid = add(pelvis, mv(Lr, [0, B.lumbar, 0]));
  const Tr = mm(mm(Lr, Rz(-pose.thoracic * D2R)), Ry(pose.twistT * D2R));
  const neck = add(mid, mv(Tr, [0, B.thoracic, 0]));
  const Hr = mm(mm(Tr, Rz(-pose.neck * D2R)), Ry(pose.headYaw * D2R));
  const head = add(neck, mv(Hr, [0, B.neck + B.headR * 0.75, 0]));
  Object.assign(J, { pelvis, mid, neck, head, P, Lr, Tr, Hr });
  const facing = mv(Ry(pose.root.yaw * D2R), [1, 0, 0]);
  const ang = solved || {};
  for (const sideName of ["R", "L"]) {
    const side = sideName === "R" ? 1 : -1;
    // arm
    const A = pose["arm" + sideName];
    const sh = add(neck, mv(Tr, [0, -B.shoulderDrop, side * B.shoulderW]));
    let flex = A.flex, abd = A.abd, bend = A.bend;
    const armTarget = A.rel ? add(pelvis, mv(P, A.rel)) : A.ik;
    if (armTarget && A.ikW > 0) {
      // blend in position space: aim at a point between the FK hand and the target, then solve
      const tgt = A.ikW >= 1 ? armTarget : lerpV(chainEnd(Tr, sh, abd, flex, bend, A.rot, B.upperArm, B.forearm, side, +1), armTarget, A.ikW);
      const s = solveTwoBone(Tr, sh, tgt, B.upperArm, B.forearm, side, +1);
      flex = s.flex; abd = s.abd; bend = s.bend;
    }
    const A1 = mm(mm(mm(Tr, Rx(-side * abd * D2R)), Rz(flex * D2R)), Ry(side * (A.rot || 0) * D2R));
    const el = add(sh, mv(A1, [0, -B.upperArm, 0]));
    const A2 = mm(A1, Rz(bend * D2R));
    const wr = add(el, mv(A2, [0, -B.forearm, 0]));
    J["shoulder" + sideName] = sh; J["elbow" + sideName] = el; J["wrist" + sideName] = wr;
    J["upperArmR" + sideName] = A1; J["forearmR" + sideName] = A2;
    ang["arm" + sideName] = { flex, abd, bend, rot: A.rot || 0 };
    // leg
    const Lg = pose["leg" + sideName];
    const hip = add(pelvis, mv(P, [0, 0, side * B.hipW]));
    let lf = Lg.flex, la = Lg.abd, lb = Lg.bend;
    if (Lg.ik && Lg.ikW > 0) {
      const anTarget = Lg.ankleT || footAnkle(Lg, pose.root.yaw * D2R);
      // blend in position space (a lifting foot travels between the floor point and the FK foot)
      const tgt = Lg.ikW >= 1 ? anTarget : lerpV(chainEnd(P, hip, la, lf, lb, Lg.rot, B.thigh, B.shin, side, -1), anTarget, Lg.ikW);
      const s = solveTwoBone(P, hip, tgt, B.thigh, B.shin, side, -1);
      lf = s.flex; la = s.abd; lb = s.bend;
    }
    const L1 = mm(mm(mm(P, Rx(-side * la * D2R)), Rz(lf * D2R)), Ry(side * (Lg.rot || 0) * D2R));
    const kn = add(hip, mv(L1, [0, -B.thigh, 0]));
    const L2 = mm(L1, Rz(-lb * D2R));
    const an = add(kn, mv(L2, [0, -B.shin, 0]));
    let ankle = Lg.ankle;
    const F = mm(L2, Rz(ankle * D2R));
    let f = mv(F, [1, 0, 0]), n = mv(F, [0, 1, 0]);
    if (Lg.footPitch != null && Lg.footW > 0) {
      // a planted/aimed foot keeps its own world orientation (no toe-in from leg rotation)
      const p = Lg.footPitch * D2R, Y = Ry(pose.root.yaw * D2R);
      const fw = mv(Y, [Math.cos(p), Math.sin(p), 0]), nw = mv(Y, [-Math.sin(p), Math.cos(p), 0]);
      f = norm(lerpV(f, fw, Lg.footW)); n = norm(lerpV(n, nw, Lg.footW));
    }
    // reported ankle angle: dorsiflexion = 90 deg minus the angle between foot and shin
    const shinUp = norm(sub(kn, an));
    ankle = 90 - Math.acos(Math.max(-1, Math.min(1, dot(f, shinUp)))) * R2D;
    const sole = sub(an, mul(n, B.ankleH));
    J["hip" + sideName] = hip; J["knee" + sideName] = kn; J["ankle" + sideName] = an;
    J["toe" + sideName] = add(sole, mul(f, B.toeFwd));
    J["heel" + sideName] = sub(sole, mul(f, B.heelBack));
    J["footF" + sideName] = f; J["footN" + sideName] = n;
    ang["leg" + sideName] = { flex: lf, abd: la, bend: lb, ankle, rot: Lg.rot || 0 };
  }
  ang.spine = { lumbar: pose.lumbar, thoracic: pose.thoracic, twist: pose.twistL + pose.twistT, neck: pose.neck, headYaw: pose.headYaw, side: pose.side };
  J.angles = ang;
  return J;
}

/* Full solve for one interpolated pose: root anchoring, then FK with IK. */
function solvePose(pose) {
  if (pose.rootFrom && pose.rootFromW > 0) {
    // anchor uses the limb angles as given (FK) — anchored effectors must not be IK-driven
    const probe = JSON.parse(JSON.stringify(pose));
    probe.root.x = 0; probe.root.y = 0;
    probe.legL.ikW = 0; probe.legR.ikW = 0;
    const J0 = fk(probe);
    const e = J0[pose.rootFrom.eff];
    const ax = pose.rootFrom.at[0] == null ? pose.root.x : pose.rootFrom.at[0] - e[0];
    const ay = pose.rootFrom.at[1] - e[1];
    pose = Object.assign({}, pose, { root: Object.assign({}, pose.root, { x: lerp(pose.root.x, ax, pose.rootFromW), y: lerp(pose.root.y, ay, pose.rootFromW) }) });
  }
  const J = fk(pose);
  J.pose = pose;
  return J;
}

/* ---------- exercise timeline ---------- */
function buildTimeline(ex) {
  const keys = ex.keys.map(k => ({ t: k.t, ease: k.ease || ex.ease || "inOut", pose: null, spec: k }));
  // resolve "same" references and inheritance: each key inherits the previous key's spec
  let prev = {};
  for (const k of keys) {
    // "same": n copies key n's full (merged) pose; otherwise a key inherits the previous one
    const merged = k.spec.same != null ? deepMerge(keys[k.spec.same].full, stripMeta(k.spec))
      : deepMerge(k.spec.inherit === false ? {} : prev, stripMeta(k.spec));
    k.full = merged; prev = merged;
    k.pose = normPose(merged);
  }
  fillTargets(keys.map(k => k.pose));
  return keys;
}
function stripMeta(s) { const o = Object.assign({}, s); delete o.t; delete o.ease; delete o.same; delete o.inherit; return o; }
function deepMerge(a, b) {
  const out = Array.isArray(a) ? a.slice() : Object.assign({}, a);
  for (const k of Object.keys(b)) {
    const bv = b[k];
    if (k !== "foot" && k !== "rootFrom" && bv && typeof bv === "object" && !Array.isArray(bv) && a && typeof a[k] === "object" && a[k] && !Array.isArray(a[k])) out[k] = deepMerge(a[k], bv);
    else out[k] = bv;
  }
  return out;
}

/* Pose at time t (seconds) in a looping exercise. The last key must be at t = cycle length and
   is the loop's end; it is normally identical to key 0. */
function poseAt(ex, timeline, t) {
  const cycle = ex.duration / (ex.cycles || 1);
  let tc = ((t % cycle) + cycle) % cycle;
  const ks = timeline;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (tc >= a.t && tc <= b.t) {
      const u = b.t > a.t ? (tc - a.t) / (b.t - a.t) : 0;
      return lerpPose(a.pose, b.pose, EASE[b.ease || "inOut"](u));
    }
  }
  return lerpPose(ks[ks.length - 1].pose, ks[ks.length - 1].pose, 0);
}

const POINT_KEYS = ["pelvis", "mid", "neck", "head", "shoulderR", "elbowR", "wristR", "hipR", "kneeR", "ankleR", "toeR", "heelR",
  "shoulderL", "elbowL", "wristL", "hipL", "kneeL", "ankleL", "toeL", "heelL"];
function travelShift(ex, t) {
  if (!ex.travel) return 0;
  const cycle = ex.duration / (ex.cycles || 1);
  return ex.travel * Math.floor(t / cycle + 1e-9);
}
/* camera x offset for a travelling exercise: follows the body at constant speed */
function cameraFollow(ex, t) {
  if (!ex.travel) return 0;
  return ex.travel * t / (ex.duration / (ex.cycles || 1));
}

function sampleFrames(ex, fps) {
  const timeline = buildTimeline(ex);
  const n = Math.round(ex.duration * fps);
  const frames = [];
  for (let i = 0; i <= n; i++) {
    const t = i / fps;
    const J = solvePose(poseAt(ex, timeline, t));
    // travelling exercises (walk, crawl): each completed cycle moves the body by ex.travel in x
    const shift = travelShift(ex, t);
    if (shift) for (const k of POINT_KEYS) J[k] = [J[k][0] + shift, J[k][1], J[k][2]];
    J.t = t;
    frames.push(J);
  }
  return { frames, n, timeline };
}

module.exports = { BODY, D2R, R2D, EASE, v, add, sub, mul, dot, len, mm, mv, mtv, Rx, Ry, Rz,
  defaultPose, normPose, lerpPose, travelShift, cameraFollow, POINT_KEYS, solveTwoBone, fk, solvePose, buildTimeline, poseAt, sampleFrames };
