# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"The Church of Jack": a single-page, affectionate parody site about a real person (Javan Jack). Next.js 15 App Router + React 19 + TypeScript + Tailwind v4 + `lucide-react`. It is a **static export** — no backend, database, auth, or API routes.

## Commands

```sh
npm install
npm run dev        # next dev on http://127.0.0.1:3000 (bound to 127.0.0.1, not localhost)
npm run build      # static export to out/
npm run typecheck  # tsc --noEmit — the only automated check; there is no linter or test suite
node scripts/prepare-images.mjs  # re-encode public/images/*.jpg → .webp after replacing images
```

`next start` does not work (`output: "export"`); serve `out/` with any static server to preview a production build. `prepare-images.mjs` imports `sharp`, which is not a declared dependency (it currently resolves transitively through Next).

## Build quirks

- `next.config.ts` sets `distDir` to `.next-dev` in development and `.next` for builds, so dev and build can run without clobbering each other. Both, plus `out/` and `artifacts/`, are gitignored.
- `images.unoptimized: true` (required for static export); images are plain `.webp` files served from `public/images/`.
- `.openai/hosting.json` points the hosting provider at `out/` — keep the export directory as `out`.

## Architecture

- `app/page.tsx` is a server component that composes every section and holds most of the editorial/parody copy inline.
- `components/church.tsx` (header, hero, chapter headings, seal) and `components/rituals.tsx` (interactive pieces: scripture generator, rest slider, local-only confession, gallery `<dialog>`, keyboard Easter eggs `WHAT`/`REST`) are both `"use client"`.
- `data/church.ts` is the single source of content: `jack` facts, the eight `sayings` (each with interpretations), `images` (gallery/hero config incl. alt text), and `observances`. Components render from this data rather than hardcoding it.
- `data/disciples.ts` is a typed registry rendered automatically by the page; it is intentionally empty.
- Styling: Tailwind is imported in `app/globals.css`, but most visual design (green/gold/parchment theme via CSS variables on `:root`, responsive layout, image crops, reduced-motion) lives as hand-written classes in `globals.css`. Hero/thumbnail framing is done with CSS crops — source images are never cropped.
- `@/*` path alias maps to the repo root.
- **`/commute`, the Jackboy** (`app/commute/page.tsx`, `components/game/`): a canvas console with swappable cartridges and no dependencies.
  - `JackBoy.tsx` owns input and the current `Cartridge` (`types.ts`: `setInput`, `tap(x, y)` in game coordinates, `destroy`). `boot(id)` swaps cartridges; Select returns to `menu.ts`.
  - Games are registered in `carts.ts` and loaded with a dynamic `import()`, so each is its own chunk. A new game is a `CartFactory` module plus a registry entry.
  - Each game owns its state and calls `runLoop` from `gfx.ts`. Use `createGfx` for text and panels. The 3×5 font in `sprites.ts` is uppercase only, and `*` draws a heart: add a glyph there if you need a new character.
  - `commute.ts` uses `level.ts`; tiles are 8px, and `GROUND` is the sidewalk row. `lunch.ts` is the break-room catcher.
- To playtest, use the dev-only hooks `window.__menu`, `__jack` and `__lunch` (`set({...})`, `tick(n)`; `__lunch.spawn(kind, x, y)` and `quiet()`). The Claude browser pane throttles `requestAnimationFrame` when hidden, so step frames manually instead of relying on timeouts.

## Content guardrails (from the README — important)

- Only the supplied facts in `data/church.ts` and the **eight exact sayings** count as information about Javan. Do not add or alter quotes, and do not invent dates, dating encounters, named friends, employer policies, or other personal details.
- Only add disciples whose names/details the user has supplied or approved.
- Game content the user requested: matcha, strawberry kiwi vapes (helpful in the commute, harmful in Second Helpings), fish pelau, pork and cumin, Rubbers pizza, and "hopeful admirer" enemies. Admirers can only be dodged, never attacked. Jack's in-game lines come from the eight sayings.
- Public copy stays in character: no parody/affiliation disclaimers on the site.
- The Word of Jack generator must use only the eight sayings and never repeat the same quote consecutively.
- Preserve the accessibility features: skip link, mobile nav, visible focus, reduced-motion support, keyboard support on the slider (arrows/Home/End), and the gallery dialog's focus containment/restoration, Escape, and arrow-key navigation.
- The confession form is local only; nothing is transmitted or stored.
- Original 704×1524 portrait JPEGs (`Gemini_Generated_Image_*.jpg`) stay in the repo root; `public/images/` keeps both `.jpg` and `.webp` copies.
