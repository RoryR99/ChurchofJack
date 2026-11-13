// Contract Crunch: falling pairs of cargo at Jack's desk. Match 3+ of a kind in a row or column to clear them.
// Signed contracts clear every block of the type they land on; amendments arrive on a deadline as junk.
import { SPR, makeSprite } from "./sprites";
import { sfx } from "./audio";
import { buzz, createGfx, loadBest, runLoop, saveBest } from "./gfx";
import { NO_INPUT, W, type CartFactory, type Input } from "./types";

export const CRUNCH_BEST_KEY = "jack-crunch-best";
const COLS = 6;
const ROWS = 14;
const CELL = 8;
const WX = 8; // well origin
const WY = 16;
const EMPTY = 0;
const CONTRACT = 5;
const JUNK = 6;
const DX = [0, 1, 0, -1]; // where the second block sits: up, right, down, left
const DY = [-1, 0, 1, 0];
const CHAINS = ["", "", "SUBCLAUSE!", "ADDENDUM!", "APPENDIX!"];

type State = "title" | "play" | "pause" | "over";
type Piece = { a: number; b: number; x: number; y: number; r: number };
type Popup = { x: number; y: number; text: string; t: number };

export const createCrunch: CartFactory = (canvas) => {
  const ctx = canvas.getContext("2d")!;
  const { fill, text, center, panel, bubble } = createGfx(ctx);
  const cells = [null, SPR.crate, SPR.barrel, SPR.parcel, SPR.cup, SPR.contract, SPR.junk].map((s) => (s ? makeSprite(s) : null));
  const jackImg = makeSprite(SPR.jackIdle);

  let input: Input = { ...NO_INPUT };
  let prev = { ...input };
  let state: State = "title";
  let stateT = 0;
  let frame = 0;
  let best = loadBest(CRUNCH_BEST_KEY);

  const grid = new Int8Array(COLS * ROWS);
  let piece: Piece | null = null;
  let next: [number, number] = [1, 2];
  let phase: "piece" | "flash" = "piece";
  let clearing = new Set<number>();
  let flashT = 0;
  let chain = 0;
  let fallT = 0;
  let lockT = 0;
  let lockResets = 0;
  let das = 0;
  let score = 0;
  let level = 1;
  let cleared = 0;
  let junkT = 0;
  let junkPending = false;
  let popups: Popup[] = [];
  let say = { text: "", t: 0 };

  const at = (x: number, y: number) => (x < 0 || x >= COLS || y >= ROWS ? -1 : y < 0 ? EMPTY : grid[y * COLS + x]);
  const fallFrames = () => Math.max(5, 42 - (level - 1) * 4);
  const junkEvery = () => Math.max(420, 1080 - level * 60);

  function randomPair(): [number, number] {
    const c = () => 1 + Math.floor(Math.random() * 4);
    if (Math.random() < 1 / 14) return [CONTRACT, c()];
    return [c(), c()];
  }

  function reset() {
    grid.fill(EMPTY);
    score = cleared = chain = 0;
    level = 1;
    popups = [];
    phase = "piece";
    clearing = new Set();
    junkT = junkEvery();
    junkPending = false;
    next = randomPair();
    say = { text: "LOOK TO REST YOURSELF.", t: 100 };
    spawn();
    setState("play");
  }
  function setState(s: State) {
    state = s;
    stateT = 0;
  }

  function fits(p: Piece) {
    return at(p.x, p.y) === EMPTY && at(p.x + DX[p.r], p.y + DY[p.r]) === EMPTY;
  }

  function spawn() {
    const [a, b] = next;
    next = randomPair();
    piece = { a, b, x: 2, y: 0, r: 0 };
    fallT = lockT = lockResets = 0;
    if (!fits(piece)) gameOver();
  }

  function gameOver() {
    piece = null;
    if (score > best) {
      best = score;
      saveBest(CRUNCH_BEST_KEY, best);
    }
    sfx.over();
    setState("over");
  }

  function tryMove(dx: number, dy: number, dr = 0) {
    if (!piece) return false;
    const r = (piece.r + dr + 4) % 4;
    const kicks = dr ? [[0, 0], [-1, 0], [1, 0], [0, -1]] : [[0, 0]];
    for (const [kx, ky] of kicks) {
      const p = { ...piece, x: piece.x + dx + kx, y: piece.y + dy + ky, r };
      if (fits(p)) {
        piece = p;
        if (dy === 0 && lockT > 0 && lockResets < 8) {
          lockT = 0;
          lockResets++;
        }
        return true;
      }
    }
    return false;
  }

  function dropY(p: Piece) {
    let y = p.y;
    while (fits({ ...p, y: y + 1 })) y++;
    return y;
  }

  function lock() {
    if (!piece) return;
    const p = piece;
    piece = null;
    const bx = p.x + DX[p.r];
    const by = p.y + DY[p.r];
    if (p.y < 0 || by < 0) return gameOver();
    grid[p.y * COLS + p.x] = p.a;
    grid[by * COLS + bx] = p.b;
    sfx.blip();
    chain = 0;
    resolve();
  }

  function gravity() {
    for (let x = 0; x < COLS; x++) {
      let w = ROWS - 1;
      for (let y = ROWS - 1; y >= 0; y--) {
        const v = grid[y * COLS + x];
        if (v !== EMPTY) {
          grid[y * COLS + x] = EMPTY;
          grid[w * COLS + x] = v;
          w--;
        }
      }
    }
  }

  function dropJunk() {
    const n = Math.min(4, 2 + Math.floor(level / 3));
    const cols = [...Array(COLS).keys()].sort(() => Math.random() - 0.5).slice(0, n);
    for (const x of cols) {
      let y = ROWS - 1;
      while (y >= 0 && grid[y * COLS + x] !== EMPTY) y--;
      if (y >= 0) grid[y * COLS + x] = JUNK;
    }
    popups.push({ x: WX + 2, y: WY + 20, text: "AMENDMENTS!", t: 60 });
    say = { text: "SAY THAT AGAIN PLEASE.", t: 90 };
    sfx.hit();
    buzz(40);
  }

  /** Find everything that clears right now. */
  function findClears() {
    const out = new Set<number>();
    const cargo = (v: number) => v >= 1 && v <= 4;
    // Runs of 3+ horizontally and vertically
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; ) {
        const v = grid[y * COLS + x];
        let e = x + 1;
        while (e < COLS && grid[y * COLS + e] === v) e++;
        if (cargo(v) && e - x >= 3) for (let i = x; i < e; i++) out.add(y * COLS + i);
        x = e;
      }
    }
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; ) {
        const v = grid[y * COLS + x];
        let e = y + 1;
        while (e < ROWS && grid[e * COLS + x] === v) e++;
        if (cargo(v) && e - y >= 3) for (let i = y; i < e; i++) out.add(i * COLS + x);
        y = e;
      }
    }
    // Signed contracts: clear every block of the type they touch (below first)
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== CONTRACT) continue;
      const x = i % COLS;
      const y = Math.floor(i / COLS);
      const touching = [at(x, y + 1), at(x - 1, y), at(x + 1, y), at(x, y - 1)].find(cargo);
      out.add(i);
      if (touching) {
        for (let k = 0; k < grid.length; k++) if (grid[k] === touching) out.add(k);
        score += 100 * level;
        popups.push({ x: WX + 6, y: WY + 40, text: "SIGNED!", t: 60 });
      }
    }
    // Amendments next to anything clearing go too
    for (const i of [...out]) {
      const x = i % COLS;
      const y = Math.floor(i / COLS);
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (at(nx, ny) === JUNK) out.add(ny * COLS + nx);
      }
    }
    return out;
  }

  function resolve() {
    gravity();
    if (junkPending && chain === 0) {
      junkPending = false;
      dropJunk();
      gravity();
    }
    const found = findClears();
    if (found.size) {
      chain++;
      clearing = found;
      phase = "flash";
      flashT = 18;
      const pts = found.size * 10 * chain * level;
      score += pts;
      cleared += found.size;
      if (chain >= 2) popups.push({ x: WX + 2, y: WY + 50, text: chain >= 5 ? "WHAT." : CHAINS[chain], t: 60 });
      if (chain >= 3) say = { text: "ROCK BACK HEAVY", t: 90 };
      chain >= 2 ? sfx.combo(Math.min(chain + 1, 7)) : sfx.pickup();
      const newLevel = 1 + Math.floor(cleared / 25);
      if (newLevel > level) {
        level = newLevel;
        popups.push({ x: WX + 6, y: WY + 64, text: `CLAUSE ${level}`, t: 80 });
        sfx.rest();
      }
    } else {
      phase = "piece";
      spawn();
    }
  }

  function stackHeight() {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y * COLS + x] !== EMPTY) return ROWS - y;
    return 0;
  }

  function step() {
    const pressed = (k: keyof Input) => input[k] && !prev[k];
    if (say.t > 0) say.t--;
    popups = popups.filter((p) => --p.t > 0);
    if (--junkT <= 0) {
      junkPending = true;
      junkT = junkEvery();
    }
    if (phase === "flash") {
      if (--flashT <= 0) {
        for (const i of clearing) grid[i] = EMPTY;
        clearing = new Set();
        resolve();
      }
      return;
    }
    if (!piece) return;
    // Rotate
    if (pressed("a")) tryMove(0, 0, 1) && sfx.blip();
    if (pressed("b")) tryMove(0, 0, -1) && sfx.blip();
    // Move with auto-repeat
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir) {
      if (das === 0 || (das > 12 && (das - 12) % 4 === 0)) tryMove(dir, 0);
      das++;
    } else das = 0;
    // Hard drop
    if (pressed("up")) {
      const y = dropY(piece);
      score += (y - piece.y) * 2;
      piece.y = y;
      return lock();
    }
    // Gravity / soft drop
    const every = input.down ? 2 : fallFrames();
    if (++fallT >= every) {
      fallT = 0;
      if (tryMove(0, 1)) {
        if (input.down) score += 1;
        lockT = 0;
      }
    }
    if (piece && !fits({ ...piece, y: piece.y + 1 })) {
      if (++lockT >= (input.down ? 6 : 24)) lock();
    }
  }

  function update() {
    frame++;
    stateT++;
    const aPressed = input.a && !prev.a;
    const startPressed = input.start && !prev.start;
    if (state === "title") {
      if (aPressed || startPressed) reset();
    } else if (state === "pause") {
      if (aPressed || startPressed) setState("play");
    } else if (state === "over") {
      if ((aPressed || startPressed) && stateT > 40) reset();
    } else if (startPressed) setState("pause");
    else step();
    prev = { ...input };
  }

  // ---------- Rendering ----------
  function drawCell(v: number, x: number, y: number) {
    const img = cells[v];
    if (img) ctx.drawImage(img, WX + x * CELL, WY + y * CELL);
  }

  function render() {
    // Desk backdrop
    fill(0, 0, 0, W, 144);
    fill(1, 0, 132, W, 12);
    fill(2, 0, 131, W, 1);
    // Well
    fill(3, WX - 2, WY - 2, COLS * CELL + 4, ROWS * CELL + 4);
    fill(0, WX, WY, COLS * CELL, ROWS * CELL);
    for (let x = 1; x < COLS; x++) for (let y = 1; y < ROWS; y++) fill(1, WX + x * CELL, WY + y * CELL, 1, 1);
    // Settled blocks
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === EMPTY) continue;
      if (clearing.has(i) && (flashT < 6 || Math.floor(flashT / 3) % 2)) {
        if (flashT < 6) fill(3, WX + (i % COLS) * CELL + 2, WY + Math.floor(i / COLS) * CELL + 2, 4, 4);
        continue;
      }
      drawCell(grid[i], i % COLS, Math.floor(i / COLS));
    }
    // Active piece and its landing ghost
    if (piece && state === "play") {
      const gy = dropY(piece);
      for (const [x, y] of [
        [piece.x, gy],
        [piece.x + DX[piece.r], gy + DY[piece.r]],
      ]) {
        if (y < 0) continue;
        fill(2, WX + x * CELL, WY + y * CELL, CELL, 1);
        fill(2, WX + x * CELL, WY + y * CELL + CELL - 1, CELL, 1);
      }
      if (piece.y >= 0) drawCell(piece.a, piece.x, piece.y);
      const by = piece.y + DY[piece.r];
      if (by >= 0) drawCell(piece.b, piece.x + DX[piece.r], by);
    }
    // Top bar
    fill(3, 0, 0, W, 11);
    center("CONTRACT CRUNCH", 3, 0);
    // Side panel
    text("IN TRAY", 64, 16, 3);
    fill(3, 66, 23, 22, 26);
    fill(0, 67, 24, 20, 24);
    if (cells[next[1]]) ctx.drawImage(cells[next[1]]!, 73, 27);
    if (cells[next[0]]) ctx.drawImage(cells[next[0]]!, 73, 37);
    text("SCORE", 102, 16, 2);
    text(String(score).padStart(6, "0"), 102, 23, 3);
    text("CLAUSE", 102, 33, 2);
    text(String(level), 102, 40, 3);
    text("CLEARED", 66, 56, 2);
    text(String(cleared), 66, 63, 3);
    text("NEXT AMENDMENT", 66, 74, 2);
    fill(3, 66, 81, 60, 4);
    fill(1, 67, 82, Math.max(0, Math.round((junkT / junkEvery()) * 58)), 2);
    // Jack at his desk
    const danger = stackHeight() >= ROWS - 3;
    ctx.drawImage(jackImg, 112, 113); // sitting behind the desk
    fill(3, 136, 107, 16, 12); // monitor
    fill(danger && Math.floor(frame / 15) % 2 ? 2 : 1, 137, 108, 14, 9);
    fill(3, 143, 119, 2, 3);
    fill(0, 126, 118, 8, 4); // paperwork
    fill(3, 126, 117, 8, 1);
    fill(2, 100, 122, 56, 3); // desk
    fill(3, 100, 125, 56, 1);
    fill(3, 104, 126, 2, 6);
    fill(3, 150, 126, 2, 6);
    if (state === "play") {
      if (say.t > 0) bubble(say.text, 117, 112);
      else if (danger && Math.floor(frame / 40) % 2) bubble("WHAT.", 117, 112);
    }
    for (const p of popups) text(p.text, p.x, p.y - (60 - p.t) / 5, 3);

    if (state === "title") {
      panel(10, 18, 140, 96);
      center("CONTRACT", 26, 3, 2);
      center("CRUNCH", 40, 3, 2);
      center("MATCH 3 OF A CARGO", 58, 2);
      center("A/B ROTATE  UP DROP", 66, 2);
      center("CONTRACTS CLEAR A TYPE", 74, 2);
      if (Math.floor(frame / 30) % 2) center("PRESS START", 88, 3);
      center(`BEST ${String(best).padStart(6, "0")}`, 100, 2);
    } else if (state === "pause") {
      panel(16, 48, 128, 40);
      center("PAUSED", 56, 3, 2);
      center("LOOK TO REST YOURSELF.", 74, 2);
    } else if (state === "over") {
      panel(8, 26, 144, 90);
      center("CONTRACT VOID.", 34, 3, 2);
      center("SAY THAT AGAIN PLEASE.", 52, 2);
      center(`CLEARED ${cleared}   CLAUSE ${level}`, 64, 3);
      center(`SCORE ${String(score).padStart(6, "0")}`, 76, 3);
      center(`BEST  ${String(best).padStart(6, "0")}`, 86, 2);
      if (stateT > 40 && Math.floor(frame / 30) % 2) center("PRESS A TO RETRY", 102, 3);
    }
  }

  const stop = runLoop(update, render, () => {
    if (state === "play") setState("pause");
  });

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__crunch = {
      grid,
      COLS,
      ROWS,
      get state() {
        return state;
      },
      get piece() {
        return piece;
      },
      get score() {
        return score;
      },
      get phase() {
        return phase;
      },
      get level() {
        return level;
      },
      /** Replace the falling pair (deterministic tests). */
      force(a: number, b: number, x = 2, r = 0) {
        piece = { a, b, x, y: 1, r };
      },
      setNext(a: number, b: number) {
        next = [a, b];
      },
      junkNow() {
        junkPending = true;
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
    setInput(nextInput: Input) {
      input = nextInput;
    },
    tap() {
      if (state === "title") reset();
      else if (state === "pause") setState("play");
      else if (state === "over" && stateT > 40) reset();
      else if (state === "play" && phase === "piece") tryMove(0, 0, 1);
    },
    destroy() {
      stop();
    },
  };
};
