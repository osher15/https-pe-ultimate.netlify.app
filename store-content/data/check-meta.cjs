#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const filename = path.join(__dirname, 'activities.meta.json');
let data;
try { data = JSON.parse(fs.readFileSync(filename, 'utf8')); }
catch (err) { console.error('FAIL: cannot parse activities.meta.json:', err.message); process.exit(1); }
if (!Array.isArray(data)) { console.error('FAIL: expected a JSON array'); process.exit(1); }
const errors = [];
if (data.length !== 120) errors.push('Expected 120 activities, got ' + data.length);
const ids = new Set();
for (const [index, item] of data.entries()) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push('Invalid item at index ' + index); continue; }
  if (typeof item.id !== 'string' || !item.id.trim()) errors.push('Missing ID at index ' + index);
  else if (ids.has(item.id)) errors.push('Duplicate ID: ' + item.id);
  else ids.add(item.id);
}
if (errors.length) { for (const e of errors) console.error('FAIL:', e); process.exit(1); }
console.log('PASS: 120 activity metadata records, valid JSON, unique IDs');
