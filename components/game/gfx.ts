// Shared drawing helpers and the fixed-step loop used by every Jackboy cartridge.
import { FONT, PAL } from "./sprites";
import { H, W } from "./types";

export function createGfx(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false;
  const fill = (c: number, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = PAL[c];
    ctx.fillRect(x, y, w, h);
  };
  const text = (str: string, x: number, y: number, c = 3, s = 1) => {
    ctx.fillStyle = PAL[c];
    let cx = Math.round(x);
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch] ?? FONT["?"];
      for (let r = 0; r < 5; r++) {
        const bits = +g[r];
        for (let b = 0; b < 3; b++) if (bits & (4 >> b)) ctx.fillRect(cx + b * s, Math.round(y) + r * s, s, s);
      }
      cx += 4 * s;
    }
  };
  const textW = (str: string, s = 1) => str.length * 4 * s - s;
  const center = (str: string, y: number, c = 3, s = 1) => text(str, Math.floor((W - textW(str, s)) / 2), y, c, s);
  const panel = (x: number, y: number, w: number, h: number) => {
    fill(3, x, y, w, h);
    fill(0, x + 1, y + 1, w - 2, h - 2);
    fill(2, x + 2, y + 2, w - 4, 1);
    fill(2, x + 2, y + h - 3, w - 4, 1);
  };
  /** Speech bubble whose tail points at (cx, by). An optional 7×6 icon sits before the text. */
  const bubble = (str: string, cx: number, by: number, icon?: HTMLCanvasElement) => {
    const w = textW(str) + (icon ? 12 : 6);
    const x = Math.max(1, Math.min(W - w - 1, Math.round(cx - w / 2)));
    const y = Math.max(13, by - 11);
    fill(3, x, y, w, 9);
    fill(0, x + 1, y + 1, w - 2, 7);
    fill(0, Math.round(cx) - 1, y + 9, 3, 1);
    fill(3, Math.round(cx), y + 9, 1, 2);
    if (icon) {
      ctx.drawImage(icon, x + 2, y + 2, 7, 6);
      text(str, x + 10, y + 2);
    } else text(str, x + 3, y + 2);
  };
  return { ctx, fill, text, textW, center, panel, bubble, disc: (cx: number, cy: number, r: number, c: number) => disc(ctx, cx, cy, r, c) };
}
export type Gfx = ReturnType<typeof createGfx>;

export function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: number) {
  ctx.fillStyle = PAL[c];
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1);
  }
}

export function strip(w: number, h = H) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Tempe Butte ("A" Mountain) and the desert hills, standing on `baseY`. 320px wide, tiles horizontally. */
export function buildButte(baseY: number) {
  const [c, x] = strip(320);
  x.fillStyle = PAL[1];
  for (let i = 0; i < 320; i++) {
    const butte = 46 * Math.max(0, 1 - Math.abs(i - 110) / 70) ** 0.8;
    const hills = 10 + 6 * Math.sin(i / 23) + 4 * Math.sin(i / 9 + 1);
    const h = Math.round(Math.max(butte, hills));
    x.fillRect(i, baseY - h, 1, h);
  }
  x.fillStyle = PAL[0];
  const ax = 106;
  const ay = baseY - 36;
  [
    [1, 0, 2, 1],
    [0, 1, 1, 5],
    [3, 1, 1, 5],
    [1, 3, 2, 1],
  ].forEach(([dx, dy, w, h]) => x.fillRect(ax + dx * 2, ay + dy * 2, w * 2, h * 2));
  return c;
}

/** Fixed 60 Hz update with requestAnimationFrame rendering. Calls `onPause` when the page is hidden or loses focus. */
export function runLoop(update: () => void, render: () => void, onPause: () => void) {
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  const STEP = 1000 / 60;
  const loop = (now: number) => {
    acc += Math.min(100, now - last);
    last = now;
    while (acc >= STEP) {
      update();
      acc -= STEP;
    }
    render();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  const onVis = () => {
    if (document.hidden) onPause();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("blur", onPause);
  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("blur", onPause);
  };
}

/** Best score in localStorage, tolerant of blocked storage. */
export const loadBest = (key: string) => {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};
export const saveBest = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
};

/** Short vibration, only once the user has interacted (browsers block it before that). */
export const buzz = (ms: number) => {
  try {
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation?.hasBeenActive !== false) nav.vibrate?.(ms);
  } catch {}
};
