"use strict";
/* Small helpers for writing exercise specs. All values are world units (≈ cm) and degrees. */

const STAND_Y = 89.85;       // pelvis height when standing with straight (not locked) knees
const HIP_Z = 11;            // foot z for a hip-width stance

/* Merge any number of partial key objects (later wins, one level deep for limbs). */
function M(...objs) {
  const o = {};
  for (const x of objs) for (const k of Object.keys(x || {})) {
    const v = x[k];
    if (v && typeof v === "object" && !Array.isArray(v) && o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) && k !== "foot") o[k] = Object.assign({}, o[k], v);
    else o[k] = v;
  }
  return o;
}
/* Planted foot targets. pitch: world foot angle (0 flat, negative = heel up). */
const footR = (x, pitch = 0, y = 0, z = HIP_Z) => ({ legR: { foot: { toe: [x, z], pitch, ...(y ? { y } : {}) } } });
const footL = (x, pitch = 0, y = 0, z = -HIP_Z) => ({ legL: { foot: { toe: [x, z], pitch, ...(y ? { y } : {}) } } });
const feet = (x = 14, pitch = 0, y = 0, z = HIP_Z) => M(footR(x, pitch, y, z), footL(x, pitch, y, -z));
const heelR = (x, pitch = 0, z = HIP_Z) => ({ legR: { foot: { heel: [x, z], pitch } } });
const heelL = (x, pitch = 0, z = -HIP_Z) => ({ legL: { foot: { heel: [x, z], pitch } } });
/* Free (FK) limb: removes any IK target. */
const freeArm = (flex, elbow = 10, abd = 6, rot) => ({ ik: null, rel: null, flex, elbow, abd, ...(rot != null ? { rot } : {}) });
const freeArms = (flex, elbow = 10, abd = 6) => ({ armR: freeArm(flex, elbow, abd), armL: freeArm(flex, elbow, abd) });
const freeLeg = (flex, knee = 0, ankle = 0, abd = 2, rot) => ({ foot: null, flex, knee, ankle, abd, ...(rot != null ? { rot } : {}) });
/* Hands on a support at height y (wrist centre sits one hand radius above it). */
const hands = (x, y = 0, z = 18) => ({ armR: { ik: [x, y + 4.6, z] }, armL: { ik: [x, y + 4.6, -z] } });
const handR = (x, y = 0, z = 18) => ({ armR: { ik: [x, y + 4.6, z] } });
const handL = (x, y = 0, z = 18) => ({ armL: { ik: [x, y + 4.6, -z] } });

const STAND = M({ root: { x: 0, y: STAND_Y, pitch: 0, yaw: 0, roll: 0 }, lumbar: 0, thoracic: 0, neck: 0, twistL: 0, twistT: 0, headYaw: 0, side: 0, breath: 0 },
  freeArms(0, 12, 6), feet(14));

/* Seconds for a list of [key, duration] pairs -> keys with absolute t. */
function seq(start, list) {
  let t = start;
  return list.map(([k, d]) => { t = +(t + d).toFixed(4); return Object.assign({ t }, k); });
}
const breathHold = (dur, extra) => [
  Object.assign({ t: 0, ease: "sine", breath: 0 }, extra || {}),
  { t: +(dur * 0.45).toFixed(3), ease: "sine", breath: 1 },
  { t: dur, ease: "sine", breath: 0 }
];
const lerp = (a, b, u) => a + (b - a) * u;

module.exports = { STAND_Y, HIP_Z, M, footR, footL, feet, heelR, heelL, freeArm, freeArms, freeLeg, hands, handR, handL, STAND, seq, breathHold, lerp };
