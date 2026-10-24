/**
 * The application's screenshots, made ready for the site.
 *
 * The owner's rule (§139): pictures of djmanzo come only from the
 * application's `docs/screenshots/` (here `app/`, djmanzo checked out as a
 * submodule) or, for pictures taken for the site that the application does not
 * carry, `screenshots/` beside this script's folder, held to the same rules;
 * named `<screen>--<theme>[--<skin>].png`. This reads both folders and their
 * READMEs — what each picture shows, and the theme's name
 * as the application's picker says it — encodes every picture as WebP in the
 * Chromium the browser tests already use (no new dependency), and writes
 * `public/shots/app/` and `shared/shots.json`, which the Signal Path and the
 * guide read. The showcase's hero becomes the page's share picture.
 *
 *   npm run shots        after the folder changes
 *
 * It stops, saying why, at a picture the README does not describe or a skin
 * the application does not have, so nothing is shown with a made-up caption.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const ROOT = new URL("../app/", import.meta.url);
const DOCS = new URL("docs/screenshots/", ROOT);
const OWN = new URL("../screenshots/", import.meta.url);
const FOLDERS = [
  { root: DOCS, name: "app/docs/screenshots" },
  { root: OWN, name: "screenshots" },
];
const OUT = new URL("../public/shots/app/", import.meta.url);
const INDEX = new URL("../shared/shots.json", import.meta.url);
const SHARE = new URL("../public/shots/share.jpg", import.meta.url);
const KINDS = ["screens", "themes", "skins"];
const QUALITY = 0.8;

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Each README's tables: a picture's path, what it shows, and its theme (", <skin> skin" after it, for a skin).
function describedIn(root) {
  const described = new Map();
  const readme = readFileSync(new URL("README.md", root), "utf8");
  for (const m of readme.matchAll(/^\| \[!\[[^\]]*\]\(([^)]+)\)\]\([^)]+\) \| ([^|]+?) \| ([^|]+?) \|$/gm)) {
    described.set(m[1], { shows: m[2], theme: m[3].replace(/, [^,]+ skin$/, "") });
  }
  return described;
}

// The application's skins: the id and the name its picker shows.
const skinsSource = readFileSync(new URL("ui/src/skins/skins.ts", ROOT), "utf8");
const SKINS = [...skinsSource.matchAll(/id: "([^"]+)",\s*name: "([^"]+)"/g)].map((m) => ({ id: m[1], name: m[2] }));

function fail(why) {
  console.error(`shots: ${why}`);
  process.exit(1);
}

const shots = [];
const seen = new Set();
for (const folder of FOLDERS) {
  const described = describedIn(folder.root);
  for (const kind of KINDS) {
    let files = [];
    try {
      files = readdirSync(new URL(`${kind}/`, folder.root));
    } catch {
      continue;
    }
    for (const file of files.filter((f) => f.endsWith(".png")).sort()) {
      const path = `${kind}/${file}`;
      if (seen.has(file)) fail(`${folder.name}/${path} is in both folders: keep one`);
      seen.add(file);
      const about = described.get(path) ?? fail(`${path} is not described in ${folder.name}/README.md`);
      const [screen, themeSlug, skinSlug] = file.replace(/\.png$/, "").split("--");
      if (slug(about.theme) !== themeSlug) fail(`${path}: the README says ${about.theme}, the name says ${themeSlug}`);
      const skin = skinSlug ? (SKINS.find((k) => k.id === skinSlug || slug(k.name) === skinSlug)?.name ?? fail(`${path}: djmanzo has no skin ${skinSlug}`)) : null;
      const name = file.replace(/\.png$/, "");
      shots.push({
        src: `/shots/app/${name}.webp`,
        screen,
        theme: about.theme,
        skin,
        shows: about.shows,
        alt: `${about.shows} — djmanzo in the ${about.theme} theme${skin ? `, worn with the ${skin} skin` : ""}`,
        file: new URL(path, folder.root),
      });
    }
  }
}

const browser = await chromium.launch({ executablePath: process.env.DJMANZO_CHROMIUM || undefined });
const page = await browser.newPage();

/** A PNG, re-encoded by the browser's canvas; a size only when it is to change. */
async function encode(png, type, width) {
  const url = await page.evaluate(
    async ({ b64, type, quality, width }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const w = width ?? img.naturalWidth;
      const h = Math.round((img.naturalHeight * w) / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      return JSON.stringify({ data: canvas.toDataURL(type, quality), w, h });
    },
    { b64: png.toString("base64"), type, quality: QUALITY, width },
  );
  const { data, w, h } = JSON.parse(url);
  return { bytes: Buffer.from(data.slice(data.indexOf(",") + 1), "base64"), w, h };
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
let total = 0;
const index = [];
for (const s of shots) {
  const { bytes, w, h } = await encode(readFileSync(s.file), "image/webp");
  writeFileSync(new URL(s.src.replace("/shots/app/", ""), OUT), bytes);
  total += bytes.length;
  const { file: _file, ...rest } = s;
  index.push({ ...rest, width: w, height: h });
}
const share = await encode(readFileSync(new URL("showcase/hero.png", DOCS)), "image/jpeg", 1200);
writeFileSync(SHARE, share.bytes);
await browser.close();

writeFileSync(INDEX, JSON.stringify(index, null, 1) + "\n");
console.log(`shots: ${index.length} pictures, ${(total / 1024 / 1024).toFixed(1)} MiB, and the share picture (${share.w}×${share.h})`);
