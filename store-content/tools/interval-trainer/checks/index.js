'use strict';
// Entry point so that `node --test store-content/tools/interval-trainer/checks/` works on
// Node 22, where a directory argument is resolved as a module (this index.js). It loads every
// *.test.cjs file in this folder in a stable order. Running
// `node --test store-content/tools/interval-trainer/checks/*.test.cjs` is equivalent (use one
// form, not both). The browser check (browser.cjs) is separate because it needs Chromium.
const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname)
  .filter((f) => f.endsWith('.test.cjs'))
  .sort()
  .forEach((f) => require(path.join(__dirname, f)));
