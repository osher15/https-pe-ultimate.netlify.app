"use strict";
/* Headless Chromium pass over the animated SVGs.
     NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
       node store-content/exercise-anim/checks/browser.cjs
   For each exercise:
   - the animated SVG loads in an <img> and animates (screenshots 0.4 s apart differ);
   - opened as a document with prefers-reduced-motion: reduce, the SVG's own media query hides
     the animation and shows the still key pose (screenshots identical);
   - the recommended app markup <picture><source media="(prefers-reduced-motion: reduce)"
     srcset="still/..."><img src="svg/..."></picture> shows the still file under reduce;
   - seeked just before the loop end, the SVG matches frame 0 (seamless loop).
   Note: Playwright's reduced-motion emulation does not reach an SVG inside <img> (its own
   isolated document), which is why the app should use the <picture> markup above. */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");
const spec = require("../src/exercises.cjs");

const OUT = path.resolve(__dirname, "..", "out");
let failed = 0;
const ok = (c, msg) => { console.log((c ? "ok   " : "FAIL ") + msg); if (!c) failed++; };

/* share of pixels whose RGB differs by more than 24 (anti-aliasing tolerance) */
async function pixelDiff(page, a, b) {
  return page.evaluate(async ([a64, b64]) => {
    const load = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = "data:image/png;base64," + src; });
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    const px = im => { const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const da = px(ia), db = px(ib); let n = 0;
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) n++;
    return n / (da.length / 4);
  }, [a.toString("base64"), b.toString("base64")]);
}

(async () => {
  const browser = await chromium.launch();
  const html = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "exanim-")), "img.html");
  const shot = p => p.screenshot({ clip: { x: 0, y: 0, width: 260, height: 260 } });
  for (const motion of ["no-preference", "reduce"]) {
    const page = await browser.newPage({ viewport: { width: 300, height: 300 }, reducedMotion: motion });
    for (const ex of spec.exercises) {
      const anim = "file://" + path.join(OUT, "svg", ex.id + ".svg"), still = "file://" + path.join(OUT, "still", ex.id + ".svg");
      fs.writeFileSync(html, `<!doctype html><body style="margin:0;background:#fff"><picture><source media="(prefers-reduced-motion: reduce)" srcset="${still}"><img id="i" src="${anim}" width="260" height="260"></picture></body>`);
      await page.goto("file://" + html);
      await page.waitForFunction(() => document.getElementById("i").complete);
      const info = await page.evaluate(() => ({ w: document.getElementById("i").naturalWidth, src: document.getElementById("i").currentSrc }));
      ok(info.w === 260, `${ex.id}: <picture> loads (${motion})`);
      ok(info.src.includes(motion === "reduce" ? "/still/" : "/svg/"), `${ex.id}: <picture> picks ${motion === "reduce" ? "the still" : "the animated"} file`);
      await page.waitForTimeout(150);
      const a = await shot(page);
      await page.waitForTimeout(400);
      const b = await shot(page);
      const same = Buffer.compare(a, b) === 0;
      ok(motion === "reduce" ? same : !same, `${ex.id}: ${motion === "reduce" ? "still under reduced motion" : "animates in <img>"}`);
      // the animated SVG opened directly honours the media query itself
      if (motion === "reduce") {
        await page.goto(anim);
        const hidden = await page.evaluate(() => getComputedStyle(document.querySelector(".a")).display === "none" && getComputedStyle(document.querySelector(".s")).display !== "none");
        const c = await shot(page); await page.waitForTimeout(300); const d = await shot(page);
        ok(hidden && Buffer.compare(c, d) === 0, `${ex.id}: animated SVG shows its still pose under reduced motion`);
      }
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 260, height: 260 } });
  const diffPage = await browser.newPage();
  for (const ex of spec.exercises) {
    await page.goto("file://" + path.join(OUT, "svg", ex.id + ".svg"));
    await page.evaluate(() => document.documentElement.pauseAnimations());
    await page.evaluate(() => document.documentElement.setCurrentTime(0));
    const a = await page.screenshot();
    await page.evaluate(t => document.documentElement.setCurrentTime(t - 0.0002), ex.duration);
    const b = await page.screenshot();
    const d = await pixelDiff(diffPage, a, b);
    ok(d < 0.005, `${ex.id}: frame just before the loop end matches frame 0 (seamless; ${(d * 100).toFixed(3)}% px differ)`);
  }
  await browser.close();
  console.log(failed ? `${failed} failed` : "all browser checks passed");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
