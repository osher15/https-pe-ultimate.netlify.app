import React from "react";
import {
  AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, continueRender, delayRender,
} from "remotion";
import type { AdData, Seg } from "./types";
import {
  FPS, LIME, INK, PH, clamp, easeOut, fontFam, BrandBg, camAt, Headline, Captions, Stamp,
  Confetti, PlaneIcon, NoWifiIcon, MoonIcon,
} from "./parts";

const fr = (t: number) => Math.round(t * FPS);

/* גופני המותג (public/fonts/fonts.css) — מחכים להם לפני כל פריים */
const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = staticFile("fonts/fonts.css");
    l.onload = () => {
      const fams = ["800 40px Rubik", "500 40px Rubik", "800 40px Cairo", "600 40px Cairo"];
      Promise.all(fams.map((x) => document.fonts.load(x, "אבג abc ابت абв"))).then(() => continueRender(h), () => continueRender(h));
    };
    l.onerror = () => continueRender(h);
    document.head.appendChild(l);
  }, [h]);
};

/* ---------- פתיח: הבעיה, בצחוק ---------- */
const Hook: React.FC<{ s: Seg; d: AdData }> = ({ s, d }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const tf = s.cues.length > 1 ? s.cues[1].start - s.t0 : s.d * 0.55;      /* הקפאה עם הכתובית השנייה */
  const gem = s.gem!;
  const srcT = Math.min(Math.min(t, tf) * gem.rate, gem.dur - 0.06);
  const zin = spring({ frame: f - fr(tf), fps: FPS, config: { damping: 18, stiffness: 140 } });
  const z = t < tf ? 1 : 1 + (d.hook.face.z - 1) * zin;
  const shake = t > tf + 0.25 && t < tf + 0.42 ? Math.sin(f * 2.3) * 10 : 0;
  const out = interpolate(t, [s.d - 0.42, s.d], [0, 1], { ...clamp, easing: Easing2 });
  const c0 = s.cues[0] ? s.cues[0].start - s.t0 : 0;
  return (
    <AbsoluteFill
      style={{
        scale: `${1 - 0.86 * out}`, rotate: `${-32 * out}deg`, translate: `${d.rtl ? 180 * out : -180 * out}px ${600 * out}px`,
        borderRadius: 80 * out, overflow: "hidden", boxShadow: out ? "0 30px 80px rgba(0,0,0,.6)" : undefined,
      }}
    >
      <AbsoluteFill style={{ transformOrigin: `${d.hook.face.x}px ${d.hook.face.y}px`, scale: `${z}`, translate: `${shake}px 0` }}>
        <AbsoluteFill style={{ filter: t >= tf ? "saturate(.55) sepia(.35) contrast(1.08)" : undefined }}>
          <Freeze frame={Math.floor(srcT * FPS)}>
            <OffthreadVideo src={staticFile(gem.src)} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
          </Freeze>
        </AbsoluteFill>
        {d.hook.bubbles.map((b, i) => (
          <Bubble key={i} text={d.gags.bubbles[i]} side={b.side} x={b.x} y={b.y} tail={b.tail} at={c0 + b.at} d={d} />
        ))}
      </AbsoluteFill>
      {t >= tf ? (
        <AbsoluteFill style={{ background: "radial-gradient(closest-side at 50% 42%,transparent 55%,rgba(0,0,0,.55))" }} />
      ) : null}
      <Stamp text={d.gags.stamp} at={tf + 0.22} color="#ff5a5a" rot={-7} lang={d.lang} rtl={d.rtl} y={1080} />
      <NightChip text={d.gags.night} at={tf + 0.95} d={d} />
    </AbsoluteFill>
  );
};
const Easing2 = (x: number) => x * x * x;

const Bubble: React.FC<{ text: string; side: string; x: number; y: number; tail: string; at: number; d: AdData }> = ({ text, side, x, y, tail, at, d }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - fr(at), fps: FPS, config: { damping: 10, stiffness: 240, mass: 0.6 } });
  if (f < fr(at)) return null;
  const tl = tail === "bl" ? { left: 40 } : tail === "br" ? { right: 40 } : { left: "46%" };
  return (
    <div style={{ position: "absolute", [side]: x, top: y, scale: `${s}`, transformOrigin: tail === "br" ? "85% 100%" : tail === "bl" ? "15% 100%" : "50% 100%", rotate: `${tail === "br" ? 3 : -3}deg` }}>
      <div
        style={{
          position: "relative", background: "#fff", color: INK, fontFamily: fontFam(d.lang), direction: d.rtl ? "rtl" : "ltr",
          fontSize: 50, fontWeight: 800, padding: "18px 30px", borderRadius: 36, whiteSpace: "nowrap",
          boxShadow: "0 16px 40px rgba(0,0,0,.35)", border: "4px solid #111",
        }}
      >
        {text}
        <div style={{ position: "absolute", bottom: -18, width: 34, height: 34, background: "#fff", borderRight: "4px solid #111", borderBottom: "4px solid #111", rotate: "45deg", ...tl }} />
      </div>
    </div>
  );
};

const NightChip: React.FC<{ text: string; at: number; d: AdData }> = ({ text, at, d }) => {
  const f = useCurrentFrame();
  if (f < fr(at)) return null;
  const s = spring({ frame: f - fr(at), fps: FPS, config: { damping: 16, stiffness: 180 } });
  const shown = Math.min(text.length, Math.floor((f - fr(at)) / 1.6));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center", opacity: s, translate: `0 ${(1 - s) * 60}px` }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 18, background: "#1e1b4b", border: "2px solid rgba(253,230,138,.5)",
          borderRadius: 999, padding: "14px 34px", fontFamily: fontFam(d.lang), direction: d.rtl ? "rtl" : "ltr",
          fontSize: 44, fontWeight: 800, color: "#fde68a", boxShadow: "0 16px 40px rgba(0,0,0,.4)",
        }}
      >
        <MoonIcon size={50} />
        <span>{text.slice(0, shown)}<span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>|</span></span>
      </div>
    </div>
  );
};

/* ---------- סצנה מהאפליקציה: טלפון, מצלמה שנוסעת לכפתור, כותרת ---------- */
const AppSeg: React.FC<{ s: Seg; d: AdData; slam: boolean }> = ({ s, d, slam }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const c = s.clip!;
  const S = PH.w / c.vw;
  const srcT = Math.min(c.start + t * c.rate, c.recDur - 0.08);
  const cam = camAt(c.keys, t);
  const Fx = PH.x + cam.fx * S, Fy = PH.y + cam.fy * S, Cx = PH.x + PH.w / 2, Cy = PH.y + PH.h / 2;
  const dir = d.rtl ? -1 : 1;
  /* כניסה: אחרי הפתיח — הטלפון «נוחת» מלמטה; אחרת — החלקה מהצד */
  const sIn = spring({ frame: f, fps: FPS, config: slam ? { damping: 13, stiffness: 150, mass: 0.9 } : { damping: 20, stiffness: 210 } });
  const inX = slam ? 0 : (1 - sIn) * 1100 * dir;
  const inY = slam ? (1 - sIn) * 1500 : 0;
  const land = slam && t > 0.28 && t < 0.46 ? Math.sin(f * 2.1) * 9 : 0;
  const outP = interpolate(t, [s.d - 0.2, s.d], [0, 1], { ...clamp, easing: (x) => x * x });
  const blur = Math.abs(inX) / 90 + outP * 10;
  const tilt = slam ? (1 - sIn) * 14 : (1 - sIn) * -18 * dir;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          translate: `${inX - outP * 1100 * dir + land}px ${inY}px`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
          perspective: 1800,
        }}
      >
        <AbsoluteFill style={{ rotate: slam ? `${tilt * 0.5}deg` : undefined, transform: slam ? undefined : `rotateY(${tilt}deg)` }}>
          {/* שכבת המצלמה */}
          <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${Cx - Fx * cam.z}px, ${Cy - Fy * cam.z}px) scale(${cam.z})` }}>
            <div
              style={{
                position: "absolute", left: PH.x - 12, top: PH.y - 12, width: PH.w + 24, height: PH.h + 24, borderRadius: PH.r + 12,
                background: "#1c2035", boxShadow: "0 0 0 2px rgba(255,255,255,.14),0 50px 110px rgba(0,0,0,.65),0 0 140px rgba(163,230,53,.14)",
              }}
            />
            <div style={{ position: "absolute", left: PH.x, top: PH.y, width: PH.w, height: PH.h, borderRadius: PH.r, overflow: "hidden", background: "#000" }}>
              <Freeze frame={Math.floor(srcT * FPS)}>
                <OffthreadVideo src={staticFile(c.src)} muted style={{ width: PH.w, height: PH.h }} />
              </Freeze>
              {c.rings.map((r, i) => {
                if (t < r.t0 - 0.1 || t > r.t1) return null;
                const p = interpolate(t, [r.t0 - 0.1, r.t0 + 0.25, r.t1 - 0.25, r.t1], [0, 1, 1, 0], clamp);
                const sc = interpolate(t, [r.t0 - 0.1, r.t0 + 0.3], [1.35, 1], { ...clamp, easing: easeOut });
                const [x, y, w, h] = r.box;
                return (
                  <div key={i} style={{
                    position: "absolute", left: (x - 6) * S, top: (y - 6) * S, width: (w + 12) * S, height: (h + 12) * S,
                    border: `${6 / cam.z}px solid ${LIME}`, borderRadius: 18, opacity: p, scale: `${sc}`,
                    boxShadow: `0 0 ${30 / cam.z}px rgba(163,230,53,.6)`,
                  }} />
                );
              })}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* הכותרת מעל הכול, עם רקע מדורג שלא יתערבב עם הזום */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(9,10,20,.92) 0,rgba(9,10,20,.7) 190px,transparent 290px)", opacity: interpolate(cam.z, [1, 1.3], [0.35, 1], clamp) }} />
      <AbsoluteFill style={{ opacity: 1 - outP, translate: `${-outP * 200 * dir}px 0` }}>
        {s.line ? <Headline text={s.line} lang={d.lang} rtl={d.rtl} /> : null}
      </AbsoluteFill>
      {s.k === "offline" ? <OfflineBadge d={d} /> : null}
      {c.ff ? <FastBadge rate={c.rate} rtl={d.rtl} out={outP} /> : null}
    </AbsoluteFill>
  );
};

/* הקלטה שמורצת קדימה כדי להגיע לרגע החשוב — אומרים את זה בגלוי */
const FastBadge: React.FC<{ rate: number; rtl: boolean; out: number }> = ({ rate, rtl, out }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - 6, fps: FPS, config: { damping: 14, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", top: 1545, [rtl ? "left" : "right"]: 90, scale: `${s}`, opacity: 1 - out }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(6,8,18,.8)", border: `2px solid ${LIME}`, borderRadius: 999,
        padding: "8px 20px", color: LIME, fontFamily: "'Rubik',sans-serif", fontSize: 34, fontWeight: 800, direction: "ltr" }}>
        <svg width={40} height={28} viewBox="0 0 40 28" fill={LIME}><path d="M0 0l18 14L0 28zM20 0l18 14-18 14z" /></svg>
        ×{rate.toFixed(1)}
      </div>
    </div>
  );
};

/* «מצב טיסה» — ההוכחה החזותית לטענה «עובד בלי קליטה» */
const OfflineBadge: React.FC<{ d: AdData }> = ({ d }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - fr(0.35), fps: FPS, config: { damping: 14, stiffness: 190 } });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 262, display: "flex", justifyContent: "center", translate: `0 ${(1 - s) * -140}px`, opacity: s }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 20, background: ORANGE_BG, color: "#1a1206", borderRadius: 999,
          padding: "14px 34px", fontFamily: fontFam(d.lang), direction: d.rtl ? "rtl" : "ltr", fontSize: 44, fontWeight: 800,
          boxShadow: "0 18px 50px rgba(0,0,0,.5)",
        }}
      >
        <PlaneIcon size={50} color="#1a1206" />
        <span>{d.gags.plane}</span>
        <NoWifiIcon size={46} color="#1a1206" />
      </div>
    </div>
  );
};
const ORANGE_BG = "#fb923c";

/* ---------- הרגע הרגוע (Gemini B) ---------- */
const Calm: React.FC<{ s: Seg; d: AdData }> = ({ s, d }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const gem = s.gem!;
  const srcT = Math.min(t * gem.rate, gem.dur - 0.06);
  const at2 = Math.max(0.9, s.d * 0.45);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: `${interpolate(t, [0, s.d], [1.02, 1.1])}` }}>
        <Freeze frame={Math.floor(srcT * FPS)}>
          <OffthreadVideo src={staticFile(gem.src)} muted style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg,rgba(0,0,0,.55) 0,transparent 480px)" }} />
      {s.line ? <Headline text={s.line} lang={d.lang} rtl={d.rtl} big top={90} delay={0.15} /> : null}
      <Stamp text={d.gags.stamp2} at={at2} color={LIME} rot={5} lang={d.lang} rtl={d.rtl} y={1180} size={80} />
      <Confetti at={at2 + 0.05} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 0.2], [0.85, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/* ---------- כרטיס סיום ---------- */
const End: React.FC<{ s: Seg; d: AdData }> = ({ d }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const r1 = interpolate(t, [0, 0.32], [0, 1250], { ...clamp, easing: easeOut });
  const r2 = interpolate(t, [0.12, 0.48], [0, 1250], { ...clamp, easing: easeOut });
  const sp = (at: number, cfg = { damping: 12, stiffness: 170 }) => spring({ frame: f - fr(at), fps: FPS, config: cfg });
  const lg = sp(0.3, { damping: 9, stiffness: 150 });
  const nm = sp(0.55), url = sp(0.8), tag = sp(1.0);
  const glow = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <AbsoluteFill>
      <BrandBg />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <div style={{ width: 280, height: 280, borderRadius: 70, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          scale: `${lg}`, rotate: `${(1 - lg) * -25}deg`, boxShadow: `0 30px 80px rgba(0,0,0,.5),0 0 ${60 + 50 * glow}px rgba(163,230,53,${0.25 + 0.2 * glow})` }}>
          <Img src={staticFile("logo.png")} style={{ width: 236 }} />
        </div>
        <div style={{ fontFamily: "'Rubik',sans-serif", fontSize: 112, fontWeight: 800, color: "#fff", direction: "ltr", opacity: nm, translate: `0 ${(1 - nm) * 50}px` }}>
          PE <span style={{ color: LIME }}>Ultimate</span>
        </div>
        <div style={{ fontFamily: "'Rubik',sans-serif", fontSize: 54, fontWeight: 800, color: INK, background: LIME, borderRadius: 999, padding: "20px 50px",
          direction: "ltr", scale: `${url}`, boxShadow: "0 16px 40px rgba(163,230,53,.3)" }}>
          pe-ultimate.netlify.app
        </div>
        <div style={{ fontFamily: fontFam(d.lang), direction: d.rtl ? "rtl" : "ltr", fontSize: 46, fontWeight: 800, color: "rgba(255,255,255,.85)", opacity: tag, translate: `0 ${(1 - tag) * 30}px` }}>
          {d.end}
        </div>
      </AbsoluteFill>
      {/* מעבר עיגול: ירוק מתרחב, ואחריו «חור» שחושף את הכרטיס */}
      {t < 0.5 ? (
        <AbsoluteFill style={{ background: LIME, clipPath: `circle(${r1}px at 50% 50%)`, WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${r2}px, #000 ${r2 + 1}px)` }} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- אפקטים קוליים: כל אחד נעוץ לאירוע בתמונה ---------- */
type Hit = { t: number; k: string; v: number; dur?: number };
const sfxHits = (d: AdData): Hit[] => {
  const out: Hit[] = [];
  let seenApp = false;
  d.segs.forEach((s, i) => {
    if (s.k === "hook") {
      const c0 = s.cues[0] ? s.cues[0].start : s.t0;
      const tf = s.cues.length > 1 ? s.cues[1].start : s.t0 + s.d * 0.55;
      d.hook.bubbles.forEach((b) => out.push({ t: c0 + b.at, k: "pop", v: 0.55 }));
      out.push({ t: tf - 0.05, k: "scratch", v: 0.8 });
      out.push({ t: tf + 0.22, k: "stamp", v: 0.7 });
      out.push({ t: tf + 0.95, k: "typing", v: 0.3, dur: 1.2 });
      out.push({ t: s.t1 - 0.45, k: "crumple", v: 0.75 });
    } else if (s.clip) {
      if (!seenApp) { out.push({ t: s.t0, k: "slam", v: 0.6 }); out.push({ t: s.t0 + 0.05, k: "needle", v: 0.5 }); seenApp = true; }
      else out.push({ t: s.t0 - 0.12, k: "whoosh", v: 0.45 });
      s.clip.taps.forEach((tt) => out.push({ t: s.t0 + tt, k: "tap", v: 0.35 }));
      if (s.k === "offline") out.push({ t: s.t0 + 0.35, k: "pop", v: 0.45 });
    } else if (s.k === "end") {
      out.push({ t: s.t0, k: "whoosh", v: 0.45 });
      out.push({ t: s.t0 + 0.3, k: "logo", v: 0.55 });
    } else if (s.gem) {
      out.push({ t: s.t0 - 0.12, k: "whoosh", v: 0.4 });
      out.push({ t: s.t0, k: "sparkle", v: 0.35 });
      out.push({ t: s.t0 + Math.max(0.9, s.d * 0.45), k: "chime", v: 0.5 });
    }
    void i;
  });
  return out.filter((h) => h.t >= 0 && h.t < d.total);
};

const AudioLayer: React.FC<{ d: AdData }> = ({ d }) => {
  const firstApp = d.segs.find((s) => s.clip);
  const endSeg = d.segs.find((s) => s.k === "end");
  const mStart = firstApp ? firstApp.t0 : 0;
  const total = d.total;
  return (
    <>
      {d.vo.pieces.map((p, i) => (
        <Sequence key={"vo" + i} from={fr(p.at)} layout="none">
          <Audio src={staticFile(d.vo.src)} trimBefore={fr(p.from)} trimAfter={p.to != null ? fr(p.to) : undefined} />
        </Sequence>
      ))}
      <Sequence from={fr(mStart)} layout="none">
        <Audio
          src={staticFile("bgm/" + d.bgm.file)}
          volume={(fx) => {
            const t = mStart + fx / FPS;
            const up = endSeg ? interpolate(t, [endSeg.t0 - 0.2, endSeg.t0 + 0.3], [d.bgm.vol, d.bgm.endVol], clamp) : d.bgm.vol;
            return up * interpolate(t, [mStart, mStart + 0.4, total - 0.9, total], [0, 1, 1, 0], clamp);
          }}
        />
      </Sequence>
      {sfxHits(d).map((h, i) => (
        <Sequence key={"sfx" + i} from={fr(h.t)} durationInFrames={h.dur ? fr(h.dur) : undefined} layout="none">
          <Audio src={staticFile("sfx/" + d.sfx[h.k])} volume={h.v} />
        </Sequence>
      ))}
    </>
  );
};

/* ---------- הסרטון ---------- */
export const Ad: React.FC<{ id: string; data: AdData | null }> = ({ data }) => {
  useFonts();
  if (!data) return null;
  const d = data;
  const allCues = d.segs.filter((s) => s.k !== "end").flatMap((s) => s.cues);
  const endSeg = d.segs.find((s) => s.k === "end");
  let prevHook = false;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <BrandBg />
      {d.segs.map((s, i) => {
        const from = fr(s.t0), dur = Math.max(1, fr(s.t1) - fr(s.t0));
        let el: React.ReactNode = null;
        if (s.k === "hook" && s.gem) el = <Hook s={s} d={d} />;
        else if (s.clip) el = <AppSeg s={s} d={d} slam={prevHook} />;
        else if (s.k === "end") el = <End s={s} d={d} />;
        else if (s.gem) el = <Calm s={s} d={d} />;
        prevHook = s.k === "hook";
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {el}
          </Sequence>
        );
      })}
      <Captions cues={allCues} lang={d.lang} rtl={d.rtl} until={endSeg ? endSeg.t0 : d.total} />
      <AudioLayer d={d} />
    </AbsoluteFill>
  );
};
