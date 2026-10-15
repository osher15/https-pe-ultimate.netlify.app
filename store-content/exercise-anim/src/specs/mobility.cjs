"use strict";
/* Mobility exercises. */
const { STAND_Y, M, footR, footL, feet, freeArm, freeArms, freeLeg, hands, handR, handL, STAND, breathHold } = require("./_h.cjs");

/* ---------- cat-cow ---------- */
const QUAD = { root: { x: 0, y: 48, pitch: -77, z: 0 }, lumbar: 0, thoracic: 0, neck: -12, twistL: 0, twistT: 0, headYaw: 0, side: 0, breath: 0 };
const kneeLeg = freeLeg(77, 90, -50, 2);
// thigh kept vertical (knee planted) while the pelvis tilts: hip flexion = -pelvis pitch
const kneeAt = pitch => ({ legR: freeLeg(-pitch, 90, -50, 2), legL: freeLeg(-pitch, 90, -50, 2) });
const catcow = {
  id: "catcow", name: "Cat-cow", duration: 3.0, camera: { yaw: 0 }, still: 0,
  props: [{ type: "mat", x: [-80, 80] }],
  contacts: [{ eff: "wristR" }, { eff: "wristL" }, { eff: "kneeR" }, { eff: "kneeL" }],
  form: ["On hands and knees, hands under the shoulders, knees under the hips", "Cow: breathe in, let the belly sink, chest forward, look slightly up",
    "Cat: breathe out, round the whole back toward the ceiling, chin toward the chest", "Slow and continuous, the movement starts from the pelvis"],
  doubts: [],
  keys: [
    // pelvis tilt chosen so the shoulders stay over the hands (solved: cow -94.5°, cat -52.5°)
    M({ t: 0, ease: "sine" }, QUAD, hands(39, 1.6, 17), kneeAt(-94.5), { root: { pitch: -94.5 }, lumbar: -14, thoracic: -8, neck: -28, breath: 1 }),
    M({ t: 1.5, ease: "sine", root: { pitch: -52.5 }, lumbar: 16, thoracic: 18, neck: 30, breath: 0 }, kneeAt(-52.5)),
    { t: 3.0, ease: "sine", same: 0 }
  ]
};

/* ---------- 90/90 hip switch (elevated view) ---------- */
// thighs horizontal: abd 90 with flex = angle forward of the side (an Euler artefact, not 90° of anatomical abduction)
const FRONT = { flex: 60, abd: 90, rot: 180, knee: 90, ankle: -10 }, BACKL = { flex: 15, abd: 90, rot: 0, knee: 90, ankle: -20 }, MIDL = { flex: 136, abd: 18, rot: 0, knee: 142, ankle: 12 };
const leg = o => freeLeg(o.flex, o.knee, o.ankle, o.abd, o.rot);
const hip90 = {
  id: "hip90", name: "90/90 hip switch", duration: 3.0, camera: { yaw: -90, elev: 62 }, still: 0,
  props: [{ type: "mat", x: [-50, 80], z: [-75, 75] }],
  order: ["legL", "legR", "torso", "head", "armL", "armR"],
  contacts: [{ eff: "pelvis" }],
  form: ["Sit tall with both legs bent at 90°: one leg in front, the other out to the side behind", "Lift the knees and rotate both legs to the other side (like windscreen wipers)",
    "Keep the trunk upright and do not lean on the hands", "Slow and controlled, from the hips"],
  limits: { hipAbd: [-20, 92] },
  doubts: ["The model's hip rotation is approximate (thighs on the floor use an abduction/flexion combination); the shins lie close to, not exactly on, the floor."],
  keys: [
    M({ t: 0, ease: "sine", root: { x: 0, y: 13, pitch: 0, z: 0 }, lumbar: 0, thoracic: 0, neck: 0, twistL: 0, twistT: 0, headYaw: 0, side: 0 },
      { armR: freeArm(70, 100, -10), armL: freeArm(70, 100, -10) }, { legR: leg(FRONT), legL: leg(BACKL) }),
    { t: 0.4 },
    // thighs sweep along the floor while the shins rotate up and over (rot passes 90°)
    M({ t: 1.5, ease: "sine" }, { legR: leg(BACKL), legL: leg(FRONT) }),
    { t: 1.9 },
    M({ t: 3.0, ease: "sine" }, { legR: leg(FRONT), legL: leg(BACKL) })
  ]
};

/* ---------- world's greatest stretch ---------- */
const worldgreat = {
  id: "worldgreat", name: "World's greatest stretch", duration: 3.0, camera: { yaw: -35, elev: 18 }, still: 1.3,
  props: [{ type: "mat", x: [-90, 90], z: [-35, 35] }],
  order: ["armL", "legL", "torso", "head", "legR", "armR"],
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "wristL" }],
  form: ["Long lunge: front foot flat, back leg long with the heel up", "The hand on the back-leg side is on the floor inside the front foot",
    "Rotate the chest open and reach the other arm to the ceiling; eyes follow the hand", "Return the hand toward the front instep and repeat slowly"],
  limits: { hipFlex: [-35, 168] },
  doubts: ["Shown on one side; back knee is off the floor (long version).", "Hip flexion here includes the pelvic tilt (the model has one pelvis segment), so its limit is raised to 168° for this deep lunge."],
  keys: [
    M({ t: 0, ease: "sine", root: { x: 2, y: 31, pitch: -52, z: 0 }, lumbar: 4, thoracic: 4, neck: -8, twistL: 0, twistT: 0, headYaw: 0, side: 0 },
      footR(62, 0, 0, 11), footL(-76, -55, 0, -11), handL(48, 0, 2), { armL: { exact: true } }, { armR: { ik: [44, 22, 8] } }),
    M({ t: 1.1, ease: "sine", twistL: -8, twistT: -38, headYaw: -35, neck: -14 }, { armR: freeArm(-20, 4, 90) }),
    { t: 1.6 },
    M({ t: 2.6, ease: "sine", twistL: 0, twistT: 0, headYaw: 0, neck: -8 }, { armR: { ik: [44, 22, 8] } }),
    { t: 3.0 }
  ]
};

/* ---------- thoracic rotation (quadruped) ---------- */
const thoracic = {
  id: "thoracic", name: "Thoracic rotation", duration: 3.0, camera: { yaw: -15, elev: 28 }, still: 1.3,
  props: [{ type: "mat", x: [-80, 80], z: [-35, 35] }],
  order: ["armL", "legL", "torso", "legR", "head", "armR"],
  contacts: [{ eff: "wristL" }, { eff: "kneeR" }, { eff: "kneeL" }],
  form: ["On hands and knees, one hand lightly behind the head", "Rotate from the upper back: elbow down toward the supporting wrist",
    "Then open up, elbow toward the ceiling, eyes follow the elbow", "Hips stay still and square; slow and controlled"],
  doubts: [],
  keys: [
    M({ t: 0, ease: "sine" }, QUAD, { root: { y: 46 } }, handL(40, 1.6, 17), { armL: { exact: true } }, { armR: freeArm(-10, 145, 105, -100) }, { legR: freeLeg(92, 108, -50, 2), legL: freeLeg(92, 108, -50, 2) }, { twistT: 10, twistL: 3, headYaw: 10 }),
    M({ t: 1.3, ease: "sine", twistT: -40, twistL: -6, headYaw: -30 }),
    { t: 1.7 },
    { t: 3.0, ease: "sine", same: 0 }
  ]
};

/* ---------- deep squat hold ---------- */
const deepsquathold = {
  id: "deepsquathold", name: "Deep squat hold", duration: 3.0, camera: { yaw: 0 }, still: 0, hold: true,
  contacts: [{ eff: "toeR" }, { eff: "heelR" }, { eff: "toeL" }, { eff: "heelL" }],
  form: ["Feet a little wider than the hips, heels stay on the floor", "Sit as low as comfortable between the heels",
    "Back long (not fully rounded), chest up", "Hands together in front; the elbows push the knees gently outward; breathe and hold"],
  doubts: ["Side view hides the elbows pressing the knees outward."],
  keys: breathHold(3.0, M(STAND, { root: { x: -14, y: 30, pitch: -28 }, lumbar: 8, thoracic: 2, neck: -12 },
    footR(16, 0, 0, 17), footL(16, 0, 0, -17), { armR: { ik: null, rel: [34, 30, 3] }, armL: { ik: null, rel: [34, 30, -3] } }))
};

/* ---------- ankle rocks (half-kneeling) ---------- */
const anklerock = {
  id: "anklerock", name: "Ankle rocks", duration: 3.0, camera: { yaw: 0 }, still: 1.3,
  props: [{ type: "mat", x: [-80, 80] }],
  contacts: [{ eff: "kneeL" }, { eff: "toeR" }, { eff: "heelR" }],
  form: ["Half-kneeling: back knee on the floor, front foot flat", "Slowly move the front knee forward over the toes",
    "The front heel stays down the whole time", "Return and repeat; trunk upright"],
  doubts: [],
  keys: [
    M({ t: 0, ease: "sine", root: { x: 0, y: 0, pitch: 0, z: 0 }, rootFrom: { eff: "kneeL", at: [-18, 7.6] }, lumbar: 0, thoracic: 0, neck: 0, twistL: 0, twistT: 0, headYaw: 0, side: 0 },
      { legL: freeLeg(0, 90, -40, 2) }, footR(56, 0, 1.6, 11), { armR: { ik: null, rel: [1, 3, 22] }, armL: { ik: null, rel: [1, 3, -22] } }),
    M({ t: 1.3, ease: "sine" }, { legL: freeLeg(-22, 68, -40, 2) }),
    { t: 1.7 },
    { t: 3.0, ease: "sine", same: 0 }
  ]
};

/* ---------- shoulder CARs ---------- */
// The hand follows a path on a sphere around the shoulder: forward and up in front, then out to
// the side and back down behind the body (IK keeps the elbow straight).
function shouldercar() {
  const SH = [0, STAND_Y + 46 - 6, 15], R = 52.2, N = 16, T = 3.0;
  const dirAt = u => {
    let th, al;
    if (u <= 0.5) { th = Math.PI * (u / 0.5); al = 0; }
    else { const v = (u - 0.5) / 0.5; th = Math.PI * (1 - v); al = Math.PI * v; } // up, then out to the side, then down behind: back to the start
    return [Math.sin(th) * Math.cos(al), -Math.cos(th), Math.sin(th) * Math.sin(al) + 0.08];
  };
  const keys = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, d = dirAt(u), n = Math.hypot(...d);
    const tgt = [SH[0] + R * d[0] / n, SH[1] + R * d[1] / n, SH[2] + R * d[2] / n];
    const k = { t: +(T * u).toFixed(4), ease: "linear", armR: { ik: tgt.map(v => +v.toFixed(2)), exact: true } };
    keys.push(i === 0 ? M(STAND, k, { armL: freeArm(0, 10, 8) }) : k);
  }
  return {
    id: "shouldercar", name: "Shoulder CARs", duration: T, camera: { yaw: -45, elev: 6 }, still: 0.75,
    contacts: [{ eff: "toeR" }, { eff: "toeL" }],
    form: ["Stand tall, trunk and hips still (a fist clenched helps)", "Draw the biggest slow circle possible with the straight arm: forward, up, out, back and down",
      "Only the shoulder moves — no leaning or twisting", "Even speed, then repeat (and the other arm)"],
    doubts: ["The model has no shoulder blade; the back part of the circle is approximate.", "One arm shown; the other arm rests."],
    keys
  };
}

module.exports = [catcow, hip90, worldgreat, thoracic, deepsquathold, anklerock, shouldercar()];
