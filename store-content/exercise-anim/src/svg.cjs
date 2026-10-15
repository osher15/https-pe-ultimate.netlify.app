"use strict";
/* Animated SVG emitter. Every frame of the solved skeleton is projected with the exercise's
   camera, and each body part becomes one <polyline>/<circle> in <defs> whose geometry is a
   SMIL <animate> over all frames (linear between 25 fps samples). Parts are painted twice
   through <use>: a dark outline stroke and a colour stroke on top. A second, static copy of
   the key pose is shown instead when the viewer prefers reduced motion.

   Scene props (mat, box, bench, wall, bar) are drawn in world space; held props (dumbbells,
   goblet dumbbell, kettlebell, band, jump rope) follow the hands frame by frame. */

const S = require("./skeleton.cjs");
const { BODY } = S;

const PAL = {
  bg: "#eef3f8", floor: "#dfe6ee", floorLine: "#a9b6c3", floorTick: "#c3ced9", shadow: "#9fb0c0",
  outline: "#25323f",
  skin: "#e2a77d", skinFar: "#c98d63", hair: "#3a2a22",
  shirt: "#22a699", shirtFar: "#188278",
  shorts: "#34457d", shortsFar: "#28365f",
  shoe: "#ffffff", shoeFar: "#d5dde6",
  mat: "#8cc7b6", matEdge: "#5f9f8d",
  prop: "#c9d3dd", propSide: "#aab7c4", propTop: "#dde4eb", pad: "#4f5d75", padTop: "#66758f",
  wall: "#e6dccf", wallSide: "#d3c6b5",
  metal: "#4a5563", metalLight: "#6b7685", band: "#e4572e", rope: "#e4572e",
  watchFace: "#ffffff", watchHand: "#e4572e"
};
const OL = 2.6;          // outline width added around every stroke
const VIEW = 250;        // default view-box size (world units): one scale for the whole library

function camera(ex) {
  const yaw = (ex.camera && ex.camera.yaw || 0) * S.D2R;
  const elev = (ex.camera && ex.camera.elev || 0) * S.D2R;
  const V = S.mm(S.Rx(elev), S.Ry(yaw));
  return { yaw, elev, V, proj: (p, dx) => { const q = S.mv(V, [p[0] - (dx || 0), p[1], p[2]]); return [q[0], -q[1], q[2]]; } };
}

const r1 = x => { const v = Math.round(x * 10) / 10; return Object.is(v, -0) ? 0 : v; };
const fmtPts = pts => pts.map(p => r1(p[0]) + "," + r1(p[1])).join(" ");
const mid = (a, b) => S.mul(S.add(a, b), 0.5);
const unit = a => S.mul(a, 1 / (S.len(a) || 1));

/* Build the per-frame geometry of all parts. */
function geometry(ex, frames) {
  const cam = camera(ex);
  const torsoW = Math.hypot(BODY.torsoDepth * Math.cos(cam.yaw), BODY.torsoBreadth * Math.sin(cam.yaw));
  const parts = {};
  const put = (name, kind, val, extra) => { (parts[name] = parts[name] || Object.assign({ kind, frames: [] }, extra || {})).frames.push(val); };
  const vis = (name, v) => { (parts[name].vis = parts[name].vis || []).push(v); };
  const depth = {};
  const addDepth = (k, d) => { depth[k] = (depth[k] || 0) + d; };
  const held = ex.held || [];
  for (const J of frames) {
    const dx = S.cameraFollow(ex, J.t);
    const P = p => cam.proj(p, dx);
    const P2 = p => P(p).slice(0, 2);
    const up = S.mv(J.Tr, [0, 1, 0]), lup = S.mv(J.Lr, [0, 1, 0]), lat = S.mv(J.Tr, [0, 0, 1]);
    const tA = S.add(J.pelvis, S.mul(lup, 5)), tB = J.mid, tC = S.sub(J.neck, S.mul(up, 8));
    put("torso", "poly", [P2(tA), P2(tB), P2(tC)], { w: torsoW });
    parts.torso.bw = parts.torso.bw || []; parts.torso.bw.push(torsoW + (J.pose.breath || 0) * 1.6);
    put("pelvis", "poly", [P2(J.hipL), P2(S.add(J.pelvis, S.mul(lup, 7))), P2(J.hipR)], { w: BODY.legW + 5 });
    // shoulder yoke: makes the shoulder line (and trunk rotation) readable in front and top views
    put("yoke", "poly", [P2(J.shoulderL), P2(S.sub(J.neck, S.mul(up, 5))), P2(J.shoulderR)], { w: BODY.armW + 6 });
    const headUp = S.mv(J.Hr, [0, 1, 0]), headF = S.mv(J.Hr, [1, 0, 0]), headZ = S.mv(J.Hr, [0, 0, 1]);
    put("neck", "poly", [P2(S.sub(J.neck, S.mul(up, 4))), P2(S.add(J.neck, S.mul(headUp, BODY.neck)))], { w: BODY.neckW });
    put("head", "circle", P2(J.head), { r: BODY.headR });
    put("hair", "circle", P2(S.add(J.head, S.add(S.mul(headF, -BODY.headR * 0.22), S.mul(headUp, BODY.headR * 0.2)))), { r: BODY.headR * 0.98 });
    for (const sgn of [1, -1]) {
      const eye = S.add(J.head, S.add(S.add(S.mul(headF, BODY.headR * 0.62), S.mul(headUp, BODY.headR * 0.12)), S.mul(headZ, sgn * BODY.headR * 0.36)));
      const pe = P(eye), ph = P(J.head), name = sgn > 0 ? "eyeR" : "eyeL";
      put(name, "circle", pe.slice(0, 2), { r: 1.55 });
      vis(name, pe[2] - ph[2]);
    }
    addDepth("torso", P(J.mid)[2]); addDepth("head", P(J.head)[2] + 0.01);
    for (const sd of ["R", "L"]) {
      const sh = J["shoulder" + sd], el = J["elbow" + sd], wr = J["wrist" + sd];
      put("arm" + sd, "poly", [P2(sh), P2(el), P2(wr)], { w: BODY.armW });
      put("sleeve" + sd, "poly", [P2(sh), P2(S.add(sh, S.mul(S.sub(el, sh), 0.42)))], { w: BODY.armW + 3.6 });
      put("hand" + sd, "circle", P2(wr), { r: BODY.handR });
      const hp = J["hip" + sd], kn = J["knee" + sd], an = J["ankle" + sd];
      put("leg" + sd, "poly", [P2(hp), P2(kn), P2(an)], { w: BODY.legW });
      put("shorts" + sd, "poly", [P2(hp), P2(S.add(hp, S.mul(S.sub(kn, hp), 0.45)))], { w: BODY.legW + 3.4 });
      const n = J["footN" + sd], rad = BODY.footW / 2;
      put("foot" + sd, "poly", [P2(S.add(J["heel" + sd], S.mul(n, rad))), P2(S.add(J["toe" + sd], S.add(S.mul(n, rad), S.mul(J["footF" + sd], -rad * 0.6))))], { w: BODY.footW });
      addDepth("arm" + sd, (P(el)[2] + P(wr)[2]) / 2);
      addDepth("leg" + sd, (P(kn)[2] + P(an)[2]) / 2);
    }
    // arms drawn in front of or behind the trunk frame by frame (exercises that twist)
    if (ex.dynamicArms) {
      const front = P(mid(J.wristL, J.wristR))[2] >= P(J.mid)[2] + (ex.dynamicArms.bias || 0);
      (parts._armsFront = parts._armsFront || []).push(front ? 1 : 0);
    }
    // held props
    for (const h of held) {
      if (h.type === "db") for (const sd of ["R", "L"]) {
        const wr = J["wrist" + sd], ax = h.axis === "up" ? up : lat, half = 7.5;
        put("db" + sd + "a", "circle", P2(S.add(wr, S.mul(ax, -half))), { r: 8.2 });
        put("db" + sd + "h", "poly", [P2(S.add(wr, S.mul(ax, -half))), P2(S.add(wr, S.mul(ax, half)))], { w: 3.2 });
        put("db" + sd + "b", "circle", P2(S.add(wr, S.mul(ax, half))), { r: 8.2 });
      } else if (h.type === "gdb") {
        const c = S.add(mid(J.wristL, J.wristR), S.mul(up, 3)), ax = [0, 1, 0];
        put("gdbh", "poly", [P2(S.add(c, S.mul(ax, -9))), P2(S.add(c, S.mul(ax, 9)))], { w: 4 });
        put("gdba", "circle", P2(S.add(c, S.mul(ax, -9))), { r: 7 });
        put("gdbb", "circle", P2(S.add(c, S.mul(ax, 9))), { r: 7 });
      } else if (h.type === "kb") {
        const wm = mid(J.wristL, J.wristR), dir = unit(S.sub(wm, mid(J.shoulderL, J.shoulderR)));
        const c = S.add(wm, S.mul(dir, 11));
        put("kbh", "poly", [P2(S.add(wm, S.mul(dir, -2))), P2(c)], { w: 3.4 });
        put("kbb", "circle", P2(c), { r: 9.5 });
      } else if (h.type === "band") {
        const pts = [];
        if (h.to === "knees") pts.push(S.add(h.from, [0, 0, -6]), J.kneeL, J.kneeR, S.add(h.from, [0, 0, 6]));
        else pts.push(J.wristL, h.from, J.wristR);
        put("band", "poly", pts.map(P2), { w: 2.6 });
      } else if (h.type === "rope") {
        // rope swings around the body; one turn per jump. Apex on a circle in the sagittal plane
        const cyc = ex.duration / (ex.cycles || 1);
        const ph = 2 * Math.PI * ((J.t / cyc) * (h.turns || 1) + (h.phase || 0));
        const C = [J.pelvis[0], h.cy || 75, 0], R = h.r || 82;
        const apex = [C[0] + R * Math.cos(ph), Math.max(0.5, C[1] + R * Math.sin(ph)), 0];
        // the rope bows: hand -> a point trailing the apex on a smaller circle -> apex
        const H = mid(J.wristL, J.wristR);
        const ma = ph - 0.5, Mp = [C[0] + R * 0.8 * Math.cos(ma), Math.max(0.5, C[1] + R * 0.8 * Math.sin(ma)), 0];
        const ctrl = S.sub(S.mul(Mp, 2), S.mul(S.add(H, apex), 0.5));
        const pts = [];
        for (let k = 0; k <= 10; k++) {
          const u = k / 10;
          const q = S.add(S.add(S.mul(H, (1 - u) * (1 - u)), S.mul(ctrl, 2 * u * (1 - u))), S.mul(apex, u * u));
          pts.push(P2(q));
        }
        put("rope", "poly", pts, { w: 1.8 });
        (parts._ropeFront = parts._ropeFront || []).push(Math.cos(ph) >= 0 ? 1 : 0);
      }
    }
  }
  // paint order: by mean depth unless the exercise overrides it
  const groups = ["armL", "armR", "legL", "legR", "torso", "head"];
  let order = ex.order ? ex.order.slice() : groups.slice().sort((a, b) => depth[a] - depth[b]);
  if (!ex.order) {
    order = order.filter(g => g !== "head"); order.splice(order.indexOf("torso") + 1, 0, "head");
    if (held.length) { // held props sit just in front of the far arm, behind the near arm
      const lastArm = Math.max(order.indexOf("armL"), order.indexOf("armR"));
      order.splice(lastArm, 0, "held");
    }
  }
  // bounding box over every part
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of Object.keys(parts)) {
    const pt = parts[k];
    if (!pt || !pt.frames) continue;
    const pad = (pt.kind === "circle" ? pt.r : (pt.w || 0) / 2) + OL;
    for (const f of pt.frames) for (const p of (pt.kind === "circle" ? [f] : f)) {
      x0 = Math.min(x0, p[0] - pad); x1 = Math.max(x1, p[0] + pad); y0 = Math.min(y0, p[1] - pad); y1 = Math.max(y1, p[1] + pad);
    }
  }
  return { parts, order, bbox: [x0, y0, x1, y1], cam, depth };
}

/* Emit the defs and the painted <use>s for one frame set (animated if frameSel == null). */
function emitFigure(geo, ex, idp, dur, frameSel) {
  const defs = [], uses = [];
  const anim = (attr, vals, discrete) => {
    if (vals.every(v => v === vals[0])) return { attr: `${attr}="${vals[0]}"`, el: "" };
    return { attr: `${attr}="${vals[0]}"`, el: `<animate attributeName="${attr}" dur="${dur}s" repeatCount="indefinite"${discrete ? ' calcMode="discrete"' : ""} values="${vals.join(";")}"/>` };
  };
  const sel = arr => frameSel == null ? arr : [arr[frameSel]];
  const done = new Set();
  const defPart = (name) => {
    const id = idp + name;
    if (done.has(name)) return id;
    done.add(name);
    const pt = geo.parts[name];
    if (pt.kind === "poly") {
      const a = anim("points", sel(pt.frames).map(fmtPts));
      defs.push(`<polyline id="${id}" ${a.attr}>${a.el}</polyline>`);
    } else {
      const cx = anim("cx", sel(pt.frames).map(p => r1(p[0]))), cy = anim("cy", sel(pt.frames).map(p => r1(p[1])));
      defs.push(`<circle id="${id}" r="${r1(pt.r)}" ${cx.attr} ${cy.attr}>${cx.el}${cy.el}</circle>`);
    }
    return id;
  };
  const strokeUse = (name, color, w, extraW, dash) => {
    const id = defPart(name);
    const d = dash ? ` stroke-dasharray="${dash}"` : "";
    if (!dash) uses.push(`<use href="#${id}" stroke="${PAL.outline}" stroke-width="${r1(w + OL * 2)}"/>`);
    if (extraW) {
      const a = anim("stroke-width", sel(extraW).map(r1));
      uses.push(`<use href="#${id}" stroke="${color}" ${a.attr}${d}>${a.el}</use>`);
    } else uses.push(`<use href="#${id}" stroke="${color}" stroke-width="${r1(w)}"${d}/>`);
  };
  const fillUse = (name, color) => {
    const id = defPart(name);
    uses.push(`<use href="#${id}" fill="${color}" stroke="${PAL.outline}" stroke-width="${OL}"/>`);
  };
  const wrapVis = (flags, fn) => { // draw fn() inside a group shown only on frames where flags = 1
    const v = sel(flags);
    if (v.every(x => x === 1)) return fn();
    if (v.every(x => x === 0)) return;
    const a = anim("opacity", v, true);
    uses.push(`<g ${a.attr}>${a.el}`); fn(); uses.push(`</g>`);
  };
  const isFar = g => geo.order.indexOf(g) < geo.order.indexOf("torso");
  const drawArm = (sd, far) => {
    strokeUse("arm" + sd, far ? PAL.skinFar : PAL.skin, BODY.armW);
    strokeUse("sleeve" + sd, far ? PAL.shirtFar : PAL.shirt, BODY.armW + 3.6);
    fillUse("hand" + sd, far ? PAL.skinFar : PAL.skin);
  };
  const drawHeld = which => {
    for (const h of ex.held || []) {
      if (h.type === "db") for (const sd of which || ["L", "R"]) {
        fillUse("db" + sd + "a", PAL.metal); strokeUse("db" + sd + "h", PAL.metalLight, 3.2); fillUse("db" + sd + "b", PAL.metal);
      } else if (h.type === "gdb" && !which) {
        strokeUse("gdbh", PAL.metalLight, 4); fillUse("gdba", PAL.metal); fillUse("gdbb", PAL.metal);
      } else if (h.type === "kb" && !which) {
        strokeUse("kbh", PAL.metal, 3.4); fillUse("kbb", PAL.metal);
      } else if (h.type === "band" && !which) {
        strokeUse("band", PAL.band, 2.6);
      }
    }
  };
  const hasRope = (ex.held || []).find(h => h.type === "rope");
  const drawRope = () => strokeUse("rope", hasRope.ghost ? "#e98a6d" : PAL.rope, 1.8, null, hasRope.ghost ? "4 3" : null);
  if (hasRope) wrapVis(geo.parts._ropeFront.map(x => 1 - x), drawRope);
  for (const g of geo.order) {
    if (g === "torso") {
      const t = geo.parts.torso;
      strokeUse("torso", PAL.shirt, t.w, t.bw.some(x => Math.abs(x - t.w) > 0.05) ? t.bw : null);
      strokeUse("pelvis", PAL.shorts, geo.parts.pelvis.w);
      strokeUse("yoke", PAL.shirt, geo.parts.yoke.w);
    } else if (g === "head") {
      strokeUse("neck", PAL.skin, BODY.neckW);
      fillUse("hair", PAL.hair);
      fillUse("head", PAL.skin);
      for (const e of ["eyeR", "eyeL"]) {
        const v = geo.parts[e].vis;
        if (v.filter(x => x > 0.5).length > v.length * 0.5) uses.push(`<use href="#${defPart(e)}" fill="${PAL.outline}"/>`);
      }
    } else if (g === "held") {
      drawHeld();
    } else if (g === "armsBack" || g === "armsFront") {
      const f = geo.parts._armsFront;
      wrapVis(g === "armsFront" ? f : f.map(x => 1 - x), () => { drawHeld(); drawArm("L", g === "armsBack"); drawArm("R", g === "armsBack"); });
    } else if (g.startsWith("arm")) {
      drawArm(g.slice(3), isFar(g));
    } else if (g.startsWith("leg")) {
      const sd = g.slice(3), far = isFar(g);
      strokeUse("leg" + sd, far ? PAL.skinFar : PAL.skin, BODY.legW);
      strokeUse("shorts" + sd, far ? PAL.shortsFar : PAL.shorts, BODY.legW + 3.4);
      strokeUse("foot" + sd, far ? PAL.shoeFar : PAL.shoe, BODY.footW);
    }
  }
  if (hasRope) wrapVis(geo.parts._ropeFront, drawRope);
  return { defs, uses };
}

/* A world-space box: visible faces only, flat-shaded. */
function boxFaces(P, x, y, z, cols) {
  const C = (i, j, k) => [x[i], y[j], z[k]];
  const faces = [
    { n: [0, 1, 0], c: cols.top, v: [C(0, 1, 0), C(1, 1, 0), C(1, 1, 1), C(0, 1, 1)] },
    { n: [0, 0, 1], c: cols.front, v: [C(0, 0, 1), C(1, 0, 1), C(1, 1, 1), C(0, 1, 1)] },
    { n: [0, 0, -1], c: cols.front, v: [C(0, 0, 0), C(1, 0, 0), C(1, 1, 0), C(0, 1, 0)] },
    { n: [1, 0, 0], c: cols.side, v: [C(1, 0, 0), C(1, 0, 1), C(1, 1, 1), C(1, 1, 0)] },
    { n: [-1, 0, 0], c: cols.side, v: [C(0, 0, 0), C(0, 0, 1), C(0, 1, 1), C(0, 1, 0)] }
  ];
  const out = [];
  for (const f of faces) {
    const nz = P.normal(f.n);
    if (nz <= 1e-6) continue;
    out.push(`<polygon points="${fmtPts(f.v.map(p => P(p)))}" fill="${f.c}" stroke="${PAL.outline}" stroke-width="1.6" stroke-linejoin="round"/>`);
  }
  return out.join("");
}

/* Floor and static props, drawn in world space and projected. */
function emitScene(ex, geo, view, dur, still) {
  const cam = geo.cam;
  const P = p => cam.proj(p);
  P.normal = n => S.mv(cam.V, n)[2];
  const out = [];
  const [vx, vy, vw, vh] = view;
  const back = P([0, 0, -70]);
  out.push(`<rect x="${r1(vx)}" y="${r1(back[1])}" width="${r1(vw)}" height="${r1(vy + vh - back[1])}" fill="${PAL.floor}"/>`);
  out.push(`<line x1="${r1(vx)}" y1="${r1(back[1])}" x2="${r1(vx + vw)}" y2="${r1(back[1])}" stroke="${PAL.floorLine}" stroke-width="1.6"/>`);
  if (ex.travel) {
    // floor ticks scroll with the camera so travelling exercises read as moving forward
    const total = ex.travel * (ex.cycles || 1);
    const k = Math.max(1, Math.round(Math.abs(total) / 40)), sp = Math.abs(total) / k;
    const ticks = [];
    for (let x = vx - sp; x < vx + vw + 2 * sp; x += sp) ticks.push(`M${r1(x)} ${r1(back[1] + 4)}h${r1(sp * 0.35)}`);
    const tr = still ? "" : `<animateTransform attributeName="transform" type="translate" from="0 0" to="${r1(-Math.sign(total) * sp * k)} 0" dur="${dur}s" repeatCount="indefinite"/>`;
    out.push(`<path d="${ticks.join("")}" stroke="${PAL.floorTick}" stroke-width="3" stroke-linecap="round">${tr}</path>`);
  }
  for (const pr of ex.props || []) {
    if (pr.type === "mat") {
      const [xa, xb] = pr.x, za = pr.z ? pr.z[0] : -32, zb = pr.z ? pr.z[1] : 32, h = 1.6;
      if (Math.abs(cam.elev) < 1e-6 && Math.abs(cam.yaw) < 1e-6) {
        out.push(`<rect x="${r1(xa)}" y="${r1(-h)}" width="${r1(xb - xa)}" height="${r1(h + 1.4)}" rx="1.2" fill="${PAL.mat}" stroke="${PAL.matEdge}" stroke-width="1"/>`);
      } else {
        const q = [[xa, h, za], [xb, h, za], [xb, h, zb], [xa, h, zb]].map(p => P(p));
        out.push(`<polygon points="${fmtPts(q)}" fill="${PAL.mat}" stroke="${PAL.matEdge}" stroke-width="1" stroke-linejoin="round"/>`);
      }
    } else if (pr.type === "box") {
      out.push(boxFaces(P, pr.x, pr.y, pr.z || [-30, 30], { top: PAL.propTop, front: PAL.prop, side: PAL.propSide }));
    } else if (pr.type === "bench") {
      // padded bench: two legs and a padded top
      const [xa, xb] = pr.x, h = pr.h || 45, z = pr.z || [-14, 14];
      out.push(boxFaces(P, [xa + 6, xa + 12], [0, h - 7], [z[0] + 3, z[1] - 3], { top: PAL.metal, front: PAL.metalLight, side: PAL.metal }));
      out.push(boxFaces(P, [xb - 12, xb - 6], [0, h - 7], [z[0] + 3, z[1] - 3], { top: PAL.metal, front: PAL.metalLight, side: PAL.metal }));
      out.push(boxFaces(P, [xa, xb], [h - 7, h], z, { top: PAL.padTop, front: PAL.pad, side: PAL.pad }));
    } else if (pr.type === "wall") {
      out.push(boxFaces(P, [pr.x, pr.x + 12], [0, pr.h || 230], pr.z || [-80, 80], { top: PAL.wallSide, front: PAL.wall, side: PAL.wallSide }));
    } else if (pr.type === "bar") {
      // pull-up bar along z with two posts
      const z = pr.z || [-45, 45], x = pr.x, y = pr.y;
      for (const zz of z) {
        const a = P([x, 0, zz]), b = P([x, y + 6, zz]);
        out.push(`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${PAL.outline}" stroke-width="6.6" stroke-linecap="round"/>`);
        out.push(`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${PAL.prop}" stroke-width="4" stroke-linecap="round"/>`);
      }
      const a = P([x, y, z[0]]), b = P([x, y, z[1]]);
      out.push(`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${PAL.outline}" stroke-width="5.6" stroke-linecap="round"/>`);
      out.push(`<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" stroke="${PAL.metalLight}" stroke-width="3" stroke-linecap="round"/>`);
    }
  }
  return out.join("");
}

function stopwatch(ex, view, dur) {
  // a small stopwatch whose hand sweeps once per loop: "hold" without any text
  const [vx, vy, vw] = view;
  const r = vw * 0.05, cx = vx + vw - r * 1.9, cy = vy + r * 2.1;
  return `<g stroke="${PAL.outline}" stroke-width="${r1(r * 0.16)}" stroke-linecap="round">` +
    `<line x1="${r1(cx)}" y1="${r1(cy - r)}" x2="${r1(cx)}" y2="${r1(cy - r * 1.35)}"/>` +
    `<line x1="${r1(cx - r * 0.3)}" y1="${r1(cy - r * 1.4)}" x2="${r1(cx + r * 0.3)}" y2="${r1(cy - r * 1.4)}"/>` +
    `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${PAL.watchFace}"/>` +
    `<line x1="${r1(cx)}" y1="${r1(cy)}" x2="${r1(cx)}" y2="${r1(cy - r * 0.72)}" stroke="${PAL.watchHand}">` +
    (dur ? `<animateTransform attributeName="transform" type="rotate" from="0 ${r1(cx)} ${r1(cy)}" to="360 ${r1(cx)} ${r1(cy)}" dur="${dur}s" repeatCount="indefinite"/>` : "") +
    `</line></g>`;
}

function shadowEl(ex, geo, frames, frameSel, dur) {
  const xs = [], rx = [];
  for (const J of frames) {
    const base = geo.cam.proj([J.pelvis[0], 0, 0], S.cameraFollow(ex, J.t));
    xs.push(r1(base[0]));
    const low = Math.min(J.toeR[1], J.toeL[1], J.heelR[1], J.heelL[1]);
    rx.push(r1(Math.max(14, 30 - low * 0.6)));
  }
  const ry = 3 + 40 * Math.sin(Math.abs(geo.cam.elev)) * 0.5;
  const sel = a => frameSel == null ? a : [a[frameSel]];
  const xa = sel(xs), ra = sel(rx);
  const a = (n, v) => v.every(x => x === v[0]) ? "" : `<animate attributeName="${n}" dur="${dur}s" repeatCount="indefinite" values="${v.join(";")}"/>`;
  const fy = geo.cam.proj([0, 0, 0])[1];
  return `<ellipse cx="${xa[0]}" cy="${r1(fy)}" rx="${ra[0]}" ry="${r1(ry)}" fill="${PAL.shadow}" opacity="0.35">${a("cx", xa)}${a("rx", ra)}</ellipse>`;
}

/* Square view box at one library-wide scale (VIEW units), grown only if the motion needs it.
   Horizontally centred on the motion and props, floor near the bottom. */
function viewBox(ex, geo) {
  let [x0, y0, x1, y1] = geo.bbox;
  const P = p => geo.cam.proj(p);
  for (const pr of ex.props || []) {
    const xs = pr.type === "wall" || pr.type === "bar" ? [pr.x, pr.x + (pr.type === "wall" ? 12 : 0)] : pr.x;
    const zs = pr.z || [0];
    for (const xx of xs) for (const zz of zs) { const a = P([xx, 0, zz]); x0 = Math.min(x0, a[0]); x1 = Math.max(x1, a[0]); y1 = Math.max(y1, a[1]); }
    if (pr.type === "bar") { const a = P([pr.x, pr.y, 0]); y0 = Math.min(y0, a[1] - 6); }
  }
  y1 = Math.max(y1, P([0, 0, 40])[1]);
  let size = Math.max(ex.viewSize || VIEW, (x1 - x0) * 1.08 + 8);
  const bottom = y1 + size * 0.05;
  if (bottom - size > y0 - size * 0.04) { /* fits */ } else size = Math.max(size, (bottom - y0) * 1.06);
  const cx = (x0 + x1) / 2;
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
  const A = emitFigure(geo, ex, "a", dur, null);
  const St = emitFigure(geo, ex, "s", dur, stillIdx);
  const vb = view.map(r1).join(" ");
  const hold = ex.hold ? stopwatch(ex, view, dur) : "";
  const holdStill = ex.hold ? stopwatch(ex, view, 0) : "";
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="${vb}" role="img" aria-label="${escapeXml(ex.name)}">`;
  const bg = `<rect x="${r1(view[0])}" y="${r1(view[1])}" width="${r1(view[2])}" height="${r1(view[3])}" fill="${PAL.bg}"/>`;
  const svg = head +
    `<style>.s{display:none}@media (prefers-reduced-motion:reduce){.a{display:none}.s{display:inline}}polyline{fill:none;stroke-linecap:round;stroke-linejoin:round}</style>` +
    bg +
    `<g class="a">${emitScene(ex, geo, view, dur, false)}${shadowEl(ex, geo, frames, null, dur)}<defs>${A.defs.join("")}</defs>${A.uses.join("")}${hold}</g>` +
    `<g class="s">${emitScene(ex, geo, view, dur, true)}${shadowEl(ex, geo, frames, stillIdx, dur)}<defs>${St.defs.join("")}</defs>${St.uses.join("")}${holdStill}</g>` +
    `</svg>\n`;
  // still-only file for <picture><source media="(prefers-reduced-motion: reduce)"> in the app
  const stillSvg = head + `<style>polyline{fill:none;stroke-linecap:round;stroke-linejoin:round}</style>` + bg +
    `<g>${emitScene(ex, geo, view, dur, true)}${shadowEl(ex, geo, frames, stillIdx, dur)}<defs>${St.defs.join("")}</defs>${St.uses.join("")}${holdStill}</g>` +
    `</svg>\n`;
  return { svg, stillSvg, frames, n, view, geo };
}
function escapeXml(s) { return String(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])); }

module.exports = { render, PAL, geometry, VIEW };
