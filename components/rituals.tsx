"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  FilePenLine,
  Maximize2,
  Moon,
  Sparkles,
  X,
} from "lucide-react";
import { images, sayings } from "@/data/church";

export function WordOfJack() {
  const [current, setCurrent] = useState(0);
  const [interpretation, setInterpretation] = useState(0);
  const [received, setReceived] = useState(false);
  function receive() {
    setCurrent(
      (previous) =>
        (previous + 1 + Math.floor(Math.random() * (sayings.length - 1))) % sayings.length,
    );
    setInterpretation(Math.floor(Math.random() * 2));
    setReceived(true);
  }
  return (
    <div className="word-ritual">
      <div className="word-text" aria-live="polite" aria-atomic="true">
        <span className="eyebrow">
          {received
            ? `JACK 1:${current + 1} · THE WORD HAS BEEN RECEIVED`
            : "A LITTLE GUIDANCE, SUBJECT TO INTERPRETATION"}
        </span>
        <blockquote>“{sayings[current].quote}”</blockquote>
        <p>{sayings[current].interpretations[interpretation]}</p>
      </div>
      <button className="button gold" onClick={receive}>
        <Sparkles size={17} /> Receive the Word of Jack{" "}
        <ArrowUpRight size={17} />
      </button>
      <span className="ritual-note">
        {sayings.length} possible revelations. No further clarification guaranteed.
      </span>
    </div>
  );
}
const stages = [
  {
    name: "Overworked",
    text: "The inbox is not a personality. The Church respectfully requests a pause.",
  },
  {
    name: "Questioning",
    text: "Could this have been an email? Could the email have been silence?",
  },
  { name: "Resting", text: "For this brief moment, the appendix can wait." },
  {
    name: "Fully Rested",
    text: "A state the doctrine endorses. Work and girl-related overthinking may appeal.",
  },
  { name: "Ascended", text: "Look to rest yourself." },
];
export function RestMeter() {
  const [rest, setRest] = useState(42);
  const index = Math.min(4, Math.floor(rest / 20));
  return (
    <div className="rest-widget">
      <div className="widget-top">
        <Moon size={23} />
        <span className="eyebrow">THE RESTFULNESS INDEX</span>
      </div>
      <div className="rest-reading">
        <span>
          {rest}
          <small>/100</small>
        </span>
        <span className="rest-status">{stages[index].name}</span>
      </div>
      <label htmlFor="rest-slider" className="sr-only">
        Your Restfulness Index
      </label>
      <input
        id="rest-slider"
        type="range"
        min="0"
        max="100"
        value={rest}
        onChange={(e) => setRest(Number(e.target.value))}
        style={{ "--rest": `${rest}%` } as React.CSSProperties}
        aria-valuetext={`${rest} out of 100: ${stages[index].name}`}
      />
      <div className="range-ends">
        <span>OVERWORKED</span>
        <span>ASCENDED</span>
      </div>
      <div
        className={`rest-message ${index === 4 ? "ascended" : ""}`}
        aria-live="polite"
      >
        <span>THE CHURCH’S ASSESSMENT</span>
        <p>{stages[index].text}</p>
      </div>
      <p className="fine-print">
        Slide towards salvation.
      </p>
    </div>
  );
}
const sins = [
  [
    "Did not read the terms",
    "Read Clause 7 three times and look to rest yourself.",
  ],
  [
    "Skipped the appendix",
    "Acknowledge the appendix. Even the smallest subparagraph deserves devotion.",
  ],
  [
    "Ignored the amendment",
    "Contemplate the amendment, then take a ceremonial break.",
  ],
  [
    "Forgot the signature",
    "Contemplate the sacred signature. Your penance is hereby countersigned.",
  ],
  [
    "Failed to rest yourself",
    "Put down the contract. Look to rest yourself.",
  ],
];
export function Confession() {
  const [sin, setSin] = useState("");
  const [penance, setPenance] = useState("");
  const [clicks, setClicks] = useState(0);
  return (
    <div className="confession">
      <div className="widget-top">
        <button
          className="icon-button"
          aria-label="Inspect the contract seal"
          onClick={() => setClicks(clicks + 1)}
        >
          <FilePenLine size={24} />
        </button>
        <span className="eyebrow">FORM C-01 · CONTRACTUAL CONFESSIONAL</span>
      </div>
      <h3>
        Confess your
        <br />
        <em>contractual sins.</em>
      </h3>
      <label htmlFor="confession">What weighs upon your paperwork?</label>
      <select
        id="confession"
        value={sin}
        onChange={(e) => {
          setSin(e.target.value);
          setPenance("");
        }}
      >
        <option value="" disabled>
          Select your transgression
        </option>
        {sins.map(([title]) => (
          <option key={title}>{title}</option>
        ))}
      </select>
      <button
        className="button outline"
        disabled={!sin}
        onClick={() =>
          setPenance(sins.find(([title]) => title === sin)?.[1] ?? "")
        }
      >
        Request absolution <ArrowUpRight size={16} />
      </button>
      <div className="penance" aria-live="polite">
        {clicks > 0 && clicks % 3 === 0 ? (
          <p>“Say that again please.”</p>
        ) : penance ? (
          <>
            <span>
              <Check size={15} /> ABSOLUTION GRANTED, SUBJECT TO TERMS
            </span>
            <p>{penance}</p>
          </>
        ) : (
          <p className="fine-print">
            Nothing is submitted or stored.
          </p>
        )}
      </div>
    </div>
  );
}

export function Gallery() {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  function close() {
    dialog.current?.close();
  }
  function move(direction: number) {
    setActive(
      (previous) => (previous + direction + images.length) % images.length,
    );
  }
  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    const onClose = () => {
      document.body.style.overflow = "";
      lastTrigger.current?.focus();
    };
    modal.addEventListener("close", onClose);
    return () => {
      modal.removeEventListener("close", onClose);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <>
      <div className="gallery-grid">
        {images.map((item, i) => (
          <button
            className="archive-item"
            key={item.src}
            onClick={(e) => {
              lastTrigger.current = e.currentTarget;
              setActive(i);
              dialog.current?.showModal();
              document.body.style.overflow = "hidden";
            }}
            aria-label={`View ${item.title}`}
          >
            <span className="archive-image">
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: item.position }}
              />
              <span className="archive-number">ARCHIVE / 00{i + 1}</span>
              <span className="archive-expand">
                <Maximize2 size={17} />
              </span>
            </span>
            <span className="archive-caption">
              <span>{item.title}</span>
              <ArrowUpRight size={18} />
            </span>
            <span className="archive-subtitle">{item.subtitle}</span>
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        aria-labelledby="lightbox-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        <button
          className="lightbox-close icon-button"
          aria-label="Close image"
          onClick={close}
        >
          <X />
        </button>
        <figure>
          <img
            src={images[active].src}
            alt={images[active].alt}
            width={704}
            height={1524}
          />
          <figcaption>
            <span id="lightbox-title">{images[active].title}</span>
            <span>
              {active + 1} / {images.length}
            </span>
          </figcaption>
        </figure>
        <div className="lightbox-controls">
          <button
            className="button outline"
            onClick={() => move(-1)}
            aria-label="Previous image"
          >
            <ArrowLeft size={18} /> Previous
          </button>
          <button
            className="button outline"
            onClick={() => move(1)}
            aria-label="Next image"
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      </dialog>
    </>
  );
}
export function EasterEgg() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let typed = "";
    let timer: ReturnType<typeof setTimeout>;
    const handle = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      )
        return;
      if (event.key.length !== 1) return;
      typed = (typed + event.key.toUpperCase()).slice(-4);
      if (typed === "WHAT" || typed === "REST") {
        setMessage(typed === "WHAT" ? "What." : "Look to rest yourself.");
        clearTimeout(timer);
        timer = setTimeout(() => setMessage(""), 4000);
        typed = "";
      }
    };
    window.addEventListener("keydown", handle);
    return () => {
      window.removeEventListener("keydown", handle);
      clearTimeout(timer);
    };
  }, []);
  return (
    <div className={`easter-egg ${message ? "visible" : ""}`} role="status">
      {message && (
        <>
          <span className="eyebrow">AN UNSCHEDULED REVELATION</span>
          <p>{message}</p>
          <button
            aria-label="Dismiss revelation"
            className="icon-button"
            onClick={() => setMessage("")}
          >
            <X size={18} />
          </button>
        </>
      )}
    </div>
  );
}
