"use strict";
/* Body-weight strength exercises (and inchworm). */
const { STAND_Y, M, footR, footL, feet, freeArms, freeLeg, hands, handR, handL, STAND, breathHold, lerp } = require("./_h.cjs");

/* ---------- incline push-up: hands on a box ---------- */
const BOX_H = 45;
const pushincline = {
  id: "pushincline", name: "Incline push-up", duration: 2.4, camera: { yaw: 0 }, still: 1.05,
  props: [{ type: "box", x: [30, 78], y: [0, BOX_H], z: [-30, 30] }],
  contacts: [{ eff: "toeR" }, { eff: "toeL" }, { eff: "wristR" }, { eff: "wristL" }],
  form: ["Hands on the box edge, slightly wider than the shoulders, under the shoulders at the top",
    "Body one straight line from head to heels: it pivots on the toes, no sagging or piking hips",
    "Lower the chest to the box edge, elbows travelling back at about 45°",
    "Push back to straight arms; the higher the box, the easier"],
  keys: [
    M({ t: 0, root: { pitch: -48.5 }, rootFrom: { eff: "toeR", at: [-40, 0] }, lumbar: 0, thoracic: 0, neck: 0,
      legs: { flex: 0, abd: 2, knee: 0, ankle: 2 } }, hands(48, BOX_H, 19)),
    { t: 1.0, root: { pitch: -60 } },
    { t: 1.12 },
    { t: 2.0, same: 0 },
    { t: 2.4 }
  ]
};

/* ---------- wall sit ---------- */
const WALL_X = -44;
const wall = {
  id: "wall", name: "Wall sit", duration: 3.0, camera: { yaw: 0 }, still: 0, hold: true,
  props: [{ type: "wall", x: WALL_X, h: 200 }],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  doubts: ["Static hold: the stopwatch hand signals the hold; breathing is a slight chest rise."],
    form: ["Back flat against the wall from hips to head", "Thighs parallel to the floor, knees at about 90° above the ankles",
    "Feet flat, hip width, shins vertical", "Arms relaxed at the sides — not resting on the knees", "Hold and keep breathing"],
  keys: breathHold(3.0, M(STAND, { root: { x: WALL_X + 12 + 12.5, y: 48.5, pitch: 0 }, neck: 0 },
    freeArms(-4, 14, 10), feet(WALL_X + 24.5 + 42 + 16)))
};

/* ---------- step-up onto a box ---------- */
const STEP_H = 40, STEP_X = [22, 72];
const sx0 = -16; // standing toe x on the floor
const onBoxToe = 60;
const stepup = {
  id: "stepup", name: "Step-up", duration: 3.0, camera: { yaw: 0 }, still: 1.4,
  props: [{ type: "box", x: STEP_X, y: [0, STEP_H], z: [-30, 30] }],
  contacts: [{ eff: "toeR", from: 0.6, to: 2.3 }, { eff: "heelR", from: 0.6, to: 2.3 }, { eff: "toeL", from: 0, to: 0.62 }, { eff: "toeL", from: 2.25, to: 3.0 }],
  doubts: ["The same (right) leg leads every repetition; teachers usually alternate legs."],
    form: ["Whole foot on the box (heel too)", "Drive up through the leading leg — don't push off with the bottom foot",
    "Stand tall on the box, hips and knees fully extended", "Step down with control, the same leg leads up next time"],
  keys: [
    M(STAND, { t: 0, root: { x: sx0 - 14, y: STAND_Y } }, feet(sx0), freeArms(4, 14, 6)),
    M({ t: 0.35, ease: "inOut", root: { x: sx0 - 10, y: 87, pitch: -4 } }, footR(onBoxToe - 30, 10, STEP_H + 14)),
    M({ t: 0.6, ease: "out", root: { x: sx0 - 2, y: 84, pitch: -14 }, lumbar: 3 }, footR(onBoxToe, 0, STEP_H), footL(sx0, -10), freeArms(18, 20, 6)),
    M({ t: 1.05, ease: "inOut", root: { x: onBoxToe - 24, y: STEP_H + 82, pitch: -8 }, lumbar: 1 }, footL(sx0 + 14, -40, 12), freeArms(-10, 16, 6)),
    M({ t: 1.35, ease: "out", root: { x: onBoxToe - 14, y: STEP_H + STAND_Y, pitch: 0 }, lumbar: 0 }, footL(onBoxToe, 0, STEP_H), freeArms(4, 14, 6)),
    { t: 1.6 },
    M({ t: 1.95, ease: "inOut", root: { x: onBoxToe - 24, y: STEP_H + 74, pitch: -10 }, lumbar: 2 }, footL(sx0 + 18, -10, 14)),
    M({ t: 2.25, ease: "out", root: { x: sx0 + 2, y: 84, pitch: -8 } }, footL(sx0, 0)),
    M({ t: 2.6, ease: "inOut", root: { x: sx0 - 10, y: 87, pitch: -3 }, lumbar: 0 }, footR(onBoxToe - 30, 10, STEP_H + 14)),
    { t: 3.0, ease: "out", same: 0 }
  ]
};

/* ---------- bench dip ---------- */
const DIP_H = 45;
const dip = {
  id: "dip", name: "Bench dip", duration: 2.6, camera: { yaw: 0 }, still: 1.1,
  props: [{ type: "bench", x: [-75, -16], h: DIP_H, z: [-22, 22] }],
  contacts: [{ eff: "wristR" }, { eff: "wristL" }, { eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  doubts: ["At the bottom the upper arm is about 73° behind the trunk: normal for bench dips (the shoulder blade tilts), but at the edge of the model, which has no shoulder blade.", "Bent-knee (easier) version."],
    form: ["Hands on the bench edge, close to the body, fingers forward", "Feet flat, knees bent (easier) — further away is harder",
    "Lower straight down until the elbows reach about 90°", "Elbows point back, not out to the sides; shoulders stay away from the ears",
    "Push back up to straight arms"],
  keys: [
    M({ t: 0, root: { x: -1, y: 57, pitch: 2 }, lumbar: 0, thoracic: 0, neck: 0 }, hands(-21, DIP_H, 17), feet(66)),
    { t: 1.0, root: { x: 2, y: 40, pitch: -4 } },
    { t: 1.2 },
    { t: 2.2, same: 0 },
    { t: 2.6 }
  ]
};

/* ---------- pike push-up ---------- */
const pike = {
  id: "pike", name: "Pike push-up", duration: 2.6, camera: { yaw: 0 }, still: 1.1,
  props: [{ type: "mat", x: [-80, 70] }],
  contacts: [{ eff: "wristR" }, { eff: "wristL" }, { eff: "toeR" }, { eff: "toeL" }],
  doubts: ["Heels are up; with tight hamstrings the knees may bend a little in real life."],
    form: ["Hips high — the body makes an upside-down V", "Hands shoulder width, feet hip width, legs as straight as possible",
    "Bend the elbows and lower the top of the head toward the floor between the hands", "Push back up; the hips stay high (it is not a push-up)"],
  keys: [
    M({ t: 0, root: { x: 3, y: 80, pitch: -132 }, lumbar: 4, thoracic: 2, neck: 20 }, hands(36, 1.6, 18), feet(-52, -48, 1.6)),
    { t: 1.0, root: { x: 9, y: 73, pitch: -150 }, neck: 24 },
    { t: 1.2 },
    { t: 2.2, same: 0 },
    { t: 2.6 }
  ]
};

/* ---------- calf raise ---------- */
const calf = {
  id: "calf", name: "Calf raise", duration: 2.8, camera: { yaw: 0 }, still: 1.1,
  contacts: [{ eff: "toeR" }, { eff: "toeL" }],
  form: ["Stand tall, feet hip width, weight over the balls of the feet", "Rise slowly as high as possible onto the toes",
    "Hold one second at the top", "Lower with control — no bouncing or jumping"],
  keys: [
    M(STAND, { t: 0 }, freeArms(0, 12, 8)),
    M({ t: 0.9, ease: "inOut", root: { x: 7.4, y: STAND_Y + 8.6 } }, feet(14, -36)),
    { t: 1.6 },
    M({ t: 2.4, ease: "inOut", root: { x: 0, y: STAND_Y } }, feet(14, 0)),
    { t: 2.8 }
  ]
};

/* ---------- bear crawl (travels forward; camera follows) ---------- */
function bearcrawl() {
  const T = 32, C = 1.2, RY = 55, PITCH = -89;
  const HX = 40, FX = -44;               // hand / toe base x relative to the pelvis
  const key = (t, u, rA, rB, liftA, liftB) => {
    // u: 0..1 root progress in the cycle; rA/rB: offsets of the diagonal pairs (A = right hand + left foot)
    const x = T * u;
    return M({ t, ease: "linear", root: { x, y: RY + (liftA || liftB ? 1 : 0), pitch: PITCH } },
      handR(HX + rA, liftA ? 6 : 0, 17), footL(FX + rA, -76, liftA ? 6 : 0), handL(HX + rB, liftB ? 6 : 0, 17), footR(FX + rB, -76, liftB ? 6 : 0));
  };
  return {
    id: "bearcrawl", name: "Bear crawl", duration: 2.4, cycles: 2, travel: T, camera: { yaw: 0 }, still: 0.33,
    contacts: [{ eff: "wristR", from: 0, to: 0.58 }, { eff: "toeL", from: 0, to: 0.58 }, { eff: "wristL", from: 0.62, to: 1.18 }, { eff: "toeR", from: 0.62, to: 1.18 }],
    doubts: ["Travels forward: the camera follows and floor marks scroll; the GIF repeats seamlessly."],
    form: ["Hands under the shoulders, knees under the hips, knees hovering just off the floor", "Back flat like a table, head in line",
      "Opposite hand and foot move together (right hand with left foot)", "Small steps, hips stay low and level"],
    keys: [
      M(key(0, 0, T / 4, -T / 4), { lumbar: 0, thoracic: 0, neck: -12 }),
      key(C * 0.25, 0.25, 0, 0, false, true),
      key(C * 0.5, 0.5, -T / 4, T / 4),
      key(C * 0.75, 0.75, 0, 0, true, false),
      key(C, 1, T / 4, -T / 4)
    ].map((k, i) => {
      // absolute positions: add the root progress to every target
      const x = k.root.x;
      for (const L of ["armR", "armL"]) if (k[L]) k[L].ik[0] += x;
      for (const L of ["legR", "legL"]) if (k[L]) k[L].foot.toe[0] += x;
      return k;
    })
  };
}

/* ---------- single-leg deadlift (body weight) ---------- */
const singleleg = {
  id: "singleleg", name: "Single-leg deadlift", duration: 3.0, camera: { yaw: 0 }, still: 1.3,
  contacts: [{ eff: "toeL" }, { eff: "heelL" }],
  doubts: ["Right leg lifts only; arms hang toward the floor (one common variant)."],
    form: ["Stand on one leg, its knee slightly bent", "Hinge at the hip: the chest and the free leg move together like a see-saw plank",
    "Back flat, hips square to the floor, arms reach toward the floor", "Go until the body is about horizontal, then return to standing"],
  keys: [
    M(STAND, { t: 0 }, freeArms(0, 10, 8)),
    M({ t: 0.35, ease: "inOut", root: { x: -2, y: STAND_Y - 1, pitch: -6 } }, footR(2, -30, 9)),
    M({ t: 0.75, ease: "inOut", root: { x: -10, y: 85, pitch: -45 }, neck: -6 }, footR(-34, -50, 28), freeArms(40, 8, 8)),
    M({ t: 1.2, ease: "inOut", root: { x: -16, y: 82, pitch: -82 }, neck: -10 }, { legR: freeLeg(4, 4, -20) }, freeArms(78, 6, 8)),
    { t: 1.5 },
    M({ t: 2.0, ease: "inOut", root: { x: -10, y: 85, pitch: -45 }, neck: -6 }, footR(-34, -50, 28), freeArms(40, 8, 8)),
    M({ t: 2.4, ease: "inOut", root: { x: -2, y: STAND_Y - 1, pitch: -6 }, neck: 0 }, footR(2, -30, 9), freeArms(0, 10, 8)),
    { t: 2.75, ease: "inOut", same: 0 },
    { t: 3.0 }
  ]
};

/* ---------- inchworm (travels forward; camera follows) ---------- */
function inchworm() {
  const toe0 = 14, H0 = 26, H1 = 135, TRAVEL = H1 - H0;
  const FOLD = (dx) => ({ root: { x: -4 + dx, y: 84, pitch: -112 }, lumbar: 28, thoracic: 22, neck: 10 });
  const PLANK = { root: { x: 96.8, y: 43.9, pitch: -71.5 }, lumbar: 0, thoracic: 0, neck: -4 };
  // hips stay high while the hands or feet walk (a smooth bump on top of the straight blend)
  const lerpRoot = (a, b, u, bump = 0) => ({ root: { x: lerp(a.root.x, b.root.x, u), y: lerp(a.root.y, b.root.y, u) + bump * Math.sin(Math.PI * u), pitch: lerp(a.root.pitch, b.root.pitch, u) },
    lumbar: lerp(a.lumbar, b.lumbar, u), thoracic: lerp(a.thoracic, b.thoracic, u), neck: lerp(a.neck, b.neck, u) });
  const keys = [], contacts = [{ eff: "toeR", from: 0, to: 1.3 }, { eff: "toeL", from: 0, to: 1.3 }];
  keys.push(M(STAND, { t: 0 }, feet(toe0)));
  keys.push(M({ t: 0.62, ease: "sine" }, FOLD(0), hands(H0, 0, 17)));
  // hands walk out: right, left, right, left
  let hr = H0, hl = H0, t = 0.62;
  const step = (H1 - H0) / 2, NS = 4, HS = 0.15;
  for (let i = 0; i < NS; i++) {
    const right = i % 2 === 0;
    const u0 = i / NS, u1 = (i + 1) / NS;
    const from = right ? hr : hl, to = Math.min(H1, from + step);
    const mid = lerpRoot(FOLD(0), PLANK, (u0 + u1) / 2, -8), end = lerpRoot(FOLD(0), PLANK, u1, -8);
    keys.push(M({ t: +(t + HS / 2).toFixed(3), ease: "sine" }, mid, feet(toe0, -84 * Math.cbrt((u0 + u1) / 2)), right ? handR((from + to) / 2, 6, 17) : handL((from + to) / 2, 6, 17)));
    keys.push(M({ t: +(t + HS).toFixed(3), ease: "sine" }, end, feet(toe0, -84 * Math.cbrt(u1)), right ? handR(to, 0, 17) : handL(to, 0, 17)));
    contacts.push({ eff: right ? "wristL" : "wristR", from: t, to: +(t + HS).toFixed(3) });
    if (right) hr = to; else hl = to;
    t += HS;
  }
  keys.push(M({ t: +(t + 0.14).toFixed(3) }, PLANK, feet(toe0, -80)));
  t += 0.14;
  // feet walk in: R, L, R, L
  let fr = toe0, fl = toe0;
  const toe1 = toe0 + TRAVEL, fstep = (toe1 - toe0) / 2, FS = 0.18;
  const FOLD2 = FOLD(TRAVEL);
  for (let i = 0; i < 4; i++) {
    const right = i % 2 === 0;
    const u0 = i / 4, u1 = (i + 1) / 4;
    const from = right ? fr : fl, to = from + fstep;
    // the hips can only follow the rear foot: progress after steps 1..4 = 0, .5, .5, 1
    const prog = [0, 0.5, 0.5, 1], pm0 = [0, 0.25, 0.5, 0.75];
    const mid = lerpRoot(PLANK, FOLD2, pm0[i], 6), end = lerpRoot(PLANK, FOLD2, prog[i], 6);
    const pitch = lerp(-80, 0, prog[i]), pm = lerp(-80, 0, pm0[i]);
    const other = right ? footL(fl, pm) : footR(fr, pm), other2 = right ? footL(fl, pitch) : footR(fr, pitch);
    keys.push(M({ t: +(t + FS / 2).toFixed(3), ease: "sine" }, mid, other, right ? footR((from + to) / 2, pm, 3) : footL((from + to) / 2, pm, 3)));
    keys.push(M({ t: +(t + FS).toFixed(3), ease: "sine" }, end, other2, right ? footR(to, pitch) : footL(to, pitch)));
    contacts.push({ eff: right ? "toeL" : "toeR", from: t, to: +(t + FS).toFixed(3) });
    if (right) fr = to; else fl = to;
    t += FS;
  }
  keys.push(M({ t: +(t + 0.55).toFixed(3), ease: "sine", root: { x: TRAVEL, y: STAND_Y, pitch: -30 }, lumbar: 6, thoracic: 4, neck: 0 }, freeArms(40, 12, 6), feet(toe1)));
  keys.push(M(STAND, { t: 3.0, ease: "inOut", root: { x: TRAVEL, y: STAND_Y, pitch: 0 } }, feet(toe1)));
  // first key's feet pitch for the plank phase: toes tucked
  return {
    id: "inchworm", name: "Inchworm", duration: 3.0, travel: TRAVEL, camera: { yaw: 0 }, still: 1.35,
    contacts,
    doubts: ["A real inchworm is slower than 3 s; here it is compressed (4 hand steps, 4 foot steps).", "Knees bend a little in the fold so the hands reach the floor."],
    form: ["From standing, hinge and walk the hands to the floor (knees may bend a little)",
      "Walk the hands out to a straight-arm plank, body in one line", "Walk the feet in toward the hands with small steps, legs as straight as possible",
      "Roll up to standing and repeat — the body travels forward"],
    keys
  };
}

module.exports = [pushincline, wall, stepup, dip, pike, calf, bearcrawl(), singleleg, inchworm()];
