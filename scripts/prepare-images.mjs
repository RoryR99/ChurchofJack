// Re-encode supplied images for delivery. Keep originals untouched; all cropping is CSS.
import sharp from "sharp";
import { stat } from "node:fs/promises";
const names = [
  "jack-robed",
  "jack-cosmic",
  "jack-ascended",
  "church-moodboard",
];
let before = 0,
  after = 0;
for (const name of names) {
  const source = `public/images/${name}.jpg`;
  const target = `public/images/${name}.webp`;
  await sharp(source).webp({ quality: 83, effort: 5 }).toFile(target);
  before += (await stat(source)).size;
  after += (await stat(target)).size;
}
console.log(
  `Images: ${before} bytes → ${after} bytes (${Math.round(100 - (after / before) * 100)}% smaller)`,
);
