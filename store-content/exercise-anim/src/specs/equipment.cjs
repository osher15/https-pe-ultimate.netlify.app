"use strict";
/* Exercises with equipment: dumbbells, kettlebell, band, pull-up bar, bench. */
const { STAND_Y, M, footR, footL, feet, heelR, heelL, freeArm, freeArms, freeLeg, hands, STAND } = require("./_h.cjs");

const DB = [{ type: "db" }];

/* ---------- goblet squat ---------- */
const GOB = { armR: freeArm(12, 128, -12), armL: freeArm(12, 128, -12) };
const gsquat = {
  id: "gsquat", name: "Goblet squat", duration: 2.8, camera: { yaw: 0 }, still: 1.3, held: [{ type: "gdb" }],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Hold one dumbbell vertically against the chest", "Feet shoulder width, heels down; sit down between the heels",
    "Chest up and back straight the whole time — the weight helps you stay upright", "At the bottom the elbows sit inside the knees; drive up to standing"],
  doubts: ["Side view hides the elbows-inside-knees cue."],
  keys: [
    M(STAND, { t: 0 }, GOB, feet(14, 0, 0, 14)),
    { t: 1.2, ease: "inOut", root: { x: -17, y: 43, pitch: -24 }, lumbar: 2, thoracic: 2, neck: -8 },
    { t: 1.45 },
    { t: 2.45, ease: "inOut", same: 0 },
    { t: 2.8 }
  ]
};

/* ---------- dumbbell bent-over row ---------- */
const ROW = { root: { x: -12, y: 84, pitch: -45 }, lumbar: 0, thoracic: 0, neck: -12 };
const dbrow = {
  id: "dbrow", name: "Dumbbell row", duration: 2.4, camera: { yaw: 0 }, still: 0.9, held: DB,
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Hinge forward about 45°, knees slightly bent, back flat", "Dumbbells hang under the shoulders",
    "Pull the elbows back close to the body and squeeze the shoulder blades", "Lower with control; the trunk does not swing"],
  doubts: ["Two-dumbbell bent-over version (no bench support)."],
  keys: [
    M(STAND, { t: 0 }, ROW, freeArms(45, 4, 8), feet(14)),
    M({ t: 0.8, ease: "inOut" }, freeArms(-28, 100, 10)),
    { t: 1.05 },
    M({ t: 2.0, ease: "inOut" }, freeArms(45, 4, 8)),
    { t: 2.4 }
  ]
};

/* ---------- dumbbell shoulder press (front ¾ view) ---------- */
const SHY = STAND_Y + 46 - 6;
// FK: upper arm out to the side, forearm vertical (rot -90), then pressed overhead
const press = (abd, elbow) => ({ armR: freeArm(10, elbow, abd, -90), armL: freeArm(10, elbow, abd, -90) });
const dbpress = {
  id: "dbpress", name: "Dumbbell shoulder press", duration: 2.4, camera: { yaw: -70, elev: 0 }, still: 0.95, held: DB,
  order: ["legL", "legR", "torso", "head", "held", "armL", "armR"],
  contacts: [{ eff: "toeR" }, { eff: "toeL" }],
  form: ["Stand tall, core tight, no extra arch in the lower back", "Start with the dumbbells at shoulder height, elbows under the wrists",
    "Press straight up until the arms are straight overhead", "Lower with control back to shoulder height"],
  doubts: [],
  keys: [
    M(STAND, { t: 0 }, press(88, 90), feet(14)),
    M({ t: 0.85, ease: "inOut" }, press(168, 6)),
    { t: 1.05 },
    M({ t: 2.0, ease: "inOut" }, press(88, 90)),
    { t: 2.4 }
  ]
};

/* ---------- dumbbell Romanian deadlift ---------- */
const rdl = {
  id: "rdl", name: "Dumbbell Romanian deadlift", duration: 2.8, camera: { yaw: 0 }, still: 1.3, held: DB,
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Knees slightly bent and soft, not locked", "Push the hips back; the back stays flat and the dumbbells slide close along the legs",
    "Lower to about mid-shin (or until the back would round)", "Drive the hips forward to stand tall"],
  doubts: [],
  keys: [
    M(STAND, { t: 0 }, freeArms(0, 4, 4), feet(14)),
    M({ t: 1.15, ease: "inOut", root: { x: -18, y: 84, pitch: -68 }, neck: -12 }, freeArms(64, 4, 4)),
    { t: 1.4 },
    M({ t: 2.5, ease: "inOut", root: { x: 0, y: STAND_Y, pitch: 0 }, neck: 0 }, freeArms(0, 4, 4)),
    { t: 2.8 }
  ]
};

/* ---------- band lat pull-down (kneeling, front ¾ view) ---------- */
const BAR_Y = 205;
const KNEEL = { root: { x: 0, y: 48.5, pitch: 0 }, lumbar: 0, thoracic: 0, neck: -6 };
const kneelLegs = { legR: freeLeg(0, 90, -45, 3), legL: freeLeg(0, 90, -45, 3) };
const latpull = {
  id: "latpull", name: "Lat pull-down (band)", duration: 2.6, camera: { yaw: -65, elev: 6 }, still: 1.0,
  props: [{ type: "bar", x: 2, y: BAR_Y, z: [-45, 45] }, { type: "mat", x: [-60, 50], z: [-40, 40] }],
  held: [{ type: "band", from: [2, BAR_Y, 0] }],
  order: ["legL", "legR", "torso", "head", "armL", "armR", "held"],
  contacts: [{ eff: "kneeR" }, { eff: "kneeL" }],
  form: ["Kneel tall under the anchor, band in both hands, arms up", "Start the pull from the shoulder blades (down and back)",
    "Bring the elbows down toward the ribs, hands to about chin height", "Trunk upright, no leaning back; return slowly"],
  doubts: ["Kneeling band version under a bar; the machine version is the same movement seated."],
  keys: [
    M({ t: 0 }, KNEEL, kneelLegs, { armR: { ik: [4, 180, 26] }, armL: { ik: [4, 180, -26] } }),
    M({ t: 0.9, ease: "inOut" }, { armR: { ik: [8, 128, 26] }, armL: { ik: [8, 128, -26] } }),
    { t: 1.15 },
    M({ t: 2.2, ease: "inOut" }, { armR: { ik: [4, 180, 26] }, armL: { ik: [4, 180, -26] } }),
    { t: 2.6 }
  ]
};

/* ---------- band-assisted pull-up ---------- */
const PB = 214;
const pullup = {
  id: "pullup", name: "Pull-up (band-assisted)", duration: 2.8, camera: { yaw: -62, elev: 8 }, still: 1.1,
  order: ["legL", "legR", "torso", "held", "head", "armL", "armR"],
  props: [{ type: "bar", x: 6, y: PB, z: [-45, 45] }],
  held: [{ type: "band", from: [6, PB, 0], to: "knees" }],
  contacts: [{ eff: "wristR" }, { eff: "wristL" }],
  form: ["Hands on the bar about shoulder width, start from straight arms", "Pull the chest toward the bar until the chin is over it",
    "No swinging or kicking; the band under the knees helps", "Lower with control all the way to straight arms"],
  doubts: ["Band-assisted version; the band is looped from the bar to the knees.", "Front ¾ view so the bar reads as a horizontal bar on two uprights."],
  keys: [
    M({ t: 0, root: { x: 2, y: PB - 4.6 - 52 - 40 + 4.5, pitch: 4 }, lumbar: 0, thoracic: -2, neck: -8 },
      { armR: { ik: [6, PB - 1, 22], exact: true }, armL: { ik: [6, PB - 1, -22], exact: true } }, { legR: freeLeg(-6, 85, -30, 3), legL: freeLeg(-6, 85, -30, 3) }),
    { t: 1.0, ease: "inOut", root: { x: -6, y: PB - 22 - 40 + 1, pitch: 8 }, neck: -14 },
    { t: 1.3 },
    { t: 2.4, ease: "inOut", same: 0 },
    { t: 2.8 }
  ]
};

/* ---------- biceps curl ---------- */
const curl = {
  id: "curl", name: "Biceps curl", duration: 2.4, camera: { yaw: 0 }, still: 0.95, held: DB,
  contacts: [{ eff: "toeR" }, { eff: "toeL" }],
  form: ["Stand tall, elbows pinned to the sides of the body", "Curl the dumbbells up without swinging the body",
    "Squeeze at the top", "Lower slowly to straight arms"],
  doubts: [],
  keys: [
    M(STAND, { t: 0 }, freeArms(0, 4, 6), feet(14)),
    M({ t: 0.85, ease: "inOut" }, freeArms(6, 138, 6)),
    { t: 1.05 },
    M({ t: 2.05, ease: "inOut" }, freeArms(0, 4, 6)),
    { t: 2.4 }
  ]
};

/* ---------- band triceps push-down ---------- */
const ANC = [42, 190, 0];
const tripush = {
  id: "tripush", name: "Band triceps push-down", duration: 2.4, camera: { yaw: 0 }, still: 0.95,
  props: [{ type: "bar", x: ANC[0], y: ANC[1], z: [-45, 45] }],
  held: [{ type: "band", from: ANC }],
  contacts: [{ eff: "toeR" }, { eff: "toeL" }],
  form: ["Stand facing the anchor, slight forward lean, elbows pinned to the ribs", "Push the hands down until the arms are fully straight",
    "Only the forearms move — the elbows stay still", "Return with control without letting the band snap back"],
  doubts: [],
  keys: [
    M(STAND, { t: 0, root: { x: 0, y: STAND_Y - 1, pitch: -8 }, neck: -4 }, freeArms(8, 100, 8), feet(14)),
    M({ t: 0.8, ease: "inOut" }, freeArms(10, 4, 8)),
    { t: 1.0 },
    M({ t: 2.0, ease: "inOut" }, freeArms(8, 100, 8)),
    { t: 2.4 }
  ]
};

/* ---------- kettlebell swing ---------- */
const kbswing = {
  id: "kbswing", name: "Kettlebell swing", duration: 2.4, cycles: 2, camera: { yaw: 0 }, still: 0.55, held: [{ type: "kb" }],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }], maxStepCm: 32,
  form: ["Hinge at the hips (not a squat): hips back, back flat, the bell swings between the thighs",
    "Snap the hips forward explosively and stand tall", "Arms stay long; the bell floats to about chest height from the hip drive, not from the arms",
    "Core tight; let the bell fall back into the next hinge"],
  doubts: [],
  keys: [
    M(STAND, { t: 0, ease: "sine", root: { x: -18, y: 80, pitch: -62 }, neck: -14 }, freeArms(40, 4, -4), feet(14, 0, 0, 16)),
    M({ t: 0.3, ease: "sine", root: { x: -4, y: 88, pitch: -18 }, neck: -4 }, freeArms(30, 4, -4)),
    M({ t: 0.55, ease: "sine", root: { x: 0, y: STAND_Y - 0.5, pitch: 0 }, neck: 0 }, freeArms(88, 4, -4)),
    M({ t: 0.85, ease: "sine", root: { x: -4, y: 88, pitch: -16 }, neck: -4 }, freeArms(20, 4, -4)),
    M({ t: 1.2, ease: "sine", root: { x: -18, y: 80, pitch: -62 }, neck: -14 }, freeArms(40, 4, -4))
  ]
};

/* ---------- farmer's carry (walks forward; camera follows) ---------- */
function carry() {
  const T = 104, C = 1.2, S = T / 2, Y = 86, HEEL = 22, TF = HEEL + 23; // TF: toe of the flat stance foot
  // one stride cycle: right heel strike, right mid-stance, left heel strike, left mid-stance
  const k = (t, rx, legs) => M({ t, ease: "linear", root: { x: rx, y: Y, pitch: 0 } }, legs);
  const keys = [
    M(STAND, { t: 0, ease: "linear", root: { x: 0, y: Y }, neck: 0 }, freeArms(0, 4, 9), heelR(HEEL, 12), footL(TF - S, -32)),
    k(C * 0.12, T * 0.12, M(heelR(HEEL, 0), footL(TF - S + 10, -40, 8))),
    k(C * 0.25, T * 0.25, M(heelR(HEEL, 0), footL(HEEL + 10, 4, 9))),
    k(C * 0.5, T * 0.5, M(heelL(HEEL + S, 12), footR(TF, -32))),
    k(C * 0.62, T * 0.62, M(heelL(HEEL + S, 0), footR(TF + 10, -40, 8))),
    k(C * 0.75, T * 0.75, M(heelL(HEEL + S, 0), footR(HEEL + S + 10, 4, 9))),
    k(C, T, M(heelR(HEEL + T, 12), footL(TF + S, -32)))
  ];
  return {
    id: "carry", name: "Farmer's carry", duration: 2.4, cycles: 2, travel: T, camera: { yaw: 0 }, still: 0.3, held: DB,
    contacts: [{ eff: "heelR", from: 0, to: 0.3 }, { eff: "heelL", from: 0.6, to: 0.9 }],
    form: ["Heavy dumbbell in each hand at the sides, arms long", "Stand tall: shoulders back and down, chest up, no leaning to a side",
      "Short, steady steps; brace the core", "Walk for distance or time"],
    doubts: ["Walking cycle is simplified (heel strike → flat → toe-off); arms do not swing because of the load."],
    keys
  };
}

/* ---------- dumbbell bench press ---------- */
const BH = 45;
const BENCH_ROOT = { root: { x: 22, y: BH + 12.5, pitch: 90 }, lumbar: 0, thoracic: 0, neck: -6 };
const bpress = (y, zOut) => ({ armR: { ik: [-14, y, 15 + zOut] }, armL: { ik: [-14, y, -15 - zOut] } });
const bench = {
  id: "bench", name: "Dumbbell bench press", duration: 2.4, camera: { yaw: -20, elev: 14 }, still: 0.95, held: DB,
  props: [{ type: "bench", x: [-72, 34], h: BH, z: [-16, 16] }],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Lie on the bench, feet flat on the floor, shoulder blades pulled together", "Start with the dumbbells above the chest, arms straight",
    "Lower with control to chest level, elbows about 45–60° from the body", "Press straight back up over the chest; no bouncing"],
  doubts: [],
  keys: [
    M({ t: 0 }, BENCH_ROOT, bpress(BH + 12.5 + 50, 4), feet(66, 0, 0, 16)),
    M({ t: 0.85, ease: "inOut" }, bpress(BH + 12.5 + 8, 26)),
    { t: 1.05 },
    M({ t: 2.0, ease: "inOut" }, bpress(BH + 12.5 + 50, 4)),
    { t: 2.4 }
  ]
};

module.exports = [gsquat, dbrow, dbpress, rdl, latpull, pullup, curl, tripush, kbswing, carry(), bench];
