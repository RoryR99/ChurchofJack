// Tiny square-wave bleeps. The AudioContext is created on the first user gesture.
let ac: AudioContext | null = null;
let muted = false;

export function unlockAudio() {
  if (!ac) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) ac = new Ctor();
  }
  if (ac?.state === "suspended") void ac.resume();
}

export const setMuted = (m: boolean) => {
  muted = m;
};

function tone(freq: number, dur: number, type: OscillatorType = "square", to?: number, delay = 0) {
  if (!ac || muted) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const arp = (notes: number[], step: number, type: OscillatorType = "square") =>
  notes.forEach((f, i) => tone(f, step + 0.04, type, undefined, i * step));

export const sfx = {
  jump: () => tone(330, 0.1, "square", 660),
  pickup: () => arp([880, 1320], 0.06),
  hit: () => tone(220, 0.25, "sawtooth", 60),
  rest: () => arp([523, 659, 784], 0.1, "triangle"),
  win: () => arp([523, 659, 784, 1047], 0.12),
  over: () => arp([392, 330, 262], 0.18, "triangle"),
  blip: () => tone(660, 0.04),
  combo: (n: number) => tone(440 + n * 110, 0.08),
  boing: () => tone(180, 0.18, "triangle", 520),
};
