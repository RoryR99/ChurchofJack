import { PAL, SPR, makeSprite } from "./sprites";
import { COLS, GROUND, ROWS, T, TILE, buildLevel, type Ent } from "./level";
import { sfx } from "./audio";
import { buildButte, buzz, createGfx, loadBest, runLoop, saveBest as storeBest, strip } from "./gfx";
import { H, NO_INPUT, W, type CartFactory, type Input } from "./types";

type State = "title" | "play" | "pause" | "over" | "win";
type Admirer = { x: number; y: number; dir: number; face: number; chase: boolean; variant: number; line: number; fleeing: boolean; cool: number };
type Item = { kind: "matcha" | "vape"; x: number; y: number; taken: boolean };
type Box = { x: number; y: number };
type Popup = { x: number; y: number; text: string; t: number };

const LINES = ["FREE FRIDAY?", "YOUR NUMBER?", "HI JACK!", "COFFEE LATER?", "NICE ROBE!", "WANNA HANG?"];
const BEST_KEY = "jack-commute-best";
const LEVEL = buildLevel();
const PW = 8; // player hitbox
const PH = 13;

export const createCommute: CartFactory = (canvas) => {
  const ctx = canvas.getContext("2d")!;
  const { fill, text, textW, center, panel, bubble, disc } = createGfx(ctx);

  // Sprites (right-facing and flipped)
  const spr = (rows: string[], remap?: Record<string, string>) => [makeSprite(rows, remap), makeSprite(rows, remap, true)];
  const jack = { idle: spr(SPR.jackIdle), w1: spr(SPR.jackWalk1), w2: spr(SPR.jackWalk2), jump: spr(SPR.jackJump) };
  const alt = { "3": "2", "2": "3" };
  const adm = [
    [spr(SPR.admirer1), spr(SPR.admirer2)],
    [spr(SPR.admirer1, alt), spr(SPR.admirer2, alt)],
  ];
  const img = {
    matcha: makeSprite(SPR.matcha),
    vape: makeSprite(SPR.vape),
    heart: makeSprite(SPR.heart),
    heartEmpty: makeSprite(SPR.heartEmpty, { "3": "1" }),
    heartLight: makeSprite(SPR.heart, { "3": "0" }),
    cactus: makeSprite(SPR.cactus),
    bench: makeSprite(SPR.bench),
  };
  const tiles: Record<number, HTMLCanvasElement> = {
    [T.TOP]: makeSprite(SPR.top),
    [T.FILL]: makeSprite(SPR.fill),
    [T.BRICK]: makeSprite(SPR.brick),
    [T.PLAT]: makeSprite(SPR.plat),
    [T.WATERTOP]: makeSprite(SPR.waterTop),
    [T.WATER]: makeSprite(SPR.water),
  };
  const far = buildButte(GROUND * TILE);
  const mid = buildMid();

  // State
  let input: Input = { ...NO_INPUT };
  const jumpHeld = () => input.a || input.up;
  let prev = { ...input };
  let state: State = "title";
  let stateT = 0;
  let frame = 0;
  let day = 1;
  let score = 0;
  let best = loadBest(BEST_KEY);
  const p = { x: LEVEL.start.x, y: LEVEL.start.y, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buffer: 0, inv: 0, hurtT: 0 };
  let hearts = 3;
  let caff = 0;
  let cloud = 0;
  let clockF = 0;
  let framesPerMin = 180;
  let speed = 1;
  let minutes = 30;
  let checkpoint: Box = { ...LEVEL.start };
  let lastBench = -1;
  let items: Item[] = [];
  let admirers: Admirer[] = [];
  let cacti: Box[] = [];
  let benches: Box[] = [];
  let popups: Popup[] = [];
  let say = { text: "", t: 0 };
  let endReason: "late" | "tired" = "tired";
  let bonus = { time: 0, hearts: 0 };
  let stats = { matcha: 0, vape: 0 };
  let cam = 0;

  function startDay(d: number) {
    day = d;
    if (d === 1) score = 0;
    const ents: Ent[] = LEVEL.ents;
    items = ents.filter((e) => e.kind === "matcha" || e.kind === "vape").map((e) => ({ kind: e.kind as Item["kind"], x: e.x, y: e.y, taken: false }));
    admirers = ents
      .filter((e) => e.kind === "admirer")
      .map((e, i) => ({ x: e.x, y: e.y, dir: i % 2 ? 1 : -1, face: -1, chase: !!e.chase, variant: i % 2, line: i % LINES.length, fleeing: false, cool: 0 }));
    cacti = ents.filter((e) => e.kind === "cactus").map((e) => ({ x: e.x, y: e.y }));
    benches = ents.filter((e) => e.kind === "bench").map((e) => ({ x: e.x, y: e.y }));
    Object.assign(p, { x: LEVEL.start.x, y: LEVEL.start.y, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buffer: 0, inv: 0, hurtT: 0 });
    checkpoint = { ...LEVEL.start };
    lastBench = -1;
    hearts = 3;
    caff = cloud = clockF = 0;
    minutes = 30;
    framesPerMin = Math.max(96, 180 - (d - 1) * 36);
    speed = 1 + (d - 1) * 0.25;
    popups = [];
    stats = { matcha: 0, vape: 0 };
    say = { text: d > 1 ? `DAY ${d}. REPETEZ.` : "LOOK TO REST YOURSELF.", t: 120 };
    setState("play");
  }

  function setState(s: State) {
    state = s;
    stateT = 0;
  }

  function saveBest() {
    if (score > best) {
      best = score;
      storeBest(BEST_KEY, best);
    }
  }

  // Tiles
  const tileAt = (px: number, py: number) => {
    const c = Math.floor(px / TILE);
    const r = Math.floor(py / TILE);
    if (c < 0 || c >= COLS) return T.BRICK;
    if (r < 0 || r >= ROWS) return T.EMPTY;
    return LEVEL.grid[r * COLS + c];
  };
  const solid = (t: number) => t === T.TOP || t === T.FILL || t === T.BRICK;
  const solidAt = (px: number, py: number) => solid(tileAt(px, py));
  const supportAt = (px: number, py: number) => {
    const t = tileAt(px, py);
    return solid(t) || t === T.PLAT;
  };
  const overlap = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
    ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

  function hurt(srcX: number) {
    hearts--;
    p.inv = 110;
    p.hurtT = 16;
    p.vx = p.x + 4 < srcX + 4 ? -1.8 : 1.8;
    p.vy = -2.6;
    say = { text: "WHAT.", t: 90 };
    sfx.hit();
    buzz(60);
    if (hearts <= 0) gameOver("tired");
  }

  function fall() {
    hearts--;
    sfx.hit();
    buzz(60);
    if (hearts <= 0) return gameOver("tired");
    Object.assign(p, { x: checkpoint.x, y: checkpoint.y, vx: 0, vy: 0, inv: 90, hurtT: 0 });
    say = { text: "SAY THAT AGAIN PLEASE.", t: 120 };
  }

  function gameOver(reason: "late" | "tired") {
    endReason = reason;
    saveBest();
    sfx.over();
    setState("over");
  }

  function step(jumpPressed: boolean) {
    // Clock
    clockF++;
    minutes = 30 + Math.floor(clockF / framesPerMin);
    if (minutes >= 60) return gameOver("late");
    if (caff > 0) caff--;
    if (cloud > 0) cloud--;
    if (p.inv > 0) p.inv--;
    if (say.t > 0) say.t--;

    // Player movement
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const max = (input.b ? 1.6 : 1) * (caff > 0 ? 1.3 : 1);
    if (p.hurtT > 0) p.hurtT--;
    else if (dir) {
      p.vx += dir * (p.onGround ? 0.15 : 0.1);
      p.vx = Math.max(-max, Math.min(max, p.vx));
      p.face = dir;
    } else {
      p.vx *= p.onGround ? 0.75 : 0.95;
      if (Math.abs(p.vx) < 0.05) p.vx = 0;
    }
    if (Math.abs(p.vx) > max && p.hurtT === 0) p.vx *= 0.9;
    p.coyote = p.onGround ? 6 : p.coyote - 1;
    p.buffer = jumpPressed ? 6 : p.buffer - 1;
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = caff > 0 ? -4.6 : -4.1;
      p.buffer = p.coyote = 0;
      sfx.jump();
    }
    if (!jumpHeld() && p.vy < -1.6) p.vy = -1.6;
    p.vy = Math.min(4, p.vy + 0.25);

    // X collision
    p.x += p.vx;
    if (p.x < 0) p.x = 0;
    for (const yy of [p.y + 1, p.y + PH / 2, p.y + PH - 1]) {
      if (p.vx > 0 && solidAt(p.x + PW, yy)) {
        p.x = Math.floor((p.x + PW) / TILE) * TILE - PW - 0.01;
        p.vx = 0;
      } else if (p.vx < 0 && solidAt(p.x, yy)) {
        p.x = (Math.floor(p.x / TILE) + 1) * TILE;
        p.vx = 0;
      }
    }
    // Y collision
    const prevBottom = p.y + PH;
    p.y += p.vy;
    p.onGround = false;
    if (p.vy >= 0) {
      const bottom = p.y + PH;
      const top = Math.floor(bottom / TILE) * TILE;
      for (const xx of [p.x + 1, p.x + PW - 1]) {
        const t = tileAt(xx, bottom);
        if (solid(t) || (t === T.PLAT && prevBottom <= top + 0.01)) {
          p.y = top - PH;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
    } else {
      for (const xx of [p.x + 1, p.x + PW - 1]) {
        if (solidAt(xx, p.y)) {
          p.y = (Math.floor(p.y / TILE) + 1) * TILE;
          p.vy = 0;
          break;
        }
      }
    }
    // Pits and the lake
    const under = tileAt(p.x + PW / 2, p.y + PH - 2);
    if (p.y > ROWS * TILE || under === T.WATERTOP || under === T.WATER) return fall();

    // Items
    for (const it of items) {
      if (it.taken || !overlap(p.x, p.y, PW, PH, it.x, it.y, 8, 8)) continue;
      it.taken = true;
      sfx.pickup();
      if (it.kind === "matcha") {
        score += 100;
        caff = 300;
        stats.matcha++;
        popups.push({ x: it.x - 8, y: it.y, text: "+100 MATCHA", t: 50 });
      } else {
        score += 150;
        cloud = 240;
        stats.vape++;
        popups.push({ x: it.x - 4, y: it.y, text: "+150 VAPE", t: 50 });
        say = { text: "ROCK BACK HEAVY", t: 90 };
      }
    }

    // Admirers
    for (const a of admirers) {
      const dx = p.x - a.x;
      const near = Math.abs(dx) < 72 && Math.abs(p.y - a.y) < 32;
      let vx: number;
      if (a.cool > 0) a.cool--;
      a.fleeing = (cloud > 0 && near) || a.cool > 0;
      if (a.fleeing) vx = -Math.sign(dx || 1) * 0.7;
      else if (a.chase && Math.abs(dx) < 56 && Math.abs(p.y - a.y) < 24) vx = Math.sign(dx) * 0.55 * speed;
      else vx = a.dir * 0.35 * speed;
      const nx = a.x + vx;
      const front = vx > 0 ? nx + 8 : nx;
      if (solidAt(front, a.y + 6) || !supportAt(front, a.y + 14)) {
        if (!a.fleeing && !(a.chase && Math.abs(dx) < 56)) a.dir *= -1;
      } else a.x = nx;
      if (vx) a.face = Math.sign(vx);
      if (!a.fleeing && cloud === 0 && p.inv === 0 && overlap(p.x + 1, p.y + 1, PW - 2, PH - 1, a.x + 1, a.y + 1, 6, 12)) {
        a.cool = 150; // she takes the hint and wanders off for a bit
        hurt(a.x);
      }
      if (state !== "play") return;
    }

    // Cacti
    for (const c of cacti) {
      if (cloud === 0 && p.inv === 0 && overlap(p.x + 1, p.y + 1, PW - 2, PH - 1, c.x + 1, c.y + 2, 6, 10)) {
        hurt(c.x);
        if (state !== "play") return;
      }
    }

    // Benches (checkpoints)
    benches.forEach((b, i) => {
      if (i !== lastBench && p.onGround && overlap(p.x, p.y, PW, PH, b.x, b.y - 4, 16, 12)) {
        lastBench = i;
        checkpoint = { x: b.x + 4, y: GROUND * TILE - PH };
        if (hearts < 3) hearts++;
        say = { text: "LOOK TO REST YOURSELF.", t: 120 };
        popups.push({ x: b.x - 8, y: b.y - 10, text: "CHECKPOINT", t: 60 });
        sfx.rest();
      }
    });

    // Popups
    popups = popups.filter((pp) => --pp.t > 0);

    // The office door
    if (p.x + PW >= LEVEL.door) {
      bonus = { time: (60 - minutes) * 50, hearts: hearts * 100 };
      score += bonus.time + bonus.hearts;
      saveBest();
      sfx.win();
      setState("win");
    }
  }

  function update() {
    frame++;
    stateT++;
    const jumpPressed = jumpHeld() && !(prev.a || prev.up);
    const startPressed = input.start && !prev.start;
    prev = { ...input };
    if (state === "title") {
      if (jumpPressed || startPressed) startDay(1);
    } else if (state === "pause") {
      if (startPressed || jumpPressed) setState("play");
    } else if (state === "over") {
      if ((jumpPressed || startPressed) && stateT > 40) startDay(1);
    } else if (state === "win") {
      if ((jumpPressed || startPressed) && stateT > 40) startDay(day + 1);
    } else {
      if (startPressed) setState("pause");
      else step(jumpPressed);
    }
    if (state === "play" || state === "title") {
      const target = state === "title" ? 0 : p.x + PW / 2 - 64;
      cam = Math.round(Math.max(0, Math.min(LEVEL.width - W, target)));
    }
  }

  // ---------- Rendering ----------
  function drawWorld() {
    fill(0, 0, 0, W, H);
    disc(128, 34, 11, 1);
    tileStrip(far, cam * 0.2);
    tileStrip(mid, cam * 0.5);
    // Light rail passing in the distance
    const tx = W + 40 - ((frame * 0.9) % 900);
    if (tx > -80 && tx < W) {
      fill(2, tx, 101, 72, 13);
      for (let i = 0; i < 6; i++) fill(0, tx + 4 + i * 11, 104, 7, 4);
      fill(3, tx, 114, 72, 2);
      fill(1, tx + 30, 96, 1, 5);
    }

    // Buildings at each end
    for (const e of LEVEL.ents) {
      const sx = e.x - cam;
      if (e.kind === "apartment" && sx > -80) {
        fill(2, sx, 48, 64, 72);
        fill(3, sx, 44, 64, 4);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) fill(r === 1 && c === 2 ? 1 : 0, sx + 6 + c * 15, 54 + r * 14, 8, 8);
        fill(3, sx + 44, 104, 12, 16);
        text("APT", sx + 4, 108, 0);
      } else if (e.kind === "office" && sx < W + 10) {
        fill(1, sx, 32, 96, 88);
        fill(3, sx, 26, 96, 6);
        fill(3, sx, 32, 2, 88);
        text("SHIPPING CO.", sx + 24, 37, 3);
        for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) fill(2, sx + 8 + c * 14, 48 + r * 13, 8, 8);
        fill(3, sx + 30, 98, 22, 22);
        fill(1, sx + 40, 98, 1, 22);
        text("9AM", sx + 35, 92, 3);
      }
    }

    // Tiles
    const c0 = Math.floor(cam / TILE);
    for (let r = 0; r < ROWS; r++) {
      for (let c = c0; c <= c0 + W / TILE; c++) {
        if (c >= COLS) break;
        const t = LEVEL.grid[r * COLS + c];
        if (t) ctx.drawImage(tiles[t], c * TILE - cam, r * TILE);
      }
    }

    // Signs, benches, cacti
    for (const e of LEVEL.ents) {
      if (e.kind !== "sign") continue;
      const sx = e.x - cam;
      const w = textW(e.text!) + 6;
      if (sx > W || sx + w < 0) continue;
      fill(3, sx + Math.floor(w / 2), e.y + 9, 2, 13);
      fill(3, sx, e.y, w, 10);
      text(e.text!, sx + 3, e.y + 3, 0);
    }
    for (const b of benches) if (b.x - cam > -16 && b.x - cam < W) ctx.drawImage(img.bench, b.x - cam, b.y);
    for (const c of cacti) if (c.x - cam > -8 && c.x - cam < W) ctx.drawImage(img.cactus, c.x - cam, c.y);

    // Items
    const bob = Math.floor(frame / 16) % 2;
    for (const it of items) {
      if (it.taken || it.x - cam < -8 || it.x - cam > W) continue;
      ctx.drawImage(it.kind === "matcha" ? img.matcha : img.vape, it.x - cam, it.y - bob);
    }

    // Admirers
    for (const a of admirers) {
      const sx = Math.round(a.x - cam);
      if (sx < -10 || sx > W) continue;
      const f = Math.floor(frame / 12) % 2;
      ctx.drawImage(adm[a.variant][f][a.face > 0 ? 0 : 1], sx - 1, Math.round(a.y) - 1);
      const dx = Math.abs(p.x - a.x);
      if (state === "play" && dx < 44 && Math.abs(p.y - a.y) < 32) {
        const by = say.t > 0 ? Math.min(a.y, p.y) - 13 : a.y; // stack above Jack's own bubble
        if (a.fleeing) bubble("OK BYE", sx + 4, by);
        else bubble(LINES[a.line], sx + 4, by, img.heart);
      }
    }

    // Jack
    const px = Math.round(p.x - cam);
    const py = Math.round(p.y);
    if (caff > 0 && Math.abs(p.vx) > 0.5) {
      const bx = p.vx > 0 ? px - 5 : px + PW + 1;
      fill(2, bx, py + 5, 4, 1);
      fill(2, bx + (p.vx > 0 ? -2 : 2), py + 9, 4, 1);
    }
    if (!(p.inv > 0 && Math.floor(p.inv / 4) % 2)) {
      const moving = Math.abs(p.vx) > 0.1;
      const walkF = Math.floor(frame / (input.b ? 5 : 8)) % 2;
      const set = !p.onGround && state === "play" ? jack.jump : moving ? (walkF ? jack.w1 : jack.w2) : jack.idle;
      ctx.drawImage(set[p.face > 0 ? 0 : 1], px - 1, py - 1);
    }
    if (cloud > 0 && (cloud > 60 || Math.floor(cloud / 6) % 2)) {
      for (let i = 0; i < 3; i++) {
        const a = frame * 0.08 + i * 2.09;
        const cx = px + 4 + Math.round(Math.cos(a) * 10);
        const cy = py + 7 + Math.round(Math.sin(a) * 7);
        disc(cx, cy, 3, 1);
        disc(cx, cy, 2, 0);
      }
    }
    if (say.t > 0 && state === "play") bubble(say.text, px + 4, py - 2);

    for (const pp of popups) text(pp.text, pp.x - cam, pp.y - (50 - pp.t) / 3, 3);
  }

  function drawHud() {
    fill(3, 0, 0, W, 11);
    for (let i = 0; i < 3; i++) ctx.drawImage(i < hearts ? img.heartLight : img.heartEmpty, 2 + i * 9, 3);
    const clock = `8:${String(minutes).padStart(2, "0")}`;
    text(clock, 66, 3, minutes >= 55 && Math.floor(frame / 15) % 2 ? 1 : 0);
    text(`D${day}`, 88, 3, 1);
    text(String(score).padStart(6, "0"), W - 26, 3, 0);
    let y = 14;
    if (caff > 0) {
      ctx.drawImage(img.matcha, 2, y);
      fill(3, 12, y + 3, 30, 3);
      fill(1, 12, y + 3, Math.ceil((caff / 300) * 30), 3);
      y += 10;
    }
    if (cloud > 0) {
      ctx.drawImage(img.vape, 2, y);
      fill(3, 12, y + 3, 30, 3);
      fill(1, 12, y + 3, Math.ceil((cloud / 240) * 30), 3);
    }
  }

  function render() {
    drawWorld();
    if (state === "title") {
      panel(12, 14, 136, 92);
      center("JACK'S", 22, 3, 2);
      center("COMMUTE", 36, 3, 2);
      center("CLOCK IN BY 9:00 AM", 54, 2);
      center("GRAB MATCHA + VAPES", 62, 2);
      center("DODGE THE ADMIRERS", 70, 2);
      if (Math.floor(frame / 30) % 2) center("PRESS START", 84, 3);
      center(`BEST ${String(best).padStart(6, "0")}`, 96, 2);
      return;
    }
    drawHud();
    if (state === "pause") {
      panel(16, 48, 128, 40);
      center("PAUSED", 56, 3, 2);
      center("LOOK TO REST YOURSELF.", 74, 2);
    } else if (state === "over") {
      panel(10, 30, 140, 84);
      if (endReason === "late") {
        center("YOU'RE LATE.", 38, 3, 2);
        center("CONTRACT AMENDED.", 56, 2);
      } else {
        center("OUT OF HEARTS", 38, 3, 2);
        center("LOOK TO REST YOURSELF.", 56, 2);
      }
      center(`SCORE ${String(score).padStart(6, "0")}`, 72, 3);
      center(`BEST  ${String(best).padStart(6, "0")}`, 82, 3);
      if (stateT > 40 && Math.floor(frame / 30) % 2) center("PRESS A TO RETRY", 100, 3);
    } else if (state === "win") {
      panel(10, 22, 140, 100);
      center(`CLOCKED IN 8:${String(minutes).padStart(2, "0")}`, 30, 3, 1);
      center("WHAT. A COMMUTE.", 40, 2);
      text(`MATCHA x${stats.matcha}   VAPES x${stats.vape}`, 22, 54, 3);
      text(`TIME BONUS   +${bonus.time}`, 22, 64, 3);
      text(`HEART BONUS  +${bonus.hearts}`, 22, 74, 3);
      center(`SCORE ${String(score).padStart(6, "0")}`, 88, 3);
      center(`BEST  ${String(best).padStart(6, "0")}`, 98, 2);
      if (stateT > 40 && Math.floor(frame / 30) % 2) center(`PRESS A FOR DAY ${day + 1}`, 110, 3);
    }
  }

  function tileStrip(strip: HTMLCanvasElement, offset: number) {
    const o = Math.round(offset) % strip.width;
    ctx.drawImage(strip, -o, 0);
    if (strip.width - o < W) ctx.drawImage(strip, strip.width - o, 0);
  }

  const stop = runLoop(update, render, () => {
    if (state === "play") setState("pause");
  });

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__jack = {
      p,
      get state() {
        return state;
      },
      get hearts() {
        return hearts;
      },
      set(i: Partial<Input>) {
        input = { ...input, ...i };
      },
      tick(n = 1) {
        for (let i = 0; i < n; i++) update();
        render();
      },
    };
  }

  return {
    setInput(next: Input) {
      input = next;
    },
    /** Tap on the screen: starts or restarts from menus. */
    tap() {
      if (state === "title") startDay(1);
      else if (state === "pause") setState("play");
      else if (state === "over" && stateT > 40) startDay(1);
      else if (state === "win" && stateT > 40) startDay(day + 1);
    },
    destroy() {
      stop();
    },
  };
};

// ---------- Background art ----------
// Saguaros and palms
function buildMid() {
  const [c, x] = strip(256);
  const base = GROUND * TILE;
  x.fillStyle = PAL[2];
  const saguaro = (sx: number, h: number) => {
    x.fillRect(sx, base - h, 3, h);
    x.fillRect(sx - 4, base - h + 8, 2, 6);
    x.fillRect(sx - 4, base - h + 13, 4, 2);
    x.fillRect(sx + 5, base - h + 5, 2, 7);
    x.fillRect(sx + 3, base - h + 11, 4, 2);
  };
  const palm = (sx: number, h: number) => {
    x.fillRect(sx, base - h, 2, h);
    const ty = base - h;
    x.fillRect(sx - 6, ty, 14, 1);
    x.fillRect(sx - 8, ty + 1, 3, 1);
    x.fillRect(sx + 7, ty + 1, 3, 1);
    x.fillRect(sx - 3, ty - 2, 8, 2);
    x.fillRect(sx - 5, ty + 2, 2, 2);
    x.fillRect(sx + 5, ty + 2, 2, 2);
  };
  saguaro(20, 26);
  palm(70, 40);
  palm(84, 34);
  saguaro(140, 20);
  palm(196, 44);
  saguaro(232, 24);
  return c;
}
