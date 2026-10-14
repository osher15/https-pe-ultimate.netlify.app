"use strict";
/* Shared loader for the Interval Trainer Node checks: evaluates the shipped data + engine
   <script> blocks of interval-trainer.html in a bare VM (no DOM). */
const fs = require("fs"), path = require("path");
const TOOL = path.resolve(__dirname, "..");
const ROOT = path.resolve(TOOL, "..", "..", "..");
const HTML_PATH = path.join(TOOL, "interval-trainer.html");
const HTML = fs.readFileSync(HTML_PATH, "utf8");

function script(id) {
  const m = new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>').exec(HTML);
  if (!m) throw new Error("script #" + id + " not found");
  return m[1];
}
function load() {
  /* Evaluated in this realm (not a vm context) so deepStrictEqual sees ordinary objects;
     the scripts only touch the `window` object passed in. */
  const win = {};
  new Function("window", script("pe-it-data") + "\n;\n" + script("pe-it-engine"))(win);
  return { D: win.PE_IT_DATA, E: win.PE_IT_ENGINE };
}
module.exports = { TOOL, ROOT, HTML, HTML_PATH, script, load };
