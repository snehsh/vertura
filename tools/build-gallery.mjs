#!/usr/bin/env node
/* Fills the "photos" of each event in data/events.json from the photo folders.
 *
 *   assets/gallery/annual-showcase-2026/01.jpg   -> event slug "annual-showcase-2026"
 *   assets/gallery/grade-7-debate/arrival.jpg    -> event slug "grade-7-debate"
 *
 * Run from the repo root:   node tools/build-gallery.mjs
 *
 *  - One folder per event; the folder name is the event's "slug" in events.json.
 *  - A folder with no matching event gets a starter entry (no date yet) — open
 *    data/events.json and fill in the title, date, location, summary and timeline.
 *  - Everything you typed (titles, timelines, photo captions and alt text) is kept.
 *    Only the list of photos is refreshed: new files are added at the end, files
 *    you deleted are dropped, and your existing order is preserved.
 *  - Use folder and file names with no spaces.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const DIR = "assets/gallery";
const OUT = "data/events.json";
const OK = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

const titleCase = (s) =>
  s.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

if (!existsSync(DIR)) { console.error(`No ${DIR} folder — run this from the repo root.`); process.exit(1); }

const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const events = data.events ?? [];
const bySlug = new Map(events.map((e) => [e.slug, e]));

let added = 0, started = 0;
for (const folder of readdirSync(DIR).sort()) {
  const full = join(DIR, folder);
  if (folder.startsWith(".") || !statSync(full).isDirectory()) continue;

  const files = readdirSync(full).filter((f) => OK.has(extname(f).toLowerCase())).sort();
  const src = (f) => `/${DIR}/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`;
  const onDisk = new Map(files.map((f) => [src(f), f]));

  let ev = bySlug.get(folder);
  if (!ev) {
    ev = { slug: folder, title: titleCase(folder), category: "", date: "", location: "", summary: "", timeline: [], photos: [] };
    events.push(ev); bySlug.set(folder, ev); started++;
  }
  const kept = (ev.photos ?? []).filter((p) => onDisk.has(p.src));
  const have = new Set(kept.map((p) => p.src));
  for (const [s, f] of onDisk) if (!have.has(s)) { kept.push({ src: s, alt: "", caption: "" }); added++; }
  ev.photos = kept;
}

writeFileSync(OUT, JSON.stringify({ _how_to: data._how_to, events }, null, 2) + "\n");
console.log(`${events.length} event(s) in ${OUT}; ${added} photo(s) added; ${started} starter event(s) created.`);
if (started) console.log("Open data/events.json and fill in title, date (YYYY-MM-DD), location, summary and timeline for the new ones.");
