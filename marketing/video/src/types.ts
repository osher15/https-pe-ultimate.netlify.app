export type Word = { w: string; s: number; e: number };
export type Cue = { text: string; start: number; end: number; words: Word[] };
export type CamKey = { t: number; fx: number; fy: number; z: number };
export type Clip = {
  src: string; start: number; rate: number; recDur: number; vw: number; vh: number; ff: boolean;
  keys: CamKey[]; rings: { t0: number; t1: number; box: number[] }[]; taps: number[];
};
export type Seg = {
  k: string; t0: number; t1: number; d: number; line: string | null; cues: Cue[];
  clip?: Clip; gem?: { src: string; dur: number; from: number; rate: number };
};
export type AdData = {
  version: string; lang: string; rtl: boolean; total: number; fps: number;
  vo: { src: string; pieces: { from: number; to: number | null; at: number }[] };
  segs: Seg[]; end: string;
  gags: { bubbles: string[]; stamp: string; night: string; plane: string; stamp2: string };
  hook: { bubbles: { side: string; x: number; y: number; tail: string; at: number }[]; face: { x: number; y: number; z: number } };
  sfx: Record<string, string>;
  bgm: { file: string; vol: number; endVol: number };
};
