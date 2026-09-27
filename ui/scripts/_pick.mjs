// Merge curated picks from the contact-sheet dumps into app/data/photo-sources.json.
import { readFile, writeFile } from 'node:fs/promises'

const DIR = 'C:/Users/ebita/AppData/Local/Temp/opencode/sheets'

// key -> [sheet, query, index]
const PICKS = {
  mocha: ['a', 'mocha coffee', 3],
  'green-tea': ['a', 'green tea cup', 0],
  'iced-tea': ['a', 'iced tea', 0],
  'banana-bread': ['b', 'banana bread', 0],
  'iced-latte': ['b', 'iced latte', 2],
  'mint-tea': ['b', 'mint tea', 1],
  'pain-au-chocolat': ['c', 'chocolate croissant', 0],
  cortado: ['c', 'macchiato', 4],
}

const sheets = {}
for (const s of ['a', 'b', 'c']) {
  sheets[s] = JSON.parse(await readFile(`${DIR}/new-${s}.json`, 'utf8'))
}

const existing = JSON.parse(await readFile('app/data/photo-sources.json', 'utf8'))
const missing = []

for (const [key, [sheet, q, i]] of Object.entries(PICKS)) {
  const hit = sheets[sheet].find(t => t.q === q && t.i === i)
  if (!hit) { missing.push(`${key} (${sheet}/${q}#${i})`); continue }
  existing[key] = {
    url: hit.url,
    license: hit.license,
    source: hit.source,
    title: hit.title,
    creator: hit.creator ?? '',
    creator_url: hit.creator_url ?? '',
    page: hit.page ?? '',
    sourceWidth: hit.w,
    sourceHeight: hit.h,
  }
}

if (missing.length) {
  console.error('MISSING PICKS:\n  ' + missing.join('\n  '))
  process.exitCode = 1
}

await writeFile('app/data/photo-sources.json', JSON.stringify(existing, null, 2) + '\n')
console.log(`photo-sources.json now has ${Object.keys(existing).length} entries`)
for (const key of Object.keys(PICKS)) {
  const m = existing[key]
  if (m) console.log(`  ${key.padEnd(20)} ${m.source}/${m.license}  ${(m.title ?? '').slice(0, 30)}`)
}
