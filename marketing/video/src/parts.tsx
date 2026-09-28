import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, Easing } from "remotion";
import type { CamKey, Cue } from "./types";

export const FPS = 30;
export const LIME = "#a3e635";
export const ORANGE = "#fb923c";
export const INK = "#0c0e1a";

/* מיקום הטלפון בפריים (פיקסלים בסרטון) */
export const PH = { x: 130, y: 230, w: 820, h: 1458, r: 58 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const fontFam = (lang: string) =>
  lang === "ar" ? "'Cairo','Rubik',sans-serif" : "'Rubik','Cairo',sans-serif";

/* פיצול כותרת: מה שאחרי הנקודה/המקף האחרונים מודגש בירוק */
export const splitHl = (s: string): [string, string] => {
  const m = s.match(/^(.*[^.\s]\s?[.—:]\s+)(\S.*)$/);
  return m ? [m[1].trim(), m[2]] : [s, ""];
};

/* רקע המותג: כהה, הילות ירוק/כתום, קווי מסלול שזזים לאט */
export const BrandBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(900px 700px at 85% 8%,rgba(163,230,53,.22),transparent 60%)," +
          "radial-gradient(900px 800px at 10% 95%,rgba(251,146,60,.20),transparent 60%)," +
          "linear-gradient(160deg,#111531,#0c0e1a 45%,#090a14)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(115deg,transparent 0 120px,rgba(255,255,255,.035) 120px 124px)",
          backgroundPosition: `${(f * 0.8) % 124}px 0`,
        }}
      />
    </AbsoluteFill>
  );
};

/* מצלמה: אינטרפולציה לינארית בין המפתחות, ואז ממוצע נע (0.6 שנ׳)
   שהופך כל מעבר לתנועה רכה — גם כשהמפתחות צפופים (מעקב אחרי גלילה) */
const rawCam = (keys: CamKey[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return { t, fx: a.fx + (b.fx - a.fx) * u, fy: a.fy + (b.fy - a.fy) * u, z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * u) };
    }
  }
  return keys[keys.length - 1];
};
export const camAt = (keys: CamKey[], t: number) => {
  const N = 16, win = 0.6;
  let fx = 0, fy = 0, lz = 0;
  for (let i = 0; i < N; i++) {
    const k = rawCam(keys, t - win * (i / (N - 1)) + win / 2);
    fx += k.fx; fy += k.fy; lz += Math.log(k.z);
  }
  return { fx: fx / N, fy: fy / N, z: Math.exp(lz / N) };
};

/* כותרת קינטית בראש הפריים: מילים עולות אחת אחרי השנייה */
export const Headline: React.FC<{ text: string; lang: string; rtl: boolean; big?: boolean; top?: number; delay?: number }> = ({ text, lang, rtl, big, top = 0, delay = 0.08 }) => {
  const f = useCurrentFrame();
  const [pre, hi] = splitHl(text);
  const all = [...pre.split(/\s+/).filter(Boolean).map((w) => ({ w, hi: false })), ...hi.split(/\s+/).filter(Boolean).map((w) => ({ w, hi: true }))];
  const size = big ? 92 : 66;
  const hiStart = pre.split(/\s+/).filter(Boolean).length;
  return (
    <div
      style={{
        position: "absolute", left: 50, right: 50, top, height: big ? 420 : PH.y,
        display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
        direction: rtl ? "rtl" : "ltr", fontFamily: fontFam(lang),
      }}
    >
      <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.14, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.65)" }}>
        {all.map((x, i) => {
          const s = spring({ frame: f - Math.round((delay + i * 0.07) * FPS), fps: FPS, config: { damping: 15, stiffness: 170 } });
          const br = big && hi && i === hiStart;
          return (
            <React.Fragment key={i}>
              {br ? <br /> : null}
              <span
                style={{
                  display: "inline-block", marginInline: size * 0.13, color: x.hi ? LIME : "#fff",
                  translate: `0 ${(1 - s) * 50}px`, opacity: s, position: "relative",
                }}
              >
                {x.w}
                {x.hi ? (
                  <span
                    style={{
                      position: "absolute", left: 0, right: 0, bottom: -6, height: 7, borderRadius: 4, background: LIME,
                      transformOrigin: rtl ? "right" : "left",
                      scale: `${interpolate(f, [(delay + 0.35 + i * 0.07) * FPS, (delay + 0.7 + i * 0.07) * FPS], [0, 1], { ...clamp, easing: easeOut })} 1`,
                    }}
                  />
                ) : null}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* כתוביות בסגנון רשתות: הכתובית קופצת, המילה שנאמרת עכשיו בירוק */
export const Captions: React.FC<{ cues: Cue[]; lang: string; rtl: boolean; until: number }> = ({ cues, lang, rtl, until }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t >= until) return null;
  let c: Cue | undefined;
  for (const x of cues) if (t >= x.start - 0.06 && t < x.end + 0.2) c = x;
  if (!c) return null;
  const s = spring({ frame: f - Math.round((c.start - 0.06) * FPS), fps: FPS, config: { damping: 13, stiffness: 200 } });
  return (
    <div style={{ position: "absolute", left: 36, right: 36, bottom: 118, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(6,8,18,.86)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 28,
          padding: "16px 30px", maxWidth: 1000, textAlign: "center", direction: rtl ? "rtl" : "ltr",
          fontFamily: fontFam(lang), fontSize: 50, fontWeight: 800, lineHeight: 1.3,
          scale: `${0.86 + 0.14 * s}`, opacity: Math.min(1, s * 1.4), boxShadow: "0 18px 50px rgba(0,0,0,.45)",
        }}
      >
        {c.words.map((w, i) => (
          <span key={i} style={{ color: t >= w.e ? "#fff" : t >= w.s ? LIME : "rgba(255,255,255,.5)" }}>
            {w.w}{i < c!.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

/* חותמת (הקפאת פריים): נוחתת מגדול לקטן עם רעידה */
export const Stamp: React.FC<{ text: string; at: number; color: string; rot: number; lang: string; rtl: boolean; y: number; size?: number }> = ({ text, at, color, rot, lang, rtl, y, size = 88 }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - Math.round(at * FPS), fps: FPS, config: { damping: 11, stiffness: 260, mass: 0.7 } });
  if (f < at * FPS) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: fontFam(lang), direction: rtl ? "rtl" : "ltr", fontSize: size, fontWeight: 800, color,
          border: `9px solid ${color}`, borderRadius: 22, padding: "10px 34px", background: "rgba(8,10,20,.55)",
          rotate: `${rot}deg`, scale: `${interpolate(s, [0, 1], [2.4, 1])}`, opacity: Math.min(1, s * 2),
          textShadow: "0 4px 18px rgba(0,0,0,.5)", boxShadow: "0 20px 60px rgba(0,0,0,.45)", whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* קונפטי דטרמיניסטי (בלי Math.random) */
export const Confetti: React.FC<{ at: number; n?: number }> = ({ at, n = 46 }) => {
  const f = useCurrentFrame();
  const t = f / FPS - at;
  if (t < 0 || t > 2.6) return null;
  const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const cols = [LIME, ORANGE, "#fff", "#60a5fa"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = -Math.PI / 2 + (rnd(i, 1) - 0.5) * 2.2, sp = 900 + rnd(i, 2) * 1100;
        const x = 540 + Math.cos(ang) * sp * t, y = 1100 + Math.sin(ang) * sp * t + 0.5 * 2600 * t * t;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 16 + rnd(i, 3) * 14, height: 9 + rnd(i, 4) * 8,
            background: cols[i % cols.length], borderRadius: 3, rotate: `${t * (300 + rnd(i, 5) * 600)}deg`,
            opacity: interpolate(t, [0, 0.1, 2.0, 2.6], [0, 1, 1, 0], clamp),
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

export const PlaneIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
);
export const NoWifiIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <path d="M2 8.8a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0" opacity={0.45} />
    <circle cx="12" cy="19.5" r="1.2" fill={color} />
    <path d="M3 3l18 18" />
  </svg>
);
export const MoonIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fde68a"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>
);
