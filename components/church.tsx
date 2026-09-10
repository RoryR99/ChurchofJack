"use client";
import { useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Menu, X } from "lucide-react";
import { images } from "@/data/church";
export function Seal({ small = false }: { small?: boolean }) {
  return (
    <span className={`seal ${small ? "small" : ""}`} aria-hidden="true">
      <span>J</span>
      <i>✦</i>
    </span>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a href="#home" className="brand" aria-label="The Church of Jack home">
        <Seal small />
        <span>
          THE CHURCH<span>OF JACK</span>
        </span>
      </a>
      <button
        className="menu-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="main-nav"
        className={open ? "nav open" : "nav"}
        aria-label="Main navigation"
      >
        {[
          ["The Gospel", "gospel"],
          ["Doctrine", "doctrine"],
          ["The Disciples", "disciples"],
          ["Sacred Archives", "archives"],
        ].map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="nav-rest" href="#rest" onClick={() => setOpen(false)}>
          Receive Rest <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
export function Hero() {
  return (
    <section id="home" className="hero">
      <div
        className="hero-art"
        style={{ backgroundImage: `url('${images[0].src}')` }}
        role="img"
        aria-label="Portrait of Javan Jack in orange robes"
      />
      <div className="hero-shade" />
      <div className="hero-inner">
        <div className="eyebrow">
          <span className="line" /> THE SACRED ORDER OF REST
        </div>
        <h1>
          The Church
          <br />
          of <em>Jack.</em>
        </h1>
        <p className="hero-quote">Look to rest yourself.</p>
        <p className="hero-description">
          From Trinidad to the distant lands of Tempe.
          <br />
          One man. Five sayings. An unreasonable amount of theology.
        </p>
        <div className="hero-actions">
          <a className="button gold" href="#gospel">
            Enter the Church <ArrowUpRight size={17} />
          </a>
          <a className="text-link" href="#sayings">
            <BookOpen size={17} /> Read the Gospel
          </a>
        </div>
      </div>
      <div className="hero-bottom">
        <span>REST. REPETITION. ROCKING BACK.</span>
        <a href="#gospel">
          SCROLL TO REVELATION <ArrowDown size={15} />
        </a>
        <span>TEMPE, AZ · TRINIDAD & TOBAGO</span>
      </div>
    </section>
  );
}
export function Chapter({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="eyebrow chapter">
      <span>{number}</span>
      <span className="line" />
      {children}
    </div>
  );
}
