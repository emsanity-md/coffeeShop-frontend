import type { Transition } from 'motion-v'

/**
 * Shared motion vocabulary.
 *
 * Every animated component reads its timings from here, so a card entrance on
 * the POS and a reveal on the landing page can't drift apart. The values mirror
 * the CSS custom properties in assets/css/motion.css — change one, change both.
 */
export const MOTION = {
  ease: {
    warm: [0.22, 1, 0.36, 1],
    out: [0.25, 1, 0.5, 1],
    spring: [0.34, 1.56, 0.64, 1],
    inOut: [0.4, 0, 0.2, 1],
  },
  duration: {
    instant: 0.1,
    fast: 0.15,
    med: 0.28,
    slow: 0.48,
    slower: 0.7,
  },
} as const

export const transition = (overrides: Partial<Transition> = {}): Transition => ({
  duration: MOTION.duration.med,
  ease: MOTION.ease.warm,
  ...overrides,
})

/** Opacity + 10px rise. The default entrance for content. */
export const fadeUp = (delay = 0): Transition => transition({ delay })

/** Scale + rise, for cards that should feel placed rather than faded in. */
export const cardEnter = (delay = 0): Transition => transition({ delay })

/** Overshoot pop, reserved for direct feedback (add-to-cart, count change). */
export const pop = (delay = 0): Transition => ({
  duration: 0.3,
  ease: MOTION.ease.spring,
  delay,
})

/** Standard props for a scroll-triggered reveal. */
export function revealProps(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-64px' },
    transition: fadeUp(delay),
  }
}
