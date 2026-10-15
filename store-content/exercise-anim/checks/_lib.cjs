"use strict";
const path = require("path");
const S = require("../src/skeleton.cjs");
const spec = require("../src/exercises.json");

const ROOT = path.resolve(__dirname, "..");
const REPO = path.resolve(ROOT, "..", "..");

/* Anatomical ranges (degrees) for the solved joint angles, generous for children/teens but
   excluding anything a joint cannot do. Hip flexion is measured against the pelvis segment
   (no separate pelvic tilt in the model), so its upper bound is a little higher than a
   textbook hip-only range. */
const LIMITS = {
  knee: [-1, 155], elbow: [-1, 150],
  hipFlex: [-35, 155], hipAbd: [-20, 50],
  shFlex: [-60, 180], shAbd: [-45, 180],
  ankle: [-55, 45],
  lumbar: [-25, 45], thoracic: [-25, 45], twist: [-50, 50], neck: [-45, 50], headYaw: [-60, 60]
};

function cameraProj(ex) {
  const yaw = (ex.camera && ex.camera.yaw || 0) * S.D2R, elev = (ex.camera && ex.camera.elev || 0) * S.D2R;
  const V = S.mm(S.Rx(elev), S.Ry(yaw));
  return p => { const q = S.mv(V, p); return [q[0], -q[1]]; };
}

const cache = new Map();
function frames(ex) {
  if (!cache.has(ex.id)) cache.set(ex.id, S.sampleFrames(ex, spec.fps));
  return cache.get(ex.id);
}

function jointAngles(J) {
  const a = J.angles, out = {};
  for (const sd of ["L", "R"]) {
    out["knee" + sd] = ["knee", a["leg" + sd].bend];
    out["elbow" + sd] = ["elbow", a["arm" + sd].bend];
    out["hipFlex" + sd] = ["hipFlex", a["leg" + sd].flex];
    out["hipAbd" + sd] = ["hipAbd", a["leg" + sd].abd];
    out["shFlex" + sd] = ["shFlex", a["arm" + sd].flex];
    out["shAbd" + sd] = ["shAbd", a["arm" + sd].abd];
    out["ankle" + sd] = ["ankle", a["leg" + sd].ankle];
  }
  for (const k of ["lumbar", "thoracic", "twist", "neck", "headYaw"]) out[k] = [k, a.spine[k]];
  return out;
}

module.exports = { S, spec, ROOT, REPO, LIMITS, cameraProj, frames, jointAngles };
