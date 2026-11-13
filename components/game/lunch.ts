// Second Helpings: a lunch-break catcher. Catch the food, dodge the work (and, this time, the vapes).
import { PAL, SPR, makeSprite } from "./sprites";
import { sfx } from "./audio";
import { buildButte, buzz, createGfx, disc, loadBest, runLoop, saveBest, strip } from "./gfx";
import { H, NO_INPUT, W, type CartFactory, type Input } from "./types";

type State = "title" | "play" | "pause" | "over";
type Food = "pelau" | "pork" | "pizza" | "matcha" | "cake";
type Hazard = "email" | "replyall" | "amendment" | "phone" | "vape";
type Kind = Food | Hazard;
type Item = { kind: Kind; x: number; y: number; vy: number; vx: number; t: number; bounced: boolean };
type Popup = { x: number; y: number; text: string; t: number };

export const LUNCH_BEST_KEY = "jack-lunch-best";
const FLOOR = 124; // counter top
const JY = FLOOR - 15; // Jack's sprite top
const JW = 12;
const FOODS: Food[] = ["pelau", "pork", "pizza", "matcha", "cake"];
const FOOD_WEIGHTS = [25, 25, 25, 15, 7];
const HAZARDS: Hazard[] = ["email", "vape", "amendment", "phone", "replyall"];
const HAZARD_WEIGHTS = [32, 26, 15, 15, 12];
const DAMAGE: Record<Hazard, number> = { email: 15, replyall: 15, amendment: 25, phone: 20, vape: 15 };
const HELPINGS = ["", "", "SECOND HELPING!", "THIRD HELPING!", "FOURTH HELPING!", "FIFTH HELPING!"];
const isFood = (k: Kind): k is Food => (FOODS as string[]).includes(k);
const pick = <T,>(list: T[], weights: number[]) => {
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) if ((r -= weights[i]) < 0) return list[i];
  return list[0];
};

export const createLunch: CartFactory = (canvas) => {
  const ctx = canvas.getContext("2d")!;
  const g = createGfx(ctx);
  const { fill, text, center, panel, bubble } = g;

  const jack = [makeSprite(SPR.jackPlate), makeSprite(SPR.jackPlateWalk)];
  const alt = { "3": "2", "2": "3" };
  const adm = [
    [makeSprite(SPR.admirer1, alt), makeSprite(SPR.admirer2, alt)],
    [makeSprite(SPR.admirer1, alt, true), makeSprite(SPR.admirer2, alt, true)],
  ];
  const img: Record<Kind, HTMLCanvasElement> & { heart: HTMLCanvasElement } = {
    pelau: makeSprite(SPR.pelau),
    pork: makeSprite(SPR.pork),
    pizza: makeSprite(SPR.pizza),
    matcha: makeSprite(SPR.matcha),
    cake: makeSprite(SPR.cake),
    email: makeSprite(SPR.email),
    replyall: makeSprite(SPR.email, { "0": "1" }),
    amendment: makeSprite(SPR.amendment),
    phone: makeSprite(SPR.phone),
    vape: makeSprite(SPR.vape),
    heart: makeSprite(SPR.heart),
  };
  const room = buildRoom();
  const fog = buildFog();

  let input: Input = { ...NO_INPUT };
  let prev = { ...input };
  let state: State = "title";
  let stateT = 0;
  let frame = 0;
  let best = loadBest(LUNCH_BEST_KEY);

  const j = { x: 74, vx: 0, face: 1, flash: 0 };
  let t = 0;
  let rest = 100;
  let score = 0;
  let combo = 0;
  let bestCombo = 0;
  let foods = 0;
  let naps = 0;
  let spawnT = 0;
  let coma = 0;
  let cumin = 0;
  let caff = 0;
  let dessert = 0;
  let fogT = 0;
  let napFlash = 0;
  let vapeWarned = false;
  let items: Item[] = [];
  let popups: Popup[] = [];
  let say = { text: "", t: 0 };
  let admirer: { x: number; dir: number; leaving: boolean; hit: boolean } | null = null;
  let admirerT = 0;

  function reset() {
    Object.assign(j, { x: 74, vx: 0, face: 1, flash: 0 });
    t = spawnT = coma = cumin = caff = dessert = fogT = napFlash = 0;
    rest = 100;
    score = combo = bestCombo = foods = naps = 0;
    vapeWarned = false;
    items = [];
    popups = [];
    admirer = null;
    admirerT = 1200 + Math.random() * 600;
    say = { text: "LOOK TO REST YOURSELF.", t: 100 };
    setState("play");
  }
  function setState(s: State) {
    state = s;
    stateT = 0;
  }

  function spawn(kind?: Kind, x?: number, y = 4) {
    const sec = t / 60;
    const fall = Math.min(2, 0.7 + sec * 0.02);
    if (!kind) {
      const bad = Math.min(0.5, 0.25 + sec * 0.005);
      kind = Math.random() < bad ? pick(HAZARDS, HAZARD_WEIGHTS) : pick(FOODS, FOOD_WEIGHTS);
      if (dessert > 0 && !isFood(kind)) kind = "cake";
    }
    const vy = kind === "phone" ? fall * 1.5 : fall * (0.85 + Math.random() * 0.3);
    items.push({ kind, x: x ?? 6 + Math.random() * (W - 20), y, vy, vx: 0, t: 0, bounced: false });
  }

  function pop(x: number, y: number, str: string, life = 50) {
    popups.push({ x: Math.max(1, Math.min(W - str.length * 4, x - str.length * 2)), y, text: str, t: life });
  }

  function catchFood(it: Item) {
    if (it.kind === "pizza" && !it.bounced) {
      // Rubbery: the first catch sends it back up.
      it.bounced = true;
      it.vy = -3.2;
      it.y = JY - 10;
      score += 10 * mult();
      pop(it.x + 4, it.y, "BOING!");
      sfx.boing();
      return false;
    }
    combo++;
    bestCombo = Math.max(bestCombo, combo);
    foods++;
    rest = Math.min(100, rest + 3);
    let base = 10;
    if (it.kind === "pelau") {
      base = 20;
      rest = Math.min(100, rest + 2);
      coma = 120;
      pop(it.x + 4, JY - 24, "FISH PELAU. FOOD COMA.");
    } else if (it.kind === "pork") {
      base = 15;
      cumin = 240;
      pop(it.x + 4, JY - 24, "CUMIN KICK! X2");
    } else if (it.kind === "pizza") {
      base = 20;
      pop(it.x + 4, JY - 24, "RUBBERS PIZZA!");
    } else if (it.kind === "matcha") {
      rest = Math.min(100, rest + 7);
      caff = 300;
      pop(it.x + 4, JY - 24, "MATCHA. +REST");
    } else if (it.kind === "cake") {
      base = 50;
      dessert = 300;
      for (const o of items) if (!isFood(o.kind)) Object.assign(o, { kind: "cake", vx: 0 });
      pop(80, 40, "THE DESSERT EXCEPTION!", 80);
    }
    score += base * mult();
    if (combo >= 2 && combo <= 5) say = { text: HELPINGS[combo], t: 60 };
    else if (combo === 10) say = { text: "BOTTOMLESS.", t: 70 };
    if (foods % 10 === 0 && naps < 3) {
      naps++;
      pop(j.x + 6, JY - 32, "+NAP (PRESS A)", 70);
    }
    combo >= 2 ? sfx.combo(Math.min(combo, 6)) : sfx.pickup();
    return true;
  }

  function hitBy(kind: Hazard) {
    rest -= DAMAGE[kind];
    combo = 0;
    j.flash = 30;
    sfx.hit();
    buzz(50);
    if (kind === "vape") {
      fogT = 180;
      say = vapeWarned ? { text: "COUGH. WHAT.", t: 80 } : { text: "THE DOCTRINE HAS BEEN AMENDED.", t: 120 };
      vapeWarned = true;
    } else if (kind === "amendment") say = { text: "SAY THAT AGAIN PLEASE.", t: 90 };
    else if (kind === "phone") say = { text: "REPETEZ S'IL VOUS PLAIT.", t: 90 };
    else say = { text: "WHAT.", t: 60 };
    pop(j.x + 6, JY - 24, kind === "replyall" ? "REPLY ALL. -15" : `-${DAMAGE[kind]} REST`);
  }

  function nap() {
    if (naps <= 0) return;
    naps--;
    napFlash = 24;
    for (const it of items) if (!isFood(it.kind)) pop(it.x + 4, it.y, "ZZZ", 30);
    items = items.filter((it) => isFood(it.kind));
    if (admirer && !admirer.leaving) admirer.leaving = true;
    fogT = 0;
    say = { text: "LOOK TO REST YOURSELF.", t: 100 };
    sfx.rest();
  }

  function step(aPressed: boolean) {
    t++;
    const dec = (v: number) => (v > 0 ? v - 1 : 0);
    coma = dec(coma);
    cumin = dec(cumin);
    caff = dec(caff);
    dessert = dec(dessert);
    fogT = dec(fogT);
    napFlash = dec(napFlash);
    j.flash = dec(j.flash);
    if (say.t > 0) say.t--;
    if (aPressed) nap();

    // Jack
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const max = (input.b ? 2.3 : 1.4) * (caff > 0 ? 1.35 : 1) * (coma > 0 ? 0.5 : 1);
    if (dir) {
      j.vx += dir * 0.35;
      j.vx = Math.max(-max, Math.min(max, j.vx));
      j.face = dir;
    } else j.vx *= 0.7;
    j.x = Math.max(2, Math.min(W - JW - 2, j.x + j.vx));

    // Spawning
    const sec = t / 60;
    if (--spawnT <= 0) {
      spawn();
      spawnT = Math.max(18, 50 - sec * 0.6);
    }

    // Items
    const next: Item[] = [];
    for (const it of items) {
      it.t++;
      if (it.bounced && it.vy < 2) it.vy += 0.12;
      if (it.kind === "amendment") it.vx = Math.sin(it.t / 12) * 0.9;
      it.x = Math.max(1, Math.min(W - 10, it.x + it.vx));
      it.y += it.vy;
      if (it.kind === "replyall" && it.y > 56) {
        for (const vx of [-0.7, 0, 0.7]) next.push({ kind: "email", x: it.x, y: it.y, vy: it.vy, vx, t: 0, bounced: false });
        pop(it.x + 4, it.y - 6, "REPLY ALL!", 40);
        continue;
      }
      if (it.kind === "email" && it.vx) it.vx *= 0.99;
      const caught = it.y + 8 >= JY && it.y <= JY + 5 && it.x + 8 > j.x - 1 && it.x < j.x + JW + 1;
      if (caught && (it.vy > 0 || !it.bounced)) {
        if (isFood(it.kind)) {
          if (!catchFood(it)) {
            next.push(it);
            continue;
          }
        } else hitBy(it.kind);
        if (rest <= 0) break;
        continue;
      }
      if (it.y > FLOOR) {
        if (isFood(it.kind) && it.kind !== "cake") {
          if (combo >= 2) pop(it.x + 4, FLOOR - 10, "FOR LATER", 40);
          combo = 0;
        }
        continue;
      }
      next.push(it);
    }
    items = next;

    // Admirer cameo
    if (!admirer && sec > 15 && --admirerT <= 0) {
      const fromLeft = Math.random() < 0.5;
      admirer = { x: fromLeft ? -12 : W + 2, dir: fromLeft ? 1 : -1, leaving: false, hit: false };
    }
    if (admirer) {
      const a = admirer;
      if (a.leaving) a.x += (a.x + 5 < j.x + 6 ? -1 : 1) * 1.2;
      else a.x += a.dir * 0.45;
      if (!a.leaving && !a.hit && a.x + 8 > j.x + 2 && a.x < j.x + JW - 2) {
        a.hit = true;
        a.leaving = true;
        rest -= 10;
        combo = 0;
        j.flash = 30;
        sfx.hit();
        say = { text: "WHAT.", t: 60 };
        pop(j.x + 6, JY - 24, "-10 REST");
      }
      if (a.x < -16 || a.x > W + 6) {
        admirer = null;
        admirerT = 900 + Math.random() * 900;
      }
    }

    popups = popups.filter((pp) => --pp.t > 0);
    if (rest <= 0) {
      rest = 0;
      if (score > best) {
        best = score;
        saveBest(LUNCH_BEST_KEY, best);
      }
      sfx.over();
      setState("over");
    }
  }

  function update() {
    frame++;
    stateT++;
    const aPressed = input.a && !prev.a;
    const startPressed = input.start && !prev.start;
    prev = { ...input };
    if (state === "title") {
      if (aPressed || startPressed) reset();
    } else if (state === "pause") {
      if (aPressed || startPressed) setState("play");
    } else if (state === "over") {
      if ((aPressed || startPressed) && stateT > 40) reset();
    } else if (startPressed) setState("pause");
    else step(aPressed);
  }

  // ---------- Rendering ----------
  function render() {
    ctx.drawImage(room, 0, 0);
    drawClock();
    // Items
    for (const it of items) {
      const shake = it.kind === "phone" && Math.floor(it.t / 3) % 2 ? 1 : 0;
      ctx.drawImage(img[it.kind], Math.round(it.x) + shake, Math.round(it.y));
    }
    // Admirer
    if (admirer) {
      const f = Math.floor(frame / 12) % 2;
      const facing = admirer.leaving ? (admirer.x + 5 < j.x + 6 ? -1 : 1) : admirer.dir;
      ctx.drawImage(adm[facing > 0 ? 0 : 1][f], Math.round(admirer.x), FLOOR - 14);
      if (state === "play") bubble(admirer.leaving ? "OK BYE" : "LUNCH TOGETHER?", admirer.x + 5, FLOOR - 15, admirer.leaving ? undefined : img.heart);
    }
    // Jack
    if (!(j.flash > 0 && Math.floor(j.flash / 4) % 2)) {
      const walking = Math.abs(j.vx) > 0.3 && Math.floor(frame / 7) % 2;
      ctx.drawImage(jack[walking ? 1 : 0], Math.round(j.x), JY);
    }
    if (coma > 0) text(Math.floor(frame / 20) % 2 ? "Z Z" : " Z ", j.x + 1, JY - 24, 2);
    if (cumin > 0 && state === "play") text("X2", j.x + 14, JY + 2, 3);
    // Vape fog
    if (fogT > 0) {
      const drift = Math.round(Math.sin(frame / 20) * 4);
      ctx.globalAlpha = Math.min(1, fogT / 40);
      ctx.drawImage(fog, drift - 8, 40);
      ctx.globalAlpha = 1;
    }
    if (napFlash > 0 && napFlash % 6 < 3) fill(0, 0, 11, W, H - 11);
    if (say.t > 0 && state === "play") bubble(say.text, j.x + 6, JY - 1);
    for (const pp of popups) text(pp.text, pp.x, pp.y - (50 - pp.t) / 4, 3);

    if (state === "title") {
      panel(12, 16, 136, 92);
      center("SECOND", 24, 3, 2);
      center("HELPINGS", 38, 3, 2);
      center("CATCH THE LUNCH", 56, 2);
      center("DODGE THE WORK", 64, 2);
      center("VAPES HURT HERE", 72, 2);
      if (Math.floor(frame / 30) % 2) center("PRESS START", 86, 3);
      center(`BEST ${String(best).padStart(6, "0")}`, 98, 2);
      return;
    }
    drawHud();
    if (state === "pause") {
      panel(16, 48, 128, 40);
      center("PAUSED", 56, 3, 2);
      center("LOOK TO REST YOURSELF.", 74, 2);
    } else if (state === "over") {
      panel(8, 22, 144, 102);
      center("OUT OF REST.", 30, 3, 2);
      center("BEING FULL IS A", 48, 2);
      center("TEMPORARY OPINION.", 56, 2);
      center(`FOOD x${foods}   BEST COMBO x${bestCombo}`, 70, 3);
      center(`SCORE ${String(score).padStart(6, "0")}`, 82, 3);
      center(`BEST  ${String(best).padStart(6, "0")}`, 92, 2);
      if (stateT > 40 && Math.floor(frame / 30) % 2) center("PRESS A TO RETRY", 110, 3);
    }
  }

  function drawClock() {
    const mins = Math.floor(t / 120);
    const cx = 132;
    const cy = 30;
    const ang = (mins / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = PAL[3];
    for (let r = 1; r < 7; r++) ctx.fillRect(Math.round(cx + Math.cos(ang) * r), Math.round(cy + Math.sin(ang) * r), 1, 1);
    for (let r = 1; r < 5; r++) ctx.fillRect(Math.round(cx + Math.cos(-Math.PI / 2 + mins / 720) * r), Math.round(cy - r), 1, 1);
  }

  function drawHud() {
    fill(3, 0, 0, W, 11);
    text("REST", 2, 3, 0);
    fill(2, 20, 3, 42, 5);
    const low = rest < 25 && Math.floor(frame / 10) % 2;
    fill(low ? 2 : 0, 21, 4, Math.ceil((rest / 100) * 40), 3);
    const mins = Math.floor(t / 120);
    const clock = mins < 60 ? `12:${String(mins).padStart(2, "0")}` : `1:${String(mins - 60).padStart(2, "0")}`;
    text(clock, 68, 3, 0);
    if (mins >= 60) text("EXT", 90, 3, 1);
    text(String(score).padStart(6, "0"), W - 26, 3, 0);
    for (let i = 0; i < naps; i++) text("Z", 3 + i * 6, 14, 3);
    if (combo >= 2) text(`x${Math.min(combo, 5)}`, W - 14, 14, 3);
    if (dessert > 0) text("DESSERT", W - 30, 22, 2);
  }

  function mult() {
    return Math.max(1, Math.min(5, combo)) * (cumin > 0 ? 2 : 1);
  }

  const stop = runLoop(update, render, () => {
    if (state === "play") setState("pause");
  });

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__lunch = {
      j,
      get state() {
        return state;
      },
      get rest() {
        return rest;
      },
      set rest(v: number) {
        rest = v;
      },
      get score() {
        return score;
      },
      get combo() {
        return combo;
      },
      get naps() {
        return naps;
      },
      get items() {
        return items;
      },
      get fx() {
        return { coma, cumin, caff, dessert, fogT, admirer };
      },
      spawn,
      spawnAdmirer(fromLeft = true) {
        admirer = { x: fromLeft ? -12 : W + 2, dir: fromLeft ? 1 : -1, leaving: false, hit: false };
      },
      /** Stop random spawns for deterministic tests. */
      quiet() {
        spawnT = 1e9;
        admirerT = 1e9;
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
    tap() {
      if (state === "title") reset();
      else if (state === "pause") setState("play");
      else if (state === "over" && stateT > 40) reset();
      else if (state === "play") nap();
    },
    destroy() {
      stop();
    },
  };
};

// ---------- Background art ----------
function buildRoom() {
  const [c, x] = strip(W);
  const f = (col: number, a: number, b: number, w: number, h: number) => {
    x.fillStyle = PAL[col];
    x.fillRect(a, b, w, h);
  };
  f(0, 0, 0, W, H);
  // Wall trim
  f(1, 0, 96, W, 28);
  f(2, 0, 95, W, 1);
  // Window onto Tempe
  f(3, 8, 18, 68, 48);
  f(0, 10, 20, 64, 44);
  const butte = buildButte(64);
  x.save();
  x.beginPath();
  x.rect(10, 20, 64, 44);
  x.clip();
  x.drawImage(butte, -50, 0);
  x.restore();
  f(3, 41, 20, 2, 44);
  f(3, 10, 41, 64, 2);
  f(2, 6, 66, 72, 3);
  // Wall clock face
  disc(x, 132, 30, 9, 3);
  disc(x, 132, 30, 8, 0);
  // Poster
  f(3, 92, 24, 26, 34);
  f(0, 93, 25, 24, 32);
  const words = ["LOOK", "TO", "REST"];
  words.forEach((w, i) => tinyText(x, w, 105 - w.length * 2, 30 + i * 8));
  // Vending machine
  f(3, 130, 58, 26, 66);
  f(2, 132, 60, 22, 62);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) f(r % 2 ? 1 : 0, 134 + k * 6, 63 + r * 9, 4, 6);
  f(3, 134, 102, 18, 6);
  f(0, 150, 66, 2, 8);
  // Microwave
  f(3, 6, 82, 30, 14);
  f(1, 8, 84, 18, 10);
  f(2, 28, 84, 6, 10);
  // Counter
  f(3, 0, FLOOR, W, 2);
  f(2, 0, FLOOR + 2, W, H - FLOOR - 2);
  for (let i = 0; i < W; i += 16) f(3, i, FLOOR + 2, 1, H - FLOOR - 2);
  f(1, 0, FLOOR + 6, W, 1);
  return c;
}

function buildFog() {
  const [c, x] = strip(W + 16, 90);
  x.fillStyle = PAL[1];
  for (let yy = 0; yy < 90; yy++) for (let xx = (yy % 2); xx < W + 16; xx += 2) if (Math.sin(xx / 9) * 10 + Math.cos(yy / 7) * 8 + 20 > yy * 0.3) x.fillRect(xx, yy, 1, 1);
  const puff = (cx: number, cy: number, r: number) => disc(x, cx, cy, r, 0);
  [20, 60, 100, 140].forEach((px, i) => puff(px, 30 + (i % 2) * 18, 9));
  return c;
}

function tinyText(ctx: CanvasRenderingContext2D, str: string, x: number, y: number) {
  createGfx(ctx).text(str, x, y, 3);
}
