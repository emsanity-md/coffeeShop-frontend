/**
 * Where an image came from.
 *
 * The sourcing ladder is documented in README → "Images & credits". The
 * current committed set was reached at the Openverse tier and resolved to two
 * CC0 stock providers; `generated` is the in-repo floor that always works.
 */
export type PhotoSource =
  | 'unsplash'
  | 'pexels'
  | 'pixabay'
  | 'openverse'
  | 'wikimedia'
  | 'stocksnap'
  | 'rawpixel'
  | 'stockcake'
  | 'generated'

export interface Photo {
  /** Public path under /images. Always kebab-case, never has spaces. */
  src: string
  width: number
  height: number
  /** Meaningful alt text — never the filename. */
  alt: string
  source: PhotoSource
  /** Human-readable licence, e.g. 'Unsplash License', 'CC0 1.0'. */
  license: string
  author: string
  authorUrl?: string
  /** Canonical page on the source site. */
  pageUrl: string
  /** Query params appended to outbound links, e.g. utm_source/utm_medium. */
  utm?: Record<string, string>
}

export type PhotoKey = string
