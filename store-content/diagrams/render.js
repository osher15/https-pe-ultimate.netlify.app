/*
 * PE diagram renderer (pe-diagram/1): renderScene(scene, opts) -> standalone SVG string.
 *
 * - Pure and deterministic: no DOM, no randomness, no clock. Same input -> same bytes.
 * - Works in Node (module.exports) and in the browser (window.PEDiagram; load
 *   templates/index.js first).
 * - The only text drawn inside the picture is player numbers, station numbers,
 *   path order numerals and single-letter zone labels. Titles and descriptions go
 *   into <title>/<desc> for accessibility. Diagrams are never mirrored for RTL.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./templates/index.js'));
  } else {
    root.PEDiagram = factory(root.PEDiagramTemplates);
  }
})(typeof self !== 'undefined' ? self : this, function (T) {
  'use strict';

  var LANGS = ['he', 'en', 'ar', 'ru', 'es'];
  var RTL = { he: true, ar: true };
  var FONT = 'Arial, Helvetica, sans-serif';

  // Notation palette. Shapes carry the meaning; colour is a secondary cue and
  // is chosen to stay distinguishable in greyscale print.
  var C = {
    ink: '#111827',
    halo: '#ffffff',
    teamA: '#1d4ed8',      // triangle
    teamB: '#c62828',      // square
    ball: '#f59e0b',
    cone: '#f97316',
    coneBase: '#9a3412',
    zoneFill: '#fde68a',
    zoneStroke: '#b45309',
    teacher: '#166534',
    station: '#ffffff'
  };
  // Marker sizes in viewBox units. All templates are 1000 units wide, so a player
  // marker is ~6.5% of the diagram width (~21 px and ~10 px numerals when the
  // diagram is 320 px wide on a phone; ~11 mm at 170 mm print width).
  var S = {
    triR: 38,          // team A triangle circumradius
    sqHalf: 28,        // team B square half-side
    numFont: 32,
    ballR: 13,
    stationR: 32,
    teacherR: 30,
    pathW: 6,
    arrowLen: 27,
    arrowHalf: 13.5,
    orderR: 19,
    orderFont: 26,
    zoneBadge: 40,
    zoneFont: 29,
    waveLen: 40,
    waveAmp: 8.5
  };

  var fmt = T.fmt;

  // ------------------------------------------------------------ escaping
  // Removes characters that are not allowed in XML 1.0 and escapes markup.
  function escapeXml(value) {
    var s = value === undefined || value === null ? '' : String(value);
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '');
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function attrs(o) {
    var out = '';
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]];
      if (v === undefined || v === null) continue;
      out += ' ' + keys[i] + '="' + (typeof v === 'number' ? fmt(v) : escapeXml(v)) + '"';
    }
    return out;
  }
  function el(name, o) { return '<' + name + attrs(o) + '/>'; }
  function text(x, y, str, o) {
    var a = { x: x, y: y };
    for (var k in o) a[k] = o[k];
    return '<text' + attrs(a) + '>' + escapeXml(str) + '</text>';
  }
  function pts(list) {
    return list.map(function (p) { return fmt(p[0]) + ',' + fmt(p[1]); }).join(' ');
  }

  // ------------------------------------------------------------ geometry
  function getTemplate(id) {
    var t = T.get(id);
    if (!t) throw new Error('Unknown template: ' + String(id));
    return t;
  }
  // Scene coordinates (0..100, origin top-left of the playing area) -> viewBox.
  function mapPoint(template, x, y) {
    var t = typeof template === 'string' ? getTemplate(template) : template;
    return [t.area.x + (x / 100) * t.area.w, t.area.y + (y / 100) * t.area.h];
  }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function isPoint(p) { return Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1]); }
  function dist(a, b) { return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])); }

  // Uniform Catmull-Rom spline through the points, sampled as a polyline.
  function smooth(points) {
    if (points.length < 3) return points.slice();
    var out = [points[0]];
    var SAMPLES = 16;
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1];
      var p3 = points[Math.min(points.length - 1, i + 2)];
      for (var k = 1; k <= SAMPLES; k++) {
        var t = k / SAMPLES, t2 = t * t, t3 = t2 * t;
        var x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, y]);
      }
    }
    return out;
  }
  function polyLength(p) {
    var L = 0;
    for (var i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]);
    return L;
  }
  // Point and unit direction at arc length s along the polyline.
  function pointAt(p, s) {
    var acc = 0;
    for (var i = 1; i < p.length; i++) {
      var d = dist(p[i - 1], p[i]);
      if (d === 0) continue;
      if (acc + d >= s || i === p.length - 1) {
        var t = Math.max(0, Math.min(1, (s - acc) / d));
        var dx = (p[i][0] - p[i - 1][0]) / d, dy = (p[i][1] - p[i - 1][1]) / d;
        return { pt: [p[i - 1][0] + dx * d * t, p[i - 1][1] + dy * d * t], dir: [dx, dy] };
      }
      acc += d;
    }
    return { pt: p[p.length - 1].slice(), dir: [1, 0] };
  }
  // Sub-polyline between arc lengths a and b.
  function slice(p, a, b) {
    var out = [pointAt(p, a).pt];
    var acc = 0;
    for (var i = 1; i < p.length; i++) {
      acc += dist(p[i - 1], p[i]);
      if (acc > a && acc < b) out.push(p[i]);
    }
    out.push(pointAt(p, b).pt);
    return out;
  }
  function dPath(p) {
    var d = 'M ' + fmt(p[0][0]) + ' ' + fmt(p[0][1]);
    for (var i = 1; i < p.length; i++) d += ' L ' + fmt(p[i][0]) + ' ' + fmt(p[i][1]);
    return d;
  }
  // Wavy version of a polyline; the wave fades out before the end so the
  // arrowhead stays aligned with the travel direction.
  function wave(p) {
    var L = polyLength(p);
    var step = S.waveLen / 12;
    var n = Math.max(2, Math.ceil(L / step));
    var out = [];
    var fadeEnd = S.waveLen * 0.9;
    for (var i = 0; i <= n; i++) {
      var s = (L * i) / n;
      var at = pointAt(p, s);
      var env = Math.min(1, s / (S.waveLen * 0.25), Math.max(0, (L - s) / fadeEnd));
      var off = S.waveAmp * env * Math.sin((2 * Math.PI * s) / S.waveLen);
      out.push([at.pt[0] - at.dir[1] * off, at.pt[1] + at.dir[0] * off]);
    }
    return out;
  }

  // ------------------------------------------------------------ glyphs
  function triangle(cx, cy, r) {
    return [[cx, cy - r], [cx + r * 0.866, cy + r / 2], [cx - r * 0.866, cy + r / 2]];
  }
  function numeral(x, y, n, fill, size) {
    var str = String(n);
    var fs = str.length > 2 ? size * 0.72 : size;
    return text(x, y + fs * 0.35, str, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: fill });
  }
  function validCount(n) { return typeof n === 'number' && isFinite(n) && Math.floor(n) === n && n > 0; }

  function glyphPlayer(o, p) {
    var out = '';
    if (o.team === 'A') {
      var tri = triangle(p[0], p[1], S.triR);
      out += el('polygon', { points: pts(tri), fill: C.halo, stroke: C.halo, 'stroke-width': 8, 'stroke-linejoin': 'round' });
      out += el('polygon', { points: pts(tri), fill: C.teamA, stroke: C.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
      if (validCount(o.n)) out += numeral(p[0], p[1] + S.triR * 0.14, o.n, '#ffffff', S.numFont);
    } else if (o.team === 'B') {
      var h = S.sqHalf;
      out += el('rect', { x: p[0] - h, y: p[1] - h, width: 2 * h, height: 2 * h, rx: 4, fill: C.halo, stroke: C.halo, 'stroke-width': 8 });
      out += el('rect', { x: p[0] - h, y: p[1] - h, width: 2 * h, height: 2 * h, rx: 4, fill: C.teamB, stroke: C.ink, 'stroke-width': 2.5 });
      if (validCount(o.n)) out += numeral(p[0], p[1], o.n, '#ffffff', S.numFont);
    }
    return out;
  }
  function glyphBall(p) {
    return el('circle', { cx: p[0], cy: p[1], r: S.ballR + 3, fill: C.halo }) +
      el('circle', { cx: p[0], cy: p[1], r: S.ballR, fill: C.ball, stroke: C.ink, 'stroke-width': 2.5 });
  }
  function glyphCone(x, y) {
    // Small orange triangle on a darker base plate (distinct from team A).
    return el('rect', { x: x - 16, y: y + 9, width: 32, height: 6, rx: 2, fill: C.coneBase, stroke: C.ink, 'stroke-width': 1.5 }) +
      el('polygon', { points: pts([[x, y - 17], [x + 11, y + 10], [x - 11, y + 10]]), fill: C.cone, stroke: C.coneBase, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  }
  function glyphStation(o, p) {
    var out = el('circle', { cx: p[0], cy: p[1], r: S.stationR + 3, fill: C.halo });
    out += el('circle', { cx: p[0], cy: p[1], r: S.stationR, fill: C.station, stroke: C.ink, 'stroke-width': 4 });
    out += el('circle', { cx: p[0], cy: p[1], r: S.stationR - 7, fill: 'none', stroke: C.ink, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
    if (validCount(o.n)) out += numeral(p[0], p[1], o.n, C.ink, S.numFont);
    return out;
  }
  function glyphTeacher(p) {
    var x = p[0], y = p[1], k = S.teacherR / 27;
    return el('circle', { cx: x, cy: y, r: S.teacherR + 3, fill: C.halo }) +
      el('circle', { cx: x, cy: y, r: S.teacherR, fill: C.teacher, stroke: C.ink, 'stroke-width': 2.5 }) +
      el('circle', { cx: x, cy: y - 8 * k, r: 6.5 * k, fill: '#ffffff' }) +
      el('path', { d: 'M ' + fmt(x - 13 * k) + ' ' + fmt(y + 16 * k) + ' C ' + fmt(x - 13 * k) + ' ' + fmt(y + k) + ' ' + fmt(x + 13 * k) + ' ' + fmt(y + k) + ' ' + fmt(x + 13 * k) + ' ' + fmt(y + 16 * k) + ' Z', fill: '#ffffff' });
  }
  // Top-left corner of the zone's label badge (centred when the zone is small).
  function zoneBadgeBox(o, t) {
    if (typeof o.label !== 'string' || !/^[A-Z]$/.test(o.label)) return null;
    var a = mapPoint(t, o.x, o.y), b = mapPoint(t, o.x + o.w, o.y + o.h);
    var w = b[0] - a[0], h = b[1] - a[1], bs = S.zoneBadge;
    var bx = a[0] + 6, by = a[1] + 6;
    if (w < bs + 12) bx = a[0] + w / 2 - bs / 2;
    if (h < bs + 12) by = a[1] + h / 2 - bs / 2;
    return [bx, by];
  }
  function glyphZone(o, t) {
    var a = mapPoint(t, o.x, o.y), b = mapPoint(t, o.x + o.w, o.y + o.h);
    var w = b[0] - a[0], h = b[1] - a[1];
    var out = el('rect', { x: a[0], y: a[1], width: w, height: h, rx: 6, fill: C.zoneFill, 'fill-opacity': '0.5', stroke: C.zoneStroke, 'stroke-width': 3.5, 'stroke-dasharray': '14 9' });
    var box = zoneBadgeBox(o, t);
    if (box) {
      var bs = S.zoneBadge, bx = box[0], by = box[1];
      out += el('rect', { x: bx, y: by, width: bs, height: bs, rx: 7, fill: '#ffffff', stroke: C.zoneStroke, 'stroke-width': 2.5 });
      out += text(bx + bs / 2, by + bs / 2 + S.zoneFont * 0.35, o.label, { 'text-anchor': 'middle', 'font-size': S.zoneFont, 'font-weight': 700, fill: C.ink });
    }
    return out;
  }
  function arrowHead(tip, dir) {
    var bx = tip[0] - dir[0] * S.arrowLen, by = tip[1] - dir[1] * S.arrowLen;
    var nx = -dir[1] * S.arrowHalf, ny = dir[0] * S.arrowHalf;
    return [tip, [bx + nx, by + ny], [bx - nx, by - ny]];
  }

  // Marker radius of an object sitting on a path endpoint (for trimming).
  function obstacleRadius(o) {
    if (o.type === 'player') return o.team === 'B' ? S.sqHalf * 1.2 : S.triR * 0.8;
    if (o.type === 'station') return S.stationR;
    if (o.type === 'teacher') return S.teacherR;
    if (o.type === 'ball') return S.ballR;
    return 0;
  }
  function endpointTrim(point, markers) {
    var best = 0;
    for (var i = 0; i < markers.length; i++) {
      if (dist(point, markers[i].p) <= 10) best = Math.max(best, markers[i].r);
    }
    return best;
  }

  // Builds the drawable geometry of one path (shared by paths + order badges).
  function pathGeometry(path, t, markers) {
    if (!path || !isPoint(path.from) || !isPoint(path.to)) return null;
    var raw = [path.from];
    if (Array.isArray(path.via)) {
      for (var i = 0; i < path.via.length; i++) if (isPoint(path.via[i])) raw.push(path.via[i]);
    }
    raw.push(path.to);
    var mapped = raw.map(function (q) { return mapPoint(t, q[0], q[1]); });
    var poly = smooth(mapped);
    var L = polyLength(poly);
    if (L < 1) return null;
    var a = endpointTrim(mapped[0], markers);
    a = a ? a + 4 : 0;
    var b = endpointTrim(mapped[mapped.length - 1], markers);
    b = b ? b + 6 : 0;
    var minVisible = S.arrowLen * 1.6;
    if (L - a - b < minVisible) {
      var k = Math.max(0, (L - minVisible) / Math.max(1e-9, a + b));
      a *= Math.min(1, k); b *= Math.min(1, k);
    }
    var body = slice(poly, a, L - b);
    return { poly: body, length: polyLength(body) };
  }

  function drawPath(path, geom) {
    var body = geom.poly;
    var L = geom.length;
    var end = pointAt(body, L);
    var back = pointAt(body, Math.max(0, L - S.arrowLen));
    var dir = [end.pt[0] - back.pt[0], end.pt[1] - back.pt[1]];
    var dl = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]) || 1;
    dir = [dir[0] / dl, dir[1] / dl];
    var stroked = slice(body, 0, Math.max(0, L - S.arrowLen * 0.7));
    if (path.kind === 'dribble') stroked = wave(stroked);
    var d = dPath(stroked);
    var out = el('path', { d: d, fill: 'none', stroke: C.halo, 'stroke-width': S.pathW + 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': '0.85' });
    var style = { d: d, fill: 'none', stroke: C.ink, 'stroke-width': S.pathW, 'stroke-linejoin': 'round' };
    if (path.kind === 'pass') { style['stroke-dasharray'] = '16 11'; style['stroke-linecap'] = 'butt'; }
    else style['stroke-linecap'] = 'round';
    out += el('path', style);
    out += el('polygon', { points: pts(arrowHead(end.pt, dir)), fill: C.ink, stroke: C.halo, 'stroke-width': 1.5, 'stroke-linejoin': 'round' });
    return out;
  }

  // Places a small order numeral beside the start of a path. Candidate spots are
  // tried in a fixed order (near the start, then further along; left side, then
  // right side of the travel direction); the first spot clear of markers and of
  // other badges wins, otherwise the spot with the most clearance.
  function orderBadge(order, geom, t, placed, markers) {
    var off = S.orderR + 12;
    var minX = S.orderR + 2, maxX = t.viewBox.w - S.orderR - 2;
    var minY = S.orderR + 2, maxY = t.viewBox.h - S.orderR - 2;
    var along = [Math.min(geom.length * 0.3, 40), Math.min(geom.length * 0.5, 80)];
    var best = null, bestScore = -Infinity;
    for (var a = 0; a < along.length && !(bestScore >= 0); a++) {
      var at = pointAt(geom.poly, along[a]);
      for (var side = 1; side >= -1; side -= 2) {
        var x = Math.max(minX, Math.min(maxX, at.pt[0] + side * at.dir[1] * off));
        var y = Math.max(minY, Math.min(maxY, at.pt[1] - side * at.dir[0] * off));
        var score = Infinity;
        for (var m = 0; m < markers.length; m++) score = Math.min(score, dist(markers[m].p, [x, y]) - markers[m].r - S.orderR - 3);
        for (var b = 0; b < placed.length; b++) score = Math.min(score, dist(placed[b].p, [x, y]) - 2 * S.orderR - 4);
        if (score > bestScore) { bestScore = score; best = [x, y]; }
        if (score >= 0) break;
      }
    }
    x = best[0]; y = best[1];
    placed.push({ order: order, p: [x, y] });
    return el('circle', { cx: x, cy: y, r: S.orderR + 2.5, fill: C.halo }) +
      el('circle', { cx: x, cy: y, r: S.orderR, fill: C.ink }) +
      numeral(x, y, order, '#ffffff', S.orderFont);
  }

  // ------------------------------------------------------------ scene
  function pickLang(map, lang) {
    if (map && typeof map === 'object') {
      if (typeof map[lang] === 'string' && map[lang].trim()) return map[lang];
      if (typeof map.en === 'string') return map.en;
    }
    return '';
  }
  function safeId(s) { return String(s).replace(/[^A-Za-z0-9_-]/g, '_'); }
  function kit() { return { cone: glyphCone, fmt: fmt }; }

  function svgOpen(w, h, lang, prefix, extra) {
    var a = {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 ' + fmt(w) + ' ' + fmt(h),
      width: w,
      height: h,
      role: 'img',
      'aria-labelledby': prefix + '-title ' + prefix + '-desc',
      lang: lang,
      'font-family': FONT
    };
    for (var k in extra) a[k] = extra[k];
    return '<svg' + attrs(a) + '>';
  }

  /**
   * renderScene(scene, opts) -> SVG string.
   * opts.lang     : 'he' | 'en' | 'ar' | 'ru' | 'es' (default 'en'); selects <title>/<desc>.
   * opts.idPrefix : prefix for element ids (default derived from scene id + lang), so
   *                 several diagrams can be inlined in one HTML page.
   * Throws on an unknown template. Objects/paths with invalid coordinates are skipped
   * (the validator reports them).
   */
  function renderScene(scene, opts) {
    opts = opts || {};
    var lang = LANGS.indexOf(opts.lang) >= 0 ? opts.lang : 'en';
    if (!scene || typeof scene !== 'object') throw new Error('Scene must be an object');
    var t = getTemplate(scene.template);
    var prefix = opts.idPrefix ? safeId(opts.idPrefix) : 'ped-' + safeId(scene.id || 'scene') + '-' + lang;
    var objects = Array.isArray(scene.objects) ? scene.objects.filter(function (o) { return o && typeof o === 'object'; }) : [];
    var paths = Array.isArray(scene.paths) ? scene.paths.filter(function (p) { return p && typeof p === 'object'; }) : [];

    var out = svgOpen(t.viewBox.w, t.viewBox.h, lang, prefix, { 'data-template': t.id, 'data-scene': scene.id ? String(scene.id) : undefined });
    out += '<title id="' + prefix + '-title">' + escapeXml(pickLang(scene.title, lang)) + '</title>';
    out += '<desc id="' + prefix + '-desc">' + escapeXml(pickLang(scene.alt, lang)) + '</desc>';
    out += el('rect', { x: 0, y: 0, width: t.viewBox.w, height: t.viewBox.h, fill: '#ffffff' });
    out += '<g data-layer="template">' + t.draw(kit()) + '</g>';

    // Zones
    var zones = '';
    objects.forEach(function (o) {
      if (o.type === 'zone' && isNum(o.x) && isNum(o.y) && isNum(o.w) && isNum(o.h) && o.w > 0 && o.h > 0) zones += glyphZone(o, t);
    });
    out += '<g data-layer="zones">' + zones + '</g>';

    // Markers that can sit on path endpoints.
    var markers = [];
    objects.forEach(function (o) {
      if (isNum(o.x) && isNum(o.y)) {
        var r = obstacleRadius(o);
        if (r) markers.push({ p: mapPoint(t, o.x, o.y), r: r });
      }
    });

    // Paths
    var geoms = paths.map(function (p) {
      if (p.kind !== 'move' && p.kind !== 'pass' && p.kind !== 'dribble') return null;
      return pathGeometry(p, t, markers);
    });
    var pathSvg = '';
    paths.forEach(function (p, i) { if (geoms[i]) pathSvg += drawPath(p, geoms[i]); });
    out += '<g data-layer="paths">' + pathSvg + '</g>';

    // Objects, drawn in a fixed type order so overlaps are predictable.
    var order = ['cone', 'station', 'player', 'teacher', 'ball'];
    var objSvg = '';
    order.forEach(function (type) {
      objects.forEach(function (o) {
        if (o.type !== type || !isNum(o.x) || !isNum(o.y)) return;
        var p = mapPoint(t, o.x, o.y);
        if (type === 'cone') objSvg += glyphCone(p[0], p[1]);
        else if (type === 'station') objSvg += glyphStation(o, p);
        else if (type === 'player') objSvg += glyphPlayer(o, p);
        else if (type === 'teacher') objSvg += glyphTeacher(p);
        else if (type === 'ball') objSvg += glyphBall(p);
      });
    });
    out += '<g data-layer="objects">' + objSvg + '</g>';

    // Order numerals, only when more than one distinct order value exists.
    var orders = {};
    paths.forEach(function (p, i) { if (geoms[i] && validCount(p.order)) orders[p.order] = true; });
    if (Object.keys(orders).length > 1) {
      var placed = [];
      var starts = [];
      var badges = '';
      var clearance = markers.slice();
      objects.forEach(function (o) {
        if (o.type === 'cone' && isNum(o.x) && isNum(o.y)) clearance.push({ p: mapPoint(t, o.x, o.y), r: 15 });
        if (o.type === 'zone' && isNum(o.x) && isNum(o.y) && isNum(o.w) && isNum(o.h)) {
          var box = zoneBadgeBox(o, t);
          if (box) clearance.push({ p: [box[0] + S.zoneBadge / 2, box[1] + S.zoneBadge / 2], r: S.zoneBadge * 0.7 });
        }
      });
      paths.forEach(function (p, i) {
        if (!geoms[i] || !validCount(p.order)) return;
        // One badge per (order, start point): paths that branch from the same spot share it.
        var start = geoms[i].poly[0];
        for (var k = 0; k < starts.length; k++) {
          if (starts[k].order === p.order && dist(starts[k].p, start) < 10) return;
        }
        starts.push({ order: p.order, p: start });
        badges += orderBadge(p.order, geoms[i], t, placed, clearance);
      });
      out += '<g data-layer="order">' + badges + '</g>';
    }
    return out + '</svg>';
  }

  /** Empty template preview (used by the gallery). */
  function renderTemplate(id, opts) {
    opts = opts || {};
    var t = getTemplate(id);
    var titles = {}, alts = {};
    LANGS.forEach(function (l) { titles[l] = t.label; alts[l] = t.orientation; });
    return renderScene({ id: 'template-' + id, template: id, title: titles, alt: alts, objects: [], paths: [] }, opts);
  }

  // ------------------------------------------------------------ legend
  var LEGEND_LABELS = {
    heading: { he: 'מקרא', en: 'Legend', ar: 'مفتاح الرموز', ru: 'Условные обозначения', es: 'Leyenda' },
    teamA: { he: 'קבוצה א׳', en: 'Team A', ar: 'الفريق أ', ru: 'Команда А', es: 'Equipo A' },
    teamB: { he: 'קבוצה ב׳', en: 'Team B', ar: 'الفريق ب', ru: 'Команда Б', es: 'Equipo B' },
    ball: { he: 'כדור', en: 'Ball', ar: 'كرة', ru: 'Мяч', es: 'Balón' },
    cone: { he: 'קונוס', en: 'Cone', ar: 'قمع', ru: 'Конус', es: 'Cono' },
    move: { he: 'תנועה', en: 'Movement', ar: 'حركة', ru: 'Перемещение', es: 'Desplazamiento' },
    pass: { he: 'מסירה', en: 'Pass', ar: 'تمريرة', ru: 'Передача', es: 'Pase' },
    dribble: { he: 'כדרור', en: 'Dribble', ar: 'تنطيط / قيادة الكرة', ru: 'Ведение мяча', es: 'Conducción / bote' },
    zone: { he: 'אזור', en: 'Zone', ar: 'منطقة', ru: 'Зона', es: 'Zona' },
    teacher: { he: 'מורה', en: 'Teacher', ar: 'المعلّم', ru: 'Учитель', es: 'Docente' },
    station: { he: 'תחנה', en: 'Station', ar: 'محطة', ru: 'Станция', es: 'Estación' }
  };
  var LEGEND_ORDER = ['teamA', 'teamB', 'ball', 'cone', 'station', 'move', 'pass', 'dribble', 'zone', 'teacher'];

  function legendIcon(key, cx, cy) {
    var o;
    switch (key) {
      case 'teamA': return glyphPlayer({ team: 'A', n: 1 }, [cx, cy]);
      case 'teamB': return glyphPlayer({ team: 'B', n: 2 }, [cx, cy]);
      case 'ball': return glyphBall([cx, cy]);
      case 'cone': return glyphCone(cx, cy);
      case 'station': return glyphStation({ n: 3 }, [cx, cy]);
      case 'teacher': return glyphTeacher([cx, cy]);
      case 'zone':
        return el('rect', { x: cx - 44, y: cy - 22, width: 88, height: 44, rx: 6, fill: C.zoneFill, 'fill-opacity': '0.5', stroke: C.zoneStroke, 'stroke-width': 3.5, 'stroke-dasharray': '14 9' });
      default:
        o = { kind: key };
        var poly = [[cx - 48, cy], [cx + 48, cy]];
        return drawPath(o, { poly: poly, length: 96 });
    }
  }

  /**
   * renderLegend(lang) -> SVG string with the notation and localised labels.
   * Hebrew and Arabic are laid out right-to-left (direction="rtl", icons on the
   * right of each label, columns ordered from the right).
   */
  function renderLegend(lang) {
    lang = LANGS.indexOf(lang) >= 0 ? lang : 'en';
    var rtl = !!RTL[lang];
    var W = 760, rowH = 78, top = 92, cols = 2;
    var rows = Math.ceil(LEGEND_ORDER.length / cols);
    var H = top + rows * rowH + 20;
    var prefix = 'ped-legend-' + lang;
    var headingText = LEGEND_LABELS.heading[lang];
    var extra = rtl ? { direction: 'rtl' } : {};
    var out = svgOpen(W, H, lang, prefix, extra);
    out += '<title id="' + prefix + '-title">' + escapeXml(headingText) + '</title>';
    out += '<desc id="' + prefix + '-desc">' + escapeXml(LEGEND_ORDER.map(function (k) { return LEGEND_LABELS[k][lang]; }).join(', ')) + '</desc>';
    out += el('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff', stroke: '#d1d5db', 'stroke-width': 2 });
    var textDir = rtl ? { direction: 'rtl', 'unicode-bidi': 'embed' } : {};
    function label(x, y, str, size, weight) {
      var o = { 'font-size': size, fill: C.ink, 'text-anchor': 'start' };
      if (weight) o['font-weight'] = weight;
      for (var k in textDir) o[k] = textDir[k];
      return text(x, y, str, o);
    }
    out += label(rtl ? W - 32 : 32, 58, headingText, 34, 700);
    var colW = (W - 64) / cols;
    LEGEND_ORDER.forEach(function (key, i) {
      var col = Math.floor(i / rows), row = i % rows;
      var cy = top + row * rowH + rowH / 2;
      // Column 0 is the reading-start column (left in LTR, right in RTL).
      var colLeft = rtl ? W - 32 - (col + 1) * colW : 32 + col * colW;
      var iconCx, textX;
      if (rtl) { iconCx = colLeft + colW - 56; textX = colLeft + colW - 120; }
      else { iconCx = colLeft + 56; textX = colLeft + 120; }
      out += '<g data-key="' + key + '">' + legendIcon(key, iconCx, cy) + label(textX, cy + 10, LEGEND_LABELS[key][lang], 28) + '</g>';
    });
    return out + '</svg>';
  }

  return {
    LANGS: LANGS,
    RTL_LANGS: ['he', 'ar'],
    PALETTE: C,
    SIZES: S,
    LEGEND_LABELS: LEGEND_LABELS,
    templates: T,
    templateIds: T.ids.slice(),
    getTemplate: getTemplate,
    mapPoint: mapPoint,
    escapeXml: escapeXml,
    renderScene: renderScene,
    renderTemplate: renderTemplate,
    renderLegend: renderLegend
  };
});
