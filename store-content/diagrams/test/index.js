'use strict';
// Entry point so that `node --test store-content/diagrams/test/` works on Node 22,
// where a directory argument is resolved as a module (this index.js). It loads every
// *.test.js file in this folder in a stable order. Running the files directly with
// `node --test store-content/diagrams/test/*.test.js` is equivalent (use one form,
// not both, or the tests run twice).
const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname)
  .filter((f) => f.endsWith('.test.js'))
  .sort()
  .forEach((f) => require(path.join(__dirname, f)));
