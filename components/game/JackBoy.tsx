"use client";
import { useEffect, useRef, useState } from "react";
import { createGame, H, W, type Game } from "./engine";
import { setMuted, unlockAudio } from "./audio";

const DPAD: string[] = ["left up", "up", "right up", "left", "", "right", "left down", "down", "right down"];
const KEYS: Record<string, string> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  z: "a",
  " ": "a",
  x: "b",
  Shift: "b",
  Enter: "start",
  m: "select",
};

export function JackBoy() {
  const consoleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const pointers = useRef(new Map<number, string[]>());
  const keys = useRef(new Set<string>());
  const prevSelect = useRef(false);
  const muted = useRef(false);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);

  const sync = () => {
    const all = new Set(keys.current);
    pointers.current.forEach((btns) => btns.forEach((b) => all.add(b)));
    const sel = all.has("select");
    if (sel && !prevSelect.current) {
      muted.current = !muted.current;
      setMuted(muted.current);
      setIsMuted(muted.current);
    }
    prevSelect.current = sel;
    setPressed(all);
    game.current?.setInput({
      left: all.has("left"),
      right: all.has("right"),
      jump: all.has("a") || all.has("up"),
      run: all.has("b"),
      start: all.has("start"),
    });
  };

  useEffect(() => {
    const g = createGame(canvasRef.current!);
    game.current = g;
    const key = (down: boolean) => (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const btn = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!btn) return;
      e.preventDefault();
      if (down) unlockAudio();
      if (down) keys.current.add(btn);
      else keys.current.delete(btn);
      sync();
    };
    const onDown = key(true);
    const onUp = key(false);
    const clear = () => {
      keys.current.clear();
      pointers.current.clear();
      sync();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      g.destroy();
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const btnsAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-btn]");
    return el && consoleRef.current?.contains(el) && el.dataset.btn ? el.dataset.btn.split(" ") : [];
  };

  const onPointerDown = (e: React.PointerEvent) => {
    unlockAudio();
    if (e.target === canvasRef.current) {
      game.current?.tap();
      return;
    }
    const btns = btnsAt(e.clientX, e.clientY);
    if (!btns.length) return;
    e.preventDefault();
    try {
      consoleRef.current?.setPointerCapture(e.pointerId);
    } catch {}
    pointers.current.set(e.pointerId, btns);
    sync();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const btns = btnsAt(e.clientX, e.clientY);
    if (btns.join() === prev.join()) return;
    pointers.current.set(e.pointerId, btns);
    sync();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointers.current.delete(e.pointerId)) sync();
  };

  const on = (btn: string) => btn.split(" ").some((b) => b && pressed.has(b));

  return (
    <div
      ref={consoleRef}
      className="jackboy"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="jackboy-bezel">
        <div className="jackboy-bezel-label">
          <span />
          DOT MATRIX WITH SACRED SOUND
          <span />
        </div>
        <div className="jackboy-screen-row">
          <div className="jackboy-led">
            <i className={isMuted ? "muted" : ""} />
            <small>{isMuted ? "MUTE" : "SOUND"}</small>
          </div>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="jackboy-canvas"
            role="img"
            aria-label="Jack's Commute: a platformer where Jack walks through Tempe to work"
          />
        </div>
      </div>
      <div className="jackboy-brand">
        <span>
          Jack<em>boy</em>
        </span>
      </div>
      <div className="jackboy-dpad" aria-label="Direction pad">
        {DPAD.map((btn, i) => (
          <span
            key={i}
            data-btn={btn || undefined}
            className={`dpad-cell${i % 2 || i === 4 ? " arm" : ""}${i === 4 ? " hub" : ""}${btn && !btn.includes(" ") && on(btn) ? " pressed" : ""}`}
            aria-label={btn && !btn.includes(" ") ? btn : undefined}
          />
        ))}
      </div>
      <div className="jackboy-ab">
        <button type="button" tabIndex={-1} data-btn="b" className={on("b") ? "pressed" : ""} aria-label="B: hold to run">
          B
        </button>
        <button type="button" tabIndex={-1} data-btn="a" className={on("a") ? "pressed" : ""} aria-label="A: jump">
          A
        </button>
      </div>
      <div className="jackboy-meta">
        <button type="button" tabIndex={-1} data-btn="select" className={on("select") ? "pressed" : ""} aria-label="Select: mute">
          <i />
          SELECT
        </button>
        <button type="button" tabIndex={-1} data-btn="start" className={on("start") ? "pressed" : ""} aria-label="Start: pause">
          <i />
          START
        </button>
      </div>
      <div className="jackboy-grille" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
