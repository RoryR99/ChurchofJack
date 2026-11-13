export const W = 160;
export const H = 144;

export type Input = { left: boolean; right: boolean; up: boolean; down: boolean; a: boolean; b: boolean; start: boolean };
export const NO_INPUT: Input = { left: false, right: false, up: false, down: false, a: false, b: false, start: false };

/** A running game on the Jackboy. */
export type Cartridge = {
  setInput(input: Input): void;
  /** A tap on the screen, in 160×144 game coordinates. */
  tap(x: number, y: number): void;
  destroy(): void;
};

/** What the console offers a cartridge. */
export type Sys = {
  launch(id: string): void;
  isMuted(): boolean;
  toggleMute(): void;
};

export type CartFactory = (canvas: HTMLCanvasElement, sys: Sys) => Cartridge;
