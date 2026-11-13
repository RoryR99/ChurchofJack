// The Jackboy boot screen and cartridge picker.
import { SPR, makeSprite } from "./sprites";
import { sfx } from "./audio";
import { createGfx, loadBest, runLoop } from "./gfx";
import { CARTS } from "./carts";
import { H, NO_INPUT, W, type CartFactory, type Input } from "./types";

const ROW_Y = 42;
const ROW_H = 22;

export const createMenu: CartFactory = (canvas, sys) => {
  const ctx = canvas.getContext("2d")!;
  const { fill, text, center } = createGfx(ctx);
  const icons = { jackIdle: makeSprite(SPR.jackIdle), pelau: makeSprite(SPR.pelau), crate: makeSprite(SPR.crate) };
  const heart = makeSprite(SPR.heart);
  const bests = CARTS.map((c) => loadBest(c.bestKey));
  const rows = CARTS.length + 1; // + sound toggle
  let input: Input = { ...NO_INPUT };
  let prev = { ...input };
  let frame = 0;
  let cursor = 0;
  let chimed = false;
  const booted = () => frame > 70;

  function choose(i: number) {
    if (!booted()) return;
    if (i < CARTS.length) {
      sfx.pickup();
      sys.launch(CARTS[i].id);
    } else {
      sys.toggleMute();
      sfx.blip();
    }
  }

  function update() {
    frame++;
    const pressed = (k: keyof Input) => input[k] && !prev[k];
    if (booted()) {
      if (pressed("up")) {
        cursor = (cursor + rows - 1) % rows;
        sfx.blip();
      }
      if (pressed("down")) {
        cursor = (cursor + 1) % rows;
        sfx.blip();
      }
      if (pressed("a") || pressed("start")) choose(cursor);
    } else if (pressed("a") || pressed("start")) frame = 70; // skip the boot drop
    if (frame === 56 && !chimed) {
      chimed = true;
      sfx.rest();
    }
    prev = { ...input };
  }

  function render() {
    fill(0, 0, 0, W, H);
    const logoY = Math.min(12, -16 + frame * 0.6);
    center("JACKBOY", logoY, 3, 3);
    if (!booted()) {
      if (frame > 56) center("THE CHURCH OF JACK", 40, 2);
      return;
    }
    center("CHOOSE A CARTRIDGE", 31, 2);
    CARTS.forEach((c, i) => {
      const y = ROW_Y + i * ROW_H;
      const on = cursor === i;
      // Cartridge
      fill(3, 18, y, 20, 20);
      fill(on ? 1 : 2, 20, y + 2, 16, 13);
      const ic = icons[c.icon];
      ctx.drawImage(ic, 28 - Math.floor(ic.width / 2), y + 3 + Math.floor((12 - ic.height) / 2), ic.width, Math.min(12, ic.height));
      fill(2, 22, y + 16, 12, 2);
      text(c.title, 44, y + 2, 3);
      text(c.tagline, 44, y + 8, 2);
      text(`BEST ${String(bests[i]).padStart(6, "0")}`, 44, y + 14, on ? 3 : 1);
    });
    const sy = ROW_Y + CARTS.length * ROW_H + 2;
    text(`SOUND: ${sys.isMuted() ? "OFF" : "ON"}`, 44, sy, 3);
    const cy = cursor < CARTS.length ? ROW_Y + cursor * ROW_H + 7 : sy;
    ctx.drawImage(heart, 6, cy);
    center("A: PLAY   SELECT: MENU", H - 9, 2);
  }

  const stop = runLoop(update, render, () => {});

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as Record<string, unknown>).__menu = {
      get cursor() {
        return cursor;
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
    setInput(next) {
      input = next;
    },
    tap(_x, y) {
      if (!booted()) {
        frame = 70;
        return;
      }
      for (let i = 0; i < CARTS.length; i++) {
        const ry = ROW_Y + i * ROW_H;
        if (y >= ry - 2 && y < ry + ROW_H - 2) {
          cursor = i;
          return choose(i);
        }
      }
      const sy = ROW_Y + CARTS.length * ROW_H + 2;
      if (y >= sy - 4 && y < sy + 10) choose(CARTS.length);
    },
    destroy() {
      stop();
    },
  };
};
