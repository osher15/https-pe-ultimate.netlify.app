/*
 * PE diagram templates (pe-diagram/1).
 *
 * Each template defines:
 *   - viewBox      : SVG canvas size (all templates are 1000 units wide, so marker
 *                    sizes stay identical across templates);
 *   - area         : the playing-area rectangle (viewBox units) onto which scene
 *                    coordinates 0..100 are mapped (x -> right, y -> down, origin at
 *                    the top-left corner of the playing area);
 *   - landmarks    : key line positions expressed in SCENE coordinates (0..100), so
 *                    authors know where the court lines are;
 *   - draw(kit)    : returns the SVG markup for the schematic surface markings.
 *
 * Courts are schematic, not regulation-accurate. Where a court is drawn, the mapped
 * playing area includes a run-off band around the court lines so that waiting
 * players, servers or ball collectors "behind the line" still fit inside 0..100.
 *
 * Vanilla JS. Works in Node (module.exports) and in the browser
 * (window.PEDiagramTemplates). Load this file before render.js in a browser.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PEDiagramTemplates = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VIEW_W = 1000;
  var MARGIN = 40;            // viewBox margin around the playing area
  var AREA_W = VIEW_W - 2 * MARGIN;

  // ---------------------------------------------------------------- helpers
  function fmt(n) {
    var r = Math.round(n * 10) / 10;
    if (Object.is(r, -0)) r = 0;
    return String(r);
  }
  function attrs(o) {
    var out = '';
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]];
      if (v === undefined || v === null) continue;
      out += ' ' + keys[i] + '="' + (typeof v === 'number' ? fmt(v) : v) + '"';
    }
    return out;
  }
  function el(name, o) { return '<' + name + attrs(o) + '/>'; }

  /*
   * Court geometry helper. A court of physical size cw x ch (metres) is placed so
   * that its lines run from scene x0..x1 and y0..y1 (percent of the playing area).
   * The playing area is then the court plus the implied run-off band, with a single
   * uniform scale (so circles stay circles).
   */
  function courtGeom(cw, ch, x0, x1, y0, y1) {
    var areaPhysW = cw / ((x1 - x0) / 100);
    var areaPhysH = ch / ((y1 - y0) / 100);
    var s = AREA_W / areaPhysW;               // viewBox units per metre
    var areaH = areaPhysH * s;
    var ox = MARGIN + (x0 / 100) * AREA_W;     // court origin in viewBox units
    var oy = MARGIN + (y0 / 100) * areaH;
    return {
      s: s,
      area: { x: MARGIN, y: MARGIN, w: AREA_W, h: areaH },
      viewBox: { w: VIEW_W, h: areaH + 2 * MARGIN },
      X: function (m) { return ox + m * s; },
      Y: function (m) { return oy + m * s; },
      L: function (m) { return m * s; }
    };
  }
  // Abstract (non-court) geometry: area of AREA_W x areaH, helpers in percent.
  function pctGeom(aspect) {
    var areaH = AREA_W / aspect;
    var area = { x: MARGIN, y: MARGIN, w: AREA_W, h: areaH };
    return {
      area: area,
      viewBox: { w: VIEW_W, h: areaH + 2 * MARGIN },
      PX: function (p) { return area.x + (p / 100) * area.w; },
      PY: function (p) { return area.y + (p / 100) * area.h; }
    };
  }
  function line(x1, y1, x2, y2, stroke, w, extra) {
    var o = { x1: x1, y1: y1, x2: x2, y2: y2, stroke: stroke, 'stroke-width': w };
    if (extra) for (var k in extra) o[k] = extra[k];
    return el('line', o);
  }
  function rect(x, y, w, h, o) {
    var a = { x: x, y: y, width: w, height: h };
    for (var k in o) a[k] = o[k];
    return el('rect', a);
  }
  function circle(cx, cy, r, o) {
    var a = { cx: cx, cy: cy, r: r };
    for (var k in o) a[k] = o[k];
    return el('circle', a);
  }
  function path(d, o) {
    var a = { d: d };
    for (var k in o) a[k] = o[k];
    return el('path', a);
  }
  function P(x, y) { return fmt(x) + ' ' + fmt(y); }

  // Background of the whole playing area (run-off band) + court surface.
  function surface(g, runoff, courtFill, ink, cw, ch, lw) {
    return rect(g.area.x, g.area.y, g.area.w, g.area.h, { fill: runoff }) +
      rect(g.X(0), g.Y(0), g.L(cw), g.L(ch), { fill: courtFill, stroke: ink, 'stroke-width': lw });
  }

  var LW = 4;      // standard marking width
  var LW_OUT = 5;  // outline width

  // ------------------------------------------------------------- basketball
  var BB = { runoff: '#f8f1e3', court: '#f1dfbf', key: '#e6c99a', ink: '#6b4f2a' };

  // One basketball end. baseX in metres, dir = +1 (court extends to +x) or -1.
  function bbEnd(g, baseX, dir) {
    var out = '';
    var cy = 7.5;
    var keyX = baseX + dir * 5.8;
    var kx = Math.min(baseX, keyX);
    out += rect(g.X(kx), g.Y(cy - 2.45), g.L(5.8), g.L(4.9), { fill: BB.key, stroke: BB.ink, 'stroke-width': LW });
    // Free-throw circle: outer half solid, inner half dashed.
    var r = g.L(1.8);
    var top = P(g.X(keyX), g.Y(cy - 1.8));
    var bot = P(g.X(keyX), g.Y(cy + 1.8));
    var sweepOut = dir > 0 ? 1 : 0;
    out += path('M ' + top + ' A ' + fmt(r) + ' ' + fmt(r) + ' 0 0 ' + sweepOut + ' ' + bot,
      { fill: 'none', stroke: BB.ink, 'stroke-width': LW });
    out += path('M ' + top + ' A ' + fmt(r) + ' ' + fmt(r) + ' 0 0 ' + (1 - sweepOut) + ' ' + bot,
      { fill: 'none', stroke: BB.ink, 'stroke-width': LW, 'stroke-dasharray': '10 8' });
    // Three-point line: corner straights at 0.9 m from the sidelines + arc r 6.75.
    var bx = baseX + dir * 1.575;
    var cornerX = bx + dir * Math.sqrt(6.75 * 6.75 - 6.6 * 6.6);
    var R = g.L(6.75);
    out += path('M ' + P(g.X(baseX), g.Y(0.9)) + ' L ' + P(g.X(cornerX), g.Y(0.9)) +
      ' A ' + fmt(R) + ' ' + fmt(R) + ' 0 0 ' + sweepOut + ' ' + P(g.X(cornerX), g.Y(14.1)) +
      ' L ' + P(g.X(baseX), g.Y(14.1)), { fill: 'none', stroke: BB.ink, 'stroke-width': LW });
    // Backboard and ring (ring slightly enlarged for legibility).
    var boardX = baseX + dir * 1.2;
    out += line(g.X(boardX), g.Y(cy - 0.9), g.X(boardX), g.Y(cy + 0.9), '#1f2937', 7);
    out += circle(g.X(bx), g.Y(cy), Math.max(g.L(0.3), 9), { fill: 'none', stroke: '#c2410c', 'stroke-width': 4 });
    return out;
  }

  function bbFull() {
    var g = courtGeom(28, 15, 4, 96, 6, 94);
    return mk('bb-full', ['basketball'], g, {
      label: 'Basketball - full court',
      use: 'Full-court transition, lanes across the whole court, two-basket games.',
      orientation: 'Attack left to right. Baskets at both ends; centre line at x=50.',
      landmarks: { 'end line (left)': 4, 'centre line': 50, 'end line (right)': 96, 'sideline (top)': 6, 'sideline (bottom)': 94, 'basket (left) x': pctX(g, 1.575), 'basket (right) x': pctX(g, 28 - 1.575), 'baskets y': 50 },
      draw: function () {
        var out = surface(g, BB.runoff, BB.court, BB.ink, 28, 15, LW_OUT);
        out += line(g.X(14), g.Y(0), g.X(14), g.Y(15), BB.ink, LW);
        out += circle(g.X(14), g.Y(7.5), g.L(1.8), { fill: 'none', stroke: BB.ink, 'stroke-width': LW });
        out += bbEnd(g, 0, 1) + bbEnd(g, 28, -1);
        return out;
      }
    });
  }
  function bbHalf() {
    var g = courtGeom(14, 15, 0, 95, 6, 94);
    return mk('bb-half', ['basketball'], g, {
      label: 'Basketball - half court',
      use: 'Half-court attack, 1v1 to 3v3, finishing and rebounding.',
      orientation: 'Half-way line at x=0 (left edge); basket and end line on the RIGHT. Attack left to right. Band x 95-100 is behind the end line.',
      landmarks: { 'half-way line': 0, 'end line': 95, 'sideline (top)': 6, 'sideline (bottom)': 94, 'basket x': pctX(g, 14 - 1.575), 'basket y': 50, 'free-throw line x': pctX(g, 14 - 5.8), 'three-point arc top x': pctX(g, 14 - 1.575 - 6.75) },
      draw: function () {
        var out = surface(g, BB.runoff, BB.court, BB.ink, 14, 15, LW_OUT);
        var r = g.L(1.8);
        out += path('M ' + P(g.X(0), g.Y(7.5 - 1.8)) + ' A ' + fmt(r) + ' ' + fmt(r) + ' 0 0 1 ' + P(g.X(0), g.Y(7.5 + 1.8)),
          { fill: 'none', stroke: BB.ink, 'stroke-width': LW });
        out += bbEnd(g, 14, -1);
        return out;
      }
    });
  }

  // --------------------------------------------------------------- football
  var FB = { runoff: '#eaf4e6', court: '#d3e9cd', ink: '#33603b' };

  function fbEnd(g, baseX, dir, cy) {
    var out = '';
    var o = { fill: 'none', stroke: FB.ink, 'stroke-width': LW };
    var pa = baseX + dir * 16.5, ga = baseX + dir * 5.5;
    out += path('M ' + P(g.X(baseX), g.Y(cy - 20.15)) + ' L ' + P(g.X(pa), g.Y(cy - 20.15)) +
      ' L ' + P(g.X(pa), g.Y(cy + 20.15)) + ' L ' + P(g.X(baseX), g.Y(cy + 20.15)), o);
    out += path('M ' + P(g.X(baseX), g.Y(cy - 9.16)) + ' L ' + P(g.X(ga), g.Y(cy - 9.16)) +
      ' L ' + P(g.X(ga), g.Y(cy + 9.16)) + ' L ' + P(g.X(baseX), g.Y(cy + 9.16)), o);
    var spot = baseX + dir * 11;
    out += circle(g.X(spot), g.Y(cy), 5, { fill: FB.ink });
    var dy = Math.sqrt(9.15 * 9.15 - 5.5 * 5.5);
    var R = g.L(9.15);
    out += path('M ' + P(g.X(pa), g.Y(cy - dy)) + ' A ' + fmt(R) + ' ' + fmt(R) + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' ' + P(g.X(pa), g.Y(cy + dy)), o);
    // Goal drawn behind the goal line (2 m deep, 7.32 m wide).
    var gx = Math.min(baseX, baseX - dir * 2);
    out += rect(g.X(gx), g.Y(cy - 3.66), g.L(2), g.L(7.32), { fill: '#ffffff', stroke: '#1f2937', 'stroke-width': 5 });
    out += line(g.X(baseX), g.Y(cy - 3.66), g.X(baseX), g.Y(cy + 3.66), '#1f2937', 7);
    return out;
  }
  function cornerArcs(g, xs, ys, r, ink) {
    var out = '';
    for (var i = 0; i < xs.length; i++) {
      for (var j = 0; j < ys.length; j++) {
        var x = xs[i][0], dx = xs[i][1], y = ys[j][0], dy = ys[j][1];
        var R = g.L(r);
        var sweep = (dx * dy > 0) ? 0 : 1;
        out += path('M ' + P(g.X(x + dx * r), g.Y(y)) + ' A ' + fmt(R) + ' ' + fmt(R) + ' 0 0 ' + sweep + ' ' + P(g.X(x), g.Y(y + dy * r)),
          { fill: 'none', stroke: ink, 'stroke-width': 3 });
      }
    }
    return out;
  }

  function fbFull() {
    var g = courtGeom(100, 64, 4, 96, 6, 94);
    return mk('fb-full', ['football'], g, {
      label: 'Football - full pitch',
      use: 'Whole-pitch games, transition, team shape.',
      orientation: 'Attack left to right. Goals at both ends (drawn in the bands behind the goal lines); halfway line at x=50.',
      landmarks: { 'goal line (left)': 4, 'halfway line': 50, 'goal line (right)': 96, 'touchline (top)': 6, 'touchline (bottom)': 94, 'goals y': 50, 'penalty area edge (left) x': pctX(g, 16.5), 'penalty area edge (right) x': pctX(g, 100 - 16.5) },
      draw: function () {
        var out = surface(g, FB.runoff, FB.court, FB.ink, 100, 64, LW_OUT);
        out += line(g.X(50), g.Y(0), g.X(50), g.Y(64), FB.ink, LW);
        out += circle(g.X(50), g.Y(32), g.L(9.15), { fill: 'none', stroke: FB.ink, 'stroke-width': LW });
        out += circle(g.X(50), g.Y(32), 5, { fill: FB.ink });
        out += fbEnd(g, 0, 1, 32) + fbEnd(g, 100, -1, 32);
        out += cornerArcs(g, [[0, 1], [100, -1]], [[0, 1], [64, -1]], 1, FB.ink);
        return out;
      }
    });
  }
  function fbHalf() {
    var g = courtGeom(50, 56, 0, 95, 5, 95);
    return mk('fb-half', ['football'], g, {
      label: 'Football - half pitch',
      use: 'Attacking half: finishing, 2v1/3v2 to goal, small-sided games to one goal. Use this template whenever a goal matters.',
      orientation: 'Halfway line at x=0 (left edge); goal line and goal on the RIGHT. Attack left to right. Band x 95-100 is behind the goal (goal net drawn there; ball collectors fit at x 98-100).',
      landmarks: { 'halfway line': 0, 'goal line': 95, 'touchline (top)': 5, 'touchline (bottom)': 95, 'goal y': 50, 'goal posts y': pctY(g, 28 - 3.66) + ' / ' + pctY(g, 28 + 3.66), 'penalty area edge x': pctX(g, 50 - 16.5), 'goal area edge x': pctX(g, 50 - 5.5), 'penalty spot x': pctX(g, 50 - 11) },
      draw: function () {
        var out = surface(g, FB.runoff, FB.court, FB.ink, 50, 56, LW_OUT);
        var R = g.L(9.15);
        out += path('M ' + P(g.X(0), g.Y(28 - 9.15)) + ' A ' + fmt(R) + ' ' + fmt(R) + ' 0 0 1 ' + P(g.X(0), g.Y(28 + 9.15)),
          { fill: 'none', stroke: FB.ink, 'stroke-width': LW });
        out += fbEnd(g, 50, -1, 28);
        out += cornerArcs(g, [[50, -1]], [[0, 1], [56, -1]], 1, FB.ink);
        return out;
      }
    });
  }
  function fbGrid(kit) {
    var g = courtGeom(20, 20, 8, 92, 8, 92);
    return mk('fb-grid', ['football'], g, {
      label: 'Football - cone-marked grid',
      use: 'Rondos, possession squares, dribbling grids, small-sided games without goals. No goals are drawn: use fb-half when a goal matters.',
      orientation: 'Square grid; cones at the corners and side midpoints. Band of 8 around the grid for waiting players.',
      landmarks: { 'grid left': 8, 'grid right': 92, 'grid top': 8, 'grid bottom': 92, 'centre': 50 },
      draw: function (k) {
        var out = rect(g.area.x, g.area.y, g.area.w, g.area.h, { fill: FB.runoff });
        out += rect(g.X(0), g.Y(0), g.L(20), g.L(20), { fill: FB.court, stroke: FB.ink, 'stroke-width': 3, 'stroke-dasharray': '14 10' });
        var pts = [[0, 0], [10, 0], [20, 0], [0, 10], [20, 10], [0, 20], [10, 20], [20, 20]];
        for (var i = 0; i < pts.length; i++) out += k.cone(g.X(pts[i][0]), g.Y(pts[i][1]));
        return out;
      }
    });
  }

  // --------------------------------------------------------------- handball
  var HB = { runoff: '#eaf2f8', court: '#d3e4f1', goalArea: '#bcd5e9', ink: '#24506d' };

  function hbEnd(g, baseX, dir) {
    var out = '';
    var sweep = dir > 0 ? 1 : 0;
    var r6 = g.L(6), r9 = g.L(9);
    // 6 m goal-area line (filled), quarter circles around each post + straight part.
    var d6 = 'M ' + P(g.X(baseX), g.Y(8.5 - 6)) +
      ' A ' + fmt(r6) + ' ' + fmt(r6) + ' 0 0 ' + sweep + ' ' + P(g.X(baseX + dir * 6), g.Y(8.5)) +
      ' L ' + P(g.X(baseX + dir * 6), g.Y(11.5)) +
      ' A ' + fmt(r6) + ' ' + fmt(r6) + ' 0 0 ' + sweep + ' ' + P(g.X(baseX), g.Y(11.5 + 6)) + ' Z';
    out += path(d6, { fill: HB.goalArea, stroke: HB.ink, 'stroke-width': LW });
    // 9 m free-throw line (dashed), clipped at the sidelines.
    var dx9 = Math.sqrt(81 - 8.5 * 8.5);
    var d9 = 'M ' + P(g.X(baseX + dir * dx9), g.Y(0)) +
      ' A ' + fmt(r9) + ' ' + fmt(r9) + ' 0 0 ' + sweep + ' ' + P(g.X(baseX + dir * 9), g.Y(8.5)) +
      ' L ' + P(g.X(baseX + dir * 9), g.Y(11.5)) +
      ' A ' + fmt(r9) + ' ' + fmt(r9) + ' 0 0 ' + sweep + ' ' + P(g.X(baseX + dir * dx9), g.Y(20));
    out += path(d9, { fill: 'none', stroke: HB.ink, 'stroke-width': LW, 'stroke-dasharray': '14 10' });
    // 7 m line.
    out += line(g.X(baseX + dir * 7), g.Y(9.5), g.X(baseX + dir * 7), g.Y(10.5), HB.ink, LW);
    // Goal (3 m wide, 1 m deep) behind the goal line.
    var gx = Math.min(baseX, baseX - dir * 1);
    out += rect(g.X(gx), g.Y(8.5), g.L(1), g.L(3), { fill: '#ffffff', stroke: '#1f2937', 'stroke-width': 5 });
    out += line(g.X(baseX), g.Y(8.5), g.X(baseX), g.Y(11.5), '#1f2937', 7);
    return out;
  }
  function hbFull() {
    var g = courtGeom(40, 20, 4, 96, 6, 94);
    return mk('hb-full', ['handball'], g, {
      label: 'Handball - full court',
      use: 'Fast break / transition, whole-court games.',
      orientation: 'Attack left to right. Goals with 6 m and 9 m lines at both ends; centre line at x=50.',
      landmarks: { 'goal line (left)': 4, 'centre line': 50, 'goal line (right)': 96, 'sideline (top)': 6, 'sideline (bottom)': 94, 'goals y': 50, '6 m line (left) x': pctX(g, 6), '9 m line (left) x': pctX(g, 9), '9 m line (right) x': pctX(g, 31), '6 m line (right) x': pctX(g, 34) },
      draw: function () {
        var out = surface(g, HB.runoff, HB.court, HB.ink, 40, 20, LW_OUT);
        out += line(g.X(20), g.Y(0), g.X(20), g.Y(20), HB.ink, LW);
        out += hbEnd(g, 0, 1) + hbEnd(g, 40, -1);
        return out;
      }
    });
  }
  function hbHalf() {
    var g = courtGeom(20, 20, 0, 95, 6, 94);
    return mk('hb-half', ['handball'], g, {
      label: 'Handball - half court',
      use: 'Attack against the 6 m zone, shooting, 2v1/3v2 to goal.',
      orientation: 'Centre line at x=0 (left edge); goal, 6 m and 9 m lines on the RIGHT. Attack left to right. Band x 95-100 is behind the goal.',
      landmarks: { 'centre line': 0, 'goal line': 95, 'sideline (top)': 6, 'sideline (bottom)': 94, 'goal y': 50, 'goal posts y': pctY(g, 8.5) + ' / ' + pctY(g, 11.5), '6 m line x (straight part)': pctX(g, 14), '9 m line x (straight part)': pctX(g, 11), '7 m mark x': pctX(g, 13) },
      draw: function () {
        var out = surface(g, HB.runoff, HB.court, HB.ink, 20, 20, LW_OUT);
        out += hbEnd(g, 20, -1);
        return out;
      }
    });
  }

  // ------------------------------------------------------------- volleyball
  var VB = { runoff: '#faf1e6', court: '#f3dfc6', ink: '#7a5330' };

  function vbNet(g, x, ch) {
    return line(g.X(x), g.Y(-0.9), g.X(x), g.Y(ch + 0.9), '#111827', 9) +
      circle(g.X(x), g.Y(-0.9), 8, { fill: '#111827' }) +
      circle(g.X(x), g.Y(ch + 0.9), 8, { fill: '#111827' });
  }
  function vbFull() {
    var g = courtGeom(18, 9, 8, 92, 8, 92);
    return mk('vb-full', ['volleyball'], g, {
      label: 'Volleyball - full court',
      use: 'Rallies over the net, serve and receive, rotation.',
      orientation: 'Net vertical at x=50. Attack lines 3 m either side of the net. Bands behind the end lines (x<8, x>92) are the serving areas.',
      landmarks: { 'end line (left)': 8, 'attack line (left)': pctX(g, 6), 'net': 50, 'attack line (right)': pctX(g, 12), 'end line (right)': 92, 'sideline (top)': 8, 'sideline (bottom)': 92 },
      draw: function () {
        var out = surface(g, VB.runoff, VB.court, VB.ink, 18, 9, LW_OUT);
        out += line(g.X(6), g.Y(0), g.X(6), g.Y(9), VB.ink, LW);
        out += line(g.X(12), g.Y(0), g.X(12), g.Y(9), VB.ink, LW);
        out += vbNet(g, 9, 9);
        return out;
      }
    });
  }
  function vbHalf() {
    var g = courtGeom(9, 9, 10, 100, 6, 94);
    return mk('vb-half', ['volleyball'], g, {
      label: 'Volleyball - one side of the court',
      use: 'Receive-set-send patterns, positions on one side, serving.',
      orientation: 'One side of the court with the NET on the RIGHT edge (x=100); end line at x=10, band x 0-10 is the serving area behind the end line. Play goes left to right toward the net.',
      landmarks: { 'serving band': '0-10', 'end line': 10, 'attack line': pctX(g, 6), 'net': 100, 'sideline (top)': 6, 'sideline (bottom)': 94 },
      draw: function () {
        var out = surface(g, VB.runoff, VB.court, VB.ink, 9, 9, LW_OUT);
        out += line(g.X(6), g.Y(0), g.X(6), g.Y(9), VB.ink, LW);
        out += vbNet(g, 9, 9);
        return out;
      }
    });
  }

  // -------------------------------------------------------------- athletics
  var AT = { grass: '#e3efdd', track: '#f0d3c5', ink: '#7d3b2a', sand: '#efe2bb', sandInk: '#8a6d2c' };

  var LANE_TOP = 10, LANE_BOTTOM = 90, LANES = 4;
  function atLanes() {
    var g = pctGeom(920 / 600);
    var laneH = (LANE_BOTTOM - LANE_TOP) / LANES;
    var centres = [];
    for (var i = 0; i < LANES; i++) centres.push(LANE_TOP + laneH * (i + 0.5));
    return mk('at-lanes', ['athletics'], g, {
      label: 'Athletics - straight lanes',
      use: 'Sprints, relays and baton exchanges, running drills in lanes.',
      orientation: '4 horizontal lanes, running left to right. Start line at x=10, finish line at x=90. Bands y 0-10 and y 90-100 are outside the lanes (return paths); x 0-10 is behind the start (waiting), x 90-100 is the run-out.',
      landmarks: { 'start line': 10, 'finish line': 90, 'lane edges y': '10, 30, 50, 70, 90', 'lane centres y': centres.join(', '), 'return bands y': '0-10 and 90-100' },
      draw: function () {
        var out = rect(g.area.x, g.area.y, g.area.w, g.area.h, { fill: AT.grass });
        out += rect(g.area.x, g.PY(LANE_TOP), g.area.w, g.PY(LANE_BOTTOM) - g.PY(LANE_TOP), { fill: AT.track });
        for (var k = 0; k <= LANES; k++) {
          var y = g.PY(LANE_TOP + k * laneH);
          out += line(g.area.x, y, g.area.x + g.area.w, y, AT.ink, (k === 0 || k === LANES) ? LW_OUT : LW);
        }
        out += line(g.PX(10), g.PY(LANE_TOP), g.PX(10), g.PY(LANE_BOTTOM), AT.ink, 8);
        // Finish line: chequered (alternating dashes on two offset lines).
        out += line(g.PX(90) - 5, g.PY(LANE_TOP), g.PX(90) - 5, g.PY(LANE_BOTTOM), '#1f2937', 10, { 'stroke-dasharray': '12 12' });
        out += line(g.PX(90) + 5, g.PY(LANE_TOP) + 12, g.PX(90) + 5, g.PY(LANE_BOTTOM), '#1f2937', 10, { 'stroke-dasharray': '12 12' });
        return out;
      }
    });
  }
  function atJump() {
    var g = pctGeom(2);
    return mk('at-jump', ['athletics'], g, {
      label: 'Athletics - jump runway and landing pit',
      use: 'Long jump / standing and running jumps: approach, take-off board, landing pit.',
      orientation: 'Approach left to right along the runway (x 0-70, y 42-58). Take-off board at x 62-64.5; landing pit x 70-97, y 25-75. Grass around (y<42, y>58) for waiting and the return path.',
      landmarks: { 'runway y': '42-58', 'runway x': '0-70', 'take-off board x': '62-64.5', 'landing pit x': '70-97', 'landing pit y': '25-75' },
      draw: function () {
        var out = rect(g.area.x, g.area.y, g.area.w, g.area.h, { fill: AT.grass });
        out += rect(g.PX(0), g.PY(42), g.PX(70) - g.PX(0), g.PY(58) - g.PY(42), { fill: AT.track, stroke: AT.ink, 'stroke-width': LW });
        out += rect(g.PX(62), g.PY(42), g.PX(64.5) - g.PX(62), g.PY(58) - g.PY(42), { fill: '#ffffff', stroke: '#1f2937', 'stroke-width': 4 });
        out += rect(g.PX(70), g.PY(25), g.PX(97) - g.PX(70), g.PY(75) - g.PY(25), { fill: AT.sand, stroke: AT.sandInk, 'stroke-width': 7, rx: 6 });
        return out;
      }
    });
  }
  function atThrow() {
    var g = pctGeom(1.6);
    var cx = g.PX(12), cy = g.PY(50);
    var ex = g.PX(100), eyTop = g.PY(4), eyBot = g.PY(96);
    var ang = Math.atan2(cy - eyTop, ex - cx);  // half-angle of the sector
    function arcAt(rad) {
      var x1 = cx + rad * Math.cos(ang), y1 = cy - rad * Math.sin(ang);
      var y2 = cy + rad * Math.sin(ang);
      return path('M ' + P(x1, y1) + ' A ' + fmt(rad) + ' ' + fmt(rad) + ' 0 0 1 ' + P(x1, y2),
        { fill: 'none', stroke: AT.ink, 'stroke-width': 3, 'stroke-dasharray': '10 10' });
    }
    return mk('at-throw', ['athletics'], g, {
      label: 'Athletics - throwing sector',
      use: 'Throws (ball, shot, vortex, javelin-type): throwing circle/line, sector, clear landing area.',
      orientation: 'Throw left to right. Throwing circle centred at (12, 50). The sector (lighter wedge) opens to the right between (12,50)-(100,4) and (12,50)-(100,96) and must stay clear. Waiting area behind the thrower at x 0-8.',
      landmarks: { 'throwing circle centre': '12, 50', 'sector edges': '(12,50)-(100,4) and (12,50)-(100,96)', 'waiting band x': '0-8' },
      draw: function () {
        var out = rect(g.area.x, g.area.y, g.area.w, g.area.h, { fill: AT.grass });
        out += path('M ' + P(cx, cy) + ' L ' + P(ex, eyTop) + ' L ' + P(ex, eyBot) + ' Z',
          { fill: '#ffffff', 'fill-opacity': '0.55', stroke: 'none' });
        out += arcAt(g.area.w * 0.3) + arcAt(g.area.w * 0.55) + arcAt(g.area.w * 0.8);
        out += line(cx, cy, ex, eyTop, AT.ink, LW_OUT) + line(cx, cy, ex, eyBot, AT.ink, LW_OUT);
        out += circle(cx, cy, 30, { fill: '#d6d3d1', stroke: '#1f2937', 'stroke-width': 5 });
        return out;
      }
    });
  }

  // ----------------------------------------------------- fitness / neutral
  function fitStations() {
    var g = pctGeom(1.5);
    return mk('fit-stations', ['fitness', 'athletics'], g, {
      label: 'Fitness - stations hall',
      use: 'Circuits and station work in a hall or yard; place numbered station objects.',
      orientation: 'Open hall, walls drawn around the edge. No court lines. Suggested station spots: 4 stations (25,30) (75,30) (75,70) (25,70); 6 stations (20,28) (50,28) (80,28) (80,72) (50,72) (20,72); 8 stations (14,28) (38,28) (62,28) (86,28) (86,72) (62,72) (38,72) (14,72). Keep the middle band (y 40-60) for circulation and the teacher.',
      landmarks: { 'walls': '0 and 100 on both axes', 'circulation band y': '40-60' },
      draw: function () {
        var a = g.area;
        return rect(a.x, a.y, a.w, a.h, { fill: '#eceff2', stroke: '#4b5563', 'stroke-width': 10 }) +
          line(g.PX(50), g.PY(0) + 5, g.PX(50), g.PY(100) - 5, '#c4c9d0', 3, { 'stroke-dasharray': '6 12' });
      }
    });
  }
  function openArea() {
    var g = pctGeom(1.5);
    return mk('open-area', ['basketball', 'football', 'handball', 'volleyball', 'athletics', 'fitness'], g, {
      label: 'Open area (neutral)',
      use: 'Anything that does not need court lines: tag games, circles, cone routes, formations. Allowed for every sport.',
      orientation: 'Plain rectangle, aspect 3:2. No markings.',
      landmarks: { 'edges': '0 and 100 on both axes' },
      draw: function () {
        var a = g.area;
        return rect(a.x, a.y, a.w, a.h, { fill: '#f5f5f0', stroke: '#6b7280', 'stroke-width': 4 });
      }
    });
  }

  // ------------------------------------------------------------- registry
  function round1(n) { return Math.round(n * 10) / 10; }
  function pctX(g, m) { return round1(((g.X(m) - g.area.x) / g.area.w) * 100); }
  function pctY(g, m) { return round1(((g.Y(m) - g.area.y) / g.area.h) * 100); }

  function mk(id, sports, g, spec) {
    return {
      id: id,
      sports: sports,
      label: spec.label,
      use: spec.use,
      orientation: spec.orientation,
      landmarks: spec.landmarks,
      viewBox: { w: g.viewBox.w, h: Math.round(g.viewBox.h) },
      area: { x: g.area.x, y: g.area.y, w: g.area.w, h: Math.round(g.area.h * 10) / 10 },
      draw: spec.draw
    };
  }

  var list = [bbFull(), bbHalf(), fbFull(), fbHalf(), fbGrid(), hbFull(), hbHalf(),
    vbFull(), vbHalf(), atLanes(), atJump(), atThrow(), fitStations(), openArea()];
  var byId = {};
  for (var i = 0; i < list.length; i++) byId[list[i].id] = list[i];

  return {
    ids: list.map(function (t) { return t.id; }),
    get: function (id) { return Object.prototype.hasOwnProperty.call(byId, id) ? byId[id] : null; },
    list: list,
    fmt: fmt
  };
});
