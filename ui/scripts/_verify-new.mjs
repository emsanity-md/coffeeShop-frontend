// Dev tool: contact sheet of the NEW committed menu images, to verify crops.
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = 'C:/Users/ebita/AppData/Local/Temp/opencode/sheets'
await mkdir(OUT, { recursive: true })

const NEW = ['mocha', 'cortado', 'green-tea', 'mint-tea', 'iced-tea', 'iced-latte', 'pain-au-chocolat', 'banana-bread']

const CELL = 280, LABEL = 28, COLS = 4
const rows = Math.ceil(NEW.length / COLS)
const composites = []

for (let i = 0; i < NEW.length; i++) {
  const key = NEW[i]
  const left = (i % COLS) * CELL
  const top = Math.floor(i / COLS) * (CELL + LABEL)
  const file = path.join('public/images/menu', `${key}.webp`)
  composites.push({
    input: await sharp(file).resize(CELL, CELL, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer(),
    left, top,
  })
  composites.push({
    input: Buffer.from(`<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#000"/>
      <text x="5" y="19" font-family="monospace" font-size="14" fill="#ffd700">${key}</text>
    </svg>`),
    left, top: top + CELL,
  })
}

const out = path.join(OUT, 'verify-new.jpg')
await sharp({ create: { width: COLS * CELL, height: rows * (CELL + LABEL), channels: 3, background: '#000' } })
  .composite(composites).jpeg({ quality: 84 }).toFile(out)
console.log(`wrote ${out} (${NEW.length})`)
