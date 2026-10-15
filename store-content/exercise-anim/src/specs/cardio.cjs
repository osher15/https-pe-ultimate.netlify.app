"use strict";
/* Cardio exercises. */
const { STAND_Y, M, footR, footL, feet, freeArm, freeArms, freeLeg, hands, STAND } = require("./_h.cjs");

/* ---------- mountain climber ---------- */
const PLANK = { root: { x: -0.8, y: 43.9, pitch: -71.5 }, lumbar: 0, thoracic: 0, neck: -4 };
const BACK = -86, IN = -36;
// the driving foot hovers: it follows the shin (loose ankle) instead of a planted pitch
const hoverR = (x, y) => ({ legR: { foot: { toe: [x, 11], y, pitch: -45, loose: true, ankle: -20 } } });
const hoverL = (x, y) => ({ legL: { foot: { toe: [x, -11], y, pitch: -45, loose: true, ankle: -20 } } });
const climber = {
  id: "climber", name: "Mountain climber", duration: 2.0, cycles: 2, camera: { yaw: 0 }, still: 0,
  props: [{ type: "mat", x: [-100, 60] }],
  contacts: [{ eff: "wristR" }, { eff: "wristL" }],
  form: ["Straight-arm plank, hands planted under the shoulders", "Drive one knee toward the chest, then switch legs in a quick, even rhythm",
    "Hips stay low and level — the bottom does not rise", "Back flat, head in line"],
  doubts: ["Running (switch) version: the driving foot hovers instead of tapping the floor."],
  keys: [
    M({ t: 0, ease: "sine" }, PLANK, hands(35, 1.6, 18), hoverR(IN, 12), footL(BACK, -83.5, 1.6)),
    M({ t: 0.25, ease: "sine" }, hoverR(-64, 7), hoverL(-58, 9)),
    M({ t: 0.5, ease: "sine" }, hoverL(IN, 12), footR(BACK, -83.5, 1.6)),
    M({ t: 0.75, ease: "sine" }, hoverL(-64, 7), hoverR(-58, 9)),
    { t: 1.0, ease: "sine", same: 0 }
  ]
};

/* ---------- running in place (high knees, butt kicks) ---------- */
function runInPlace(id, name, upLeg, armSwing, lift, form, doubts, maxStepCm = 32, C = 0.8) {
  const stance = 14, Y = 93;
  const armsR = (sgn) => ({ armR: freeArm(sgn * armSwing.flex, armSwing.elbow, 6), armL: freeArm(-sgn * armSwing.flex + armSwing.bias, armSwing.elbow, 6) });
  // a leaving foot first lifts off as a planted-style (IK) target, then swings freely (FK)
  const lifting = side => (side === "R" ? footR : footL)(lift.x, lift.pitch, lift.y);
  const k = (t, extra) => M({ t, ease: "sine" }, extra);
  return {
    id, name, duration: 2.4, cycles: Math.round(2.4 / C), camera: { yaw: 0 }, still: 0, maxStepCm, form, doubts,
    keys: [
      M(STAND, { t: 0, ease: "sine", root: { x: 1.6, y: Y, pitch: -3 } }, { legR: upLeg }, footL(stance, -25), armsR(-1)),
      k(C * 0.25, M({ root: { x: 1.6, y: Y - 2.5, pitch: -3 } }, footR(stance, -25), footL(stance, -25), armsR(0))),
      k(C * 0.36, M({ root: { x: 1.6, y: Y - 1, pitch: -3 } }, lifting("L"))),
      k(C * 0.5, M({ root: { x: 1.6, y: Y, pitch: -3 } }, { legL: upLeg }, armsR(1))),
      k(C * 0.75, M({ root: { x: 1.6, y: Y - 2.5, pitch: -3 } }, footL(stance, -25), footR(stance, -25), armsR(0))),
      k(C * 0.86, M({ root: { x: 1.6, y: Y - 1, pitch: -3 } }, lifting("R"))),
      { t: C, ease: "sine", same: 0 }
    ]
  };
}
const knees = runInPlace("knees", "High knees", freeLeg(92, 95, -25), { flex: 45, elbow: 90, bias: 10 }, { x: 12, y: 9, pitch: -60 },
  ["Run in place on the balls of the feet", "Drive each knee up to hip height (thigh about horizontal)",
    "Trunk tall — do not lean back", "Arms pump with the legs (opposite arm forward)"],
  ["Fast exercise: 2 steps per 0.8 s cycle; the GIF stores one cycle (2 steps)."]);
const buttkick = runInPlace("buttkick", "Butt kicks", freeLeg(8, 128, -30), { flex: 22, elbow: 70, bias: 0 }, { x: -10, y: 24, pitch: -70 },
  ["Run in place on the balls of the feet", "Kick the heel up to the buttock; the thigh stays pointing down",
    "Trunk upright, quick rhythm", "Arms relaxed and swinging lightly"],
  ["The GIF stores one cycle (2 steps).", "The heel flick is the fastest leg motion in the library (shown at a slower jog: one step every 0.6 s)."], 40, 1.2);

/* ---------- imaginary jump rope ---------- */
const skip = {
  id: "skip", name: "Jump rope (imaginary)", duration: 2.0, cycles: 4, camera: { yaw: 0 }, still: 0.125,
  held: [{ type: "rope", ghost: true, turns: 1, phase: 0.25, cy: 78, r: 90 }],
  form: ["Small, quick jumps on the balls of the feet — just high enough for the rope",
    "Elbows close to the ribs, the wrists turn the (imaginary) rope", "Quiet, soft landings with slightly bent knees", "Body tall, eyes forward"],
  doubts: ["The rope is imaginary in this exercise; it is drawn as a faint dashed line to show the wrist rhythm."],
  keys: [
    M(STAND, { t: 0, ease: "sine", root: { x: 1.6, y: 91.5 } }, feet(14, -22), { armR: freeArm(14, 72, 22), armL: freeArm(14, 72, 22) }),
    M({ t: 0.15, ease: "sine", root: { x: 1.6, y: 93.5 } }, { armR: freeArm(22, 62, 24), armL: freeArm(22, 62, 24) }),
    M({ t: 0.25, ease: "sine", root: { x: 1.6, y: 97.5 } }, feet(14, -30, 4), { armR: freeArm(16, 70, 26), armL: freeArm(16, 70, 26) }),
    M({ t: 0.35, ease: "sine", root: { x: 1.6, y: 93.5 } }, feet(14, -22), { armR: freeArm(8, 80, 24), armL: freeArm(8, 80, 24) }),
    { t: 0.5, ease: "sine", same: 0 }
  ]
};

/* ---------- skater jumps (front view) ---------- */
function skater() {
  const land = side => {
    const s = side === "L" ? -1 : 1;
    const plant = side === "L" ? footL(14, -8, 0, -30) : footR(14, -8, 0, 30);
    const trail = { [side === "L" ? "legR" : "legL"]: freeLeg(-18, 75, -25, -18) };
    return M({ root: { x: -4, y: 76, z: s * 24, pitch: -24 }, lumbar: 10, thoracic: 6, neck: -18 }, plant, trail,
      { [side === "L" ? "armR" : "armL"]: freeArm(55, 30, -18), [side === "L" ? "armL" : "armR"]: freeArm(-35, 20, 18) });
  };
  const fly = (to) => {
    const s = to === "R" ? 1 : -1;
    return M({ root: { x: -2, y: 98, z: s * 2, pitch: -12 }, lumbar: 4, thoracic: 2, neck: -8 },
      // reaching leg swings out toward the landing side; the push leg lifts off (IK) behind
      { [to === "R" ? "legR" : "legL"]: freeLeg(42, 48, 15, 14) }, to === "R" ? footL(-4, -55, 18, -22) : footR(-4, -55, 18, 22), freeArms(10, 25, 10));
  };
  const push = side => {
    const s = side === "L" ? -1 : 1;
    return M({ root: { x: -3, y: 84, z: s * 16, pitch: -16 }, lumbar: 6, thoracic: 4, neck: -12 }, side === "L" ? footL(14, -35, 0, -30) : footR(14, -35, 0, 30),
      { [side === "L" ? "legR" : "legL"]: freeLeg(4, 65, -20, 8) });
  };
  return {
    id: "skater", name: "Skater jumps", duration: 2.8, cycles: 2, camera: { yaw: -90, elev: 8 }, still: 0, maxStepCm: 40,
    order: ["legL", "legR", "torso", "armL", "armR", "head"],
    contacts: [{ eff: "toeL", from: 0, to: 0.22 }, { eff: "toeR", from: 0.7, to: 0.92 }],
    form: ["Bound sideways from one leg and land on the other", "Land softly on one foot with the knee bent over the toes, hips back, chest forward",
      "The free leg sweeps behind the landing leg for balance", "Arms swing across like a speed skater"],
    doubts: ["Front view; the forward lean of the trunk is foreshortened."],
    keys: [
      M({ t: 0, ease: "sine" }, STAND, land("L")),
      M({ t: 0.22, ease: "inOut" }, push("L")),
      M({ t: 0.45, ease: "sine" }, fly("R")),
      M({ t: 0.7, ease: "sine" }, land("R")),
      M({ t: 0.92, ease: "inOut" }, push("R")),
      M({ t: 1.15, ease: "sine" }, fly("L")),
      M({ t: 1.4, ease: "sine" }, land("L"))
    ]
  };
}

module.exports = [climber, knees, skip, buttkick, skater()];
