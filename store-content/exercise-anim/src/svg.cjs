"use strict";
/* Animated SVG emitter. Every frame of the solved skeleton is projected with the exercise's
   camera, and each body part becomes one <polyline>/<circle> in <defs> whose geometry is a
   SMIL <animate> over all frames (linear between 25 fps samples). Parts are painted twice
   through <use>: a dark outline stroke and a colour stroke on top. A second, static copy of
   the key pose is shown instead when the viewer prefers reduced motion. */

const S = require("./skeleton.cjs");
const { BODY } = S;

const PAL = {
  bg: "#eef3f8", floor: "#dfe6ee", floorLine: "#a9b6c3", shadow: "#9fb0c0",
  outline: "#25323f",
  skin: "#e2a77d", skinFar: "#c98d63", hair: "#3a2a22",
  shirt: "#22a699", shirtFar: "#188278",
  shorts: "#34457d", shortsFar: "#28365f",
  shoe: "#ffffff", shoeFar: "#d5dde6",
  mat: "#8cc7b6", matEdge: "#5f9f8d", prop: "#c7d0da", propEdge: "#7d8b99",
  watchFace: "#ffffff", watchHand: "#e4572e"
};
const OL = 2.6; // outline width added around every stroke

function camera(ex) {
  const yaw = (ex.camera && ex.camera.yaw || 0) * S.D2R;
  const elev = (ex.camera && ex.camera.elev || 0) * S.D2R;
  const V = S.mm(S.Rx(elev), S.Ry(yaw));
  return { yaw, elev, V, proj: p => { const q = S.mv(V, p); return [q[0], -q[1], q[2]]; } };
}

const r1 = x => { const v = Math.round(x * 10) / 10; return Object.is(v, -0) ? 0 : v; };
const fmtPts = pts => pts.map(p => r1(p[0]) + "," + r1(p[1])).join(" ");

/* Build the per-frame geometry of all parts. Returns {parts, order, bbox}. */
function geometry(ex, frames) {
  const cam = camera(ex);
  const P = cam.proj;
  const torsoW = Math.hypot(BODY.torsoDepth * Math.cos(cam.yaw), BODY.torsoBreadth * Math.sin(cam.yaw));
  const parts = {}; // name -> {kind, frames:[...]}
  const put = (name, kind, val, extra) => { (parts[name] = parts[name] || Object.assign({ kind, frames: [] }, extra || {})).frames.push(val); };
  const depth = {};
  const addDepth = (k, d) => { depth[k] = (depth[k] || 0) + d; };
  for (const J of frames) {
    const up = S.mv(J.Tr, [0, 1, 0]), lup = S.mv(J.Lr, [0, 1, 0]);
    const tA = S.add(J.pelvis, S.mul(lup, 5)), tB = J.mid, tC = S.sub(J.neck, S.mul(up, 8));
    put("torso", "poly", [P(tA), P(tB), P(tC)].map(p => p.slice(0, 2)), { w: torsoW, breath: true });
    parts.torso.bw = parts.torso.bw || []; parts.torso.bw.push(torsoW + (J.pose.breath || 0) * 1.6);
    put("pelvis", "poly", [P(J.hipL), P(S.add(J.pelvis, S.mul(lup, 7))), P(J.hipR)].map(p => p.slice(0, 2)), { w: BODY.legW + 5 });
    const headUp = S.mv(J.Hr, [0, 1, 0]), headF = S.mv(J.Hr, [1, 0, 0]), headZ = S.mv(J.Hr, [0, 0, 1]);
    put("neck", "poly", [P(S.sub(J.neck, S.mul(up, 4))), P(S.add(J.neck, S.mul(headUp, BODY.neck)))].map(p => p.slice(0, 2)), { w: BODY.neckW });
    put("head", "circle", P(J.head).slice(0, 2), { r: BODY.headR });
    put("hair", "circle", P(S.add(J.head, S.add(S.mul(headF, -BODY.headR * 0.22), S.mul(headUp, BODY.headR * 0.2)))).slice(0, 2), { r: BODY.headR * 0.98 });
    for (const sgn of [1, -1]) {
      const eye = S.add(J.head, S.add(S.add(S.mul(headF, BODY.headR * 0.62), S.mul(headUp, BODY.headR * 0.12)), S.mul(headZ, sgn * BODY.headR * 0.36)));
      const pe = P(eye), ph = P(J.head);
      put(sgn > 0 ? "eyeR" : "eyeL", "circle", pe.slice(0, 2), { r: 1.55, vis: [] });
      parts[sgn > 0 ? "eyeR" : "eyeL"].vis.push(pe[2] - ph[2]);
    }
    addDepth("torso", P(J.mid)[2]); addDepth("head", P(J.head)[2] + 0.01);
    for (const sd of ["R", "L"]) {
      const sh = J["shoulder" + sd], el = J["elbow" + sd], wr = J["wrist" + sd];
      put("arm" + sd, "poly", [P(sh), P(el), P(wr)].map(p => p.slice(0, 2)), { w: BODY.armW });
      put("sleeve" + sd, "poly", [P(sh), P(S.add(sh, S.mul(S.sub(el, sh), 0.42)))].map(p => p.slice(0, 2)), { w: BODY.armW + 3.6 });
      put("hand" + sd, "circle", P(wr).slice(0, 2), { r: BODY.handR });
      const hp = J["hip" + sd], kn = J["knee" + sd], an = J["ankle" + sd];
      put("leg" + sd, "poly", [P(hp), P(kn), P(an)].map(p => p.slice(0, 2)), { w: BODY.legW });
      put("shorts" + sd, "poly", [P(hp), P(S.add(hp, S.mul(S.sub(kn, hp), 0.45)))].map(p => p.slice(0, 2)), { w: BODY.legW + 3.4 });
      const n = J["footN" + sd], rad = BODY.footW / 2;
      put("foot" + sd, "poly", [P(S.add(J["heel" + sd], S.mul(n, rad))), P(S.add(J["toe" + sd], S.add(S.mul(n, rad), S.mul(J["footF" + sd], -rad * 0.6))))].map(p => p.slice(0, 2)), { w: BODY.footW });
      addDepth("arm" + sd, (P(el)[2] + P(wr)[2]) / 2);
      addDepth("leg" + sd, (P(kn)[2] + P(an)[2]) / 2);
    }
  }
  // paint order: by mean depth unless the exercise overrides it
  const groups = ["armL", "armR", "legL", "legR", "torso", "head"];
  let order = ex.order ? ex.order.slice() : groups.slice().sort((a, b) => depth[a] - depth[b]);
  if (!ex.order) { // head is never behind the torso
    order = order.filter(g => g !== "head"); order.splice(order.indexOf("torso") + 1, 0, "head");
  }
  // bounding box over every part
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of Object.keys(parts)) {
    const pt = parts[k];
    const pad = (pt.kind === "circle" ? pt.r : (pt.w || 0) / 2) + OL;
    for (const f of pt.frames) for (const p of (pt.kind === "circle" ? [f] : f)) {
      x0 = Math.min(x0, p[0] - pad); x1 = Math.max(x1, p[0] + pad); y0 = Math.min(y0, p[1] - pad); y1 = Math.max(y1, p[1] + pad);
    }
  }
  return { parts, order, bbox: [x0, y0, x1, y1], cam };
}

/* Emit the defs and the painted <use>s for one frame set (animated if frames > 1). */
function emitFigure(geo, ex, idp, nFrames, dur, frameSel) {
  const defs = [], uses = [];
  const anim = (attr, vals) => {
    if (vals.every(v => v === vals[0])) return { attr: `${attr}="${vals[0]}"`, el: "" };
    return { attr: `${attr}="${vals[0]}"`, el: `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite" values="${vals.join(";")}"/>` };
  };
  const sel = arr => frameSel == null ? arr : [arr[frameSel]];
  const defPart = (name) => {
    const pt = geo.parts[name];
    const id = idp + name;
    if (pt.kind === "poly") {
      const a = anim("points", sel(pt.frames).map(fmtPts));
      defs.push(`<polyline id="${id}" ${a.attr}>${a.el}</polyline>`);
    } else {
      const cx = anim("cx", sel(pt.frames).map(p => r1(p[0]))), cy = anim("cy", sel(pt.frames).map(p => r1(p[1])));
      defs.push(`<circle id="${id}" r="${r1(pt.r)}" ${cx.attr} ${cy.attr}>${cx.el}${cy.el}</circle>`);
    }
    return id;
  };
  const strokeUse = (name, color, w, extraW) => {
    const id = defPart(name);
    const outline = `<use href="#${id}" stroke="${PAL.outline}" stroke-width="${r1(w + OL * 2)}"/>`;
    let colour;
    if (extraW) {
      const a = anim("stroke-width", sel(extraW).map(r1));
      colour = `<use href="#${id}" stroke="${color}" ${a.attr}>${a.el}</use>`;
    } else colour = `<use href="#${id}" stroke="${color}" stroke-width="${r1(w)}"/>`;
    uses.push(outline, colour);
  };
  const fillUse = (name, color) => {
    const id = defPart(name);
    uses.push(`<use href="#${id}" fill="${color}" stroke="${PAL.outline}" stroke-width="${OL}"/>`);
  };
  const farSide = sd => {
    // a side is "far" when its limbs are on average behind the torso
    const o = geo.order; return o.indexOf("arm" + sd) < o.indexOf("torso");
  };
  for (const g of geo.order) {
    if (g === "torso") {
      const t = geo.parts.torso;
      strokeUse("torso", PAL.shirt, t.w, t.bw.some(x => Math.abs(x - t.w) > 0.05) ? t.bw : null);
      strokeUse("pelvis", PAL.shorts, geo.parts.pelvis.w);
    } else if (g === "head") {
      strokeUse("neck", PAL.skin, BODY.neckW);
      fillUse("hair", PAL.hair);
      fillUse("head", PAL.skin);
      for (const e of ["eyeR", "eyeL"]) {
        const vis = geo.parts[e].vis;
        if (vis.filter(x => x > 0.5).length > vis.length * 0.5) uses.push(`<use href="#${defPart(e)}" fill="${PAL.outline}"/>`);
      }
    } else if (g.startsWith("arm")) {
      const sd = g.slice(3), far = farSide(sd);
      strokeUse("arm" + sd, far ? PAL.skinFar : PAL.skin, BODY.armW);
      strokeUse("sleeve" + sd, far ? PAL.shirtFar : PAL.shirt, BODY.armW + 3.6);
      fillUse("hand" + sd, far ? PAL.skinFar : PAL.skin);
    } else if (g.startsWith("leg")) {
      const sd = g.slice(3), far = geo.order.indexOf("leg" + sd) < geo.order.indexOf("torso");
      strokeUse("leg" + sd, far ? PAL.skinFar : PAL.skin, BODY.legW);
      strokeUse("shorts" + sd, far ? PAL.shortsFar : PAL.shorts, BODY.legW + 3.4);
      strokeUse("foot" + sd, far ? PAL.shoeFar : PAL.shoe, BODY.footW);
    }
  }
  return { defs, uses };
}

/* Props and floor, drawn in world space and projected. */
function emitScene(ex, geo, view) {
  const P = geo.cam.proj;
  const out = [];
  const [vx, vy, vw, vh] = view;
  // floor: everything below the back edge of the floor plane (z = -70) is floor colour
  const back = P([0, 0, -70]);
  out.push(`<rect x="${r1(vx)}" y="${r1(back[1])}" width="${r1(vw)}" height="${r1(vy + vh - back[1])}" fill="${PAL.floor}"/>`);
  out.push(`<line x1="${r1(vx)}" y1="${r1(back[1])}" x2="${r1(vx + vw)}" y2="${r1(back[1])}" stroke="${PAL.floorLine}" stroke-width="1.6"/>`);
  for (const pr of ex.props || []) {
    if (pr.type === "mat") {
      const [xa, xb] = pr.x, za = pr.z ? pr.z[0] : -32, zb = pr.z ? pr.z[1] : 32, h = 1.6;
      if (Math.abs(geo.cam.elev) < 1e-6 && Math.abs(geo.cam.yaw) < 1e-6) {
        out.push(`<rect x="${r1(xa)}" y="${r1(-h)}" width="${r1(xb - xa)}" height="${r1(h + 1.4)}" rx="1.2" fill="${PAL.mat}" stroke="${PAL.matEdge}" stroke-width="1"/>`);
      } else {
        const q = [[xa, h, za], [xb, h, za], [xb, h, zb], [xa, h, zb]].map(p => P(p));
        out.push(`<polygon points="${fmtPts(q)}" fill="${PAL.mat}" stroke="${PAL.matEdge}" stroke-width="1" stroke-linejoin="round"/>`);
      }
    }
  }
  return out.join("");
}

function stopwatch(ex, view, dur) {
  // a small stopwatch whose hand sweeps once per loop: "hold" without any text
  const [vx, vy, vw] = view;
  const r = vw * 0.055, cx = vx + vw - r * 1.9, cy = vy + r * 2.1;
  return `<g stroke="${PAL.outline}" stroke-width="${r1(r * 0.16)}" stroke-linecap="round">` +
    `<line x1="${r1(cx)}" y1="${r1(cy - r)}" x2="${r1(cx)}" y2="${r1(cy - r * 1.35)}"/>` +
    `<line x1="${r1(cx - r * 0.3)}" y1="${r1(cy - r * 1.4)}" x2="${r1(cx + r * 0.3)}" y2="${r1(cy - r * 1.4)}"/>` +
    `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${PAL.watchFace}"/>` +
    `<line x1="${r1(cx)}" y1="${r1(cy)}" x2="${r1(cx)}" y2="${r1(cy - r * 0.72)}" stroke="${PAL.watchHand}">` +
    (dur ? `<animateTransform attributeName="transform" type="rotate" from="0 ${r1(cx)} ${r1(cy)}" to="360 ${r1(cx)} ${r1(cy)}" dur="${dur}s" repeatCount="indefinite"/>` : "") +
    `</line></g>`;
}

function shadowEl(geo, frames, frameSel, dur) {
  const P = geo.cam.proj;
  const xs = [], rx = [];
  for (const J of frames) {
    const base = P([J.pelvis[0], 0, 0]);
    xs.push(r1(base[0]));
    const low = Math.min(J.toeR[1], J.toeL[1], J.heelR[1], J.heelL[1]);
    rx.push(r1(Math.max(14, 30 - low * 0.6)));
  }
  const ry = 3 + 40 * Math.sin(Math.abs(geo.cam.elev)) * 0.5;
  const sel = a => frameSel == null ? a : [a[frameSel]];
  const xa = sel(xs), ra = sel(rx);
  const a = (n, v) => v.every(x => x === v[0]) ? "" : `<animate attributeName="${n}" dur="${dur}s" repeatCount="indefinite" values="${v.join(";")}"/>`;
  const fy = P([0, 0, 0])[1];
  return `<ellipse cx="${xa[0]}" cy="${r1(fy)}" rx="${ra[0]}" ry="${r1(ry)}" fill="${PAL.shadow}" opacity="0.35">${a("cx", xa)}${a("rx", ra)}</ellipse>`;
}

/* Square view box that fits the whole motion (plus props), floor kept in view. */
function viewBox(ex, geo) {
  let [x0, y0, x1, y1] = geo.bbox;
  for (const pr of ex.props || []) if (pr.type === "mat") { const a = geo.cam.proj([pr.x[0], 0, 0]), b = geo.cam.proj([pr.x[1], 0, 0]); x0 = Math.min(x0, a[0], b[0]); x1 = Math.max(x1, a[0], b[0]); }
  y1 = Math.max(y1, geo.cam.proj([0, 0, 40])[1]);
  const size = Math.max(x1 - x0, y1 - y0) * 1.12 + 8;
  const cx = (x0 + x1) / 2;
  const bottom = y1 + Math.max(6, size * 0.06);
  return [cx - size / 2, bottom - size, size, size];
}

function render(ex, fps, opts) {
  opts = opts || {};
  const { frames, n } = S.sampleFrames(ex, fps);
  const geo = geometry(ex, frames);
  const view = viewBox(ex, geo);
  const dur = ex.duration;
  const px = opts.px || 260;
  const stillIdx = Math.round((ex.still != null ? ex.still : 0) * fps) % n;
  const A = emitFigure(geo, ex, "a", n, dur, null);
  const St = emitFigure(geo, ex, "s", 1, dur, stillIdx);
  const vb = view.map(r1).join(" ");
  const hold = ex.hold ? stopwatch(ex, view, dur) : "";
  const holdStill = ex.hold ? stopwatch(ex, view, 0) : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${vb}" role="img" aria-label="${escapeXml(ex.name)}">` +
    `<style>.s{display:none}@media (prefers-reduced-motion:reduce){.a{display:none}.s{display:inline}}polyline{fill:none;stroke-linecap:round;stroke-linejoin:round}</style>` +
    `<rect x="${r1(view[0])}" y="${r1(view[1])}" width="${r1(view[2])}" height="${r1(view[3])}" fill="${PAL.bg}"/>` +
    emitScene(ex, geo, view) +
    `<g class="a">${shadowEl(geo, frames, null, dur)}<defs>${A.defs.join("")}</defs>${A.uses.join("")}${hold}</g>` +
    `<g class="s">${shadowEl(geo, frames, stillIdx, dur)}<defs>${St.defs.join("")}</defs>${St.uses.join("")}${holdStill}</g>` +
    `</svg>\n`;
  // still-only file for <picture><source media="(prefers-reduced-motion: reduce)"> in the app
  const stillSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${vb}" role="img" aria-label="${escapeXml(ex.name)}">` +
    `<style>polyline{fill:none;stroke-linecap:round;stroke-linejoin:round}</style>` +
    `<rect x="${r1(view[0])}" y="${r1(view[1])}" width="${r1(view[2])}" height="${r1(view[3])}" fill="${PAL.bg}"/>` +
    emitScene(ex, geo, view) +
    `<g>${shadowEl(geo, frames, stillIdx, dur)}<defs>${St.defs.join("")}</defs>${St.uses.join("")}${holdStill}</g>` +
    `</svg>\n`;
  return { svg, stillSvg, frames, n, view, geo };
}
function escapeXml(s) { return String(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }

module.exports = { render, PAL, geometry };
