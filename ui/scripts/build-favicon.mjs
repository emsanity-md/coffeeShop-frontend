#!/usr/bin/env node
/**
 * Build the favicon set from the brand mark in the UI layer.
 *
 *   node scripts/build-favicon.mjs      # or: npm run favicon:build
 *
 * The browser tab icon was still the Nuxt starter logo because nothing in the
 * app declared a `<link rel="icon">`, so every browser fell back to the bare
 * `/favicon.ico` request. This writes every variant that path can serve:
 *
 *   public/favicon.svg            master, crisp at any size (all modern browsers)
 *   public/favicon.ico            16/32/48 multi-size, for the bare /favicon.ico
 *   public/apple-touch-icon.png   180x180, because iOS ignores SVG favicons
 *   public/icon-192.png           192x192, for PWA/Android home screen
 *
 * The bean path is read out of app/components/layout/BrandMark.vue rather than
 * duplicated here, so the tab icon can't drift from the in-page mark. If the
 * markup there is restructured this script fails loudly instead of quietly
 * shipping a stale glyph.
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()

/** Kept in step with app/assets/css/theme.css — light-mode primary pair. */
const INK = '#88602f'
const PAPER = '#fffdf9'

/**
 * Pull the `<path d="...">` out of BrandMark.vue, ignoring whitespace so the
 * multi-line `d` attribute in the component survives being read back.
 */
async function readMarkPath() {
  const file = path.join(ROOT, 'app/components/layout/BrandMark.vue')
  const src = await readFile(file, 'utf8')
  const m = src.match(/<path[\s\S]*?\bd="([\s\S]*?)"\s*\n?\s*\/>/)
  if (!m) throw new Error(`Could not find a <path d="..."> in ${file}`)
  return m[1].trim().replace(/\s+/g, ' ')
}

/**
 * The mark, scaled to fill a 24x24 tile on a rounded-square plate.
 *
 * The plate matters: a bare bean on a transparent background turns to mush at
 * 16px against dark browser chrome, whereas bean-on-plate keeps a solid
 * silhouette. `evenodd` does the crease for free — it knocks a hole through the
 * cream bean and the brown plate shows through, which is why the same path data
 * works for both the plate and the bean.
 *
 * The 0.94 scale is deliberate: at 1.0+ the bean swallows the plate and the
 * result reads as a plain cream circle rather than a bean in a tile.
 */
function faviconSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <rect width="24" height="24" rx="5" fill="${INK}" />
  <g transform="translate(12 12) scale(0.94) rotate(-15) translate(-12 -12)">
    <path fill="${PAPER}" fill-rule="evenodd" d="${d}" />
  </g>
</svg>
`
}

/** Assemble a multi-size .ico from already-encoded PNG buffers. */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type 1 = icon
  header.writeUInt16LE(images.length, 4)

  // 16 bytes per directory entry, then the payloads back to back.
  const dir = Buffer.alloc(16 * images.length)
  let offset = header.length + dir.length
  images.forEach(({ size, png }, i) => {
    const at = i * 16
    dir[at] = size >= 256 ? 0 : size // 0 is the 256 encoding
    dir[at + 1] = size >= 256 ? 0 : size
    dir.writeUInt16LE(1, at + 4) // colour planes
    dir.writeUInt16LE(32, at + 6) // bits per pixel
    dir.writeUInt32LE(png.length, at + 8)
    dir.writeUInt32LE(offset, at + 12)
    offset += png.length
  })

  return Buffer.concat([header, dir, ...images.map(i => i.png)])
}

async function main() {
  const { default: sharp } = await import('sharp')

  const d = await readMarkPath()
  const svg = faviconSvg(d)

  const publicDir = path.join(ROOT, 'public')
  await writeFile(path.join(publicDir, 'favicon.svg'), svg, 'utf8')

  // Render the PNG payloads straight from the SVG master.
  const raster = async size => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()

  const ico = buildIco(await Promise.all(
    [16, 32, 48].map(async size => ({ size, png: await raster(size) })),
  ))
  await writeFile(path.join(publicDir, 'favicon.ico'), ico)

  await writeFile(path.join(publicDir, 'apple-touch-icon.png'), await raster(180))
  await writeFile(path.join(publicDir, 'icon-192.png'), await raster(192))

  console.log('favicon: wrote favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png, icon-192.png')
}

main().catch((err) => {
  console.error(`favicon: ${err.message}`)
  process.exitCode = 1
})
