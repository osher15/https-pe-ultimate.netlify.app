"use strict";
/* All exercise specs, in library order. Each category file exports an array of specs; see the
   README ("How it works") for the spec format. Helpers shared by spec files are in specs/_h.cjs. */
const parts = [
  require("./specs/pilot.cjs"),
  require("./specs/strength.cjs"),
  require("./specs/cardio.cjs"),
  require("./specs/core.cjs"),
  require("./specs/mobility.cjs"),
  require("./specs/equipment.cjs")
];
const lib = require("../library.json").exercises;
const all = [].concat(...parts);
const order = new Map(lib.map((e, i) => [e.anim, i]));
all.sort((a, b) => (order.has(a.id) ? order.get(a.id) : 1e9) - (order.has(b.id) ? order.get(b.id) : 1e9));

module.exports = { fps: 25, gifFps: 20, exercises: all };
