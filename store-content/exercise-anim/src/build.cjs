"use strict";
/*
  Build the exercise animations.

    node store-content/exercise-anim/src/build.cjs                 # SVG only (pure Node)
    NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
      node store-content/exercise-anim/src/build.cjs --gif --sheet  # + GIFs + contact sheet

  Options: --only id1,id2   --strip <dir>  (write a PNG strip per exercise for review)

  GIF frames are rendered from the animated SVG itself (headless Chromium, animations paused
  and seeked with setCurrentTime), then assembled with ffmpeg palettegen/paletteuse. The SVG is
  the single source of truth; the GIF is a raster of it.
*/
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { render } = require("./svg.cjs");
const spec = require("./exercises.cjs");

const ROOT = path.resolve(__dirname, "..");
const OUT_SVG = path.join(ROOT, "out", "svg");
const OUT_GIF = path.join(ROOT, "out", "gif");
const OUT_STILL = path.join(ROOT, "out", "still");
const PX = 260;
const GIF_FPS = spec.gifFps || 20;

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const only = opt("--only") ? opt("--only").split(",") : null;
const exercises = spec.exercises.filter(e => !only || only.includes(e.id));

const sha = b => crypto.createHash("sha256").update(b).digest("hex");

async function main() {
  fs.mkdirSync(OUT_SVG, { recursive: true });
  // README checklist block is generated from the specs
  const readmeFile = path.join(ROOT, "README.md");
  fs.writeFileSync(readmeFile, require("./form.cjs").injectReadme(fs.readFileSync(readmeFile, "utf8"), spec));
  const results = [];
  for (const ex of exercises) {
    const r = render(ex, spec.fps, { px: PX });
    const file = path.join(OUT_SVG, ex.id + ".svg");
    fs.writeFileSync(file, r.svg);
    fs.mkdirSync(OUT_STILL, { recursive: true });
    fs.writeFileSync(path.join(OUT_STILL, ex.id + ".svg"), r.stillSvg);
    results.push({ ex, file, n: r.n, svgBytes: Buffer.byteLength(r.svg) });
    console.log(`svg  ${ex.id.padEnd(8)} ${String(Buffer.byteLength(r.svg)).padStart(7)} B  ${r.n} frames`);
  }
  const wantGif = flag("--gif"), strip = opt("--strip"), sheet = flag("--sheet");
  if (!wantGif && !strip && !sheet) return writeManifest(results);
  const { chromium } = require("playwright");
  // single-threaded software raster: makes the anti-aliasing (and so the GIF bytes) repeatable
  const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-gpu-rasterization", "--num-raster-threads=1",
    "--disable-partial-raster", "--force-color-profile=srgb", "--disable-lcd-text"] });
  const page = await browser.newPage({ viewport: { width: PX, height: PX }, deviceScaleFactor: 1 });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "exanim-"));
  const sheetRows = [];
  for (const r of results) {
    const dir = path.join(tmp, r.ex.id);
    fs.mkdirSync(dir, { recursive: true });
    await page.goto("file://" + r.file);
    await page.evaluate(() => document.documentElement.pauseAnimations());
    // warm-up: the very first paint after navigation can differ in anti-aliasing; discard it
    await page.evaluate(() => new Promise(res => { document.documentElement.setCurrentTime(0); requestAnimationFrame(() => requestAnimationFrame(res)); }));
    await page.screenshot({ clip: { x: 0, y: 0, width: PX, height: PX } });
    // GIF: gifFps (20 = exact 5 cs delay). An exercise whose loop holds identical repetitions
    // (cycles > 1) is encoded as one repetition: the looping picture is the same, the file half.
    r.gifFrames = Math.round(r.ex.duration / (r.ex.cycles || 1) * GIF_FPS);
    for (let i = 0; i < r.gifFrames; i++) {
      // seek, then wait two animation frames so the screenshot never races the repaint
      await page.evaluate(t => new Promise(res => { document.documentElement.setCurrentTime(t); requestAnimationFrame(() => requestAnimationFrame(res)); }), i / GIF_FPS);
      // take screenshots until two in a row agree, so a late repaint cannot leak into a frame
      let shot = await page.screenshot({ clip: { x: 0, y: 0, width: PX, height: PX } });
      for (let k = 0; k < 6; k++) {
        const again = await page.screenshot({ clip: { x: 0, y: 0, width: PX, height: PX } });
        if (Buffer.compare(again, shot) === 0) break;
        shot = again;
      }
      fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, "0")}.png`), shot);
    }
    const pick = [0, 1, 2, 3, 4, 5].map(k => path.join(dir, `f${String(Math.round(k * r.gifFrames / 6)).padStart(3, "0")}.png`));
    sheetRows.push({ id: r.ex.id, pick, n: r.gifFrames });
    if (wantGif) {
      fs.mkdirSync(OUT_GIF, { recursive: true });
      const gif = path.join(OUT_GIF, r.ex.id + ".gif");
      execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(GIF_FPS), "-i", path.join(dir, "f%03d.png"),
        "-vf", "split[a][b];[a]palettegen=max_colors=24:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=none:diff_mode=rectangle",
        "-loop", "0", gif]);
      r.gifBytes = fs.statSync(gif).size;
      r.gifSha = sha(fs.readFileSync(gif));
      console.log(`gif  ${r.ex.id.padEnd(8)} ${String(r.gifBytes).padStart(7)} B`);
    }
    if (strip) {
      fs.mkdirSync(strip, { recursive: true });
      const every = Math.max(1, Math.round(r.gifFrames / 12));
      const sel = []; for (let i = 0; i < r.gifFrames; i += every) sel.push(path.join(dir, `f${String(i).padStart(3, "0")}.png`));
      execFileSync("montage", [...sel, "-tile", "6x", "-geometry", "+1+1", path.join(strip, r.ex.id + ".png")]);
    }
  }
  await browser.close();
  if (sheet) {
    const files = [];
    for (const row of sheetRows) for (const [k, f] of row.pick.entries()) files.push("-label", `${row.id}  t=${(Math.round(k * row.n / 6) / GIF_FPS).toFixed(2)}s`, f);
    execFileSync("montage", [...files, "-tile", "6x", "-geometry", "130x130+3+3", "-pointsize", "10", "-background", "#ffffff", "-define", "png:exclude-chunks=date,time,tEXt,zTXt,iTXt", path.join(ROOT, "contact-sheet.png")]);
    console.log("sheet contact-sheet.png");
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  writeManifest(results);
}

function writeManifest(results) {
  const mf = path.join(ROOT, "out", "manifest.json");
  let old = {};
  try { old = JSON.parse(fs.readFileSync(mf, "utf8")); } catch (e) { /* first build */ }
  const items = Object.assign({}, old.items || {});
  for (const r of results) {
    const prev = items[r.ex.id] || {};
    items[r.ex.id] = {
      duration: r.ex.duration, fps: spec.fps, frames: r.n, size: PX,
      svgBytes: r.svgBytes, svgSha256: sha(fs.readFileSync(r.file)),
      stillSha256: sha(fs.readFileSync(path.join(OUT_STILL, r.ex.id + ".svg"))),
      gifFps: GIF_FPS, gifFrames: r.gifFrames != null ? r.gifFrames : prev.gifFrames,
      gifBytes: r.gifBytes != null ? r.gifBytes : prev.gifBytes, gifSha256: r.gifSha || prev.gifSha256
    };
  }
  const sorted = {};
  for (const k of Object.keys(items).sort()) sorted[k] = items[k];
  fs.writeFileSync(mf, JSON.stringify({ note: "Generated by src/build.cjs. Do not edit.", items: sorted }, null, 1) + "\n");
}

main().catch(e => { console.error(e); process.exit(1); });
