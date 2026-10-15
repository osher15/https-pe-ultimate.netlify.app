"use strict";
/* Dev helper: render one exercise's SVG and print solved joint data for chosen frames.
   node src/preview.cjs <id> <out.svg> [frame,frame,...] */
const fs = require("fs");
const { render } = require("./svg.cjs");
const spec = require("./exercises.json");
const id = process.argv[2];
const ex = spec.exercises.find(e => e.id === id);
if (!ex) { console.error("unknown exercise " + id); process.exit(2); }
const r = render(ex, spec.fps);
if (process.argv[3]) fs.writeFileSync(process.argv[3], r.svg);
const f1 = x => +x.toFixed(1);
const pt = p => p.map(f1).join(",");
for (const i of (process.argv[4] || "0").split(",").map(Number)) {
  const J = r.frames[i], a = J.angles;
  const o = k => JSON.stringify(Object.fromEntries(Object.entries(a[k]).map(([kk, v]) => [kk, f1(v)])));
  console.log(`#${i} pelvis ${pt(J.pelvis)} kneeR ${pt(J.kneeR)} ankleR ${pt(J.ankleR)} toeR ${pt(J.toeR)} heelR ${pt(J.heelR)} shR ${pt(J.shoulderR)} wrR ${pt(J.wristR)} head ${pt(J.head)}`);
  console.log(`   legR ${o("legR")} legL ${o("legL")} armR ${o("armR")} spine ${o("spine")}`);
}
console.log("bytes", r.svg.length, "frames", r.n, "view", r.view.map(f1).join(" "));
