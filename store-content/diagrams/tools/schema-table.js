#!/usr/bin/env node
/*
 * Prints the template reference tables embedded in schema.md (between the
 * "template-table" markers). test/docs.test.js checks that schema.md is in sync.
 *
 *   node store-content/diagrams/tools/schema-table.js
 */
'use strict';
var T = require('../templates/index.js');

function cell(s) { return String(s).replace(/\|/g, '\\|'); }

function templateTable() {
  var out = [];
  out.push('| Template | Allowed sports | Intended use | Orientation / coordinates | viewBox | Playing area (viewBox units) |');
  out.push('|---|---|---|---|---|---|');
  T.list.forEach(function (t) {
    out.push('| `' + t.id + '` | ' + t.sports.join(', ') + ' | ' + cell(t.use) + ' | ' + cell(t.orientation) + ' | ' +
      t.viewBox.w + ' x ' + t.viewBox.h + ' | x ' + t.area.x + ', y ' + t.area.y + ', w ' + t.area.w + ', h ' + t.area.h + ' |');
  });
  out.push('');
  out.push('Landmarks in scene coordinates (0-100, origin top-left of the playing area):');
  out.push('');
  T.list.forEach(function (t) {
    var parts = Object.keys(t.landmarks).map(function (k) { return k + ' = ' + t.landmarks[k]; });
    out.push('- `' + t.id + '`: ' + cell(parts.join('; ')));
  });
  return out.join('\n');
}

module.exports = { templateTable: templateTable };

if (require.main === module) process.stdout.write(templateTable() + '\n');
