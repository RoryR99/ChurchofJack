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
- `app/commute/page.tsx` + `components/game/`: **the Jackboy**, a Game Boy-style console with two games (see below).
- `.openai/hosting.json`: private Sites identity and static output configuration.

## The Jackboy (`/commute`)

A dependency-free, Game Boy-style console with three cartridges. Each game draws on one 160×144 canvas scaled with `image-rendering: pixelated`. On power-up a cartridge menu lists the games and their best scores; Select (Esc) returns to it, and `/commute?game=lunch` `?game=commute` or `?game=crunch` opens a game directly. Tapping the SOUND LED or pressing M mutes.

- **Jack's Commute:** Jack walks from his apartment through Mill Ave and Tempe Town Lake to the shipping office and must clock in before 9:00. Matcha gives a speed and jump boost. Strawberry kiwi vapes give a cloud that makes admirers wander off. Admirers and cacti cost a heart, benches are checkpoints, and each completed day repeats faster.
- **Second Helpings:** a lunch-break catcher in the office break room. Catch fish pelau (points, but a food coma slows Jack), pork and cumin (a "cumin kick" doubles points), Rubbers pizza (bounces once, so catch it twice), matcha (restores Rest) and cake (the Dessert Exception turns hazards into cake). Dodge emails, reply-alls that split into three, zigzagging amendments, ringing phones, a "Lunch together?" admirer and, this time, vapes, which drain Rest and fog the screen. Consecutive catches build a helping combo, every 10 foods earns a nap (A) that clears hazards, and the run ends when Rest hits 0.
- **Contract Crunch:** a falling-pairs puzzle at Jack's desk. Pairs of cargo (crates, barrels, parcels, matcha) fall into a 6×14 tray; A/B rotate, Down soft-drops and Up hard-drops. Three or more of one cargo in a row or column clear, and falling blocks can chain ("SUBCLAUSE!", "ADDENDUM!", "APPENDIX!", "WHAT."). A signed contract clears every block of the cargo it lands on. On a timer, amendment junk drops in; it only clears when something next to it does. Every 25 cleared blocks raises the clause (speed), and the game ends when the tray reaches the top.

Code in `components/game/`:
- `JackBoy.tsx`: the console shell, keyboard and multi-touch input, and cartridge swapping.
- `carts.ts`: the cartridge registry. Each game is loaded with a dynamic `import()`, so it ships as its own chunk. **To add a game,** write a `CartFactory` module (see `types.ts`) and register it here.
- `menu.ts`: boot screen and cartridge picker.
- `commute.ts` + `level.ts`, `lunch.ts` and `crunch.ts`: the three games.
- `gfx.ts`: shared drawing helpers (pixel font, panels, speech bubbles), the Tempe Butte backdrop, the fixed 60 Hz `runLoop`, best-score storage and `buzz` vibration. `sprites.ts`: palette-indexed string sprites and the 3×5 font. `audio.ts`: WebAudio bleeps.
- In development only, `window.__menu`, `window.__jack`, `window.__lunch` and `window.__crunch` expose `set(input)` and `tick(n)` for deterministic playtesting (the browser throttles `requestAnimationFrame` in hidden panes). `__lunch` also has `spawn(kind, x, y)`, `spawnAdmirer()` and `quiet()`; `__crunch` has `grid`, `force(a, b, x, r)`, `setNext(a, b)` and `junkNow()`.

## Content guardrails

Only the supplied facts (plus the game details the user supplied: matcha, strawberry kiwi vapes, fish pelau, pork and cumin, and Rubbers pizza) and the eight sayings are treated as information about Javan. Scripture analysis, titles, bureaucratic rituals and religious framing are fictional. Apart from the game's admirers, which were requested, no dates, dating encounters, named friends, additional personal quotes or employer policies have been invented. The images are supplied stylized artwork, not documentation of real events. The public copy stays in character, without parody or affiliation notices, as requested.

## Interactions and accessibility

- The Word of Jack uses only the eight supplied sayings and selects an interpretation; consecutive quotes differ.
- The rest slider supports keyboard arrows, Home and End.
- The confession is local only; nothing is transmitted or saved.
- Gallery images open in a native modal dialog with focus containment, focus restoration, Escape, previous/next buttons and arrow keys.
- Type `WHAT` or `REST` outside a form control for an Easter egg. Click the contract seal three times for another.
- Mobile navigation, skip link, descriptive image text, visible focus and reduced-motion support are included.

## Supplied images

All four original files are 704 × 1524 (portrait). `kbe3…` is the robed hero portrait, `loqrar…` and `wa2x…` are cosmic portraits, and `9j7k…` is the supplied moodboard. Originals remain in the project root. Images are compressed to WebP without changing proportions; archive dialogs show the full images, including their original borders. The hero and gallery thumbnails use deliberate CSS crops.

