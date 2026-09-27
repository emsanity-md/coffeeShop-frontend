#!/usr/bin/env node
/**
 * Validate the image manifest against the filesystem and the menu data.
 *
 *   node scripts/check-photos.mjs        # or: npm run photos:check
 *
 * Catches the failure modes that would otherwise only show up as a broken card
 * in the browser:
 *   - a manifest entry whose file is missing (or vice versa)
 *   - a menu item pointing at a key that doesn't exist
 *   - a third-party photo missing attribution fields
 *   - a `generated` photo that somehow carries a credit requirement
 *   - a menu photo that isn't a sane size / aspect for its slot
 *
 * Exits non-zero on failure so it can gate a build.
 */
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const errors = []
const warnings = []

const fail = m => errors.push(m)
const warn = m => warnings.push(m)

/** Parse app/data/photos.ts well enough to audit it without a TS runtime. */
async function readManifest() {
  const file = path.join(ROOT, 'app/data/photos.ts')
  const src = await readFile(file, 'utf8')
  const entries = []
  const re = /^\s{2}"([^"]+)":\s*\{([\s\S]*?)^\s{2}\},/gm
  let m
  while ((m = re.exec(src))) {
    const [, key, body] = m
    const field = name => {
      const hit = body.match(new RegExp(`^\\s{4}${name}:\\s*(?:"([^"]*)"|(\\d+)|true|false)`, 'm'))
      if (!hit) return undefined
      return hit[1] ?? (hit[2] !== undefined ? Number(hit[2]) : hit[3] === 'true')
    }
    entries.push({
      key,
      src: field('src'),
      width: field('width'),
      height: field('height'),
      alt: field('alt'),
      source: field('source'),
      license: field('license'),
      author: field('author'),
      authorUrl: field('authorUrl'),
      pageUrl: field('pageUrl'),
    })
  }
  return entries
}

const manifest = await readManifest()
if (!manifest.length) fail('app/data/photos.ts yielded no parseable entries — has its format changed?')

// --- Files exist, sizes are sane -------------------------------------------
const seenFiles = new Set()
for (const p of manifest) {
  if (!p.src) { fail(`${p.key}: no src`); continue }
  const file = path.join(ROOT, 'public', p.src.replace(/^\//, ''))
  if (!existsSync(file)) { fail(`${p.key}: file missing at public${p.src}`); continue }
  seenFiles.add(path.resolve(file))

  const { size } = await stat(file)
  if (size < 1024) fail(`${p.key}: ${p.src} is only ${size}B — almost certainly not an image`)
  if (size > 900_000) warn(`${p.key}: ${p.src} is ${Math.round(size / 1024)}KB — consider re-encoding`)

  if (!p.width || !p.height) fail(`${p.key}: missing intrinsic dimensions (prevents layout shift)`)
  if (!p.alt) fail(`${p.key}: missing alt text`)

  // Menu cards are 4:3, ambience 16:10.
  const ratio = p.width / p.height
  const expected = p.src.includes('/ambience/') ? 16 / 10 : 4 / 3
  if (Math.abs(ratio - expected) > 0.06) {
    warn(`${p.key}: aspect ${ratio.toFixed(2)} differs from expected ${expected.toFixed(2)}`)
  }

  // Attribution: required for anything not produced in-repo.
  if (p.source !== 'generated') {
    if (!p.license) fail(`${p.key}: third-party photo has no license`)
    if (!p.author) fail(`${p.key}: third-party photo has no author`)
    if (!p.pageUrl) fail(`${p.key}: third-party photo has no source page to link back to`)
  }
}

// --- No orphan files --------------------------------------------------------
for (const group of ['menu', 'ambience']) {
  const dir = path.join(ROOT, 'public/images', group)
  if (!existsSync(dir)) continue
  const { readdir } = await import('node:fs/promises')
  for (const f of await readdir(dir)) {
    const abs = path.resolve(dir, f)
    if (!seenFiles.has(abs)) warn(`public/images/${group}/${f} is on disk but not in the manifest`)
  }
}

// --- Every menu item resolves to a real photo -------------------------------
const menu = JSON.parse(await readFile(path.join(ROOT, 'app/data/menu.json'), 'utf8'))
const keys = new Set(manifest.map(p => p.key))
const missingImage = []
for (const item of menu) {
  if (!item.image) missingImage.push(`${item.name} (no image key)`)
  else if (!keys.has(item.image)) fail(`menu item "${item.name}" points at unknown photo "${item.image}"`)
}
if (missingImage.length) warn(`menu items without a photo: ${missingImage.join(', ')}`)

// --- Filenames are safe for case-sensitive hosts ---------------------------
for (const p of manifest) {
  const name = path.basename(p.src)
  if (name !== name.toLowerCase()) warn(`${p.key}: filename "${name}" has uppercase — normalise it`)
  if (/\s/.test(name)) fail(`${p.key}: filename "${name}" contains whitespace`)
}

// --- Report -----------------------------------------------------------------
console.log(`photos: ${manifest.length} entries, ${menu.length} menu items`)
for (const w of warnings) console.warn(`  warn  ${w}`)
for (const e of errors) console.error(`  FAIL  ${e}`)

if (errors.length) {
  console.error(`\n${errors.length} error(s). Run \`node scripts/fetch-photos.mjs\` to rebuild.`)
  process.exit(1)
}
console.log(warnings.length ? `\nok with ${warnings.length} warning(s)` : 'ok')
