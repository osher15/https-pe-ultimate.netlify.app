"use strict";
/* Core exercises. Lying positions: supine root pitch +90 (head toward -x), prone -90 (head toward +x). */
const { M, footR, footL, feet, freeArm, freeArms, freeLeg, hands, handR, handL, breathHold, STAND } = require("./_h.cjs");

const MAT = { type: "mat", x: [-95, 90] };
const SUP = { root: { x: 0, y: 13.6, pitch: 90, z: 0, yaw: 0, roll: 0 }, lumbar: 0, thoracic: 0, neck: -10, twistL: 0, twistT: 0, headYaw: 0, side: 0, breath: 0 };

/* ---------- sit-up ---------- */
const situp = {
  id: "situp", name: "Sit-up", duration: 2.8, camera: { yaw: 0 }, still: 1.2,
  props: [MAT],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Lying on the back, knees bent, feet flat on the floor", "Arms crossed on the chest — no pulling on the head or neck",
    "Curl up with control: head and shoulders first, then the trunk, up to sitting", "Lower back down slowly, without throwing the body"],
  doubts: ["Full sit-up to upright; feet are not held, so a teacher may prefer the shorter crunch."],
  keys: [
    M({ t: 0 }, SUP, { armR: freeArm(60, 135, -38), armL: freeArm(60, 135, -38) }, feet(60, 0, 1.6)),
    { t: 0.45, ease: "sine", root: { pitch: 80 }, thoracic: 26, lumbar: 6, neck: 16 },
    { t: 1.1, ease: "sine", root: { pitch: 30 }, thoracic: 10, lumbar: 6, neck: 8 },
    { t: 1.35 },
    { t: 2.05, ease: "sine", root: { pitch: 80 }, thoracic: 26, lumbar: 6, neck: 16 },
    { t: 2.5, ease: "sine", same: 0 },
    { t: 2.8 }
  ]
};

/* ---------- hollow hold ---------- */
const hollow = {
  id: "hollow", name: "Hollow hold", duration: 3.0, camera: { yaw: 0 }, still: 0, hold: true,
  props: [MAT],
  form: ["Lower back pressed into the floor (pelvis tucked)", "Shoulders and legs lifted a little off the floor, arms reaching past the head",
    "Legs straight and together, toes pointed — the body makes a shallow banana", "Hold and keep breathing quietly"],
  doubts: ["Arms-overhead (harder) version; beginners bend the knees or keep the arms by the sides."],
  keys: breathHold(3.0, M(SUP, { root: { x: 0, y: 13.6, pitch: 93 }, lumbar: 8, thoracic: 14, neck: 12 },
    freeArms(168, 4, 8), { legR: freeLeg(20, 0, -40, 1), legL: freeLeg(20, 0, -40, 1) }))
};

/* ---------- superman ---------- */
const PRONE = { root: { x: 0, y: 12.5, pitch: -90, z: 0 }, lumbar: 0, thoracic: 0, neck: -4, twistL: 0, twistT: 0, headYaw: 0, side: 0 };
const superman = {
  id: "superman", name: "Superman", duration: 2.8, camera: { yaw: 0 }, still: 1.2,
  props: [MAT],
  contacts: [{ eff: "pelvis" }],
  form: ["Lying face down, arms stretched forward, legs straight", "Lift the arms, chest and legs together a few centimetres off the floor",
    "Hold for a moment at the top", "Neck long — eyes to the floor, no cranking the head up; lower slowly"],
  doubts: [],
  keys: [
    M({ t: 0 }, PRONE, freeArms(172, 4, 10), { legR: freeLeg(0, 0, -52, 3), legL: freeLeg(0, 0, -52, 3) }),
    M({ t: 0.8, ease: "sine", lumbar: -10, thoracic: -10, neck: -6 }, freeArms(180, 2, 10), { legR: freeLeg(-14, 0, -52, 3), legL: freeLeg(-14, 0, -52, 3) }),
    { t: 1.5 },
    { t: 2.3, ease: "sine", same: 0 },
    { t: 2.8 }
  ]
};

/* ---------- dead bug ---------- */
const TABLE = { flex: 90, knee: 90, ankle: -15, abd: 3 };
const deadbug = {
  id: "deadbug", name: "Dead bug", duration: 2.8, camera: { yaw: -28, elev: 22 }, still: 0.7,
  props: [{ type: "mat", x: [-95, 90], z: [-35, 35] }],
  order: ["armL", "legL", "torso", "head", "legR", "armR"],
  contacts: [{ eff: "pelvis" }],
  form: ["Lying on the back, arms pointing to the ceiling, hips and knees at 90° (table-top)",
    "Lower back stays pressed to the floor the whole time", "Slowly lower one arm overhead and the opposite leg toward the floor together, then return",
    "Switch sides; breathe out as the limbs lower"],
  doubts: [],
  keys: [
    M({ t: 0 }, SUP, freeArms(92, 4, 8), { legR: freeLeg(TABLE.flex, TABLE.knee, TABLE.ankle, TABLE.abd), legL: freeLeg(TABLE.flex, TABLE.knee, TABLE.ankle, TABLE.abd) }),
    M({ t: 0.7, ease: "sine" }, { armR: freeArm(172, 4, 8), legL: freeLeg(14, 4, -30, 3) }),
    M({ t: 1.4, ease: "sine" }, { armR: freeArm(92, 4, 8), legL: freeLeg(TABLE.flex, TABLE.knee, TABLE.ankle, TABLE.abd) }),
    M({ t: 2.1, ease: "sine" }, { armL: freeArm(172, 4, 8), legR: freeLeg(14, 4, -30, 3) }),
    M({ t: 2.8, ease: "sine" }, { armL: freeArm(92, 4, 8), legR: freeLeg(TABLE.flex, TABLE.knee, TABLE.ankle, TABLE.abd) })
  ]
};

/* ---------- bird dog ---------- */
const QUAD = { root: { x: 0, y: 48, pitch: -77, z: 0 }, lumbar: 0, thoracic: 0, neck: -12, twistL: 0, twistT: 0, headYaw: 0, side: 0 };
const kneeLeg = freeLeg(77, 90, -55, 2);       // thigh vertical, shin flat on the floor behind
const reachLeg = freeLeg(-13, 0, -30, 2);       // in line with the back
const birddog = {
  id: "birddog", name: "Bird dog", duration: 2.8, camera: { yaw: 0 }, still: 0.8,
  props: [{ type: "mat", x: [-80, 80] }],
  contacts: [{ eff: "kneeR", from: 0, to: 1.4 }, { eff: "wristL", from: 0, to: 1.4 }, { eff: "kneeL", from: 1.4, to: 2.8 }, { eff: "wristR", from: 1.4, to: 2.8 }],
  form: ["On hands and knees: hands under the shoulders, knees under the hips, back flat", "Reach one arm forward and the opposite leg back at the same time, to body height",
    "Hips and back stay level and still — no twisting or arching", "Hold briefly, return, then the other side"],
  doubts: [],
  keys: [
    M({ t: 0 }, QUAD, hands(40, 1.6, 17), { legR: kneeLeg, legL: kneeLeg }),
    M({ t: 0.6, ease: "sine" }, { armR: freeArm(178, 2, 6) }, { legL: reachLeg }),
    { t: 1.0 },
    M({ t: 1.4, ease: "sine" }, handR(40, 1.6, 17), { legL: kneeLeg }),
    M({ t: 2.0, ease: "sine" }, { armL: freeArm(178, 2, 6) }, { legR: reachLeg }),
    { t: 2.4 },
    M({ t: 2.8, ease: "sine" }, handL(40, 1.6, 17), { legR: kneeLeg })
  ]
};

/* ---------- bicycle crunch ---------- */
const bike = (side) => {
  const s = side === "R" ? 1 : -1; // R: right knee in, left elbow to it (trunk turns right)
  return M({ twistT: -s * 24, twistL: -s * 6, headYaw: -s * 8 },
    { [side === "R" ? "legR" : "legL"]: freeLeg(112, 105, -25, 4), [side === "R" ? "legL" : "legR"]: freeLeg(42, 6, -30, 3) });
};
const bicycle = {
  id: "bicycle", name: "Bicycle crunch", duration: 2.4, cycles: 2, camera: { yaw: -35, elev: 24 }, still: 0,
  props: [{ type: "mat", x: [-95, 90], z: [-35, 35] }],
  order: ["armL", "legL", "torso", "head", "legR", "armR"],
  contacts: [{ eff: "pelvis" }],
  form: ["Lying on the back, hands lightly behind the head, shoulders off the floor", "Bring one knee in while the opposite elbow turns toward it",
    "The other leg straightens out low above the floor; then switch, like pedalling", "Lower back stays on the floor; slow and controlled, no pulling on the neck"],
  doubts: ["Elevated ¾ view so the trunk rotation is visible."],
  keys: [
    M({ t: 0, ease: "sine" }, SUP, { thoracic: 26, lumbar: 4, neck: 18 }, { armR: freeArm(150, 140, 62), armL: freeArm(150, 140, 62) }, bike("R")),
    M({ t: 0.6, ease: "sine" }, bike("L")),
    M({ t: 1.2, ease: "sine" }, bike("R"))
  ]
};

/* ---------- side plank (front view) ---------- */
const splank = {
  id: "splank", name: "Side plank", duration: 3.0, camera: { yaw: -90, elev: 6 }, still: 0, hold: true,
  props: [{ type: "mat", x: [-40, 40], z: [-100, 90] }],
  order: ["legR", "armR", "torso", "head", "legL", "armL"],
  contacts: [{ eff: "elbowR" }, { eff: "toeR" }, { eff: "heelR" }],
  form: ["Lying on one side, elbow directly under the shoulder, forearm on the floor", "Lift the hips so the body is one straight line from head to feet",
    "Hips do not sag and do not push back", "Feet stacked, top hand on the hip; hold and breathe"],
  doubts: ["Front view: the body is seen face-on, lying across the picture."],
  keys: breathHold(3.0, M({ root: { x: 0, y: 0, pitch: 0, roll: 74, z: 0 }, rootFrom: { eff: "elbowR", at: [null, 5.9] }, lumbar: 0, thoracic: 0, neck: 4,
    twistL: 0, twistT: 0, headYaw: 0, side: 0 },
  { armR: freeArm(0, 90, 88), armL: { ik: null, rel: [2, 4, -20] } },
  { legR: freeLeg(0, 0, 0, 2), legL: freeLeg(0, 0, 0, -2) }))
};

module.exports = [splank, situp, bicycle, superman, deadbug, birddog, hollow];
