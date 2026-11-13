// The commute, built from a few helpers: Apartment → Mill Ave → Tempe Town Lake → the office.
export const TILE = 8;
export const ROWS = 18;
export const COLS = 240;
export const GROUND = 15; // row of the sidewalk surface
export const T = { EMPTY: 0, TOP: 1, FILL: 2, BRICK: 3, PLAT: 4, WATERTOP: 5, WATER: 6 } as const;

export type EntKind = "matcha" | "vape" | "admirer" | "cactus" | "bench" | "sign" | "apartment" | "office";
export type Ent = { kind: EntKind; x: number; y: number; text?: string; chase?: boolean };

export type Level = {
  grid: Uint8Array;
  ents: Ent[];
  start: { x: number; y: number };
  door: number;
  width: number;
};

export function buildLevel(): Level {
  const grid = new Uint8Array(COLS * ROWS);
  const ents: Ent[] = [];
  const set = (c: number, r: number, t: number) => {
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) grid[r * COLS + c] = t;
  };
  const ground = (c0: number, c1: number) => {
    for (let c = c0; c <= c1; c++) {
      set(c, GROUND, T.TOP);
      for (let r = GROUND + 1; r < ROWS; r++) set(c, r, T.FILL);
    }
  };
  const water = (c0: number, c1: number) => {
    for (let c = c0; c <= c1; c++) {
      set(c, GROUND + 1, T.WATERTOP);
      set(c, GROUND + 2, T.WATER);
    }
  };
  const block = (c: number, r: number, w: number, h: number) => {
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) set(c + i, r + j, T.BRICK);
  };
  const plat = (c: number, r: number, w: number) => {
    for (let i = 0; i < w; i++) set(c + i, r, T.PLAT);
  };
  const item = (kind: "matcha" | "vape", c: number, r: number) => ents.push({ kind, x: c * TILE, y: r * TILE });
  const admirer = (c: number, surface = GROUND, chase = false) =>
    ents.push({ kind: "admirer", x: c * TILE, y: surface * TILE - 13, chase });
  const cactus = (c: number, surface = GROUND) => ents.push({ kind: "cactus", x: c * TILE, y: surface * TILE - 12 });
  const bench = (c: number) => ents.push({ kind: "bench", x: c * TILE, y: GROUND * TILE - 8 });
  const sign = (c: number, text: string) => ents.push({ kind: "sign", x: c * TILE, y: GROUND * TILE - 22, text });

  // 1. The apartment
  ents.push({ kind: "apartment", x: 0, y: 0 });
  ground(0, 49);
  sign(12, "TEMPE AZ");
  item("matcha", 15, 13);
  block(19, 14, 1, 1);
  block(20, 13, 1, 2);
  plat(23, 11, 4);
  item("matcha", 24, 9);
  admirer(30);
  cactus(35);
  plat(38, 11, 3);
  item("vape", 39, 9);
  admirer(43, GROUND, true);
  bench(46);

  // 2. Mill Avenue
  sign(52, "MILL AVE");
  ground(50, 61);
  ground(65, 80);
  ground(84, 109);
  plat(54, 11, 5);
  item("matcha", 56, 9);
  admirer(58);
  plat(66, 11, 4);
  admirer(70, GROUND, true);
  plat(72, 9, 4);
  item("matcha", 73, 7);
  admirer(76);
  cactus(79);
  plat(86, 11, 6);
  item("matcha", 88, 9);
  admirer(90);
  cactus(94);
  plat(96, 10, 4);
  item("vape", 97, 8);
  admirer(100, GROUND, true);
  bench(105);

  // 3. Tempe Town Lake
  ground(110, 117);
  sign(112, "TOWN LAKE");
  water(118, 167);
  block(120, 13, 9, 1);
  item("matcha", 124, 11);
  admirer(125, 13);
  plat(131, 11, 3);
  plat(136, 9, 3);
  item("vape", 137, 7);
  plat(141, 11, 3);
  block(146, 13, 10, 1);
  item("matcha", 150, 11);
  admirer(151, 13, true);
  plat(158, 12, 3);
  plat(163, 10, 3);
  item("matcha", 164, 8);
  ground(168, 179);
  bench(172);

  // 4. The office
  ground(180, 191);
  ground(195, 209);
  ground(213, 239);
  sign(182, "WORK ->");
  plat(186, 11, 4);
  admirer(188, GROUND, true);
  cactus(197);
  plat(198, 11, 3);
  item("matcha", 199, 9);
  admirer(201);
  plat(203, 9, 3);
  item("vape", 204, 7);
  cactus(207);
  admirer(215, GROUND, true);
  block(217, 14, 2, 1);
  block(219, 13, 2, 2);
  item("matcha", 219, 11);
  block(221, 12, 1, 3);
  cactus(224);
  admirer(225, GROUND, true);
  ents.push({ kind: "office", x: 228 * TILE, y: 0 });

  return { grid, ents, start: { x: 9 * TILE, y: GROUND * TILE - 13 }, door: 232 * TILE, width: COLS * TILE };
}
