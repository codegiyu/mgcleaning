// One-off image conversion: PNG sources in public/images/generated become WebP (at most
// 2000px wide), and the social preview becomes a 1200x630 JPEG, the size Open Graph and
// WhatsApp previews expect. Run with `node scripts/optimize-images.mjs`; originals are
// deleted only after their replacement is written. Uses the sharp that Next.js installs.
import { readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const generated = join(root, "public", "images", "generated");
const og = join(root, "public", "images", "og");
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

async function convert(source, target, pipeline) {
  const before = (await stat(source)).size;
  await pipeline(sharp(source)).toFile(target);
  const after = (await stat(target)).size;
  await rm(source);
  console.log(`${source.slice(root.length + 1)} ${kb(before)} -> ${target.slice(root.length + 1)} ${kb(after)}`);
  return { before, after };
}

let totalBefore = 0;
let totalAfter = 0;
for (const name of (await readdir(generated)).filter((file) => file.endsWith(".png"))) {
  const { before, after } = await convert(join(generated, name), join(generated, name.replace(/\.png$/, ".webp")), (image) =>
    image.resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 80 }),
  );
  totalBefore += before;
  totalAfter += after;
}

const ogSource = join(og, "mg-cleaning-services-professional-v3.png");
const result = await convert(ogSource, join(og, "mg-cleaning-services-professional-v3.jpg"), (image) =>
  image.resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 84, mozjpeg: true }),
);
totalBefore += result.before;
totalAfter += result.after;
console.log(`total ${kb(totalBefore)} -> ${kb(totalAfter)}`);
