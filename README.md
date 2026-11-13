# The Church of Jack

A responsive, affectionate parody about Javan Jack. Built with Next.js App Router, TypeScript, Tailwind CSS and Lucide icons. The site exports as static files; no database, authentication or backend is needed.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run build` creates the production static site in `out/`; serve that directory with any static HTTP server. `npm run typecheck` checks TypeScript. `next start` is not used for this static export.

## Project map

- `app/page.tsx`: section composition and editorial parody commentary.
- `app/globals.css`: the green/gold/parchment theme, responsive layouts, CSS image crops and reduced-motion support.
- `app/layout.tsx`: site metadata and global layout.
- `components/church.tsx`: navigation, hero, chapter headings and monogram seal.
- `components/rituals.tsx`: scripture generator, Restfulness Index, contractual confession, accessible gallery dialog and keyboard Easter eggs.
- `data/church.ts`: verified Jack facts, the eight exact sayings, interpretations, observances and central image configuration.
- `data/disciples.ts`: typed disciple registry. Add approved names and optional `churchTitle`, `image`, `quote`, `rank`, `description`; entries render automatically. It is intentionally empty.
- `public/images/`: delivery images, with original JPEG copies retained.
- `scripts/prepare-images.mjs`: WebP compression from the original JPEGs (run with `node scripts/prepare-images.mjs` when replacing assets).
- `app/commute/page.tsx` + `components/game/`: **Jack's Commute**, a Game Boy-style platformer (see below).
- `.openai/hosting.json`: private Sites identity and static output configuration.

## Jack's Commute (`/commute`)

A dependency-free 2D platformer on one 160×144 canvas, scaled with `image-rendering: pixelated` inside a "Jackboy" console shell. Jack walks from his apartment through Mill Ave and Tempe Town Lake to the shipping office and must clock in before 9:00. Matcha gives a speed and jump boost. Strawberry kiwi vapes give a cloud that makes admirers wander off and protects Jack from damage. Admirers and cacti cost a heart, benches are checkpoints that restore one, and each completed day repeats faster.

- `engine.ts`: game loop (fixed 60 Hz), physics, collisions, rendering, HUD and menus. Plain TypeScript with no React.
- `level.ts`: the level, built from helpers (`ground`, `plat`, `block`, `water`, `admirer`, …). Edit it to change the layout.
- `sprites.ts`: palette-indexed string sprites and the 3×5 pixel font.
- `audio.ts`: WebAudio bleeps. `JackBoy.tsx`: the console shell plus keyboard and multi-touch input.
- Controls: D-pad/arrows to move, A/Z/Space to jump, B/X to run, Start/Enter to pause, Select/M to mute. The best score is saved in `localStorage`.
- In development only, `window.__jack` exposes `set(input)` and `tick(n)` for deterministic playtesting (the browser throttles `requestAnimationFrame` in hidden panes).

## Content guardrails

Only the supplied facts (plus his love of matcha and strawberry kiwi vapes, supplied for the game) and the eight sayings are treated as information about Javan. Scripture analysis, titles, bureaucratic rituals and religious framing are fictional. Apart from the game's admirers, which were requested, no dates, dating encounters, named friends, additional personal quotes or employer policies have been invented. The images are supplied stylized artwork, not documentation of real events. The public copy stays in character, without parody or affiliation notices, as requested.

## Interactions and accessibility

- The Word of Jack uses only the eight supplied sayings and selects an interpretation; consecutive quotes differ.
- The rest slider supports keyboard arrows, Home and End.
- The confession is local only; nothing is transmitted or saved.
- Gallery images open in a native modal dialog with focus containment, focus restoration, Escape, previous/next buttons and arrow keys.
- Type `WHAT` or `REST` outside a form control for an Easter egg. Click the contract seal three times for another.
- Mobile navigation, skip link, descriptive image text, visible focus and reduced-motion support are included.

## Supplied images

All four original files are 704 × 1524 (portrait). `kbe3…` is the robed hero portrait, `loqrar…` and `wa2x…` are cosmic portraits, and `9j7k…` is the supplied moodboard. Originals remain in the project root. Images are compressed to WebP without changing proportions; archive dialogs show the full images, including their original borders. The hero and gallery thumbnails use deliberate CSS crops.

