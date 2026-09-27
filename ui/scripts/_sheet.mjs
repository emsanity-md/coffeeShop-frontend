// Dev tool: labelled contact sheet of Openverse CC0 stock candidates.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = 'C:/Users/ebita/AppData/Local/Temp/opencode/sheets'
const STOCK = 'stocksnap,rawpixel,nappy'
const [batch, ...queries] = process.argv.slice(2)

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function candidates(q, n = 6) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&source=${STOCK}&page_size=20&license_type=commercial&mature=false`
  const res = await fetch(url, { headers: { 'User-Agent': 'BrewedPrototype/1.0' } })
  if (!res.ok) return []
  const d = await res.json()
  return (d.results ?? []).filter(r => r.url && r.license === 'cc0' && r.width >= 1000).slice(0, n)
}

await mkdir(OUT, { recursive: true })

const CELL = 250, LABEL = 30, COLS = 4
const tiles = []
for (const q of queries) {
  const c = await candidates(q)
  if (!c.length) console.log(`${q}: NONE`)
  c.forEach((x, i) => tiles.push({ q, i, c: x }))
  await new Promise(r => setTimeout(r, 350))
}

const rows = Math.ceil(tiles.length / COLS)
const composites = []
let i = 0
for (const t of tiles) {
  const left = (i % COLS) * CELL
  const top = Math.floor(i / COLS) * (CELL + LABEL)
  try {
    const r = await fetch(t.c.url, { headers: { 'User-Agent': 'BrewedPrototype/1.0' }, signal: AbortSignal.timeout(30000) })
    if (!r.ok) { console.log(`${t.q}#${t.i} HTTP ${r.status}`); i++; continue }
    const buf = Buffer.from(await r.arrayBuffer())
    composites.push({ input: await sharp(buf).resize(CELL, CELL, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer(), left, top })
    composites.push({
      input: Buffer.from(`<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#000"/>
        <text x="5" y="13" font-family="monospace" font-size="13" fill="#ffd700">${esc(t.q)} #${t.i}</text>
        <text x="5" y="26" font-family="monospace" font-size="10" fill="#7cf">${esc((t.c.title ?? '').slice(0, 36))}</text>
      </svg>`), left, top: top + CELL,
    })
  } catch (e) { console.log(`${t.q}#${t.i} ERR ${e.message}`) }
  i++
}

const out = path.join(OUT, `new-${batch}.jpg`)
await sharp({ create: { width: COLS * CELL, height: rows * (CELL + LABEL), channels: 3, background: '#000' } })
  .composite(composites).jpeg({ quality: 80 }).toFile(out)

await writeFile(path.join(OUT, `new-${batch}.json`), JSON.stringify(
  tiles.map(t => ({ q: t.q, i: t.i, url: t.c.url, license: t.c.license, title: t.c.title, creator: t.c.creator, creator_url: t.c.creator_url, page: t.c.foreign_landing_url, source: t.c.source, w: t.c.width, h: t.c.height })), null, 2))

console.log(`wrote ${out} (${tiles.length})`)
