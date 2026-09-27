#!/usr/bin/env node
/**
 * Build the committed image set from app/data/photo-sources.json.
 *
 *   node scripts/fetch-photos.mjs
 *
 * The selections in photo-sources.json are curated by hand (see README →
 * "Images & credits"); this script only resolves, processes and records them.
 * It is idempotent — re-running reproduces byte-identical output.
 *
 * Processing per asset: centre/attention crop to the target aspect, downscale
 * to the target box, encode WebP. Nuxt's ipx provider then derives AVIF/WebP
 * at request time from these masters.
 */
import sharp from 'sharp'
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCES = path.join(ROOT, 'app/data/photo-sources.json')
const OUT_TS = path.join(ROOT, 'app/data/photos.ts')
const PUBLIC = path.join(ROOT, 'public/images')

const UA = 'BrewedCoffeeHouse/1.0 (image build; local dev)'

/** Output spec per group. */
const GROUPS = {
  menu: { width: 1200, height: 900, quality: 82 }, // 4:3 — POS cards, receipts
  ambience: { width: 2000, height: 1250, quality: 80 }, // 16:10 — landing hero/sections
}

/**
 * Per-asset presentation data. `alt` describes what is actually in the frame,
 * not what the product is called — screen-reader users get the picture, and
 * search gets the keyword via the surrounding heading.
 */
const PRESENTATION = {
  'espresso': { title: 'Espresso', alt: 'Fresh espresso streaming from a portafilter into a cup, thick golden crema', group: 'menu' },
  'cappuccino': { title: 'Cappuccino', alt: 'Cappuccino in a white cup and saucer photographed from above, beside a spoon', group: 'menu' },
  'latte': { title: 'Latte', alt: 'Latte with a heart poured in the foam, seen from above in a white cup', group: 'menu' },
  'americano': { title: 'Americano', alt: 'A white mug of black coffee held in one hand, laptop blurred behind', group: 'menu' },
  'cold-brew': { title: 'Cold brew', alt: 'Overhead still life of a glass of cold brew with a carafe, spoon and milk jug on wood', group: 'menu' },
  'matcha': { title: 'Matcha latte', alt: 'A cup of matcha beside a bamboo whisk and scoop of green tea powder', group: 'menu' },
  'earl-grey': { title: 'Earl grey', alt: 'A cup of black tea photographed from above among autumn leaves', group: 'menu' },
  'flat-white': { title: 'Flat white', alt: 'Flat white with a rosetta pattern in the foam, in a blue cup and saucer', group: 'menu' },
  'croissant': { title: 'Croissant', alt: 'A single golden croissant on a white plate with a softly blurred background', group: 'menu' },
  'muffin': { title: 'Muffin', alt: 'A blueberry muffin with a domed golden top on a pale surface', group: 'menu' },
  'iced-mocha': { title: 'Iced mocha', alt: 'A tall glass of iced coffee with a steel straw, dark liquid marbled with milk', group: 'menu' },
  'chai-latte': { title: 'Chai latte', alt: 'A cup of amber spiced tea on a woven bamboo mat', group: 'menu' },

  'mocha': { title: 'Mocha', alt: 'A cappuccino with dark chocolate marbled through the foam', group: 'menu' },
  'cortado': { title: 'Cortado', alt: 'A small glass of espresso cut with a cap of steamed milk', group: 'menu' },
  'green-tea': { title: 'Green tea', alt: 'A white cup of green tea with loose leaves beside it', group: 'menu' },
  'mint-tea': { title: 'Mint tea', alt: 'A hand holding a glass mug of mint tea with lemon', group: 'menu' },
  'iced-tea': { title: 'Iced tea', alt: 'Iced tea in a glass with a straw, backlit at sunset', group: 'menu' },
  'iced-latte': { title: 'Iced latte', alt: 'An iced latte in a tall glass with a straw on a cafe table', group: 'menu' },
  'pain-au-chocolat': { title: 'Pain au chocolat', alt: 'Chocolate croissants on a patterned plate', group: 'menu' },
  'banana-bread': { title: 'Banana bread', alt: 'A thick slice of banana bread on a dark surface', group: 'menu' },

  'ambience-counter': { title: 'The counter', alt: 'Inside a coffee shop: pendant lights, a long counter and customers at the bar', group: 'ambience' },
  'ambience-barista': { title: 'At the bar', alt: 'A barista pouring steamed milk into a cup, hands and apron in frame', group: 'ambience' },
  'ambience-beans': { title: 'The beans', alt: 'A cup of coffee with roasted beans scattered across a pale surface, from above', group: 'ambience' },
  'ambience-pourover': { title: 'Pour over', alt: 'A glass Chemex brewing pour-over coffee, backlit against a dark background', group: 'ambience' },
  'ambience-pastrycase': { title: 'The pastry case', alt: 'A bakery counter stacked with scones, biscuits and cakes', group: 'ambience' },
  'ambience-pour': { title: 'Slow pour', alt: 'A barista pouring water from a copper gooseneck kettle over a filter', group: 'ambience' },
}

const log = (...a) => console.log(...a)

async function fetchBuffer(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(45000) })
      if (res.status === 429) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const type = res.headers.get('content-type') ?? ''
      if (!type.startsWith('image/')) throw new Error(`content-type ${type}`)
      return { buf: Buffer.from(await res.arrayBuffer()), bytes: Number(res.headers.get('content-length') ?? 0) }
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise(r => setTimeout(r, 1200 * attempt))
    }
  }
  throw new Error('unreachable')
}

const sources = JSON.parse(await readFile(SOURCES, 'utf8'))
const entries = []
const failures = []

for (const [key, meta] of Object.entries(sources)) {
  const spec = PRESENTATION[key]
  if (!spec) { failures.push(`${key}: no presentation entry`); continue }
  const { width, height, quality } = GROUPS[spec.group]
  const dest = path.join(PUBLIC, spec.group, `${key}.webp`)

  try {
    const { buf } = await fetchBuffer(meta.url)
    if (buf.length < 4096) throw new Error(`suspiciously small (${buf.length}B)`)

    await mkdir(path.dirname(dest), { recursive: true })
    // `attention` picks the most interesting region instead of blind-centre
    // cropping, which matters for off-centre subjects like the barista shots.
    await sharp(buf, { failOn: 'none' })
      .rotate()
      .resize(width, height, { fit: 'cover', position: 'attention' })
      .webp({ quality, effort: 5 })
      .toFile(dest)

    const { size } = await import('node:fs').then(fs => fs.promises.stat(dest))
    entries.push({
      key, spec, src: `/images/${spec.group}/${key}.webp`, width, height, bytes: size, meta,
    })
    log(`  ok    ${key.padEnd(22)} ${(size / 1024).toFixed(0).padStart(4)} KB`)
  } catch (err) {
    failures.push(`${key}: ${err.message}`)
    log(`  FAIL  ${key.padEnd(22)} ${err.message}`)
  }
  await new Promise(r => setTimeout(r, 150))
}

// Remove stale images that are no longer in the manifest.
for (const [group, cfg] of Object.entries(GROUPS)) {
  const dir = path.join(PUBLIC, group)
  if (!existsSync(dir)) continue
  const { readdir } = await import('node:fs/promises')
  const keep = new Set(entries.filter(e => e.spec.group === group).map(e => `${e.key}.webp`))
  for (const f of await readdir(dir)) {
    if (!keep.has(f)) { await unlink(path.join(dir, f)); log(`  rm    ${group}/${f} (stale)`) }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const f of failures) console.error(`  ${f}`)
  process.exitCode = 1
}

// --- Emit photos.ts -------------------------------------------------------

const q = s => JSON.stringify(s)
const total = entries.reduce((n, e) => n + e.bytes, 0)

// Openverse `source` field -> PhotoSource. Anything unrecognised is recorded
// as 'openverse' so provenance is never silently lost.
const SOURCE_MAP = {
  stocksnap: 'stocksnap',
  rawpixel: 'rawpixel',
  flickr: 'openverse',
  wikimedia: 'wikimedia',
  nappy: 'openverse',
  stockcake: 'stockcake',
}

let ts = `/**
 * Image manifest — GENERATED by scripts/fetch-photos.mjs. Do not hand-edit.
 *
 * Every entry records where the file came from so the landing-page footer can
 * attribute it. The current committed set is CC0 (StockSnap / rawpixel, reached
 * through the Openverse API), so attribution is not legally required — we
 * credit anyway, because photographers deserve it.
 *
 * Swapping a photo: change its \`src\` and provenance here, or re-point
 * app/data/photo-sources.json and re-run the script.
 *
 * \`source: 'generated'\` means the image was produced in-repo (a generated SVG
 * tile) and needs no credit line.
 */

import type { Photo } from '~/types/photo'

export const PHOTOS: Record<string, Photo> = {
`

for (const e of entries.sort((a, b) => a.key.localeCompare(b.key))) {
  const m = e.meta
  const author = m.creator?.trim() || m.source || 'Unknown'
  const source = SOURCE_MAP[m.source] ?? 'openverse'
  ts += `  ${q(e.key)}: {
    src: ${q(e.src)},
    width: ${e.width},
    height: ${e.height},
    alt: ${q(e.spec.alt)},
    source: ${q(source)},
    license: ${q(`CC0 1.0 · via ${m.source}`)},
    author: ${q(author)},
    authorUrl: ${q(m.creator_url || '')},
    pageUrl: ${q(m.page || '')},
  },
`
}

ts += `}

/** Every photo that came from a third party, for the footer credits. */
export const CREDITS: Photo[] = Object.values(PHOTOS).filter(p => p.source !== 'generated')

/** Look up a photo by key; undefined when the item has no image. */
export function photo(key?: string | null): Photo | undefined {
  return key ? PHOTOS[key] : undefined
}
`

await writeFile(OUT_TS, ts)
log(`\nwrote app/data/photos.ts — ${entries.length} photos, ${(total / 1024).toFixed(0)} KB total`)
