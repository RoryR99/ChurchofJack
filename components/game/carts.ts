// The Jackboy cartridge library. Each game is loaded only when picked, so it ships as its own chunk.
// To add a game: write a CartFactory module, then add it here.
import type { CartFactory } from "./types";

export type CartInfo = {
  id: string;
  title: string;
  tagline: string;
  bestKey: string;
  icon: "jackIdle" | "pelau" | "crate";
  load: () => Promise<CartFactory>;
};

export const CARTS: CartInfo[] = [
  {
    id: "commute",
    title: "JACK'S COMMUTE",
    tagline: "CLOCK IN BY 9:00",
    bestKey: "jack-commute-best",
    icon: "jackIdle",
    load: () => import("./commute").then((m) => m.createCommute),
  },
  {
    id: "lunch",
    title: "SECOND HELPINGS",
    tagline: "SURVIVE THE LUNCH BREAK",
    bestKey: "jack-lunch-best",
    icon: "pelau",
    load: () => import("./lunch").then((m) => m.createLunch),
  },
  {
    id: "crunch",
    title: "CONTRACT CRUNCH",
    tagline: "MATCH THE CARGO",
    bestKey: "jack-crunch-best",
    icon: "crate",
    load: () => import("./crunch").then((m) => m.createCrunch),
  },
];
